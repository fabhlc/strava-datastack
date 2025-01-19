-- This macro takes a single raw weight training record
-- 1. parses out the newlines into new records and inserts them into a table
-- 2. Separates out the csv lines into parsed columns

{% macro parse_weight_training() %}
{%- if execute -%}
    {% do run_query('drop table if exists dbt_models.tmp;') %}
    {% do run_query('create table if not exists dbt_models.tmp (activity_date TIMESTAMP, exercise VARCHAR);') %}

    {% set exercise_row_query %}
    select start_at_local, description from {{ ref('modeled_weight_training') }}
    where ',' in description
    {% endset %}

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


--    {% set exercise_column_values = dbt_utils.get_column_values(
--        table=ref('modeled_weight_training'),
--        where="',' in description and start_at_local >= '2025-01-01' and length(description) > 0",
--        column='description'
--        ) %}

--    {% for record in exercise_column_values %}
--        {{print(record ~ "\nend record")}}
--        {% set tmp = record.split("\n") %}
--        {% for exercise in tmp %}
--            {% set execute_statement %}
--            insert into dbt_models.tmp values (1, '{{ exercise }}')
--            {% endset %}
--            {% do run_query(execute_statement) %}
--        {% endfor %}
--
--    {% endfor %}



--    {{ return(exercise_column) }}