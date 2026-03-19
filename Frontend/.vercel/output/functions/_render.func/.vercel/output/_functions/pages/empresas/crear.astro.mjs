/* empty css                                    */
import { c as createComponent, r as renderTemplate, e as renderComponent, d as createAstro, m as maybeRenderHead } from '../../chunks/astro/server_C1ltPUuV.mjs';
import 'kleur/colors';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
/* empty css                                    */
import { a as axiosInstance } from '../../chunks/axiosInstance_DTElsxCY.mjs';
import { AxiosError } from 'axios';
import { n as navigate } from '../../chunks/router_vN4ZPF0m.mjs';
import { $ as $$GlobalLayout } from '../../chunks/GlobalLayout_DDrasiYq.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

function CrearEmpresa({
  listaCategoria,
  listaMunicipios,
  initialValue,
  id
}) {
  const [statusForm, setStatusForm] = useState({
    isLoading: false,
    error: null,
    success: false
  });
  const onSubmit = async (e) => {
    e.preventDefault();
    setStatusForm((prev) => ({ ...prev, isLoading: true }));
    const formData = new FormData(e.currentTarget);
    const formDataObj = {};
    for (let [key, value] of formData.entries()) {
      if (!value) continue;
      formDataObj[key] = value;
    }
    console.log({ formDataObj });
    try {
      if (id) {
        const { data: _data } = await axiosInstance(`/empresas/${id}`, {
          method: "PUT",
          data: {
            ...formDataObj,
            id_categoria: +formDataObj.id_categoria,
            id_municipio: +formDataObj.id_municipio
          }
        });
      } else {
        const { data: _data } = await axiosInstance("/empresas", {
          method: "POST",
          data: {
            ...formDataObj,
            id_categoria: +formDataObj.id_categoria,
            id_municipio: +formDataObj.id_municipio
          }
        });
      }
      setStatusForm((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null
      }));
      navigate("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.detail || "Ocurrio un error inesperado.";
        setStatusForm((prev) => ({
          ...prev,
          isLoading: false,
          error: message
        }));
      }
    }
  };
  return /* @__PURE__ */ jsxs("form", { className: "content-form", onSubmit, children: [
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "nombre", children: "Nombre" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          name: "nombre",
          required: true,
          id: "nombre",
          placeholder: "Nombre",
          defaultValue: initialValue?.nombre
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "nit", children: "NIT" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          name: "nit",
          required: true,
          id: "nit",
          placeholder: "NIT",
          defaultValue: initialValue?.nit
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "correo", children: "Correo electrónico" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "email",
          name: "correo",
          required: true,
          id: "correo",
          placeholder: "Correo electrónico",
          defaultValue: initialValue?.correo
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "direccion", children: "Dirección" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          name: "direccion",
          required: true,
          id: "direccion",
          placeholder: "Direccion",
          defaultValue: initialValue?.direccion
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "logo", children: "Logo" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          name: "logo",
          id: "logo",
          placeholder: "Logo",
          required: true,
          defaultValue: initialValue?.logo
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "telefono", children: "Teléfono" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          name: "telefono",
          required: true,
          id: "telefono",
          placeholder: "Teléfono",
          defaultValue: initialValue?.telefono
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "categoria", children: "Categoría" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          name: "id_categoria",
          id: "categoria",
          required: true,
          defaultValue: initialValue?.id_categoria,
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Seleccione" }),
            listaCategoria.map((item) => /* @__PURE__ */ jsx(
              "option",
              {
                value: item.id_categoria,
                children: item.nombre
              },
              `${item.nombre}-${item.id_categoria}`
            ))
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "municipio", children: "Municipio" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          name: "id_municipio",
          id: "municipio",
          required: true,
          defaultValue: initialValue?.id_municipio,
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Seleccione" }),
            listaMunicipios.map((item) => /* @__PURE__ */ jsx(
              "option",
              {
                value: item.id_municipio,
                children: item.nombre
              },
              `${item.nombre}-${item.id_municipio}`
            ))
          ]
        }
      )
    ] }),
    statusForm.error && /* @__PURE__ */ jsx("span", { className: "error-form", children: statusForm.error }),
    /* @__PURE__ */ jsx("div", { className: "content-submit", children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: statusForm.isLoading, children: id ? "Guardar" : "Registrar" }) })
  ] });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const rol = (Astro2.cookies.get("rol") || {})?.value;
  const id = Astro2.url.searchParams.get("id") || "";
  if (!rol || rol !== "admin") {
    return Astro2.redirect("/");
  }
  const { data: dataMunicipio } = await axiosInstance("/municipios", {
    method: "GET",
    params: { skip: 0, limit: 10 }
  });
  const { data: dataCategoria } = await axiosInstance("/categorias", {
    method: "GET",
    params: { skip: 0, limit: 10 }
  });
  let initialValue = void 0;
  if (id) {
    const { data } = await axiosInstance(`/empresas/${id}`, {
      method: "GET"
    });
    initialValue = data;
  }
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Registrar empresa", "data-astro-cid-etfp3u2m": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="content-form-crear-empresa" data-astro-cid-etfp3u2m> <section data-astro-cid-etfp3u2m> <h2 data-astro-cid-etfp3u2m>${id ? "Editar empresa" : "Registrar empresa"}</h2> <ul class="content-menu-list" data-astro-cid-etfp3u2m> <li data-astro-cid-etfp3u2m> <a href="/empresas/categorias" data-astro-cid-etfp3u2m>Categorías</a> </li> <li data-astro-cid-etfp3u2m> <a href="/empresas/municipios" data-astro-cid-etfp3u2m>Municipios</a> </li> </ul> ${renderComponent($$result2, "CrearEmpresa", CrearEmpresa, { "listaMunicipios": dataMunicipio, "listaCategoria": dataCategoria, "initialValue": initialValue, "id": id, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/components/Formularios/CrearEmpresa", "client:component-export": "CrearEmpresa", "data-astro-cid-etfp3u2m": true })} </section> </div> ` })}`;
}, "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/pages/empresas/crear/index.astro", void 0);

const $$file = "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/pages/empresas/crear/index.astro";
const $$url = "/empresas/crear";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
