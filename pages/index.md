---
title: My Strava Activities
neverShowQueries: true
---

```sql sport_types
  select distinct
      sport_type
  from strava_source.activities_by_day
  where sport_type is not null
```

```sql all_activities_by_day
   SELECT
    *
  FROM strava_source.activities_by_day
  WHERE activity_year < '2025-01-01'
  GROUP BY ALL
```

```sql all_activities_by_month
    SELECT 
      activity_month
      , activity_year
      , sport_type
      , sum(activities_cnt)    AS activities_cnt
      , sum(total_distance)    AS total_distance_month
      , sum(total_moving_time) AS total_moving_time
      , sum(total_distance_month) over (partition by activity_year, sport_type) AS total_distance_year
    FROM ${all_activities_by_day}
    GROUP BY 1, 2, 3
    ORDER BY activity_month DESC
```
```sql runs_by_year
  SELECT
      *
      , LAG(total_distance) OVER (ORDER BY activity_year ASC) AS total_distance_prev_year
      , total_distance/total_distance_prev_year-1.00 AS total_distance_year_growth
  FROM (SELECT activity_year
             , sum(activities_cnt)    AS activities_cnt
             , sum(total_distance)    AS total_distance
             , sum(total_moving_time) AS total_moving_time
        FROM ${all_activities_by_day}
        WHERE sport_type = 'Run'
        GROUP BY 1)
ORDER BY activity_year DESC
```


Below are my activities for the past two years. 2024 was the year when I biked less and put more effort into running.
The data also shows when I was injured in November 2024 and took up weight training instead.

<Dropdown 
    name=sport_types
    value=sport_type
    data={sport_types}
    defaultValue="%"
>
<DropdownOption value="%" valueLabel="All"/>
</Dropdown>
<BarChart
    data={all_activities_by_month.where(`sport_type like '${inputs.sport_types.value}'`)}
    title="Activities by Month, {inputs.sport_types.value}"
    x=activity_month
    y=activities_cnt
    series=sport_type
/>
<br><br><br>
By cumulative moving time per day, the days where it surpassed 200mins were when I went for a Gran Fondo.
<CalendarHeatmap 
    data={all_activities_by_day.where(`sport_type like '${inputs.sport_types.value}'`)}
    date=activity_day
    value=total_moving_time
    title="Activity Calendar Heatmap"
    subtitle="Gradient by total moving time (minutes)"
/>

<br><br>

# Running

Below is how far I've run by month. I was shocked to see myself reach 100km in September, but it makes sense given 
that I was gunning for a half marathon that month and training to hit that (awful) 22km run. 
In total, I ran 562km in 2024, a marked 29% improvement from the previous year! 

In the "Tracking Against 2025" page, I use this data to set and track against running goals for the new year.

<BarChart
    data={all_activities_by_month.where(`sport_type = 'Run'`)}
    title="Running distance"
    x=activity_month
    y=total_distance_month
    series=sport_type>
    <Callout x="2024-09-01" y=100 labelPosition=top labelWidth=fit>
        Half-Marathon
    </Callout>
    <Callout x="2024-11-01" y=5 labelPosition=top labelWidth=fit>
        Injury
    </Callout>
</BarChart>


<BigValue
  data={runs_by_year.where(`activity_year < '2025-01-01'`)}
  value=total_distance
  sparkline=activity_year
  comparison=total_distance_year_growth
  comparisonFmt=pct 
  comparisonTitle="vs. Last Year"
/>