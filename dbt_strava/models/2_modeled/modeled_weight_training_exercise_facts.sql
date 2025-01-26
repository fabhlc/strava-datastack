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
    , REPLACE(
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
      AS exercise
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
