import{clsx as m}from"clsx";import{twMerge as x}from"tailwind-merge";function p(n){const e=n-1;return e*e*e+1}function C(...n){return x(m(n))}const w=(n,e={y:-8,x:0,start:.95,duration:150})=>{const u=getComputedStyle(n),f=u.transform==="none"?"":u.transform,c=(t,o,r)=>{const[s,d]=o,[a,l]=r;return(t-s)/(d-s)*(l-a)+a},i=t=>Object.keys(t).reduce((o,r)=>t[r]===void 0?o:o+`${r}:${t[r]};`,"");return{duration:e.duration??200,delay:0,css:t=>{const o=c(t,[0,1],[e.y??5,0]),r=c(t,[0,1],[e.x??0,0]),s=c(t,[0,1],[e.start??.95,1]);return i({transform:`${f} translate3d(${r}px, ${o}px, 0) scale(${s})`,opacity:t})},easing:p}},A=n=>{if(!(typeof n>"u")){if(typeof n=="string"){if(n.toLowerCase()==="true")return!0;if(n.toLowerCase()==="false")return!1}return!!n}};export{C as c,w as f,A as t};
