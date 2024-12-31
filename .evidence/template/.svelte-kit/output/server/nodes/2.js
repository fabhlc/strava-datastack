import * as universal from '../entries/pages/explore/_layout.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { universal };
export const universal_id = "src/pages/explore/+layout.js";
export const imports = ["_app/immutable/nodes/2.Bb1YKs4K.js","_app/immutable/chunks/index.rV6zwFgL.js","_app/immutable/nodes/3.Bg2UA9Tp.js","_app/immutable/chunks/scheduler.6BPHMyHF.js","_app/immutable/chunks/index.WoIgux7t.js"];
export const stylesheets = [];
export const fonts = [];
