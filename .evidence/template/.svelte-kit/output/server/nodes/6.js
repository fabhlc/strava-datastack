

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/explore/schema/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.JGwqS67-.js","_app/immutable/chunks/scheduler.6BPHMyHF.js","_app/immutable/chunks/index.WoIgux7t.js","_app/immutable/chunks/VennDiagram.svelte_svelte_type_style_lang.BDD9Z112.js","_app/immutable/chunks/entry.CDRQ1AgC.js","_app/immutable/chunks/preload-helper.AVeyy5YT.js","_app/immutable/chunks/index.rV6zwFgL.js"];
export const stylesheets = ["_app/immutable/assets/VennDiagram.DBCXi1Yl.css"];
export const fonts = [];