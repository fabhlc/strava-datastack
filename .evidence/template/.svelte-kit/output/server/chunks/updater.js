import{w as u}from"./VennDiagram.svelte_svelte_type_style_lang.js";import{nanoid as f}from"nanoid/non-secure";import{w as l}from"./index2.js";import{f as p}from"./ssr.js";const y=(r,t)=>{const e=u(r),n=(a,d)=>{e.update(i=>{const c=a(i);let o=c;return t&&(o=t({curr:i,next:c})),d?.(o),o})};return{...e,update:n,set:a=>{n(()=>a)}}};function b(){return f(10)}function w(r){return r.reduce((t,e)=>(t[e]=b(),t),{})}function E(r){const t={};return Object.keys(r).forEach(e=>{const n=e,s=r[n];t[n]=u(l(s))}),t}function D(r,t){const e={};return t.forEach(n=>{e[n]={[`data-${r}-${n}`]:""}}),n=>e[n]}function k(r){return r?{"aria-disabled":"true","data-disabled":""}:{"aria-disabled":void 0,"data-disabled":void 0}}function x(){const r=p();return t=>{const{originalEvent:e}=t.detail,{cancelable:n}=t,s=e.type;r(s,{originalEvent:e,currentTarget:e.currentTarget},{cancelable:n})||t.preventDefault()}}function A(r){const t={};for(const e in r){const n=r[e];n!==void 0&&(t[e]=n)}return t}function I(r){return function(t,e){if(e===void 0)return;const n=r[t];n&&n.set(e)}}export{I as a,x as b,D as c,k as d,b as e,w as g,y as o,A as r,E as t};
