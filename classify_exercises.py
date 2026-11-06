"""
Classify messy weight-training lines with the OpenAI Decisions API (gpt-6-luna)
and store results in MotherDuck. See EXERCISE_CLASSIFICATION_PLAN.md.

Commands:

  update-seed       Add exercise names found in the clean 2025 CSV-style lines
                    (name,weight,reps,sets) to dbt_strava/seeds/
                    exercises_categorized_by_muscle_group.csv. Append-only: existing
                    rows and your edits are never changed, only blank
                    typical_weight_lbs is filled. Read-only on MotherDuck.

  backfill-numbers  Parse weight/reps/sets (regex, no API) for rows already in the table.

  classify          Classify lines not yet in the lookup table and write results to
                    strava_duck.main.modeled_weight_training_decisions_api_output.

Examples:
  python classify_exercises.py update-seed
  python classify_exercises.py classify --line "Bicep curls 20lb 10x3" --print-request
  python classify_exercises.py classify --limit 20 --dry-run
  python classify_exercises.py classify
  python classify_exercises.py classify --target-table modeled_weight_training_decisions_api_output_1

Credentials (.dlt/secrets.toml, gitignored):
  [destination.motherduck.credentials] password = "..."   # MotherDuck token
  [openai] api_key = "sk-..."                             # or env OPENAI_API_KEY

Behind Netskope: set GRPC_DEFAULT_SSL_ROOTS_FILE_PATH to a CA bundle exported from
the macOS keychain. GRPC_DNS_RESOLVER=native is set automatically below.
"""

import argparse
import csv
import hashlib
import json
import os
import re
import sys
import time
import tomllib
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path

os.environ.setdefault("GRPC_DNS_RESOLVER", "native")

import duckdb  # noqa: E402
import requests  # noqa: E402

REPO = Path(__file__).parent
SECRETS_PATH = REPO / ".dlt" / "secrets.toml"
# One seed serves both dbt (muscle group join) and this script (canonical exercise list).
# dbt uses: exercise, muscle_group. This script also uses: aliases, typical_weight_lbs.
SEED_CSV = REPO / "dbt_strava" / "seeds" / "exercises_categorized_by_muscle_group.csv"
SEED_COLUMNS = ["exercise", "muscle_group", "aliases", "typical_weight_lbs"]

MD_DB = "strava_duck"
SOURCE_TABLE = f"{MD_DB}.main.modeled_weight_training"
TARGET_TABLE = f"{MD_DB}.main.modeled_weight_training_decisions_api_output"

DECISIONS_URL = "https://api.openai.com/v1/decisions"
MODEL = "gpt-6-luna"
PRICE_PER_M_INPUT_TOKENS = 0.10  # USD, output tokens not charged
CONFIDENCE_THRESHOLD = 0.70
MAX_WORKERS = 8

OTHER = "other_exercise"  # real exercise missing from canonical list
NOT_AN_EXERCISE = "not_an_exercise"
LINE_TYPES = [
    {"value": "exercise", "description": "A strength exercise entry, possibly with weight, reps or sets."},
    {"value": "cardio", "description": "Treadmill, bike, run, walk, rest timer or other cardio/time entry."},
    {"value": "note", "description": "Commentary, feelings, body-part labels, headers or other free text."},
]

# 2025 clean format: name,weight,reps,sets   (weight may be '-')
CSV4 = re.compile(r"^([^,]+?)\s*,\s*([\d.\-]+)\s*,\s*([\d\-]+)\s*,\s*([\d\-]+)$")
CARDIO_WORDS = re.compile(r"treadmill|bike|cycl|run|walk|elliptical|stair|row(er|ing)\b|cardio", re.I)
HEADER = re.compile(r"^exercise\s*,\s*weight\s*,\s*reps\s*,\s*sets$", re.I)


# --- helpers --------------------------------------------------------------
def load_secrets() -> dict:
    return tomllib.loads(SECRETS_PATH.read_text())


def md_connect():
    token = load_secrets()["destination"]["motherduck"]["credentials"]["password"]
    return duckdb.connect(f"md:{MD_DB}?motherduck_token={token}")


def openai_key() -> str:
    key = os.environ.get("OPENAI_API_KEY") or load_secrets().get("openai", {}).get("api_key")
    if not key:
        sys.exit("No OpenAI key. Set OPENAI_API_KEY or add [openai] api_key to .dlt/secrets.toml")
    return key


def line_hash(line: str) -> str:
    return hashlib.md5(line.strip().lower().encode()).hexdigest()


def fetch_distinct_lines(con) -> dict[str, date]:
    """distinct line -> first date it appears on (decides reps/sets order for free text)"""
    sql = f"""
        SELECT trim(line) AS line, min(start_at_local::date) AS first_seen
        FROM (
            SELECT start_at_local, unnest(string_split(description, chr(10))) AS line
            FROM {SOURCE_TABLE}
        )
        WHERE trim(line) <> ''
        GROUP BY 1
    """
    return {r[0]: r[1] for r in sorted(con.execute(sql).fetchall())}


# --- numbers (regex; Decisions only classifies) ----------------------------
SUPERSCRIPTS = str.maketrans("\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079\u00d7", "0123456789x")
WEIGHT_RE = re.compile(r"(\d+(?:\.\d+)?)\s*(lbs?|kgs?)\b", re.I)
SETS_REPS_RE = re.compile(r"(\d+)\s*[*xX]\s*(\d+)(?:\s*-\s*(\d+))?")
SETS_FIRST_BEFORE = date(2025, 1, 1)  # before this, "3*10" meant sets*reps; after, "10x3" is reps x sets


def _to_int(v: str):
    return int(v) if v and v.isdigit() else None


def parse_numbers(line: str, first_seen: date | None) -> dict:
    out = {"weight": None, "weight_unit": None, "reps": None, "sets": None, "parse_flag": None}
    flags = []

    if m := CSV4.match(line):  # name,weight,reps,sets ('-' = not applicable)
        try:
            out["weight"], out["weight_unit"] = float(m[2]), "lb"
        except ValueError:
            pass
        out["reps"], out["sets"] = _to_int(m[3]), _to_int(m[4])
    else:
        text = line.translate(SUPERSCRIPTS)
        if w := WEIGHT_RE.search(text):
            out["weight"], out["weight_unit"] = float(w[1]), w[2].lower().rstrip("s")
        if m := SETS_REPS_RE.search(text):
            a, b = int(m[1]), int(m[2])
            if m[3]:  # "3x12-15": 3 sets of 12-15 reps
                out["sets"], out["reps"] = a, b
                flags.append("rep range, used low end")
            elif first_seen and first_seen < SETS_FIRST_BEFORE:
                out["sets"], out["reps"] = a, b
            else:
                out["reps"], out["sets"] = a, b

    if out["sets"] is not None and out["sets"] > 8 or out["reps"] is not None and out["reps"] > 60:
        flags.append("implausible sets/reps")
    if out["weight"] is not None and out["weight"] > 600:
        flags.append("implausible weight")
    out["parse_flag"] = "; ".join(flags) or None
    return out


# --- update-seed ----------------------------------------------------------
def update_seed() -> None:
    con = md_connect()
    counts: dict[str, int] = defaultdict(int)
    weights: dict[str, list[float]] = defaultdict(list)
    sql = f"""
        SELECT trim(line)
        FROM (SELECT unnest(string_split(description, chr(10))) AS line FROM {SOURCE_TABLE})
        WHERE trim(line) <> ''
    """
    for (line,) in con.execute(sql).fetchall():
        if HEADER.match(line) or not (m := CSV4.match(line)):
            continue
        name = m[1].strip().lower()
        if re.match(r"warm-?up", name) or CARDIO_WORDS.search(name):  # not strength exercises
            continue
        counts[name] += 1
        try:
            weights[name].append(float(m[2]))
        except ValueError:  # '-' = bodyweight
            pass

    with SEED_CSV.open(newline="") as f:
        rows = [{c: (r.get(c) or "").strip() for c in SEED_COLUMNS} for r in csv.DictReader(f)]
    by_name = {r["exercise"].lower(): r for r in rows}

    added = []
    for name in sorted(counts, key=lambda n: -counts[n]):
        ws = weights[name]
        typical = f"{min(ws):g}-{max(ws):g}" if ws else ""
        if name in by_name:  # never overwrite edits: fill blanks only
            row = by_name[name]
            row["typical_weight_lbs"] = row["typical_weight_lbs"] or typical
        else:
            row = {c: "" for c in SEED_COLUMNS}
            row.update(exercise=name, typical_weight_lbs=typical)
            rows.append(row)
            by_name[name] = row
            added.append(name)

    rows.sort(key=lambda r: (r["muscle_group"] == "", r["muscle_group"].lower(), r["exercise"].lower()))
    with SEED_CSV.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=SEED_COLUMNS, lineterminator="\n")
        w.writeheader()
        w.writerows(rows)
    print(f"{len(added)} new exercises appended to {SEED_CSV.name}: {added}")
    print("Review: merge near-duplicates, fill muscle_group, add aliases (pipe-separated), "
          "and add exercises that only appear in 2024/2026 free text. "
          "Then run `dbt seed --full-refresh --select exercises_categorized_by_muscle_group`.")


# --- classify -------------------------------------------------------------
def load_canonical_choices() -> list[dict]:
    seen, choices = set(), []
    with SEED_CSV.open() as f:
        for r in csv.DictReader(f):
            name = (r.get("exercise") or "").strip().lower()
            if not name or name in seen:
                continue
            seen.add(name)
            desc = f"Targets {r['muscle_group'].strip()}." if (r.get("muscle_group") or "").strip() else "Strength exercise."
            if (r.get("aliases") or "").strip():
                desc += " Also written as: " + ", ".join(a.strip() for a in r["aliases"].split("|")) + "."
            if (r.get("typical_weight_lbs") or "").strip():
                desc += f" Usually logged at {r['typical_weight_lbs'].strip()} lb."
            choices.append({"value": name, "description": desc})
    choices.append({"value": OTHER, "description": "A real strength exercise that is not in this list."})
    choices.append({"value": NOT_AN_EXERCISE, "description": "Cardio, note, label or anything that is not a strength exercise."})
    return choices


def build_payload(line: str, choices: list[dict], ask_line_type: bool = True) -> dict:
    questions = [
            {
                "type": "choice",
                "name": "line_type",
                "instructions": (
                    "This is one line from a personal workout log. What kind of line is it? "
                    "A line with only a body-part or general comment is a note."
                ),
                "choices": LINE_TYPES,
            },
    ] if ask_line_type else []
    questions.append(
            {
                "type": "choice",
                "name": "exercise",
                "instructions": (
                    "This is one line from a personal workout log. It may be messy, abbreviated or misspelled. "
                    "Ignore sets, reps and comments. Which exercise is it? "
                    "If the line gives a weight, use it only as a soft hint to tell apart similar exercises "
                    "(compare it to the 'Usually logged at' ranges); wording in the line matters more than weight."
                ),
                "choices": choices,
            },
    )
    return {"model": MODEL, "input": line, "questions": questions}


def call_decisions(payload: dict, key: str) -> tuple[dict, int]:
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    for attempt in range(5):
        r = requests.post(DECISIONS_URL, headers=headers, json=payload, timeout=60)
        if r.status_code in (429, 500, 502, 503, 504):
            time.sleep(2**attempt)
            continue
        if r.status_code != 200:
            raise RuntimeError(f"HTTP {r.status_code}: {r.text[:300]}")
        body = r.json()
        return {a["name"]: a for a in body["answers"]}, (body.get("usage") or {}).get("input_tokens", 0)
    raise RuntimeError("retries exhausted (429/5xx)")


def multi_exercise_suspect(line: str) -> bool:
    if CSV4.match(line):
        return False
    return line.count(",") >= 2 or bool(re.search(r"\band\b|\+|/", line, re.I))


def model_input(line: str) -> str:
    """CSV-style lines are name,weight,reps,sets: send only the name to the model."""
    m = CSV4.match(line)
    return m[1].strip() if m else line


def classify_line(line: str, choices: list[dict], valid_exercises: set[str], key: str,
                  first_seen: date | None = None) -> tuple[dict, int]:
    is_csv = bool(CSV4.match(line))
    answers, tokens = call_decisions(build_payload(model_input(line), choices, ask_line_type=not is_csv), key)

    lt, ex = answers.get("line_type", {}), answers.get("exercise", {})
    line_type = lt.get("choice") if lt.get("type") == "choice" else None
    lt_conf = lt.get("confidence")
    exercise = ex.get("choice") if ex.get("type") == "choice" else None
    ex_conf = ex.get("confidence")

    if is_csv:  # name,weight,reps,sets is always an entry; the name decides cardio/note
        if exercise == NOT_AN_EXERCISE:
            line_type = "cardio" if CARDIO_WORDS.search(line) else "note"
        else:
            line_type = "exercise"
        lt_conf = 1.0

    reasons = []
    seed_match = exercise in valid_exercises and exercise not in (OTHER, NOT_AN_EXERCISE)
    if not is_csv and line_type != "exercise" and seed_match:
        if ex_conf is not None and ex_conf >= CONFIDENCE_THRESHOLD:
            line_type, lt_conf = "exercise", ex_conf
        else:
            reasons.append(f"typed {line_type} but may be seed exercise '{exercise}'")

    if line_type != "exercise":
        exercise, ex_conf = None, None
    elif exercise not in valid_exercises:
        exercise = OTHER

    if line_type is None or lt_conf is None or lt_conf < CONFIDENCE_THRESHOLD:
        reasons.append("low line_type confidence")
    if line_type == "exercise":
        if exercise == OTHER:
            reasons.append("exercise not in canonical list")
        elif exercise == NOT_AN_EXERCISE:
            reasons.append("line_type/exercise disagree")
        elif ex_conf is None or ex_conf < CONFIDENCE_THRESHOLD:
            reasons.append("low exercise confidence")
        if multi_exercise_suspect(line):
            reasons.append("possible multiple exercises")

    return {
        "line_hash": line_hash(line),
        "raw_line": line,
        "line_type": line_type,
        "line_type_confidence": lt_conf,
        "exercise_std": exercise,
        "exercise_confidence": ex_conf,
        "needs_review": bool(reasons),
        "review_reason": "; ".join(reasons) or None,
        "model": MODEL,
        "first_seen_date": first_seen,
        **parse_numbers(line, first_seen),
    }, tokens


COLUMNS = [
    "line_hash", "raw_line", "line_type", "line_type_confidence", "exercise_std",
    "exercise_confidence", "needs_review", "review_reason", "model",
    "weight", "weight_unit", "reps", "sets", "first_seen_date", "parse_flag",
]
NUMBER_COLUMNS = [
    ("weight", "DOUBLE"), ("weight_unit", "VARCHAR"), ("reps", "INTEGER"), ("sets", "INTEGER"),
    ("first_seen_date", "DATE"), ("parse_flag", "VARCHAR"),
]


def ensure_table(con) -> None:
    con.execute(
        f"""
        CREATE TABLE IF NOT EXISTS {TARGET_TABLE} (
            line_hash VARCHAR PRIMARY KEY,
            raw_line VARCHAR,
            line_type VARCHAR,
            line_type_confidence DOUBLE,
            exercise_std VARCHAR,
            exercise_confidence DOUBLE,
            needs_review BOOLEAN,
            review_reason VARCHAR,
            model VARCHAR,
            classified_at TIMESTAMP DEFAULT current_timestamp,
            weight DOUBLE,
            weight_unit VARCHAR,
            reps INTEGER,
            sets INTEGER,
            first_seen_date DATE,
            parse_flag VARCHAR
        )
        """
    )
    for col, typ in NUMBER_COLUMNS:  # tables created before the number columns existed
        con.execute(f"ALTER TABLE {TARGET_TABLE} ADD COLUMN IF NOT EXISTS {col} {typ}")


def classify(args) -> None:
    choices = load_canonical_choices()
    valid = {c["value"] for c in choices}
    con = None
    first_seen: dict[str, date] = {}

    if args.line:
        lines = args.line
        first_seen = {l: date.today() for l in lines}
        args.dry_run = True
    else:
        con = md_connect()
        ensure_table(con)
        first_seen = fetch_distinct_lines(con)
        all_lines = list(first_seen)
        done = {r[0] for r in con.execute(f"SELECT line_hash FROM {TARGET_TABLE}").fetchall()}
        lines = [l for l in all_lines if line_hash(l) not in done]
        if args.limit:
            lines = lines[: args.limit]
        print(f"{len(all_lines)} distinct lines, {len(done)} already classified, {len(lines)} to classify")

    if not lines:
        return

    if args.print_request:
        print(json.dumps(build_payload(model_input(lines[0]), choices, ask_line_type=not CSV4.match(lines[0])), indent=2, ensure_ascii=False))
        print(f"\n({len(choices)} exercise choices; request NOT sent)")
        return

    key = openai_key()
    rows, failures, total_tokens = [], [], 0
    with ThreadPoolExecutor(MAX_WORKERS) as pool:
        futures = {pool.submit(classify_line, l, choices, valid, key, first_seen.get(l)): l for l in lines}
        for fut in as_completed(futures):
            try:
                row, tokens = fut.result()
                rows.append(row)
                total_tokens += tokens
            except Exception as e:  # keep going; failed lines are retried next run
                failures.append((futures[fut], str(e)))

    for r in sorted(rows, key=lambda r: r["raw_line"])[: args.show]:
        flag = f"  REVIEW: {r['review_reason']}" if r["needs_review"] else ""
        print(f"{r['raw_line']!r:60} -> {r['line_type']}/{r['exercise_std']} "
              f"({r['exercise_confidence']}) w={r['weight']} r={r['reps']} s={r['sets']}{flag}")
    for line, err in failures:
        print(f"FAILED {line!r}: {err}", file=sys.stderr)

    cost = total_tokens / 1_000_000 * PRICE_PER_M_INPUT_TOKENS
    print(f"\n{len(rows)} classified, {len(failures)} failed, "
          f"{sum(r['needs_review'] for r in rows)} need review, "
          f"{total_tokens:,} input tokens (~${cost:.4f})")

    if args.dry_run:
        print("Dry run: nothing written.")
        return
    con.executemany(
        f"INSERT OR REPLACE INTO {TARGET_TABLE} ({', '.join(COLUMNS)}) VALUES ({', '.join('?' * len(COLUMNS))})",
        [[r[c] for c in COLUMNS] for r in rows],
    )
    print(f"Wrote {len(rows)} rows to {TARGET_TABLE}")


def backfill_numbers(args) -> None:
    """Fill weight/reps/sets/first_seen_date/parse_flag for rows already in the table (no API calls)."""
    con = md_connect()
    ensure_table(con)
    first_seen = fetch_distinct_lines(con)
    existing = con.execute(f"SELECT line_hash, raw_line FROM {TARGET_TABLE}").fetchall()
    updates, missing = [], 0
    for h, raw in existing:
        fs = first_seen.get(raw.strip())
        if fs is None:
            missing += 1
        n = parse_numbers(raw, fs)
        updates.append([n["weight"], n["weight_unit"], n["reps"], n["sets"], fs, n["parse_flag"], h])
    print(f"{len(existing)} rows; {missing} lines no longer found in source (date unknown)")
    print(f"parsed: weight={sum(u[0] is not None for u in updates)}, reps={sum(u[2] is not None for u in updates)}, "
          f"sets={sum(u[3] is not None for u in updates)}, flagged={sum(u[5] is not None for u in updates)}")
    if args.dry_run:
        print("Dry run: nothing written.")
        return
    con.executemany(
        f"UPDATE {TARGET_TABLE} SET weight=?, weight_unit=?, reps=?, sets=?, first_seen_date=?, parse_flag=? "
        f"WHERE line_hash=?",
        updates,
    )
    print(f"Updated {len(updates)} rows in {TARGET_TABLE}")


def main() -> None:
    global TARGET_TABLE
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("update-seed", help="append exercise names from the 2025 clean lines to the muscle-group seed")
    c = sub.add_parser("classify", help="classify new lines with the Decisions API")
    c.add_argument("--limit", type=int, help="max lines to classify this run")
    c.add_argument("--dry-run", action="store_true", help="call the API but don't write to MotherDuck")
    c.add_argument("--line", action="append", help="classify this text only (no DB access, implies --dry-run)")
    c.add_argument("--print-request", action="store_true", help="print the request for the first line and exit (no API call)")
    c.add_argument("--show", type=int, default=25, help="rows to print (default 25)")
    c.add_argument("--target-table", help=f"write to this table instead of {TARGET_TABLE} (created if missing)")
    b = sub.add_parser("backfill-numbers", help="parse weight/reps/sets for rows already in the table (no API calls)")
    b.add_argument("--dry-run", action="store_true")
    b.add_argument("--target-table", help=f"table to backfill instead of {TARGET_TABLE}")
    args = ap.parse_args()

    if getattr(args, "target_table", None):
        name = args.target_table
        TARGET_TABLE = name if "." in name else f"{MD_DB}.main.{name}"

    if args.cmd == "update-seed":
        update_seed()
    elif args.cmd == "backfill-numbers":
        backfill_numbers(args)
    else:
        classify(args)


if __name__ == "__main__":
    main()
