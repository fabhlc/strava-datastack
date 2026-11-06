"""
DRAFT (disabled): classifies every distinct weight-training line with the OpenAI
Decisions API on each run (~230 lines, ~$0.03). Logic lives in classify_exercises.py.

To enable:
  1. Remove enabled=False.
  2. profiles.yml -> outputs.dev: module_paths: [".."]   (makes classify_exercises importable)
  3. export OPENAI_API_KEY=...
  4. uv run --with dbt-duckdb dbt run --profiles-dir . --select +modeled_weight_training_decisions_api_output
"""

import os

import pandas as pd


def model(dbt, session):
    dbt.config(enabled=False, materialized="table", tags=["weight_training", "decisions_api"])
    import classify_exercises as ce

    first_seen = {}
    workouts = dbt.ref("modeled_weight_training").project("start_at_local::DATE, description").fetchall()
    for day, description in workouts:
        for line in (description or "").split("\n"):
            line = line.strip()
            if line and (line not in first_seen or day < first_seen[line]):
                first_seen[line] = day

    choices = ce.load_canonical_choices()
    valid = {c["value"] for c in choices}
    key = os.environ["OPENAI_API_KEY"]

    rows = [ce.classify_line(line, choices, valid, key, day)[0] for line, day in sorted(first_seen.items())]
    return pd.DataFrame(rows)
