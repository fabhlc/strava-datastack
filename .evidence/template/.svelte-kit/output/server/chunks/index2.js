import{b,s as w,r as m,e as q,f as x}from"./utils.js";const a=[];function z(s,u){return{subscribe:A(s,u).subscribe}}function A(s,u=b){let t;const n=new Set;function o(r){if(q(s,r)&&(s=r,t)){const i=!a.length;for(const e of n)e[1](),a.push(e,s);if(i){for(let e=0;e<a.length;e+=2)a[e][0](a[e+1]);a.length=0}}}function f(r){o(r(s))}function l(r,i=b){const e=[r,i];return n.add(e),n.size===1&&(t=u(o,f)||b),r(s),()=>{n.delete(e),n.size===0&&t&&(t(),t=null)}}return{set:o,update:f,subscribe:l}}function E(s,u,t){const n=!Array.isArray(s),o=n?[s]:s;if(!o.every(Boolean))throw new Error("derived() expects stores as input, got a falsy value");const f=u.length<2;return z(t,(l,r)=>{let i=!1;const e=[];let d=0,p=b;const y=()=>{if(d)return;p();const c=u(n?e[0]:e,l,r);f?l(c):p=x(c)?c:b},h=o.map((c,g)=>w(c,_=>{e[g]=_,d&=~(1<<g),i&&y()},()=>{d|=1<<g}));return i=!0,y(),function(){m(h),p(),i=!1}})}function S(s){return{subscribe:s.subscribe.bind(s)}}export{S as a,E as d,z as r,A as w};