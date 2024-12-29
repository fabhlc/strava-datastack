SELECT
  DATETRUNC('day', start_at_local) as activity_day
, DATETRUNC('month', start_at_local) AS activity_month
, DATETRUNC('year', start_at_local) AS  activity_year
, sport_type
, count(1) AS activities_cnt
, sum(distance) AS total_distance
, sum(moving_time) AS total_moving_time
FROM strava_datastack.strava_dev.reporting_all_activities
GROUP BY ALL