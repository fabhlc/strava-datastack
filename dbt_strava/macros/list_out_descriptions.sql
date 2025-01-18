-- This macro collects data from a query and inserts it into a list

{% macro list_out_descriptions() %}
    {% set query_to_process %}
        select description from {{ ref('modeled_weight_training') }}
        where description is not null or description <> ''
    {% endset %}

    {% set results = run_query(query_to_process) %}

    {% if execute %}
        {% set results_list = results.rows %}
    {% else %}
        {% set results_list = [] %}
    {% endif %}

    {{ return(results_list) }}

{% endmacro %}