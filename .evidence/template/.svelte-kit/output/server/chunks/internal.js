import{c as g,s as y,v as d,m as c}from"./ssr.js";import{a as w}from"./ssr2.js";import"./environment.js";import"./paths.js";let k={},C={};function U(n){}function V(n){k=n}function B(n){C=n}let x=null;function I(n){x=n}function L(n){}const b=g((n,t,e,_)=>{let{stores:r}=t,{page:f}=t,{constructors:i}=t,{components:a=[]}=t,{form:l}=t,{data_0:m=null}=t,{data_1:h=null}=t,{data_2:v=null}=t;y("__svelte__",r),w(r.page.notify),t.stores===void 0&&e.stores&&r!==void 0&&e.stores(r),t.page===void 0&&e.page&&f!==void 0&&e.page(f),t.constructors===void 0&&e.constructors&&i!==void 0&&e.constructors(i),t.components===void 0&&e.components&&a!==void 0&&e.components(a),t.form===void 0&&e.form&&l!==void 0&&e.form(l),t.data_0===void 0&&e.data_0&&m!==void 0&&e.data_0(m),t.data_1===void 0&&e.data_1&&h!==void 0&&e.data_1(h),t.data_2===void 0&&e.data_2&&v!==void 0&&e.data_2(v);let o,p,u=n.head;do o=!0,n.head=u,r.page.set(f),p=`  ${i[1]?`${d(i[0]||c,"svelte:component").$$render(n,{data:m,this:a[0]},{this:s=>{a[0]=s,o=!1}},{default:()=>`${i[2]?`${d(i[1]||c,"svelte:component").$$render(n,{data:h,this:a[1]},{this:s=>{a[1]=s,o=!1}},{default:()=>`${d(i[2]||c,"svelte:component").$$render(n,{data:v,form:l,this:a[2]},{this:s=>{a[2]=s,o=!1}},{})}`})}`:`${d(i[1]||c,"svelte:component").$$render(n,{data:h,form:l,this:a[1]},{this:s=>{a[1]=s,o=!1}},{})}`}`})}`:`${d(i[0]||c,"svelte:component").$$render(n,{data:m,form:l,this:a[0]},{this:s=>{a[0]=s,o=!1}},{})}`} `;while(!o);return p}),O={app_dir:"_app",app_template_contains_nonce:!1,csp:{mode:"auto",directives:{"upgrade-insecure-requests":!1,"block-all-mixed-content":!1},reportOnly:{"upgrade-insecure-requests":!1,"block-all-mixed-content":!1}},csrf_check_origin:!0,embedded:!1,env_public_prefix:"PUBLIC_",env_private_prefix:"",hooks:null,preload_strategy:"modulepreload",root:b,service_worker:!1,templates:{app:({head:n,body:t,assets:e,nonce:_,env:r})=>`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="`+e+`/favicon.ico" sizes="32x32" />
		<link rel="icon" href="`+e+`/icon.svg" type="image/svg+xml" />
		<link rel="apple-touch-icon" href="`+e+`/apple-touch-icon.png" />
		<link rel="manifest" href="`+e+`/manifest.webmanifest" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<script>
			try {
				/** @type {'light' | 'dark' | 'system'} */
				const savedTheme = localStorage.getItem('evidence-theme') ?? 'system';
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				const theme = savedTheme === 'system' ? (prefersDark ? 'dark' : 'light') : savedTheme;
				document.documentElement.setAttribute('data-theme', theme);
			} catch (e) {}
		<\/script>
		`+n+`
	</head>
	<body>
		<script>
			/*loading*/
		<\/script>
		<div>
			<!-- SvelteKit Hydrated Content -->
			`+t+`
		</div>

		<!-- SplashScreen -->
		<div
			aria-disabled
			id="__evidence_project_splash"
			data-test-id="__evidence_project_splash"
			class="fixed inset-0 w-screen h-screen flex items-center justify-center z-[9999] bg-base-100"
			style="visibility: hidden"
		>
			<svg
				width="100"
				height="100"
				viewBox="-8 -8 588 588"
				xmlns="http://www.w3.org/2000/svg"
				fill="currentColor"
				class="animate-pulse"
			>
				<path
					d="M7.19462e-05 74.3583C109.309 74.3583 195.795 86.2578 286.834 37.825C377.872 -10.6077 466.416 1.29174 573.667 1.29175L573.667 126.549C466.416 126.549 377.373 114.91 286.834 163.082C196.294 211.254 109.309 199.615 6.11417e-05 199.615L7.19462e-05 74.3583Z"
				/>
				<path
					d="M573.669 499.31C464.36 499.31 377.874 487.411 286.835 535.843C195.797 584.276 107.252 572.377 0.0014801 572.377V447.12C107.252 447.12 196.295 458.758 286.835 410.586C377.375 362.415 464.36 374.053 573.669 374.053V499.31Z"
				/>
				<path
					d="M452.896 186.499C395.028 187.686 341.581 194.947 286.835 224.074C211.396 264.212 136.995 262.826 52.2355 261.247C35.2696 260.931 17.8887 260.608 0.0014801 260.608V385.865C18.1032 385.865 35.6721 386.204 52.81 386.534C137.212 388.162 211.162 389.589 286.835 349.331C341.838 320.07 395.18 312.831 452.896 311.685V186.499Z"
				/>
			</svg>
		</div>
	</body>
</html>
`,error:({status:n,message:t})=>`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>`+t+`</title>

		<style>
			body {
				--bg: white;
				--fg: #222;
				--divider: #ccc;
				background: var(--bg);
				color: var(--fg);
				font-family:
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					'Segoe UI',
					Roboto,
					Oxygen,
					Ubuntu,
					Cantarell,
					'Open Sans',
					'Helvetica Neue',
					sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.error {
				display: flex;
				align-items: center;
				max-width: 32rem;
				margin: 0 1rem;
			}

			.status {
				font-weight: 200;
				font-size: 3rem;
				line-height: 1;
				position: relative;
				top: -0.05rem;
			}

			.message {
				border-left: 1px solid var(--divider);
				padding: 0 0 0 1rem;
				margin: 0 0 0 1rem;
				min-height: 2.5rem;
				display: flex;
				align-items: center;
			}

			.message h1 {
				font-weight: 400;
				font-size: 1em;
				margin: 0;
			}

			@media (prefers-color-scheme: dark) {
				body {
					--bg: #222;
					--fg: #ddd;
					--divider: #666;
				}
			}
		</style>
	</head>
	<body>
		<div class="error">
			<span class="status">`+n+`</span>
			<div class="message">
				<h1>`+t+`</h1>
			</div>
		</div>
	</body>
</html>
`},version_hash:"4uy2ke"};async function T(){return{...await import("./hooks.server.js")}}export{U as a,V as b,B as c,I as d,L as e,T as g,O as o,k as p,x as r,C as s};
