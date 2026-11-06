The purpose of this project is to experiment with new data stack tools I had yet to use,
namely dlt, MotherDuck, and Evidence. I analyze my own Strava fitness data, set goals, and build visualizations
to help me achieve said goals.

## Tools
- Extract+Load --> dlt
- Warehouse --> MotherDuck/DuckDB
- Transform --> dbt
- Storytelling --> evidence

<br>
Big thanks to @datadisciple for laying the ground-work for dlt. 

## Exercise classification (OpenAI Decisions API)
Weight-training `description` lines are classified by `classify_exercises.py`. It is **not** run by dbt; run it manually. See `EXERCISE_CLASSIFICATION_PLAN.md`.

From `dbt_strava/`, except step 2:
1. Refresh the classifier input: `dbt run --profiles-dir . --select +modeled_weight_training`
2. Classify new lines (repo root): `python classify_exercises.py classify`
3. Rebuild downstream: `dbt run --profiles-dir . --select modeled_weight_training+ --exclude modeled_weight_training`

If the seed changed, run `dbt seed --profiles-dir . --full-refresh --select exercises_categorized_by_muscle_group` before step 3.

Credentials: `.dlt/secrets.toml` (`[destination.motherduck.credentials] password`, `[openai] api_key`). Behind a TLS-intercepting proxy, set `GRPC_DNS_RESOLVER=native` and `GRPC_DEFAULT_SSL_ROOTS_FILE_PATH=<ca bundle>`.
