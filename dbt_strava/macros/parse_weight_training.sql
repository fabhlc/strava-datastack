-- This macro takes a single raw weight training record
-- 1. parses out the newlines into new records and inserts them into a table
-- 2. Separates out the csv lines into parsed columns

-- TODO: make into incremental

-- destination_model = dbt_models.tmp;
{% macro parse_weight_training(destination_model) %}
{%- if execute -%}
    {% set destination_model = 'dbt_models.tmp' %}

    {% set create_model_query %}
    create table if not exists {{ destination_model }} (activity_at TIMESTAMP, exercise VARCHAR);
    {% endset %}

    {% set drop_model_query %}
    drop table if exists {{ destination_model }};
    {% endset %}

    {% set exercise_row_query %}
    select start_at_local, description from {{ ref('modeled_weight_training') }}
    where ',' in description
    {% endset %}

    {% do run_query(drop_model_query) %}
    {% do run_query(create_model_query) %}
    {% set results = run_query(exercise_row_query) %}

    {% for row in results %}
        {% set dt = row[0] %}
        {% set exercises = row[1].split("\n") %}
        {% for each_exercise in exercises %}
            {% set execute_statement %}
            insert into dbt_models.tmp values ('{{ dt }}', '{{ each_exercise }}')
            {% endset %}
            {% do run_query(execute_statement) %}
        {% endfor %}
    {% endfor %}

{% endif %}
{% endmacro %}