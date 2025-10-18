import { c as createComponent, r as renderTemplate, a as renderComponent, b as createAstro, m as maybeRenderHead, F as Fragment } from '../../chunks/astro/server_CyHZ0_af.mjs';
import 'kleur/colors';
import { a as axiosInstance, n as navigate, $ as $$GlobalLayout } from '../../chunks/GlobalLayout_Dz_xDbbY.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
/* empty css                                    */
import { AxiosError } from 'axios';
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
      const { data } = await axiosInstance("/reviews", {
        method: "POST",
        data: {
          ...formDataObj,
          calificacion: +formDataObj.calificacion,
          id_empresa,
          id_usuario
        }
      });
      console.log(data);
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

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { id } = Astro2.params;
  const id_usuario = (Astro2.cookies.get("id_usuario") || {})?.value;
  const token = (Astro2.cookies.get("token") || {})?.value;
  const { data } = await axiosInstance(`/empresas/${id}`, {
    method: "GET"
  });
  const { data: dataReview } = await axiosInstance(`/reviews/${id}`, {
    method: "GET"
  });
  let puedeComentar = false;
  console.log({ id_usuario });
  if (!!id_usuario && !dataReview.find((review) => review.id_usuario.toString() === id_usuario))
    puedeComentar = true;
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Detalle Empresa", "data-astro-cid-png4kuij": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="content-detalle-empresa" data-astro-cid-png4kuij> <h2 data-astro-cid-png4kuij>Empresa ${data.nombre}</h2> <p class="content-data" data-astro-cid-png4kuij> <span class="label" data-astro-cid-png4kuij> NIT:</span>${" "} <span class="value" data-astro-cid-png4kuij>${data.nit}</span>${" "} </p> <p class="content-data" data-astro-cid-png4kuij> <span class="label" data-astro-cid-png4kuij> Correo electrónico:</span>${" "} <span class="value" data-astro-cid-png4kuij>${data.correo}</span>${" "} </p> <p class="content-data" data-astro-cid-png4kuij> <span class="label" data-astro-cid-png4kuij> Dirección:</span>${" "} <span class="value" data-astro-cid-png4kuij>${data.direccion}</span>${" "} </p> <p class="content-data" data-astro-cid-png4kuij> <span class="label" data-astro-cid-png4kuij> Teléfono:</span>${" "} <span class="value" data-astro-cid-png4kuij>${data.telefono}</span>${" "} </p> <div class="content-calificaciones" data-astro-cid-png4kuij> <h3 class="content-calificaciones" data-astro-cid-png4kuij>Calificaciones</h3> <div class="listado-calificaciones" data-astro-cid-png4kuij> ${!!dataReview.length ? dataReview.map((review) => renderTemplate`<article class="calificacion" data-astro-cid-png4kuij> <h5 class="nombre-usuario" data-astro-cid-png4kuij> ${review.id_usuario.toString() === id_usuario ? "T\xFA" : review.usuario.nombre}${" "} <span data-astro-cid-png4kuij> ${review.calificacion}/5 </span> </h5> <span class="fecha" data-astro-cid-png4kuij> ${dayjs(review.fecha).subtract(5, "hours").format("DD/MM/YYYY HH:mm")} </span> <p class="comentario" data-astro-cid-png4kuij>${review.comentario}</p> </article>`) : renderTemplate`<span data-astro-cid-png4kuij>Sin calificaciones</span>`} </div> </div> <div class="content-form-calificacion" data-astro-cid-png4kuij> ${puedeComentar && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-png4kuij": true }, { "default": ($$result3) => renderTemplate` <h3 data-astro-cid-png4kuij>Calificar empresa</h3> ${renderComponent($$result3, "EnviarCalificacion", EnviarCalificacion, { "id_usuario": id_usuario, "id_empresa": id, "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/alexocsa/Documents/dev/projects/directorio-empresas/Frontend/src/components/Formularios/EnviarCalificacion", "client:component-export": "EnviarCalificacion", "data-astro-cid-png4kuij": true })} ` })}`} ${!token && renderTemplate`<div class="content-crear-cuenta" data-astro-cid-png4kuij> <span data-astro-cid-png4kuij>Inicia sesión para dejar una calificación</span> <button data-astro-cid-png4kuij> <a href="/iniciar-sesion" data-astro-cid-png4kuij> Iniciar sesión </a> </button> </div>`} </div> </section> ` })}`;
}, "/Users/alexocsa/Documents/dev/projects/directorio-empresas/Frontend/src/pages/empresas/[id]/index.astro", void 0);

const $$file = "/Users/alexocsa/Documents/dev/projects/directorio-empresas/Frontend/src/pages/empresas/[id]/index.astro";
const $$url = "/empresas/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
