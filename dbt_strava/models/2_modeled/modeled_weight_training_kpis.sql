WITH ranked_exercises AS (
  SELECT
    activity_at
    , exercise
    , reps
    , sets
    , weight_lbs_or_level
    , weight_lbs_or_level * reps AS composite_effort

    -- all time max
    , MAX(reps) OVER (PARTITION BY exercise) AS max_all_time_reps
    , MAX(weight_lbs_or_level) OVER (PARTITION BY exercise) AS max_all_time_weight_lbs_or_level
    , MAX(composite_effort) OVER (PARTITION BY exercise) AS max_all_time_composite_effort

    -- max to-date
    , MAX(reps) OVER (
      PARTITION BY exercise ORDER BY activity_at ASC
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) AS max_to_date_reps
    , MAX(weight_lbs_or_level) OVER (
      PARTITION BY exercise ORDER BY activity_at ASC
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) AS max_to_date_weight_lbs_or_level
    , MAX(composite_effort) OVER (
      PARTITION BY exercise ORDER BY activity_at ASC
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) AS max_to_date_composite_effort
  FROM {{ ref('modeled_weight_training_exercise_facts') }}
)

SELECT
  *
  , ROW_NUMBER() OVER (PARTITION BY exercise, max_to_date_weight_lbs_or_level
    ORDER BY activity_at ASC
    ) AS number_of_times_at_level
  , CASE WHEN weight_lbs_or_level IS NULL THEN NULL
    ELSE number_of_times_at_level = TRUE END AS is_day_of_level_pr

  , ROW_NUMBER() OVER (PARTITION BY exercise, composite_effort
    ORDER BY activity_at ASC
    ) AS number_of_times_at_composite_effort
  , CASE WHEN max_to_date_composite_effort IS NULL THEN NULL
    ELSE number_of_times_at_composite_effort = TRUE END AS is_day_of_composite_pr
FROM ranked_exercises
