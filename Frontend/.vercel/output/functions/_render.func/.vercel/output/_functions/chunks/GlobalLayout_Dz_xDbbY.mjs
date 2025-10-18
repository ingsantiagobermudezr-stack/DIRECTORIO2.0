import { c as createComponent, r as renderTemplate, e as addAttribute, b as createAstro, a as renderComponent, f as renderHead, g as renderSlot, F as Fragment } from './astro/server_CyHZ0_af.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import axios from 'axios';

const $$Astro$1 = createAstro();
const $$ViewTransitions = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ViewTransitions;
  const { fallback = "animate" } = Astro2.props;
  return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>`;
}, "/Users/alexocsa/Documents/dev/projects/directorio-empresas/Frontend/node_modules/astro/components/ViewTransitions.astro", void 0);

let navigateOnServerWarned = false;
async function navigate(href, options) {
  {
    if (!navigateOnServerWarned) {
      const warning = new Error(
        "The view transitions client API was called during a server side render. This may be unintentional as the navigate() function is expected to be called in response to user interactions. Please make sure that your usage is correct."
      );
      warning.name = "Warning";
      console.warn(warning);
      navigateOnServerWarned = true;
    }
    return;
  }
}

function BotonCerrarSesion() {
  const onCloseSesion = () => {
    console.log("Hola");
    document.cookie = "rol=; path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=None; Secure";
    document.cookie = "token=; path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=None; Secure";
    document.cookie = "id_usuario=;  path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=None; Secure";
    navigate();
  };
  return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { className: "btn-cerrar-sesion", onClick: onCloseSesion, children: "Cerrar sesión" }) });
}

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

function Search() {
  const [search, setSearch] = useState("");
  const [listaEmpresas, setListaEmpresas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const onChangeSearch = (e) => {
    const { value } = e.target;
    if (!value) {
      setListaEmpresas([]);
    }
    setSearch(value);
  };
  useEffect(() => {
    if (!search.length) return;
    const obtenerListaEmpresas = async () => {
      setIsLoading(true);
      const { data } = await axiosInstance("/empresas", {
        method: "GET",
        params: { skip: 0, limit: 50, nombre: search }
      });
      setListaEmpresas(data);
      setIsLoading(false);
    };
    obtenerListaEmpresas();
  }, [search]);
  const onClickEmpresa = (idEmpresa) => {
    setListaEmpresas([]);
    navigate();
  };
  return /* @__PURE__ */ jsxs("div", { className: "content-search-bar", children: [
    /* @__PURE__ */ jsx("div", { className: "search-bar", children: /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        placeholder: "Buscar empresas, servicios y más",
        onChange: onChangeSearch,
        value: search
      }
    ) }),
    (!!listaEmpresas.length || isLoading) && /* @__PURE__ */ jsxs("ul", { className: "list-empresas-encontradas", children: [
      listaEmpresas.map((empresa, index) => /* @__PURE__ */ jsxs(
        "li",
        {
          className: "item-empresa",
          onClick: () => onClickEmpresa(empresa.id_empresa),
          style: {
            borderBottom: index === listaEmpresas.length - 1 ? "none" : "1px solid #adadad",
            marginBottom: index === listaEmpresas.length - 1 ? "0px" : "16px"
          },
          children: [
            /* @__PURE__ */ jsx("h2", { children: empresa.nombre }),
            /* @__PURE__ */ jsxs("span", { children: [
              empresa.telefono,
              ", ",
              empresa.direccion,
              " "
            ] })
          ]
        }
      )),
      isLoading && /* @__PURE__ */ jsx("li", { children: "Buscando resultados..." })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$GlobalLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$GlobalLayout;
  const { title } = Astro2.props;
  const rol = (Astro2.cookies.get("rol") || {})?.value;
  const token = (Astro2.cookies.get("token") || {})?.value;
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/css/style.css"><title>${title}</title>${renderComponent($$result, "ViewTransitions", $$ViewTransitions, {})}${renderHead()}</head> <body> <header> <div class="header-content"> <a href="/"> <h1 class="logo">Páginas Amarillas 360</h1> </a> ${renderComponent($$result, "Search", Search, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/alexocsa/Documents/dev/projects/directorio-empresas/Frontend/src/components/search", "client:component-export": "Search" })} <nav> <ul class="navbar"> <li><a href="/contacto">Contacto</a></li> ${!!token ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${rol === "admin" && renderTemplate`<li> <a href="/empresas/crear">Registrar Empresa</a> </li>`}${renderComponent($$result2, "BotonCerrarSesion", BotonCerrarSesion, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/alexocsa/Documents/dev/projects/directorio-empresas/Frontend/src/components/commons/botonCerrarSesion", "client:component-export": "BotonCerrarSesion" })} ` })}` : renderTemplate`<li> <a href="/iniciar-sesion">Iniciar sesión</a> </li>`} </ul> </nav> </div> </header> <main> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "/Users/alexocsa/Documents/dev/projects/directorio-empresas/Frontend/src/layout/GlobalLayout.astro", void 0);

export { $$GlobalLayout as $, axiosInstance as a, navigate as n };
