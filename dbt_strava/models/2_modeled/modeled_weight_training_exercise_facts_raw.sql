{{ config(
    materialized='table',
    pre_hook="{{ parse_weight_training() }}",
    tags=['weight_training']
    )
}}

-- parse_weight_training pre_hook macro depends_on: {{ ref('modeled_weight_training') }}
-- The purpose of this model is to display the output of the parse_weight_training() macro.

SELECT
    activity_at
    , split_part(exercise, ',', 1) AS exercise
    , split_part(exercise, ',', 2) AS weight_lbs_or_level
    , split_part(exercise, ',', 3) AS reps
    , split_part(exercise, ',', 3) AS sets
FROM dbt_models.tmp
