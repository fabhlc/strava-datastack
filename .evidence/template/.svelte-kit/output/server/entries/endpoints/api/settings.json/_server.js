import s from"fs";import"git-remote-origin-url";import{d as c}from"../../../../chunks/index4.js";import{logEvent as d}from"@evidence-dev/telemetry";import{j as f}from"../../../../chunks/index.js";const y=!1;async function b(){return new Response(void 0,{status:404})}function o(a,e,t){e&&(a.forEach(i=>{let r=new RegExp(`
${i}(?=
|$)`,"g");t=t.replace(r,"")}),s.writeFileSync("../../.gitignore",t))}function l(a,e){a.forEach(t=>{let i=new RegExp(`
${t}(?=
|$)`,"g");e.match(i)||(e=e+(`
`+t))}),s.writeFileSync("../../.gitignore",e)}async function v({request:a}){const{settings:e}=await a.json();let t={};s.existsSync("evidence.settings.json")&&(t=JSON.parse(s.readFileSync("evidence.settings.json","utf8"))),t.send_anonymous_usage_stats!="no"&&e.send_anonymous_usage_stats==="no"&&d("usageStatsDisabled",c,t),s.writeFileSync("evidence.settings.json",JSON.stringify(e));let i,r=s.existsSync("../../.gitignore");i=r?s.readFileSync("../../.gitignore","utf8"):"";let n;return e.database==="sqlite"?(n=[".db",".sqlite",".sqlite3"],e.credentials.gitignoreSqlite===!1?o(n,r,i):e.credentials.gitignoreSqlite===!0&&l(n,i)):e.database==="duckdb"?(n=[".duckdb",".db"],e.credentials.gitignoreDuckdb===!1?o(n,r,i):e.credentials.gitignoreDuckdb===!0&&l(n,i)):e.database==="csv"&&(n=[".csv"],e.credentials.gitignoreCsv===!1?o(n,r,i):e.credentials.gitignoreCsv===!0&&l(n,i)),f(e)}export{b as GET,v as POST,y as prerender};