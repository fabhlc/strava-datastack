const d=(e,i)=>{if(e instanceof String&&(e=e.toString()),typeof e!="string"||e.startsWith("http")||e.startsWith("#")||/^[^/]*:/.test(e))return e;let s=i.deployment.basePath;return s?(s?.startsWith("/")||(s=`/${s}`),s.endsWith("/")&&(s=s.slice(0,-1)),e.startsWith(s)?e:(e.startsWith("/")||(e=`/${e}`),`${s}${e}`)):e},t={plugins:{components:{"@evidence-dev/core-components":{overrides:[],aliases:{},provides:[]}},datasources:{"@evidence-dev/bigquery":{},"@evidence-dev/csv":{},"@evidence-dev/databricks":{},"@evidence-dev/duckdb":{},"@evidence-dev/mssql":{},"@evidence-dev/mysql":{},"@evidence-dev/postgres":{},"@evidence-dev/snowflake":{},"@evidence-dev/sqlite":{},"@evidence-dev/trino":{},"@evidence-dev/motherduck":{}}},deployment:{basePath:"/strava-datastack"}},n=e=>d(e,t);export{n as a,t as c};
