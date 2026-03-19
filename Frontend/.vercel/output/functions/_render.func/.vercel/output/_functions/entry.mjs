import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_1mJILQ1-.mjs';
import { manifest } from './manifest_CrovmHJd.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/categoria/agregar.astro.mjs');
const _page2 = () => import('./pages/admin/categoria/editar/_id_.astro.mjs');
const _page3 = () => import('./pages/admin/categoria.astro.mjs');
const _page4 = () => import('./pages/admin/departamentos/agregar.astro.mjs');
const _page5 = () => import('./pages/admin/departamentos/editar/_id_.astro.mjs');
const _page6 = () => import('./pages/admin/departamentos.astro.mjs');
const _page7 = () => import('./pages/admin/empresas/agregar.astro.mjs');
const _page8 = () => import('./pages/admin/empresas/editar/_id_.astro.mjs');
const _page9 = () => import('./pages/admin/empresas.astro.mjs');
const _page10 = () => import('./pages/admin/municipios/agregar.astro.mjs');
const _page11 = () => import('./pages/admin/municipios/editar/_id_.astro.mjs');
const _page12 = () => import('./pages/admin/municipios.astro.mjs');
const _page13 = () => import('./pages/admin/publicidad/agregar.astro.mjs');
const _page14 = () => import('./pages/admin/publicidad/editar/_id_.astro.mjs');
const _page15 = () => import('./pages/admin/publicidad.astro.mjs');
const _page16 = () => import('./pages/admin/resultados/agregar.astro.mjs');
const _page17 = () => import('./pages/admin/resultados/editar/_id_.astro.mjs');
const _page18 = () => import('./pages/admin/resultados.astro.mjs');
const _page19 = () => import('./pages/admin/reviews/agregar.astro.mjs');
const _page20 = () => import('./pages/admin/reviews/editar/_id_.astro.mjs');
const _page21 = () => import('./pages/admin/reviews.astro.mjs');
const _page22 = () => import('./pages/admin/usuarios/agregar.astro.mjs');
const _page23 = () => import('./pages/admin/usuarios/editar/_id_.astro.mjs');
const _page24 = () => import('./pages/admin/usuarios.astro.mjs');
const _page25 = () => import('./pages/admin.astro.mjs');
const _page26 = () => import('./pages/contacto.astro.mjs');
const _page27 = () => import('./pages/crear-cuenta.astro.mjs');
const _page28 = () => import('./pages/empresas/categorias.astro.mjs');
const _page29 = () => import('./pages/empresas/crear.astro.mjs');
const _page30 = () => import('./pages/empresas/municipios.astro.mjs');
const _page31 = () => import('./pages/empresas/_id_.astro.mjs');
const _page32 = () => import('./pages/iniciar-sesion.astro.mjs');
const _page33 = () => import('./pages/marketplace.astro.mjs');
const _page34 = () => import('./pages/mi-cuenta.astro.mjs');
const _page35 = () => import('./pages/terminos-condiciones.astro.mjs');
const _page36 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/categoria/agregar/index.astro", _page1],
    ["src/pages/admin/categoria/editar/[id]/index.astro", _page2],
    ["src/pages/admin/categoria/index.astro", _page3],
    ["src/pages/admin/departamentos/agregar/index.astro", _page4],
    ["src/pages/admin/departamentos/editar/[id]/index.astro", _page5],
    ["src/pages/admin/departamentos/index.astro", _page6],
    ["src/pages/admin/empresas/agregar/index.astro", _page7],
    ["src/pages/admin/empresas/editar/[id]/index.astro", _page8],
    ["src/pages/admin/empresas/index.astro", _page9],
    ["src/pages/admin/municipios/agregar/index.astro", _page10],
    ["src/pages/admin/municipios/editar/[id]/index.astro", _page11],
    ["src/pages/admin/municipios/index.astro", _page12],
    ["src/pages/admin/publicidad/agregar/index.astro", _page13],
    ["src/pages/admin/publicidad/editar/[id]/index.astro", _page14],
    ["src/pages/admin/publicidad/index.astro", _page15],
    ["src/pages/admin/resultados/agregar/index.astro", _page16],
    ["src/pages/admin/resultados/editar/[id]/index.astro", _page17],
    ["src/pages/admin/resultados/index.astro", _page18],
    ["src/pages/admin/reviews/agregar/index.astro", _page19],
    ["src/pages/admin/reviews/editar/[id]/index.astro", _page20],
    ["src/pages/admin/reviews/index.astro", _page21],
    ["src/pages/admin/usuarios/agregar/index.astro", _page22],
    ["src/pages/admin/usuarios/editar/[id]/index.astro", _page23],
    ["src/pages/admin/usuarios/index.astro", _page24],
    ["src/pages/admin/index.astro", _page25],
    ["src/pages/contacto/index.astro", _page26],
    ["src/pages/crear-cuenta/index.astro", _page27],
    ["src/pages/empresas/categorias/index.astro", _page28],
    ["src/pages/empresas/crear/index.astro", _page29],
    ["src/pages/empresas/municipios/index.astro", _page30],
    ["src/pages/empresas/[id]/index.astro", _page31],
    ["src/pages/iniciar-sesion/index.astro", _page32],
    ["src/pages/marketplace.astro", _page33],
    ["src/pages/mi-cuenta/index.astro", _page34],
    ["src/pages/terminos-condiciones/index.astro", _page35],
    ["src/pages/index.astro", _page36]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "6a8f9ab1-64d7-4ba1-856c-0560ab6bf825",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
