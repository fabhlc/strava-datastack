  SELECT
    activity_at
    , DATE_TRUNC('day', activity_at) AS activity_date
    , DATE_TRUNC('month', activity_at) AS activity_month
    , exercise
    , muscle_group
    , reps
    , sets
    , weight_lbs_or_level
    , composite_effort
    , max_all_time_reps
    , max_all_time_weight_lbs_or_level
    , max_all_time_composite_effort
    , max_to_date_reps
    , max_to_date_weight_lbs_or_level
    , max_to_date_composite_effort
    , number_of_times_at_level
    , is_day_of_level_pr
    , number_of_times_at_composite_effort
    , is_day_of_composite_pr
  FROM {{ ref('modeled_weight_training_kpis') }}