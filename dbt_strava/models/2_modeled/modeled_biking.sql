{{ config(
    materialized='incremental',
    unique_key='id')
}}

-- Purpose of this model is to track running distances against goals
-- 200 days of activity
-- distance 650km (551km in 2024)
SELECT
    id
    , start_at_local
    , name
    , distance
    , moving_time -- define as minutes
    , total_elevation_gain_meters
    , sport_type
    , achievement_count
    , kudos_count
    , description -- future data collection, assess how to capture
    , calories
    , comment_count
    , photo_count
    , average_speed -- identify measure
    , max_speed -- identify measure
    , has_heartrate
    , average_heartrate
    , max_heartrate
    , pr_count
    , has_kudoed
    , gear_id
    , workout_type -- understand more
    , average_cadence -- understand more
    , similar_activities__min_average_speed
    , similar_activities__mid_average_speed
    , similar_activities__max_average_speed
    , CURRENT_LOCALTIME() AS load_at
FROM {{ ref("stg_full_load") }}
WHERE
    sport_type = 'Ride'

    {% if is_incremental() %}
    AND start_at_local >= (select coalesce(max(start_at_local),'2020-01-01') from {{ this }} )
    {% endif %}
