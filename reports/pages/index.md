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
```sql all_activities_by_year
    SELECT 
      activity_year
      , sport_type
      , sum(activities_cnt)    AS activities_cnt
      , sum(total_distance)    AS total_distance
      , sum(total_moving_time) AS total_moving_time
    FROM ${all_activities_by_day}
    GROUP BY 1, 2
    ORDER BY activity_year DESC
```

# All Strava Activities
Below is my activities for the past few years. You can see I took up running in lieu of biking in the last year compared to 2023.
You can also see when I was injured and unable to run (November 2024 Weight Training frequency went up).

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

By cumulative moving time per day, the days where it surpassed 200mins were when I went for a Gran Fondo.
<CalendarHeatmap 
    data={all_activities_by_day.where(`sport_type like '${inputs.sport_types.value}'`)}
    date=activity_day
    value=total_moving_time
    title="Activity Calendar Heatmap"
    subtitle="Gradient by total moving time (minutes)"
/>

# Running

Below is how far I've run by month. I was shocked to see myself reach 100km in September, but it makes sense given that I was gunning for a half marathon that month and training to hit that (awful) 22km run.
<BarChart
    data={all_activities_by_month.where(`sport_type = 'Run'`)}
    title="Running distance"
    x=activity_month
    y=total_distance_month
    series=sport_type
/>
