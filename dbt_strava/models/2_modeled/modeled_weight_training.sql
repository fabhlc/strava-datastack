{{ config(
    materialized='incremental',
    unique_key='id',
    tags=['weight_training'])
}}

-- Purpose of this model is to track running distances against goals
-- 200 days of activity
-- distance 650km (551km in 2024)
SELECT
    id
    , start_at_local
    , name
    , moving_time -- define as minutes
    , sport_type
    , achievement_count
    , kudos_count
    , description -- future data collection, assess how to capture
    , calories
    , comment_count
    , photo_count
    , has_heartrate
    , average_heartrate
    , max_heartrate
    , pr_count
    , has_kudoed
    , workout_type -- understand more
    , average_cadence -- understand more
    , CURRENT_LOCALTIME() AS load_at
FROM {{ ref("stg_full_load") }}
WHERE
    sport_type = 'WeightTraining'

    {% if is_incremental() %}
    AND start_at_local >= (select coalesce(max(start_at_local),'2020-01-01') from {{ this }} )
    {% endif %}
