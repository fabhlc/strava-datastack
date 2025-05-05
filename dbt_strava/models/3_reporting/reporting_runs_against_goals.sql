SELECT
  run_month::TIMESTAMPTZ AS run_month -- required for Evidence to not throw a fit
  , category
  , distance
  , goal
FROM {{ ref("modeled_runs_against_goals") }}