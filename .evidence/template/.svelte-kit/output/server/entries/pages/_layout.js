import{b as O}from"../../chunks/index4.js";import{setParquetURLs as y,initDB as $,updateSearchPath as v,query as E}from"@evidence-dev/universal-sql/client-duckdb";import{p as i,s as F}from"../../chunks/profile.js";import"../../chunks/stores.js";import{a as d}from"../../chunks/index5.js";import h from"blueimp-md5";import{b}from"../../chunks/environment.js";const A=!0,D="always",L=async()=>{let e={};{const{readFile:n}=await import("fs/promises");({renderedFiles:e}=JSON.parse(await n("./static/data/manifest.json","utf-8").catch(()=>"{}")))}await i($),Object.keys(e??{}).length===0?console.warn('No sources found, execute "npm run sources" to generate'.trim()):(await i(y,e),await i(v,Object.keys(e)))},g=i(L),k=["/settings","/explore"],o=new Map,J=async({fetch:e,route:n,params:p,url:r})=>{const[{customFormattingSettings:w},l,j]=await Promise.all([e(d("/api/customFormattingSettings.json/GET.json")).then(t=>t.json()),e(d("/api/pagesManifest.json")).then(t=>t.json()),e(d(`/api/${n.id}/evidencemeta.json`)).then(t=>t.json()).catch(()=>({queries:[]}))]),_=h(n.id),M=h(Object.entries(p).sort().map(([t,s])=>`${t}${s}`).join("")),P=n.id&&k.every(t=>!n.id.startsWith(t));let S={};const{inputs:u=F({label:"",value:"(SELECT NULL WHERE 0 /* An Input has not been set */)"})}=o.get(r.pathname)??{},q=o.has(r.pathname);b&&!O&&!q&&(o.set(r.pathname,{inputs:u}),await e(r),o.delete(r.pathname)),await g;function f(t,{query_name:s,callback:c=m=>m}={}){return c(E(t,{route_hash:_,additional_hash:M,query_name:s,prerendering:b}))}let a=l;for(const t of(n.id??"").split("/").slice(1)){if(a=a.children[t],!a)break;if(a.frontMatter?.title)a.title=a.frontMatter.title;else if(a.frontMatter?.breadcrumb){let{breadcrumb:s}=a.frontMatter;for(const[c,m]of Object.entries(p))s=s.replaceAll(`\${params.${c}}`,m);a.title=(await f(s))[0]?.breadcrumb}}return{__db:{query:f,async load(){return g},async updateParquetURLs(t){const{renderedFiles:s}=JSON.parse(t);await i(y,s)}},inputs:u,data:S,customFormattingSettings:w,isUserPage:P,evidencemeta:j,pagesManifest:l}};export{J as load,A as prerender,D as trailingSlash};