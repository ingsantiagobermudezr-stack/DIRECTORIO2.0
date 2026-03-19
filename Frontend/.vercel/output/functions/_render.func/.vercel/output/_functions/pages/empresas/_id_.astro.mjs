/* empty css                                    */
import { c as createComponent, r as renderTemplate, e as renderComponent, d as createAstro, m as maybeRenderHead, g as addAttribute, F as Fragment } from '../../chunks/astro/server_C1ltPUuV.mjs';
import 'kleur/colors';
import { $ as $$GlobalLayout } from '../../chunks/GlobalLayout_DDrasiYq.mjs';
import { a as axiosInstance } from '../../chunks/axiosInstance_DTElsxCY.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
/* empty css                                    */
import { AxiosError } from 'axios';
import { n as navigate } from '../../chunks/router_vN4ZPF0m.mjs';
import dayjs from 'dayjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

function EnviarCalificacion({ id_usuario, id_empresa }) {
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
      formDataObj[key] = value;
    }
    try {
      const { data: _data } = await axiosInstance("/reviews", {
        method: "POST",
        data: {
          ...formDataObj,
          calificacion: +formDataObj.calificacion,
          id_empresa,
          id_usuario
        }
      });
      console.log(_data);
      setStatusForm((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null
      }));
      navigate("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        const _message = error.response?.data?.detail || "Ocurrio un error inesperado.";
        setStatusForm((prev) => ({
          ...prev,
          isLoading: false,
          error: _message
        }));
      }
    }
  };
  return /* @__PURE__ */ jsxs("form", { className: "content-form", onSubmit, children: [
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "calificacion", children: "Calificación" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          name: "calificacion",
          required: true,
          id: "calificacion",
          min: 1,
          max: 5,
          placeholder: "Calificación"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "comentario", children: "Comentario" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          name: "comentario",
          required: true,
          id: "comentario",
          placeholder: "Comentario",
          rows: 4
        }
      )
    ] }),
    statusForm.error && /* @__PURE__ */ jsx("span", { className: "error-form", children: statusForm.error }),
    /* @__PURE__ */ jsx("div", { className: "content-submit", children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: statusForm.isLoading, children: "Enviar" }) })
  ] });
}

function BotonEliminarEmpresa({ id }) {
  const [isLoading, setIsLoading] = useState(false);
  const onDelete = async () => {
    setIsLoading(true);
    try {
      await axiosInstance(`/empresas/${id}`, {
        method: "DELETE"
      });
      navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("button", { className: "btn-delete", onClick: onDelete, disabled: isLoading, children: isLoading ? /* @__PURE__ */ jsx(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: "lucide lucide-loader-circle spinner",
      children: /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
    }
  ) : "Eliminar" });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { id } = Astro2.params;
  const id_usuario = (Astro2.cookies.get("id_usuario") || {})?.value;
  const rol = (Astro2.cookies.get("rol") || {})?.value;
  const token = (Astro2.cookies.get("token") || {})?.value;
  const { data } = await axiosInstance(`/empresas/${id}`, {
    method: "GET"
  });
  const { data: dataReview } = await axiosInstance(`/reviews/${id}`, {
    method: "GET"
  });
  let puedeComentar = false;
  if (!!id_usuario && !dataReview.find((review) => review.id_usuario.toString() === id_usuario))
    puedeComentar = true;
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Detalle Empresa", "data-astro-cid-png4kuij": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="content-detalle-empresa" data-astro-cid-png4kuij> ${rol === "admin" && renderTemplate`<ul class="content-menu-list" data-astro-cid-png4kuij> <li data-astro-cid-png4kuij> <a${addAttribute(`/empresas/crear?id=${id}`, "href")} data-astro-cid-png4kuij>Editar</a> </li> <li class="btn-cancel" data-astro-cid-png4kuij> ${renderComponent($$result2, "BotonEliminarEmpresa", BotonEliminarEmpresa, { "id": id || "", "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/components/commons/BotonEliminarEmpresa", "client:component-export": "BotonEliminarEmpresa", "data-astro-cid-png4kuij": true })} </li> </ul>`} <h2${addAttribute({ marginTop: rol === "admin" ? "20px" : "60px" }, "style")} data-astro-cid-png4kuij> ${data.nombre} </h2> <div class="content-card-folder" data-astro-cid-png4kuij> <div class="content-img" data-astro-cid-png4kuij> ${data.logo && renderTemplate`<img${addAttribute(data.logo, "src")} data-astro-cid-png4kuij>`} </div> <div class="content-detail-empresa" data-astro-cid-png4kuij> <p class="content-data" data-astro-cid-png4kuij> <span class="label" data-astro-cid-png4kuij> NIT:</span>${" "} <span class="value" data-astro-cid-png4kuij>${data.nit}</span>${" "} </p> <p class="content-data" data-astro-cid-png4kuij> <span class="label" data-astro-cid-png4kuij> Correo electrónico:</span>${" "} <span class="value" data-astro-cid-png4kuij>${data.correo}</span>${" "} </p> <p class="content-data" data-astro-cid-png4kuij> <span class="label" data-astro-cid-png4kuij> Dirección:</span>${" "} <span class="value" data-astro-cid-png4kuij>${data.direccion}</span>${" "} </p> <p class="content-data" data-astro-cid-png4kuij> <span class="label" data-astro-cid-png4kuij> Teléfono:</span>${" "} <span class="value" data-astro-cid-png4kuij>${data.telefono}</span>${" "} </p> <p class="content-data" data-astro-cid-png4kuij> <span class="label" data-astro-cid-png4kuij> Categoría:</span>${" "} <span class="value" data-astro-cid-png4kuij>${data.categoria.nombre}</span>${" "} </p> <p class="content-data" data-astro-cid-png4kuij> <span class="label" data-astro-cid-png4kuij> Municipio:</span>${" "} <span class="value" data-astro-cid-png4kuij>${data.municipio.nombre}</span>${" "} </p> </div> </div> <div class="content-calificaciones" data-astro-cid-png4kuij> <h3 class="content-calificaciones" data-astro-cid-png4kuij>Calificaciones</h3> <div class="listado-calificaciones" data-astro-cid-png4kuij> ${!!dataReview.length ? dataReview.map((review) => renderTemplate`<article class="calificacion" data-astro-cid-png4kuij> <h5 class="nombre-usuario" data-astro-cid-png4kuij> ${review.id_usuario.toString() === id_usuario ? "T\xFA" : review.usuario.nombre}${" "} <span data-astro-cid-png4kuij> ${review.calificacion}/5 </span> </h5> <span class="fecha" data-astro-cid-png4kuij> ${dayjs(review.fecha).subtract(5, "hours").format("DD/MM/YYYY HH:mm")} </span> <p class="comentario" data-astro-cid-png4kuij>${review.comentario}</p> </article>`) : renderTemplate`<span data-astro-cid-png4kuij>Sin calificaciones</span>`} </div> </div> <div class="content-form-calificacion" data-astro-cid-png4kuij> ${puedeComentar && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-png4kuij": true }, { "default": ($$result3) => renderTemplate` <h3 data-astro-cid-png4kuij>Calificar empresa</h3> ${renderComponent($$result3, "EnviarCalificacion", EnviarCalificacion, { "id_usuario": id_usuario, "id_empresa": id, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/components/Formularios/EnviarCalificacion", "client:component-export": "EnviarCalificacion", "data-astro-cid-png4kuij": true })} ` })}`} ${!token && renderTemplate`<div class="content-crear-cuenta" data-astro-cid-png4kuij> <span data-astro-cid-png4kuij>Inicia sesión para dejar una calificación</span> <button data-astro-cid-png4kuij> <a href="/iniciar-sesion" data-astro-cid-png4kuij> Iniciar sesión </a> </button> </div>`} </div> </section> ` })}`;
}, "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/pages/empresas/[id]/index.astro", void 0);

const $$file = "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/pages/empresas/[id]/index.astro";
const $$url = "/empresas/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
