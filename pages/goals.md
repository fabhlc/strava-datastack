---
title: Tracking Against 2025
---

```sql runs_against_goals
  SELECT
  run_month
  , category
  , distance
  , goal
  , (DATE_PART('day', CURRENT_DATE)/ DATE_PART('day', LAST_DAY(CURRENT_DATE)))::FLOAT AS pct_of_month
  , goal*pct_of_month AS prorated_goal
  , CASE WHEN category = 'Actual' THEN distance>=prorated_goal 
    ELSE NULL END AS is_on_track
  FROM strava_duck.runs_against_goals
  WHERE run_month >= '2024-06-01'
  ORDER BY run_month DESC
```
```sql runs_against_goals_this_month
  SELECT
    *
  FROM ${runs_against_goals}
  WHERE 
    run_month::DATE = DATE_TRUNC('month', CURRENT_DATE)
    AND category = 'Actual'
```
```sql today
  SELECT CURRENT_DATE()
```

<LastRefreshed/>
<br>

Below are my run goals for the upcoming months of 2025. I'd like to run <b>100km for 3 months</b> in 2025 and a certain number of km for other months.
Here's how I'll track how I'm doing:

<BarChart
  data={runs_against_goals}
  title="Run vs. Goal"
  x=run_month
  y=distance
  series=category
  yMin=0
/>

<br>

## Pacing (Dynamic)

[//]: # (<BigValue)

[//]: # (  data={runs})

[//]: # (  value=total_distance_month)

[//]: # (  sparkline=activity_month)

[//]: # (  comparison=total_distance_month_growth)

[//]: # (  comparisonFmt=pct1)

[//]: # (  comparisonTitle="vs. Last Month")

[//]: # (/>)

{#if $runs_against_goals_this_month.is_on_track == 'true'}
  <Alert status="success">
  As of <b><Value data={today} fmt='longdate'/></b>, I'm on track to hit my monthly goal! 🚀
  </Alert> 

{:else}
  <Alert status="danger">
  As of <b><Value data={today} fmt='longdate'/></b>, I'm a bit behind my goal. Let's pick up the pace!
  </Alert> 

{/if}
Monthly Goal: &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<b><Value 
data={runs_against_goals_this_month}
column=goal
/>km</b>

Distance Ran: &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<b><Value 
data={runs_against_goals_this_month}
column=distance
fmt='#.#1'
/>km</b>

Pro-Rated Goal (month-to-date): &emsp;<b><Value 
data={runs_against_goals_this_month}
column=prorated_goal
fmt='#.#1'
/>km</b>