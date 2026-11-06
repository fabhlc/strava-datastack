# Plan: Clean and standardize weight-training exercises with the OpenAI Decisions API

## Goal

Turn the free-text `description` field on weight-training activities into one clean row per exercise, with:

- a standardized exercise name
- weight (and unit)
- reps
- sets
- a flag for lines that aren't exercises, or that need manual review

## Source data

- MotherDuck: `strava_duck.main.modeled_weight_training`, column `description`
- One workout's `description` holds many exercises, separated by newlines.
- 123 workouts total, 65 with non-empty `description` (~270 lines).
  - Roughly: 2024: 3, 2025: 50 (21 empty), 2026: 70 (35 empty).

### Formats found

| Era | Format | Example |
|---|---|---|
| Dec 2024 | Free text, `sets*reps` | `80lb 3*10 Leg raises` |
| 2025 | CSV `name,weight,reps,sets` (one header row once; `-` = bodyweight) | `Dumbbell pushes,60,12,3` / `Hanging crunches,-,8,3` |
| 2026 | Free text: name, weight, `reps x sets` | `Seated leg extensions 90lb 10x3` |
| 2026 | Name + weight only | `Calf raises 160lb`, `Lat pulldowns 140lbs` |
| 2026 | `name,weight` | `Bicep curls,20lbs` |

### Messiness to handle

- **Reps/sets order flips by era.**
  - 2024: `3*10` = sets x reps.
  - 2026: `10*3` / `10x3` = reps x sets (matches the 2025 CSV column order).
  - Resolve by date, not by guessing from the numbers.
- **Typos and variants:** `10*38`, `10x³`, `10 * 3`, `lb` / `lbs` / `12.5lb`, a leading `- `.
- **Comments inside entries:** `Pull ups (trash omg),2,2`.
- **Name variants:** `Dumbbell flyes`, `Dumbbells flyes`, `Dumbbell chest flyes`, `Bicep curls`, `Bicep dumbbell curls`.
- **Non-exercise lines:**
  - Cardio: `15min treadmill`, `1min rest`.
  - Commentary: `Gotta make use of the protein`, `Quick one before 中文课`.
  - Body-part labels: `Hamstrings`, `Glutes, ass, back`.
- **Multi-exercise lines:** `15min treadmill, calf and jumping lunges, dumbbell rows`; `Super light workout (planks, leg raises, delts)`.
- **Other numbers:** durations (`Planks 60s`, `Wall sits,-,45,3`) and odd entries (`Jetfighters 20, 10 hold, 10 hold`).
- **Existing `_cleansed` model** keeps only rows whose weight is digits or `-`, so it drops almost all of 2026.

## Key design decisions

### 1. Decisions API only classifies

It returns a probability (`predicate`), one option from a fixed list (`choice`), or a score. It **cannot extract numbers**.

| Task | Tool |
|---|---|
| Weight, unit, reps, sets | Regex (deterministic, free) |
| Standardize the exercise name | Decisions `choice` question |
| Exercise vs cardio vs note | Decisions `choice` question |

### 2. Tiered parsing

Numbers are parsed in Python (regex) and stored in the same output table as the classification.

1. **2025 CSV lines** (`name,weight,reps,sets`, exactly 3 commas): regex. The first value is the exercise name, the second the weight, the third the reps, the fourth the sets. `-` means not applicable. Weight is assumed to be `lb`.
2. **2026 / 2024 free text:** regex for `\d+\s*[*xX×]\s*\d+` and `\d+(\.\d+)?\s*(lbs?|kgs?)`.
   - Normalize superscripts (`10x³` becomes `10x3`).
   - Order by era, using the first date the line appears on (`first_seen_date`): before `2025-01-01` means sets x reps (`3*10`), otherwise reps x sets (`10x3`).
   - A rep range (`3x12-15`) means sets x low-end reps, and is flagged.
   - Implausible values (sets > 8, reps > 60, weight > 600) are flagged in `parse_flag`, e.g. `10*38`.
3. **Decisions API:** classify the line.
   - **CSV lines:** only the exercise name is sent, and only the `exercise` question is asked. The format already says it's an entry, and sending the bare name with a `line_type` question made names like `Bicep curls` come back as `note`. `line_type` is `exercise`, or `cardio` / `note` if the name maps to `not_an_exercise`.
   - **Free-text lines:** the full line is sent with both questions.
     - `line_type`: `exercise` / `cardio` / `note`
     - `exercise`: a choice from the canonical list, with `other_exercise` as the fallback.
   - Low confidence, `other_exercise`, or multi-exercise lines get `needs_review = true`.

### 3. Canonical exercise list

- **One seed, `dbt_strava/seeds/exercises_categorized_by_muscle_group.csv`, serves both dbt and the classifier.** There is no separate canonical file.
  - Columns: `exercise`, `muscle_group`, `aliases`, `typical_weight_lbs`.
  - dbt (`modeled_weight_training_exercise_facts_cleansed`) joins on `exercise` and reads `muscle_group`. The classifier reads `exercise`, `muscle_group`, `aliases` and `typical_weight_lbs`.
  - `exercise` must stay unique (case-insensitive), or the dbt join fans out rows.
  - The first version merged the original 31-row seed with 62 names from the 2025 CSV lines (65 rows total). The original values won where they overlapped.
- `update-seed` appends new names from the 2025 CSV lines. It never changes existing rows except to fill a blank `typical_weight_lbs`.
- Review the file manually: merge near-duplicates, fill `muscle_group`, add aliases.
- After editing it, run `dbt seed --full-refresh --select exercises_categorized_by_muscle_group` so MotherDuck gets the new rows (`--full-refresh` because the columns changed).
- Add `other_exercise` and `not_an_exercise`.
- Each entry has aliases and a `typical_weight_lbs` range (auto-filled from the 2025 CSV lines, editable). Both go into the choice description sent to Decisions, so the model can use the weight as a soft hint to separate similar exercises (e.g. `lat pulldowns` vs `kneeling lat pulldowns`). Wording in the line takes priority over weight. There is no separate weight-based rule in dbt.

### 4. Where results live

- **Don't add columns to existing tables.** dbt rebuilds `modeled_weight_training_exercise_facts_raw` / `_cleansed` as tables on each run, which would wipe them.
- **Use a lookup table** keyed by a hash of the line text: `strava_duck.main.modeled_weight_training_decisions_api_output`.
  - One row per **distinct line**, not per workout.
  - Each distinct line is classified once. Later runs only send new lines to the API.
- **dbt joins it back** to produce the one-to-many output.

## Tables

### `modeled_weight_training_decisions_api_output` (lookup, written by a Python script outside dbt)

| Column | Notes |
|---|---|
| `line_hash` (PK) | `md5(lower(trim(line)))` |
| `raw_line` | original text |
| `line_type` | exercise / cardio / note |
| `exercise_std` | canonical name or `other_exercise` |
| `line_type_confidence`, `exercise_confidence` | from Decisions (`line_type_confidence` is 1.0 for CSV lines) |
| `needs_review`, `review_reason` | confidence < 0.70, `other_exercise`, or multi-exercise |
| `weight`, `weight_unit` | regex; `lb` for all CSV lines, including non-lb values like treadmill speed (filter on `line_type = 'exercise'`) |
| `reps`, `sets` | regex, era-aware order |
| `first_seen_date` | earliest workout date the line appears on; drives the reps/sets order |
| `parse_flag` | rep range, implausible sets/reps or weight |
| `model`, `classified_at` | audit |

The numbers are stored here, not computed in dbt, because `first_seen_date` makes the era rule resolvable per distinct line. `classify` fills them for new lines, and `backfill-numbers` fills them for existing rows (no API calls).

## Mapping rows back to the original workout

The output table has one row per distinct line of text and no workout ID. To get back to the original activity, split `description` again, hash each line the same way, and join on `line_hash`. `line_no` is the position within the workout. Tested on MotherDuck: 279 lines across 65 workouts, 0 unmatched.

```sql
WITH lines AS (
  SELECT
    id AS activity_id,
    start_at_local,
    unnest(range(1, len(string_split(description, chr(10))) + 1)) AS line_no,
    trim(unnest(string_split(description, chr(10)))) AS raw_line
  FROM strava_duck.main.modeled_weight_training
  WHERE description IS NOT NULL
)
SELECT
  l.activity_id, l.start_at_local, l.line_no, l.raw_line,
  o.line_type, o.exercise_std, o.weight, o.reps, o.sets, o.needs_review
FROM lines AS l
LEFT JOIN strava_duck.main.modeled_weight_training_decisions_api_output AS o
  ON md5(lower(l.raw_line)) = o.line_hash
WHERE l.raw_line <> ''
```

- `activity_id` is `modeled_weight_training.id`, so it joins to anything keyed on activity.
- The same text on two lines of one workout gives two rows with the same classification.
- A line added after the last classifier run has null classification columns until `classify` is re-run.

### Fact model (dbt): one row per exercise per workout

Replaces `modeled_weight_training_exercise_facts_raw.sql` and the Jinja loop in `macros/parse_weight_training.sql` (which writes row by row into `main.tmp`).

| Column | Notes |
|---|---|
| `activity_id` | from `modeled_weight_training.id` |
| `activity_at` | `start_at_local` |
| `line_no` | position within `description` |
| `raw_line` | original text |
| `line_type`, `exercise_std`, `needs_review` | from the lookup table |
| `weight`, `weight_unit`, `reps`, `sets`, `parse_flag` | from the lookup table |

Keep non-exercise rows in this model and filter them downstream.

Example:

| activity_id | line_no | raw_line | line_type | exercise_std | weight | reps | sets |
|---|---|---|---|---|---|---|---|
| 123 | 1 | 15min stationary bike warmup | cardio | | | | |
| 123 | 2 | 3\*10 15lb Dumbbell chest flyes | exercise | dumbbell chest flyes | 15 | 10 | 3 |

## Implementation steps

1. **Canonical list:** extract distinct exercise names from the 2025 CSV lines, review and map the variants, and save as a seed.
2. **Classifier script** (`classify_exercises.py`, Python, run manually or from Airflow). **Built and run.** Commands:
   - `update-seed`: appends exercise names from the 2025 CSV lines to `dbt_strava/seeds/exercises_categorized_by_muscle_group.csv` (append-only, read-only on MotherDuck).
   - `classify [--limit N] [--dry-run] [--line "text"] [--print-request]`:
     - Explodes `description` into distinct lines (with first-seen date) and skips hashes already in the lookup table.
     - `POST /v1/decisions` with model `gpt-6-luna` for each new line, with the questions described above.
     - 8 worker threads, retry with backoff on 429 / 5xx, failed lines are retried on the next run.
     - Parses the numbers and writes everything to the lookup table. Prints token usage and estimated cost.
   - `backfill-numbers [--dry-run]`: fills the number columns for rows already in the table, no API calls.
   - Credentials come from `.dlt/secrets.toml`. Behind Netskope, set `GRPC_DEFAULT_SSL_ROOTS_FILE_PATH` to a CA bundle (see below).
3. **dbt source** for the lookup table (e.g. `strava_ai.modeled_weight_training_decisions_api_output`).
4. **New fact model:** explode lines (query above) and left join the lookup on `md5(lower(trim(raw_line)))`. Numbers come from the lookup table.
5. **Update downstream models:** `_cleansed`, `modeled_weight_training_kpis` and `reporting_weight_training_progress` so they read the new fact model and no longer depend on the old weight filter.
6. **Review `needs_review` rows** and fix the canonical list or add overrides (a small seed that wins over the AI result).
7. **Validate:** compare exercise counts and PR metrics before and after, and spot-check a sample from each era.

## Decisions API request shape

`POST https://api.openai.com/v1/decisions`

```json
{
  "model": "gpt-6-luna",
  "input": "Seated leg extensions 90lb 10x3",
  "questions": [
    {
      "type": "choice",
      "name": "line_type",
      "instructions": "What kind of line is this from a workout log?",
      "choices": [
        {"value": "exercise", "description": "A strength exercise entry."},
        {"value": "cardio", "description": "Treadmill, bike, run, rest timer."},
        {"value": "note", "description": "Commentary, body-part label, or other free text."}
      ]
    },
    {
      "type": "choice",
      "name": "exercise",
      "instructions": "The line may be messy or misspelled. Ignore sets, reps and weights. Which exercise is it?",
      "choices": [
        {"value": "leg extensions", "description": "Quads."},
        {"value": "other_exercise", "description": "A real strength exercise not in this list."},
        {"value": "not_an_exercise", "description": "Cardio, note, or label."}
      ]
    }
  ]
}
```

Response: `answers[]`, each with `name`, `choice`, `probabilities[]` and `confidence`. A `refusal` type is possible and must be handled.

## Credentials and environment

- MotherDuck token: `.dlt/secrets.toml` -> `[destination.motherduck.credentials] password` (gitignored).
- OpenAI key: `OPENAI_API_KEY`, or add `[openai] api_key` to `.dlt/secrets.toml`. API credits are billed separately from ChatGPT Plus.
- **Netskope proxy:** if MotherDuck fails with a TLS or DNS error, set:
  - `GRPC_DNS_RESOLVER=native`
  - `GRPC_DEFAULT_SSL_ROOTS_FILE_PATH=/path/to/ca_bundle.pem`, a bundle exported from the macOS keychain (`security find-certificate -a -p ...`)

## Current status

- Done: classifier script, first run of all 230 distinct lines (84 flagged for review, ~$0.03), number parsing and backfill into `strava_duck.main.modeled_weight_training_decisions_api_output`.
- The run used the **unreviewed** exercise list (the merged seed's predecessor). Duplicate names (`push ups` / `pushups`, `close grip pull ups` / `close grip pullups`, `dumbbell flyes` / `dumbbells flyes`, the bicep curl variants) split the model's answers and lowered confidence.
- Not done: clean the canonical list, re-classify flagged rows, dbt source and fact model, downstream model updates.

### Known issues

- Missing canonical exercises land in `other_exercise` (angled leg press, wrist curls, forearm curls, jetfighters, kneeling lat pulldowns, inner / outer thigh machines).
- `warmup-treadmill` and `warmup-incline treadmill` are in the list and are classified as exercises. They should be removed (cardio).
- `Calf raises 160lb` maps to `dumbbell calf raises` (usually 40-50 lb), probably a machine. The weight hint did not override the name match.
- Digits attached to the name (`Pallof press3x10/side`) look like sets x reps but the era rule parses them as reps x sets, and they get flagged. A rule for "letter directly before the digits means sets x reps" is not added yet.
- Rep ranges keep only the low end (`3x12-15` is stored as 12 reps).
- Re-classification gap: `classify` skips any line already in the table. After cleaning the canonical list, delete the affected rows (or the table), or add a `--reclassify-review` flag.

## Open questions

- Should multi-exercise lines (`calf and jumping lunges, dumbbell rows`) be split into several rows? If so, that needs a separate Responses API call with structured output, since Decisions can't split text. Otherwise they just get flagged.
- Should cardio lines (`15min treadmill`) feed anything, like minutes of cardio per workout, or are they just filtered out?
- Is weight in lbs everywhere, with `level` for machines? The old column was `weight_lbs_or_level`.
- Confidence threshold: start at 0.70 and tune after the first review pass.
