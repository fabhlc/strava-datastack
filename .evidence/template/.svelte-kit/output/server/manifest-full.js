export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "strava-datastack/_app",
	assets: new Set(["apple-touch-icon.png","data/manifest.json","data/strava_source/activities_by_day/activities_by_day.parquet","data/strava_source/activities_by_day/activities_by_day.schema.json","favicon.ico","icon-192.png","icon-512.png","icon.svg"]),
	mimeTypes: {".png":"image/png",".json":"application/json",".svg":"image/svg+xml"},
	_: {
		client: {"start":"_app/immutable/entry/start.DsvTTw9b.js","app":"_app/immutable/entry/app.DOXZ2NU6.js","imports":["_app/immutable/entry/start.DsvTTw9b.js","_app/immutable/chunks/entry.CDRQ1AgC.js","_app/immutable/chunks/scheduler.6BPHMyHF.js","_app/immutable/entry/app.DOXZ2NU6.js","_app/immutable/chunks/preload-helper.AVeyy5YT.js","_app/immutable/chunks/scheduler.6BPHMyHF.js","_app/immutable/chunks/index.WoIgux7t.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/api/customFormattingSettings.json",
				pattern: /^\/api\/customFormattingSettings\.json\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/customFormattingSettings.json/_server.js'))
			},
			{
				id: "/api/customFormattingSettings.json/GET.json",
				pattern: /^\/api\/customFormattingSettings\.json\/GET\.json\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/customFormattingSettings.json/GET.json/_server.js'))
			},
			{
				id: "/api/pagesManifest.json",
				pattern: /^\/api\/pagesManifest\.json\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/pagesManifest.json/_server.js'))
			},
			{
				id: "/api/prerendered_queries/[query_hash].arrow",
				pattern: /^\/api\/prerendered_queries\/([^/]+?)\.arrow\/?$/,
				params: [{"name":"query_hash","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/prerendered_queries/_query_hash_.arrow/_server.js'))
			},
			{
				id: "/api/settings.json",
				pattern: /^\/api\/settings\.json\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/settings.json/_server.js'))
			},
			{
				id: "/api/[...route]/evidencemeta.json",
				pattern: /^\/api(?:\/(.*))?\/evidencemeta\.json\/?$/,
				params: [{"name":"route","optional":false,"rest":true,"chained":true}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/_...route_/evidencemeta.json/_server.js'))
			},
			{
				id: "/api/[route_hash]/[additional_hash]/all-queries.json",
				pattern: /^\/api\/([^/]+?)\/([^/]+?)\/all-queries\.json\/?$/,
				params: [{"name":"route_hash","optional":false,"rest":false,"chained":false},{"name":"additional_hash","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/_route_hash_/_additional_hash_/all-queries.json/_server.js'))
			},
			{
				id: "/explore/console",
				pattern: /^\/explore\/console\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/explore/schema",
				pattern: /^\/explore\/schema\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/fix-tprotocol-service-worker.js",
				pattern: /^\/fix-tprotocol-service-worker\.js\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/fix-tprotocol-service-worker.js/_server.js'))
			},
			{
				id: "/goals",
				pattern: /^\/goals\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/manifest.webmanifest",
				pattern: /^\/manifest\.webmanifest\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/manifest.webmanifest/_server.js'))
			},
			{
				id: "/settings",
				pattern: /^\/settings\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 8 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
