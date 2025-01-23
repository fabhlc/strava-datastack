WITH ranked_exercises AS (
  SELECT
    activity_at
    , exercise
    , reps
    , sets
    , weight_lbs_or_level
    , MAX(reps) OVER (PARTITION BY exercise) AS max_all_time_reps
    , MAX(weight_lbs_or_level) OVER (PARTITION BY exercise) AS max_all_time_weight_lbs_or_level
    , MAX(reps) OVER (
      PARTITION BY exercise ORDER BY activity_at ASC
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) AS max_to_date_reps
    , MAX(weight_lbs_or_level) OVER (
      PARTITION BY exercise ORDER BY activity_at ASC
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) AS max_to_date_weight_lbs_or_level
  FROM {{ ref('modeled_weight_training_exercise_facts') }}
)

SELECT
  *
  , ROW_NUMBER() OVER (
    PARTITION BY exercise, max_to_date_weight_lbs_or_level
    ORDER BY activity_at ASC
    ) AS number_of_times_at_level
  , CASE WHEN weight_lbs_or_level IS NULL THEN NULL
    ELSE number_of_times_at_level = TRUE END AS pr_day
FROM ranked_exercises