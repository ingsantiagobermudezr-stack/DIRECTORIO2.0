import { c as createComponent, r as renderTemplate, a as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_CyHZ0_af.mjs';
import 'kleur/colors';
import { a as axiosInstance, $ as $$GlobalLayout } from '../chunks/GlobalLayout_Dz_xDbbY.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import 'react';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

function CardEmpresas({ empresas }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "title-content-empresas", children: "Lista de Empresas" }),
    /* @__PURE__ */ jsx("div", { className: "empresa-grid", children: empresas.length > 0 ? empresas.map((empresa) => /* @__PURE__ */ jsx("div", { className: "empresa-card", children: /* @__PURE__ */ jsxs("a", { href: `/empresas/${empresa.id_empresa}`, children: [
      /* @__PURE__ */ jsx("h2", { children: empresa.nombre }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("span", { className: "label", children: " NIT:" }),
        " ",
        /* @__PURE__ */ jsx("span", { className: "value", children: empresa.nit }),
        " "
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("span", { className: "label", children: " Correo electrónico:" }),
        " ",
        /* @__PURE__ */ jsx("span", { className: "value", children: empresa.correo }),
        " "
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("span", { className: "label", children: " Dirección:" }),
        " ",
        /* @__PURE__ */ jsx("span", { className: "value", children: empresa.direccion }),
        " "
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("span", { className: "label", children: " Teléfono:" }),
        " ",
        /* @__PURE__ */ jsx("span", { className: "value", children: empresa.telefono }),
        " "
      ] })
    ] }) }, empresa.id_empresa)) : /* @__PURE__ */ jsx("p", { children: "No hay empresas disponibles." }) })
  ] });
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { data } = await axiosInstance("/empresas", {
    method: "GET",
    params: { skip: 0, limit: 50 }
  });
  console.log(data);
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "P\xE1ginas amarrillas" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div> ${renderComponent($$result2, "CardEmpresas", CardEmpresas, { "empresas": data, "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/alexocsa/Documents/dev/projects/directorio-empresas/Frontend/src/components/commons/CardEmpresa", "client:component-export": "CardEmpresas" })} </div> ` })}`;
}, "/Users/alexocsa/Documents/dev/projects/directorio-empresas/Frontend/src/pages/index.astro", void 0);

const $$file = "/Users/alexocsa/Documents/dev/projects/directorio-empresas/Frontend/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
