import{nanoid as N}from"nanoid";import{Query as T,sql as f,count as A,sum as D,avg as k,min as L,max as P,median as j}from"@uwdata/mosaic-sql";import{d as F}from"./index4.js";import{w as v}from"./index2.js";const O={BASE_URL:"/strava-datastack/",DEV:!1,MODE:"production",PROD:!0,SSR:!0},b=()=>{if(typeof process<"u")return!!(process.env.EVIDENCE_DEBUG||process.env.VITE_PUBLIC_EVIDENCE_DEBUG||process.env.NODE_ENV==="test"&&!process.env.EVIDENCE_DISABLE_TEST_DEBUG);if(typeof O<"u")return!1},C=h=>{let e=null,i=null;const s=new Promise((r,a)=>{e=r,i=a});let t="init",n=null;if(!e||!i)throw new Error;return{promise:s,resolve:r=>{if(e)(t==="loading"||t==="init")&&(t="resolved",n=r,e(r),h?.());else throw new Error("SharedPromise encountered an error: res not defined")},reject:r=>{if(i)(t==="loading"||t==="init")&&(t="rejected",s.catch(()=>{}),i(r),h?.());else throw new Error("SharedPromise encountered an error: rej not defined")},get state(){return t},get value(){return n},start(){t="loading",h?.()}}},m=(h,e,i)=>{try{const s=typeof e=="function"?e():e;return s instanceof Promise?s.then(t=>h(t,!0)).catch(t=>{const n=t instanceof Error?t:new Error("Unknown Error",{cause:t});if(i)return i(n,!0);throw n}):h(s,!1)}catch(s){const t=s instanceof Error?s:new Error("Unknown Error",{cause:s});if(i)return i(t,!1);throw t}},M=(h,e)=>{const i=e.reduce((s,t)=>s+H(t.column_type),e.length*4);return Math.abs(i*h)};function B(h){return h.startsWith("STRUCT")||h.endsWith("[]")}function U(h){return h.startsWith("DECIMAL")}function H(h){const e={string:30,number:12,boolean:4,date:48};if(B(h))return console.warn(`[!] Evidence does not support DuckDB Struct or Array
If you need to use one, convert it to JSON in your query, and then manually parse it in your project`),e.string;if(U(h))return e.number;switch(h){case"BOOLEAN":return e.boolean;case"BIGINT":case"DOUBLE":case"FLOAT":case"INTEGER":case"SMALLINT":case"TINYINT":case"UBIGINT":case"UINTEGER":case"USMALLINT":case"UTINYINT":case"HUGEINT":return e.number;case"UUID":case"VARCHAR":return e.string;case"DATE":case"TIMESTAMP":case"TIMESTAMP_S":case"TIMESTAMP_MS":case"TIMESTAMP_NS":case"TIMESTAMP WITH TIME ZONE":return e.date;case"INTERVAL":case"TIME":case"TIME WITH TIME ZONE":case"BLOB":case"BIT":return e.string;default:return console.error(`Column type ${h} is not supported`),e.string}}const W=/--([^']|'.*')+$/,G=/(\/\*.*\*\/)/g,q=h=>{const e=h.split(`
`);let i=!1;for(let s=e.length;s>0;s--){let t=e[s-1],n="";const r=Array.from(t.matchAll(G));for(const o of r){const l=t.slice(0,o.index),u=t.slice(o.index+o[0].length);t=`${l}${u}`}if(i&&t.includes("/*")){i=!1;const o=t.split("/*");t=o.slice(0,-1).join("/*"),n+="/*"+o.slice(-1)}if(t.trim().endsWith("*/")){i=!0;continue}const a=W.exec(t);if(a){const o=t.slice(0,a.index),l=o.trimEnd();if(l.endsWith(";")){const u=t.slice(a.index),p=o.slice(l.length,o.length);t=`${o.slice(0,-1+-1*(o.length-l.length))}${p}${u}`}}else if(t.trimEnd().endsWith(";")){const l=t.lastIndexOf(";");t=t.slice(0,l)+t.slice(l+1)}for(const o of r){const l=t.slice(0,o.index),u=t.slice(o.index);t=`${l}${o[0]}${u}`}if(t!==e[s-1]){e[s-1]=t+n;break}}return e.push(""),e.join(`
`)};class c{#y;get value(){return this.#y}#r=[];#N=-1;get dataLoaded(){return["resolved","rejected"].includes(this.#e.state)}get dataLoading(){return this.#e.state==="loading"}get dataQueryTime(){return this.#N}#p=0;#A=-1;get length(){return this.#p}get lengthLoaded(){return["resolved","rejected"].includes(this.#t.state)}get lengthLoading(){return this.#t.state==="loading"}get lengthQueryTime(){return this.#A}#o=[];#D=void 0;#k=-1;get columns(){return this.#o}get columnsLoaded(){return["resolved","rejected"].includes(this.#s.state)}get columnsLoading(){return this.#s.state==="loading"}get columnsQueryTime(){return this.#k}get ready(){return this.#t.state==="resolved"&&this.#s.state==="resolved"&&this.#e.state==="resolved"}get loading(){return this.#t.state==="loading"||this.#s.state==="loading"||this.#e.state==="loading"}#L;get#i(){return this.#L}set#i(e){e&&(console.error(`${this.id} | Error in Query!`,e?.message),this.#w("error",e),this.#L=e)}get error(){return this.#i}#a;#$;get originalText(){return this.#$}get text(){return this.#a?.toString()??"SELECT 'Empty Query' WHERE 0"}static#f=new Set;static get queriesInFlight(){return c.#f.size>0}static resetInFlightQueries(){c.#f=new Set}static#B=e=>{this.#f.size===0&&this.#S("inFlightQueryStart",void 0),c.#f.add(e),e.#e.promise.finally(()=>{c.#f.delete(e),this.#f.size===0&&this.#S("inFlightQueryEnd",void 0)})};static#T={inFlightQueryStart:new Set,inFlightQueryEnd:new Set,queryCreated:new Set,cacheCleared:new Set};static#S=(e,i)=>{c.#T[e].forEach(s=>s(i,e))};static addEventListener(e,i){this.#T[e].add(i)}static removeEventListener(e,i){this.#T[e].delete(i)}static#P=10*1024*1024;#h=-1;get score(){return this.#h}#U=()=>{this.lengthLoaded&&this.columnsLoaded?(this.#h=M(this.length,this.columns),this.#h>c.#P&&this.#w("highScore",this.#h)):Promise.allSettled([this.#t.promise,this.#s.promise]).then(([e,i])=>{if(e.status==="rejected"||i.status==="rejected"){this.#h=-1;return}if(!this.#p||!this.#o){this.#h=-1;return}this.#h=M(this.length,this.columns),this.#h>c.#P&&this.#w("highScore",this.#h)}).catch(e=>{console.error(`${this.id} | Failed to calculate Query score ${e}`)})};#e=C(()=>this.publish(`data promise (${this.#e.state})`));#b=()=>{if(this.#e.state!=="init")return this.#e.promise;if(this.#i)return this.#c("data error","Refusing to execute data query, store has an error state"),this.#e.promise;if(this.#e.state!=="init"||this.opts.noResolve)return this.#e.promise;this.#e.start();const e=`
---- Data ${this.#u} ${this.#g}
${this.text.trim()}
        `.trim()+`
`;this.#x("data query text",`
`+e,"font-family: monospace;");const i=this.#n;c.#B(this);const s=performance.now();return m((n,r)=>{this.#r=n;const a=performance.now();return s-a>5e3&&(this.#w("longRun",s-a),this.#c("long-running",`Query took ${s-a}ms to execute`)),this.#N=a-s,this.#v(),this.#e.resolve(this),this.#w("dataReady",void 0),r?this.#e.promise:this},()=>i(e,`${this.#u}_data`),(n,r)=>(this.#i=n,this.#e.reject(n),r?this.#e.promise:this))};fetch=()=>this.#C()instanceof Promise&&!this.opts.noResolve?Promise.allSettled([this.#C(),this.#b()]).then(()=>this.value):(this.#b(),this.value);backgroundFetch=()=>{if(typeof window>"u"){this.#c("background fetch skip","Did not execute backgroundFetch in SSR");return}this.#c("background fetch","Executed backgroundFetch"),m(()=>{},async()=>(await new Promise(e=>setTimeout(e,0)),this.#n(`--data
${this.text.trim()}`,this.id)),()=>{})};#t=C(()=>this.publish(`length promise (${this.#t.state})`));#v=()=>{if(this.#r&&this.#e.state==="resolved"&&this.#t.state==="init")return this.#c("length inferred","Inferred length from already-resolved data promise",this.#r),this.#p=this.#r.length,this.#t.resolve(this),this.#t.promise;if(this.#i)return this.#c("length error","Refusing to execute length query, store has an error state",this.#i),this.#t.reject(this.#i),this.#t.value??this.#t.promise;if(this.#t.state!=="init"||this.opts.noResolve)return this.#t.promise;this.#t.start();const e=`
---- Length ${this.#u} (${this.#g})
SELECT COUNT(*) as rowCount FROM (${this.text.trim()})
        `.trim()+`
`,i=this.#n;this.#x("length query text",`
`+e,"font-family: monospace;");const s=performance.now();return m((n,r)=>{const a=performance.now();return this.#A=a-s,this.#p=n[0].rowCount,this.#t.resolve(this),r?this.#t.promise:this},()=>i(e,`${this.#u}_length`),(n,r)=>(this.#i=n,this.#t.reject(n),r?this.#t.promise:this))};#s=C(()=>this.publish(`columns promise (${this.#s.state})`));#C=()=>{if(this.#i)return this.#c("cols query error","Refusing to execute columns query, store has an error state",this.#i),this.#s.value??this.#s.promise;if(this.#s.state!=="init"||this.opts.noResolve)return this.#s.promise;this.#s.start();const e=`
---- Columns ${this.#u} (${this.#g})
DESCRIBE ${this.text.trim()}
        `.trim()+`
`;this.#x("columns query text",`
`+e,"font-family: monospace;");const i=this.#n,s=performance.now();return m((n,r)=>{const a=performance.now();return this.#k=a-s,this.#o=n,this.#s.resolve(this),this.#D=Object.fromEntries(n.map(o=>[o.column_name,void 0])),r?this.#s.promise:this},()=>i(e,`${this.#u}_columns`),(n,r)=>(this.#i=n,this.#s.reject(n),r?this.#s.promise:this))};get isQuery(){return!0}static isQuery=e=>typeof e!="object"||!e?!1:"isQuery"in e&&e.isQuery===!0;static[Symbol.hasInstance](e){return c.isQuery(e)}static get ProxyFetchTriggers(){return["at"]}#H=()=>new Proxy([],{getPrototypeOf:()=>Object.getPrototypeOf(this.#r),has:(i,s)=>s in this.#r||s in this,get:(i,s)=>{let t=s;if(typeof t=="string"&&/^[\d.]+$/.exec(t)&&(t=parseInt(t)),(typeof t=="number"||c.ProxyFetchTriggers.includes(t.toString()))&&this.#e.state==="init"&&(this.#c("implicit fetch",`Implicit query fetch triggered by ${t.toString()}`),this.#b()),t==="length"&&this.#v(),t==="constructor")return this.#r.constructor;if(t==="toString")return this.#r.toString.bind(this.#r);const n=t in this?this:this.#r&&t in this.#r?this.#r:null;if(n===null)return typeof t!="number"||t>this.#p?void 0:this.#D??{};const r=n[t];return typeof r=="function"?r.bind(n):r}});static CacheMaxScore=5*10*1024;static#l=new Map;static emptyCache=()=>{this.#l.clear(),this.#S("cacheCleared",void 0)};static get cacheSize(){return this.#l.size}static#W=e=>{this.#l.set(e.hash,{query:e,added:Date.now()}),c.#m("cache",`Added to cache: ${e.hash}`,{cacheSize:this.#l.size,cacheScore:Array.from(this.#l.values()).reduce((i,s)=>i+s.query.score,0)})};static#G=e=>{const i=this.#l.get(e);return i?i.query:null};static#j=()=>{let e=Array.from(this.#l.values()).reduce((s,t)=>s+t.query.score,0);const i=Array.from(this.#l.values()).sort((s,t)=>s.added-t.added);for(;e>this.CacheMaxScore;){const s=i.shift();if(!s)break;this.#l.delete(s.query.hash),e-=s.query.score}};static createReactive=(e,i,s)=>{const{loadGracePeriod:t=250,callback:n=()=>{},execFn:r}=e,a=c.create;let o=s,l=0,u;const p=(d,E)=>{if(!o)throw new Error;l+=1;const y=l;c.#m(`${o.id} (${g(d)}) | Reactive Updating`,d,{changeIdx:l,targetChangeIdx:y,hash:g(d)},{initialOpts:i,newOpts:E});const w=c.isQuery(d)?d:a(d,r,Object.assign({},i,{initialData:void 0,initialError:void 0},E)),x=w.fetch();let I=x;x instanceof Promise&&(I=Promise.race([new Promise(S=>setTimeout(S,t)),w.fetch()])),m(()=>{if(l!==y){c.#m("changeIdx does not match, results are discarded");return}u?.(),o=w.value,u=o.subscribe(n)},I,S=>{throw console.warn(`Error while attempting to update reactive query: ${S.message}`),S})};function $(){i={...i,initialData:void 0,initialError:void 0}}return(d,E)=>{if(o){m(()=>{},p(d,E),w=>{console.warn(`Error while attempting to update reactive query: ${w.message}`)});return}o=a(d,r,Object.assign({},i,E));const y=o.fetch();m($,y),u=o.subscribe(n),n(o)}};static#z=!1;static#Q=()=>{};static create=(e,i,s,t)=>{const n=g(e);let r;if(typeof s=="string"?r={...t,id:s}:s?(r=s,r.id||(r.id=n+"-"+Math.random().toString(36).substring(0,4))):r={id:n+"-"+Math.random().toString(36).substring(0,4)},"autoScore"in r||(r.autoScore=!0),r.disableCache)c.#m(`${r.id??"[query id missing]"} (${n}) | cache disabled`,`Cache is disabled for ${r.id??"[query id missing]"}`,{opts:r,query:e,hash:g(e)});else{const o=c.#G(n);if(c.#j(),o)return c.#m(`${r.id??"[query id missing]"} (${n}) | Using cached query`,{opts:r,hash:g(e)},e,o),o.value;c.#m(`${r.id??"[query id missing]"} (${n}) | Cached query not found`,{opts:r,hash:g(e)},e)}c.#I=!0;const a=new c(e,i,r);return c.#S("queryCreated",{raw:a,proxied:a.value}),r.disableCache||(c.#W(a),c.#j()),a.value};static#m=b()?(e,...i)=>{const s=`${(performance.now()/1e3).toFixed(3)} | Query | ${e}`;console.groupCollapsed(s);for(const t of i)console.debug(typeof t=="function"?t():t);console.groupEnd()}:()=>{};static#J=b()?(e,i,s)=>{const t=`${(performance.now()/1e3).toFixed(3)} | Query | ${e}`;console.groupCollapsed(t),console.debug(`%c${i}`,s),console.groupEnd()}:()=>{};#c=b()?(e,...i)=>{const s=`${(performance.now()/1e3).toFixed(3)} | ${this.id} (${this.hash}) | ${e}`;console.groupCollapsed(s);for(const t of i)console.debug(typeof t=="function"?t():t);console.groupEnd()}:()=>{};#x=b()?(e,i,s)=>{const t=`${(performance.now()/1e3).toFixed(3)} | ${this.id} (${this.hash}) | ${e}`;console.groupCollapsed(t),console.debug(`%c${i}`,s),console.groupEnd()}:()=>{};static#I=!1;#u;#g;#E;get#d(){return{autoScore:this.#E.autoScore,noResolve:this.#E.noResolve,disableCache:this.#E.disableCache}}get id(){return this.#u}get hash(){return this.#g}#n;opts;#F;get createdStack(){return this.#F}constructor(e,i,s={}){this.#F=new Error().stack?.split(`
`).slice(2).map(o=>o.slice(7)).join(`
`);const{id:t,initialData:n=void 0,knownColumns:r=void 0,initialError:a=void 0}=s;if(this.opts=s,this.#n=i,typeof e!="string"&&!(e instanceof T)&&(console.warn(`Query ${t} has no query text`),s.noResolve=!0),c.#I||console.warn("Directly using new Query() is not a recommended use-case. Please use Query.create()"),c.#I=!1,this.#y=this.#H(),this.#$=e?.toString()??"SELECT 'Empty Query' WHERE 0",this.#g=g(this.#$),this.#u=t??this.#g,this.#E=s,e&&typeof e!="string")this.#a=e;else if(e){const o=new T().from({[`inputQuery-${N(2)}`]:f`(${q(e)})`}).select("*");this.#a=o}else{this.#a=new T,this.#i=new Error("Refusing to create Query: No Query Text provided");return}if(a){this.#i=a;return}if(n)this.#c("initial data","Created with initial data",n),m(o=>{this.#r=o,s.initialDataDirty?(this.publish("dataDirty"),this.#b()):(this.#e.resolve(this),this.#v())},n,o=>{this.#i=o});else if(s.noResolve)return this.#e.start(),this.#t.start(),this.#s.start(),this;if(r){if(!Array.isArray(r))throw new Error("Expected knownColumns to be an array",{cause:r});this.#c("known columns","Created with known columns",r),this.#o=r,this.#s.resolve(this)}else m(()=>{},this.#C(),(o,l)=>{if(!l)throw o});m(()=>{},this.#v(),(o,l)=>{if(!l)throw o}),s.autoScore&&this.#U()}#M=new Set;subscribe=e=>(this.#M.add(e),e(this.#y),()=>this.#M.delete(e));#q=0;publish=e=>{if(this.#q++>1e5)throw new Error("Query published too many times.");this.#c("publish",`Publishing triggered by ${e}`,this),this.#M.forEach(i=>i(this.#y))};#R={dataReady:new Set,error:new Set,highScore:new Set,longRun:new Set};#w=(e,i)=>{this.#R[e].forEach(s=>s(i,e))};on=(e,i)=>{this.#R[e].add(i)};off=(e,i)=>{this.#R[e].delete(i)};addEventListener=this.on;removeEventListener=this.off;where=e=>c.create(this.#a.clone().where(f`${e}`),this.#n,{knownColumns:this.#o,noResolve:this.#E.noResolve});withOrdinal=e=>{const i=this.#a.clone();return i.select({ordinal:f`row_number() over (${e})`}),c.create(i,this.#n,{...this.#d,knownColumns:this.#o})};search=(e,i,s)=>{(typeof s>"u"||s<0||s>1)&&(s=1-1/e.length);const t=[...this.#o,{column_name:"similarity",column_type:"INTEGER",nullable:"NO"}],n=c.create,r=e.replaceAll("'","''"),o=(Array.isArray(i)?i:[i]).map(u=>{const p=f`CASE WHEN lower("${u.trim()}") = lower('${r}') THEN 2 ELSE 0 END`,$=f`jaccard(lower('${r}'), lower("${u}"))`,d=r.length>=1?f`CASE WHEN lower("${u.trim()}") LIKE lower('%${r.split(" ").join("%")}%') THEN 1 ELSE 0 END`:f`0`;return f`GREATEST((${p}), (${$}), (${d}))`}).join(",");return n(this.#a.clone().$select({similarity:f`GREATEST(${o})`},"*").where(f`"similarity" > ${s} `).orderby(f`"similarity" DESC`),this.#n,{knownColumns:t,...this.#d})};limit=e=>c.create(this.#a.clone().limit(e),this.#n,{knownColumns:this.#o,...this.#d});offset=e=>c.create(this.#a.clone().offset(e),this.#n,{knownColumns:this.#o,...this.#d});paginate=(e,i)=>c.create(this.#a.clone().offset(e).limit(i),this.#n,{knownColumns:this.#o,...this.#d});groupBy=(e,i)=>{const s=this.#a.clone();return s.$select(e),i&&s.select({rows:A("*")}),s.$groupby(e),c.create(s,this.#n,{knownColumns:this.#o,...this.#d})};static#O={sum:D,avg:k,min:L,max:P,median:j};static#V=e=>e in c.#O;agg=e=>{const i=this.#a.clone();for(const[s,t]of Object.entries(e)){if(!c.#V(s))throw new Error(`Unknown agg function: ${s}`);const n=c.#O[s],r=Array.isArray(t)?t:[t];for(const a of r){const o=typeof a=="object"?a.as:`${s}_${a}`,l=typeof a=="object"?a.col:a;i.select({[o]:n(l)})}}return c.create(i,this.#n,{knownColumns:this.#o,...this.#d})}}const g=(...h)=>(i=>{let s=0;for(let t=0;t<i.length;t++){const n=i.charCodeAt(t);s=(s<<5)-s+n,s&=s}return new Uint32Array([s])[0].toString(36)})(JSON.stringify(h)),K=v(!0),X=v("");function V(){const{subscribe:h,update:e}=v([]),i=new Map,s=t=>{e(n=>n.filter(r=>r.id!==t))};return{subscribe:h,add:(t,n=2e3)=>{if(t.id=t.id??Math.random().toString(),e(r=>{const a=r.find(o=>o.id===t.id);return a?(Object.assign(a,t),i.has(t.id)&&(clearTimeout(i.get(t.id)),i.delete(t.id))):r.push(t),r}),n){const r=setTimeout(()=>{s(t.id),i.delete(t.id)},n);i.set(t.id,r)}},dismiss:t=>{s(t),i.has(t)&&(clearTimeout(i.get(t)),i.delete[t])}}}const _=V(),R=h=>{let e;return h.subscribe(i=>e=i)(),e},z=(h,e,i)=>{i?.serialize,i?.deserialize;const s=v(e),{subscribe:t,set:n}=s;return(a=>{})(R(s)),{subscribe:t,set:a=>{n(a)},update:a=>{const o=a(R(s));n(o)}}},ee=z("showQueries",F);export{c as Q,X as a,z as l,K as p,m as r,ee as s,_ as t};