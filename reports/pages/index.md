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


```sql sport_types
  select DISTINCT
      sport_type
  from strava_datastack.reporting_all_activities
```
<Dropdown data={sport_types} name=sport value=sport_types>
    <DropdownOption value="%" valueLabel="All Categories"/>
</Dropdown>

```sql all_activities
  select
      DATETRUNC('month', start_at_local) as activity_month
    , sport_type
    , count(1) AS activities_cnt
  from strava_datastack.reporting_all_activities
  where category like '${inputs.sport_types.value}'
  GROUP BY ALL
```

<Dropdown data={categories} name=category value=category>
    <DropdownOption value="%" valueLabel="All Categories"/>
</Dropdown>

<Dropdown name=year>
    <DropdownOption value=% valueLabel="All Years"/>
    <DropdownOption value=2019/>
    <DropdownOption value=2020/>
    <DropdownOption value=2021/>
</Dropdown>

```sql orders_by_category
  select 
      date_trunc('month', order_datetime) as month,
      sum(sales) as sales_usd,
      category
  from strava_datastack.
  where category like '${inputs.category.value}'
  and date_part('year', order_datetime) like '${inputs.year.value}'
  group by all
  order by sales_usd desc
```

<BarChart
    data={orders_by_category}
    title="Sales by Month, {inputs.category.label}"
    x=month
    y=sales_usd
    series=category
/>

## What's Next?
- [Connect your data sources](settings)
- Edit/add markdown files in the `pages` folder
- Deploy your project with [Evidence Cloud](https://evidence.dev/cloud)

## Get Support
- Message us on [Slack](https://slack.evidence.dev/)
- Read the [Docs](https://docs.evidence.dev/)
- Open an issue on [Github](https://github.com/evidence-dev/evidence)
