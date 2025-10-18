import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_DEnsR_YP.mjs';
import { manifest } from './manifest_CSL_dCSh.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/contacto.astro.mjs');
const _page2 = () => import('./pages/crear-cuenta.astro.mjs');
const _page3 = () => import('./pages/empresas/crear.astro.mjs');
const _page4 = () => import('./pages/empresas/_id_.astro.mjs');
const _page5 = () => import('./pages/iniciar-sesion.astro.mjs');
const _page6 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/contacto/index.astro", _page1],
    ["src/pages/crear-cuenta/index.astro", _page2],
    ["src/pages/empresas/crear/index.astro", _page3],
    ["src/pages/empresas/[id]/index.astro", _page4],
    ["src/pages/iniciar-sesion/index.astro", _page5],
    ["src/pages/index.astro", _page6]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "4e992e94-ee8b-4ced-ad95-77ae4e324646",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
