{{ config(
    materialized='table',
    tags=['weight_training']
    )
}}

WITH cleansed_data AS (
  SELECT
    activity_at
    -- sad duckdb limitation:
    , REPLACE(
      REPLACE(
      REPLACE(
      REPLACE(
      REPLACE(
      REPLACE(
      REPLACE(
      REPLACE(
      LOWER(TRIM(exercise))
      , 'dumb bell', 'dumbbell')
      , 'dumbbell bicep curl', 'dumbbell curl')
      , 'dumbbell push', 'dumbbell press')
      , 'hanging crunches', 'hanging leg raises')
      , '1', 'one')
      , ' armed', '-armed')
      , 'one-armed cable pulls', 'one-armed lat pulldowns')
      , 'seated lat pulldowns', 'lat pulldowns')
      AS exercise
    , (CASE
      WHEN weight_lbs_or_level = '-' THEN NULL -- replace() doesn't work here fsr...
      ELSE TRIM(weight_lbs_or_level)
      END)::INTEGER AS weight_lbs_or_level
    , TRIM(reps)::INT AS reps
    , TRIM(sets)::INT AS sets
  FROM {{ ref('modeled_weight_training_exercise_facts_raw') }}
  WHERE
    exercise IS NOT NULL
    AND exercise <> ''
    AND (TRIM(weight_lbs_or_level) SIMILAR TO '[0-9]+' OR TRIM(weight_lbs_or_level) = '-')
)

, cleansed_data_with_muscle_groups AS (
  SELECT
    facts.activity_at
    , facts.exercise
    , ref.muscle_group
    , facts.weight_lbs_or_level
    , facts.reps
    , facts.sets
  FROM cleansed_data AS facts
  LEFT JOIN {{ ref('exercises_categorized_by_muscle_group') }} AS ref
    ON facts.exercise = ref.exercise
)

SELECT
  activity_at
  , exercise
  , muscle_group
  , weight_lbs_or_level
  , reps
  , sets
FROM cleansed_data_with_muscle_groups
