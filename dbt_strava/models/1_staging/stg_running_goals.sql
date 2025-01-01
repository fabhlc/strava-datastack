SELECT
    month::date as month
    , goal
FROM {{ ref("running_goals2025") }}