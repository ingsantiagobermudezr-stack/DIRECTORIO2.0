/* empty css                                 */
import { c as createComponent, r as renderTemplate, e as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_C1ltPUuV.mjs';
import 'kleur/colors';
import { $ as $$GlobalLayout } from '../chunks/GlobalLayout_DDrasiYq.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import 'react';
import { a as axiosInstance } from '../chunks/axiosInstance_DTElsxCY.mjs';
export { renderers } from '../renderers.mjs';

const CardEmpresa = ({ empresas, listadoCategorias = [] }) => {
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: empresas.map((empresa) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: "border rounded-xl shadow-md bg-white p-6 flex flex-col items-start",
      children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: empresa.logo || "/default-logo.png",
            alt: empresa.nombre,
            className: "w-20 h-20 object-contain mb-4"
          }
        ),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-2", children: empresa.nombre }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "NIT:" }),
          " ",
          empresa.nit
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Email:" }),
          " ",
          empresa.correo || empresa.email
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Dirección:" }),
          " ",
          empresa.direccion
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Teléfono:" }),
          " ",
          empresa.telefono
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Municipio:" }),
          " ",
          empresa.municipio?.nombre || empresa.municipio || "-"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Categoría" }),
          /* @__PURE__ */ jsx("select", { className: "border rounded px-3 py-2 w-full", children: listadoCategorias.length > 0 ? listadoCategorias.map((item) => /* @__PURE__ */ jsx(
            "option",
            {
              value: item.id_categoria,
              children: item.nombre
            },
            `${item.nombre}-${item.id_categoria}`
          )) : /* @__PURE__ */ jsx("option", { disabled: true, children: "No hay categorías" }) })
        ] })
      ]
    },
    empresa.id_empresa ?? empresa.nombre
  )) });
};

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  let empresas = [];
  try {
    const res = await axiosInstance("/empresas", { method: "GET" });
    empresas = res.data;
  } catch (error) {
    console.error("Error al cargar empresas:", error);
  }
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Directorio de Empresas" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="py-12 px-6 bg-gray-50 rounded-xl"> <h1 class="text-3xl font-extrabold mb-8 text-center text-gray-900">
Directorio de Empresas
</h1> ${renderComponent($$result2, "CardEmpresa", CardEmpresa, { "empresas": empresas, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/components/commons/CardEmpresa", "client:component-export": "default" })} </section> ` })}`;
}, "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/pages/index.astro", void 0);

const $$file = "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
