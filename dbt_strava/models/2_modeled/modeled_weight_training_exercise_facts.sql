{{ config(
    materialized='table'
    )
}}

WITH parsed_exercises AS (
    SELECT
        activity_at
        , split_part(exercise, ',', 1) AS exercise
        , split_part(exercise, ',', 2) AS weight_lbs_or_level
        , split_part(exercise, ',', 3) AS reps
        , split_part(exercise, ',', 3) AS sets
    FROM dbt_models.tmp
    )

, cleansed_data AS (
  SELECT
    activity_at
    , trim(exercise) AS exercise
    , weight_lbs_or_level
    , reps
    , sets
  FROM parsed_exercises
  WHERE
    exercise IS NOT NULL
    AND exercise <> ''
    AND weight_lbs_or_level NOT SIMILAR TO '[a-z]*'
)

SELECT * FROM cleansed_data