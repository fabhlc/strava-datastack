---
title: Goals (WIP)
---

```sql runs
    SELECT
      *
      , LAG(total_distance_month) OVER (ORDER BY activity_month ASC) AS total_distance_prev_month
      , total_distance_month/total_distance_prev_month-1.00 AS total_distance_month_growth
    FROM (SELECT activity_month
               , activity_year
               , SUM(total_distance) AS total_distance_month
               , COUNT(*)            AS activities
          FROM strava_source.activities_by_day
          WHERE sport_type = 'Run'
          GROUP BY 1, 2)
      ORDER BY 1 DESC
```
```sql runs_by_year
    SELECT
      *
      , LAG(total_distance_year) OVER (ORDER BY activity_year ASC) AS total_distance_prev_year
      , total_distance_year/total_distance_prev_year-1.00 AS total_distance_year_growth
    FROM (
        SELECT 
          activity_year
          , SUM(total_distance_month) AS total_distance_year
          , SUM(activities) AS activities
        FROM ${runs}
        GROUP BY 1
        )
    ORDER BY 1 DESC
```
```sql runs_against_goals
  SELECT
  run_month
  , category
  , distance
  , goal
  FROM strava_source.runs_against_goals
  WHERE run_month >= '2024-06-01'

```

<BigValue
  data={runs}
  value=total_distance_month
  sparkline=activity_month
  comparison=total_distance_month_growth
  comparisonFmt=pct1
  comparisonTitle="vs. Last Month"
/>

<BigValue
  data={runs_by_year}
  value=total_distance_year
  sparkline=activity_year
  comparison=total_distance_year_growth
  comparisonFmt=pct 
  comparisonTitle="vs. Last Year"
/>


<br/><br/>
Below are my goals for the upcoming months of 2025. I'd like to run <b>100km for 3 months</b> in 2025 and a certain number of km for other months.
<BarChart
  data={runs_against_goals}
  title="Run vs. Goal"
  x=run_month
  y=distance
  series=category
  yMin=0
  
/>