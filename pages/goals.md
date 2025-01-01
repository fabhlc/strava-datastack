---
title: Goals
---


```sql runs
    SELECT
      activity_month
      , activity_year
      , SUM(total_distance)    AS total_distance_month
      , COUNT(*) AS activities
    FROM strava_source.activities_by_day
    WHERE sport_type = 'Run'
    GROUP BY 1,2
    ORDER BY 1 DESC
```

```sql runs_by_year
    SELECT
      activity_year
      , SUM(total_distance_month) AS total_distance_year
      , COUNT(*) AS activities
    FROM ${runs}
    GROUP BY 1
    ORDER BY 1 DESC
```

<DataTable data={runs}/>


<BigValue
  data={runs}
  link=index
  value=total_distance_month
  sparkline=activity_month
  comparison=total_distance_month
  comparisonFmt=pct1
  comparisonTitle="vs. Last Month"
/>

<BigValue
  data={runs_by_year}
  value=total_distance_year
  sparkline=activity_year
  comparison=total_distance_year
  comparisonFmt=pct
  comparisonTitle="vs. Last Year"
/>
