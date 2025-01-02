SELECT
  run_month
  , category
  , distance
  , goal
FROM {{ ref("modeled_runs_against_goals") }}