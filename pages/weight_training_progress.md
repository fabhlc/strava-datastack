---
title: Weight Training
neverShowQueries: true
---

```sql exercises
  select
    activity_date
    , activity_month
    , exercise
    , muscle_group
    , reps
    , sets
    , COALESCE(weight_lbs_or_level, 0) AS weight_lbs_or_level
    , composite_effort
    , max_all_time_reps
    , max_all_time_weight_lbs_or_level
    , max_all_time_composite_effort
    , max_to_date_reps
    , max_to_date_weight_lbs_or_level
    , max_to_date_composite_effort
    , number_of_times_at_level
    , is_day_of_level_pr
    , number_of_times_at_composite_effort
    , is_day_of_composite_pr
    , 1 AS static_value
  from strava_duck.reporting_weight_training_progress
```
```sql exercises_agg_by_day
select
  *
from ${exercises}
where 
    exercise in ${inputs.exercise.value}
    and muscle_group in ${inputs.muscle_group.value}
```
```sql selected_exercises
select
  DISTINCT exercise
  , muscle_group
  , COUNT(DISTINCT muscle_group) OVER () AS number_of_muscle_groups_selected
from ${exercises_agg_by_day}
```

<Dropdown
    data={exercises} 
    name=muscle_group
    value=muscle_group
    title="Muscle Group:"
    multiple=true
    selectAllByDefault=true
/>

<Dropdown
    data={exercises.where(`muscle_group in ${inputs.muscle_group.value}`)} 
    name=exercise
    value=exercise
    title="Exercise:"
    multiple=true
    selectAllByDefault=true
/>

<br><br>
{#if selected_exercises.length == 1}
Below is a heatmap showing workout days for {selected_exercises.value[0].exercise}

{:else if selected_exercises.value[0].number_of_muscle_groups_selected == 1}
Below is a heatmap showing workout days that work the {selected_exercises.value[0].muscle_group}

{:else} 
Below is a heatmap showing workout days for the selected muscle groups

{/if}


<CalendarHeatmap
    data={exercises_agg_by_day}
    date=activity_date
    value=static_value
    colorScale={[
        ['rgb(254,234,159)', 'rgb(254,234,159)'],
        ['rgb(218,66,41)', 'rgb(218,66,41)']
    ]}
/>

<br><br>

{#if selected_exercises.length == 1}
This shows my progress (level) over time for {selected_exercises.value[0].exercise}:

{:else if selected_exercises.value[0].number_of_muscle_groups_selected == 1}
This shows my progress (level) over time for working out the {selected_exercises.value[0].muscle_group}:

{:else} 
This shows my progress (level) over time for the selected muscle groups:

{/if}

<LineChart 
    data={exercises_agg_by_day}
    x=activity_date
    y=weight_lbs_or_level 
    yAxisTitle="Level or Weight (lbs)"
    series=exercise
    markers=true 
/>

