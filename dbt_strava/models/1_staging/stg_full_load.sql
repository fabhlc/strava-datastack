{{ config(
    materialized='view')
}}

SELECT
    id
    , name
    , distance/1000.0 AS distance
    , moving_time/60.0 AS moving_time -- define as minutes
    , total_elevation_gain AS total_elevation_gain_meters
    , sport_type
    , start_date_local AS start_at_local
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
FROM {{ source("strava", "full_load") }}