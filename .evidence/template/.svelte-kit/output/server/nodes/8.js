import * as universal from '../entries/pages/settings/_page.js';
import * as server from '../entries/pages/settings/_page.server.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/settings/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/pages/settings/+page.js";
export { server };
export const server_id = "src/pages/settings/+page.server.js";
export const imports = ["_app/immutable/nodes/8.BRDgMoYT.js","_app/immutable/chunks/scheduler.6BPHMyHF.js","_app/immutable/chunks/index.WoIgux7t.js","_app/immutable/chunks/VennDiagram.svelte_svelte_type_style_lang.BDD9Z112.js","_app/immutable/chunks/entry.CDRQ1AgC.js","_app/immutable/chunks/preload-helper.AVeyy5YT.js","_app/immutable/chunks/index.rV6zwFgL.js","_app/immutable/chunks/Button.CTTjzleX.js","_app/immutable/chunks/index.CqVitEmB.js","_app/immutable/chunks/AccordionItem.CRjnQ9DB.js","_app/immutable/chunks/updater.VbPrGvGM.js","_app/immutable/chunks/Prismjs.BcRwqRJP.js"];
export const stylesheets = ["_app/immutable/assets/VennDiagram.DBCXi1Yl.css"];
export const fonts = [];
