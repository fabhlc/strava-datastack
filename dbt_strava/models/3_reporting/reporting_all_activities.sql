{{ config(
    materialized='table',
    unique_key='id')
}}

SELECT
    id
    , start_at_local
    , name
    , distance
    , moving_time
    , sport_type
    , achievement_count
    , kudos_count
    , description
    , calories
    , average_speed
    , max_speed
    , average_heartrate
    , max_heartrate
    , pr_count
    , workout_type
    , CURRENT_LOCALTIME() AS load_at
FROM {{ ref('modeled_biking') }}

UNION ALL

SELECT
    id
    , start_at_local
    , name
    , distance
    , moving_time
    , sport_type
    , achievement_count
    , kudos_count
    , description
    , calories
    , average_speed
    , max_speed
    , average_heartrate
    , max_heartrate
    , pr_count
    , workout_type
    , CURRENT_LOCALTIME() AS load_at
FROM {{ ref('modeled_running') }}

UNION ALL

SELECT
    id
    , start_at_local
    , name
    , NULL AS distance
    , moving_time
    , sport_type
    , achievement_count
    , kudos_count
    , description
    , calories
    , NULL AS average_speed
    , NULL AS max_speed
    , average_heartrate
    , max_heartrate
    , pr_count
    , workout_type
    , CURRENT_LOCALTIME() AS load_at
FROM {{ ref('modeled_weight_training') }}