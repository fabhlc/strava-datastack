{{ config(
    materialized='table',
    pre_hook="{{ parse_weight_training() }}"
    )
}}
-- parse_weight_training pre_hook macro depends_on: {{ ref('modeled_weight_training') }}


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
    , TRIM(exercise) AS exercise
    , (CASE
      WHEN weight_lbs_or_level = '-' THEN NULL -- replace() doesn't work here fsr...
      ELSE TRIM(weight_lbs_or_level)
      END)::FLOAT AS weight_lbs_or_level
    , TRIM(reps)::INT AS reps
    , TRIM(sets)::INT AS sets
  FROM parsed_exercises
  WHERE
    exercise IS NOT NULL
    AND exercise <> ''
    AND TRIM(weight_lbs_or_level) NOT SIMILAR TO '[a-z]*'
)

SELECT
  activity_at
  , exercise
  , weight_lbs_or_level
  , reps
  , sets
FROM cleansed_data