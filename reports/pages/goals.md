---
title: Goals
---

```sql all_activities_by_month
    SELECT 
      activity_month
      , activity_year
      , sport_type
      , sum(activities_cnt)    AS activities_cnt
      , sum(total_distance)    AS total_distance_month
      , sum(total_moving_time) AS total_moving_time
      , sum(total_distance_month) over (partition by activity_year, sport_type) AS total_distance_year
    FROM strava_datastack.activities_by_day
    WHERE sport_type = 'Run'
    GROUP BY 1, 2, 3
    ORDER BY activity_month DESC
```
```sql all_activities_by_year
    SELECT 
      activity_year
      , sport_type
      , sum(activities_cnt)    AS activities_cnt
      , sum(total_distance)    AS total_distance
      , sum(total_moving_time) AS total_moving_time
    FROM strava_datastack.activities_by_day
    WHERE sport_type = 'Run'
    GROUP BY 1, 2
    ORDER BY activity_year DESC
```

<BigValue 
  data={all_activities_by_month}
  link=index
  value=total_distance_month
  sparkline=activity_month
  comparison=total_distance_month
  comparisonFmt=pct1
  comparisonTitle="vs. Last Month"
/>

<BigValue 
  data={all_activities_by_year}
  value=total_distance
  sparkline=activity_year
  comparison=total_distance
  comparisonFmt=pct
  comparisonTitle="vs. Last Year"
/> 

 
[//]: # (TODO: Fix comparison for BigValues)
Total running distance last year was <b><Value 
    data={all_activities_by_year}
    column=total_distance 
    row=0
    color="#85BB65"
/>km</b>. The goal for 2025 would be an additional 100km, so <b>650km</b>! I'll set a pace to achieve.

TODO:
- chart against staggered goals
- Live Counter for month  + Use Alert? If/Else