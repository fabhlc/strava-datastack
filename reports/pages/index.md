---
title: Hello World!
---

<Details title='How to edit this page'>

  This page can be found in your project at `/pages/index.md`. Make a change to the markdown file and save it to see the change take effect in your browser.
</Details>

```sql categories
  select
      * 
  from strava_datastack.strava_runs
  limit 100
```
Look at this!

```sql sport_types
  select distinct
      sport_type
  from strava_datastack.reporting_all_activities
  where sport_type is not null
```

<Dropdown 
    name=sport 
    data={sport_types}
    value=sport_type
    defaultValue="Run"
>
<DropdownOption value="Run" valueLabel="Run"/>
</Dropdown>


<Dropdown 
    name=sport2
    defaultValue="Run"
>
<DropdownOption value="Run" valueLabel="Run"/>
<DropdownOption value="Ride" />
</Dropdown>

```sql all_activities
  select
      DATETRUNC('month', start_at_local) as activity_month
    , sport_type
    , count(1) AS activities_cnt
  from strava_datastack.reporting_all_activities
  WHERE sport_type in ('${inputs.sport2.value}')
  GROUP BY ALL
```

<BarChart
    data={all_activities}
    title="Activities by Month, {inputs.sport_types.value}"
    x=activity_month
    y=activities_cnt
    series=sport_type
/>


## What's Next?
- [Connect your data sources](settings)
- Edit/add markdown files in the `pages` folder
- Deploy your project with [Evidence Cloud](https://evidence.dev/cloud)

## Get Support
- Message us on [Slack](https://slack.evidence.dev/)
- Read the [Docs](https://docs.evidence.dev/)
- Open an issue on [Github](https://github.com/evidence-dev/evidence)
