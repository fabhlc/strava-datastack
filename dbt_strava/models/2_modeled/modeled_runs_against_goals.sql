
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

SELECT
  actuals.start_month AS run_month
  , actuals.total_distance AS distance_ran
  , goals.goal
FROM actuals
LEFT JOIN goals
  ON actuals.start_month = goals.month