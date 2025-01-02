
WITH actuals AS (
  SELECT
    DATE_TRUNC('month', start_at_local) AS start_month
      , SUM (distance) AS total_distance
      , CURRENT_LOCALTIME() AS load_at
  FROM {{ ref('modeled_running') }}
  GROUP BY 1
  )

, goals AS (
  SELECT
    month
    , goal
  FROM {{ ref("stg_running_goals") }}
    )

, runs_goals_and_diff AS (
  SELECT
    COALESCE(actuals.start_month, goals.month) AS run_month
        , actuals.total_distance AS distance_ran
        , goals.goal
        , COALESCE(goal, 0) - COALESCE(distance_ran, 0) AS distance_to_go
  FROM actuals
  FULL OUTER JOIN goals
  ON actuals.start_month::DATE = goals.month::DATE
    )

SELECT
  run_month
  , 'Actual' as category
  , distance_ran as distance
  , goal
FROM runs_goals_and_diff

UNION ALL

SELECT
  run_month
  , 'Distance to Go' as category
  , distance_to_go as distance
  , goal
FROM runs_goals_and_diff