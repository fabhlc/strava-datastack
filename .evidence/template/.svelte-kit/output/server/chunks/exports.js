const _=new URL("sveltekit-internal://");function S(e,r){if(r[0]==="/"&&r[1]==="/")return r;let t=new URL(e,_);return t=new URL(r,t),t.protocol===_.protocol?t.pathname+t.search+t.hash:t.href}function b(e,r){return e==="/"||r==="ignore"?e:r==="never"?e.endsWith("/")?e.slice(0,-1):e:r==="always"&&!e.endsWith("/")?e+"/":e}function x(e){return e.split("%25").map(decodeURI).join("%25")}function P(e){for(const r in e)e[r]=decodeURIComponent(e[r]);return e}const w=["href","pathname","search","toString","toJSON"];function j(e,r,t){const n=new URL(e);Object.defineProperty(n,"searchParams",{value:new Proxy(n.searchParams,{get(s,o){if(o==="get"||o==="getAll"||o==="has")return f=>(t(f),s[o](f));r();const a=Reflect.get(s,o);return typeof a=="function"?a.bind(s):a}}),enumerable:!0,configurable:!0});for(const s of w)Object.defineProperty(n,s,{get(){return r(),e[s]},enumerable:!0,configurable:!0});return n[Symbol.for("nodejs.util.inspect.custom")]=(s,o,a)=>a(e,o),n.searchParams[Symbol.for("nodejs.util.inspect.custom")]=(s,o,a)=>a(e.searchParams,o),$(n),n}function $(e){h(e),Object.defineProperty(e,"hash",{get(){throw new Error("Cannot access event.url.hash. Consider using `$page.url.hash` inside a component instead")}})}function y(e){h(e);for(const r of["search","searchParams"])Object.defineProperty(e,r,{get(){throw new Error(`Cannot access url.${r} on a page with prerendering enabled`)}})}function h(e){e[Symbol.for("nodejs.util.inspect.custom")]=(r,t,n)=>n(new URL(e),t)}const l="/__data.json",c=".html__data.json";function U(e){return e.endsWith(l)||e.endsWith(c)}function O(e){return e.endsWith(".html")?e.replace(/\.html$/,c):e.replace(/\/$/,"")+l}function T(e){return e.endsWith(c)?e.slice(0,-c.length)+".html":e.slice(0,-l.length)}function i(e){function r(t,n){if(t)for(const s in t){if(s[0]==="_"||e.has(s))continue;const o=[...e.values()],a=m(s,n?.slice(n.lastIndexOf(".")))??`valid exports are ${o.join(", ")}, or anything with a '_' prefix`;throw new Error(`Invalid export '${s}'${n?` in ${n}`:""} (${a})`)}}return r}function m(e,r=".js"){const t=[];if(u.has(e)&&t.push(`+layout${r}`),p.has(e)&&t.push(`+page${r}`),d.has(e)&&t.push(`+layout.server${r}`),v.has(e)&&t.push(`+page.server${r}`),g.has(e)&&t.push(`+server${r}`),t.length>0)return`'${e}' is a valid export in ${t.slice(0,-1).join(", ")}${t.length>1?" or ":""}${t.at(-1)}`}const u=new Set(["load","prerender","csr","ssr","trailingSlash","config"]),p=new Set([...u,"entries"]),d=new Set([...u]),v=new Set([...d,"actions","entries"]),g=new Set(["GET","POST","PATCH","PUT","DELETE","OPTIONS","HEAD","fallback","prerender","trailingSlash","config","entries"]),E=i(u),R=i(p),A=i(d),I=i(v),L=i(g);export{O as a,x as b,P as c,y as d,E as e,I as f,R as g,U as h,L as i,j as m,b as n,S as r,T as s,A as v};
