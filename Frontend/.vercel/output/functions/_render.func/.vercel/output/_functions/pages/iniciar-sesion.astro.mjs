import { c as createComponent, r as renderTemplate, a as renderComponent, b as createAstro, m as maybeRenderHead } from '../chunks/astro/server_CyHZ0_af.mjs';
import 'kleur/colors';
import { a as axiosInstance, n as navigate, $ as $$GlobalLayout } from '../chunks/GlobalLayout_Dz_xDbbY.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
/* empty css                                 */
import { AxiosError } from 'axios';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

function InicioSesion() {
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
      const { data } = await axiosInstance("/signin", {
        method: "POST",
        data: formDataObj
      });
      console.log({ data });
      setStatusForm((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null
      }));
      document.cookie = `token=${data.access_token};  path=/; SameSite=None; Secure`;
      document.cookie = `rol=${data.rol};  path=/; SameSite=None; Secure`;
      document.cookie = `id_usuario=${data.id_usuario};  path=/; SameSite=None; Secure`;
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
      /* @__PURE__ */ jsx("label", { htmlFor: "correo_electronico", children: "Correo electrónico" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "email",
          name: "correo",
          required: true,
          id: "correo_electronico",
          placeholder: "Correo electrónico"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-input", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "contrasenia", children: "Contraseña" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          name: "password",
          required: true,
          id: "contrasenia",
          placeholder: "********"
        }
      )
    ] }),
    statusForm.error && /* @__PURE__ */ jsx("span", { className: "error-form", children: statusForm.error }),
    /* @__PURE__ */ jsx("div", { className: "content-submit", children: /* @__PURE__ */ jsx("button", { type: "submit", disabled: statusForm.isLoading, children: "Iniciar sesión" }) })
  ] });
}

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const token = (Astro2.cookies.get("token") || {})?.value;
  if (token) {
    return Astro2.redirect("/");
  }
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Iniciar sesi\xF3n", "data-astro-cid-7n55ocdl": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="content-form-inicio-sesion" data-astro-cid-7n55ocdl> <section data-astro-cid-7n55ocdl> <h2 data-astro-cid-7n55ocdl>Iniciar sesión</h2> ${renderComponent($$result2, "InicioSesion", InicioSesion, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/alexocsa/Documents/dev/projects/directorio-empresas/Frontend/src/components/Formularios/InicioSesion", "client:component-export": "InicioSesion", "data-astro-cid-7n55ocdl": true })} <div class="content-crear-cuenta" data-astro-cid-7n55ocdl> <span data-astro-cid-7n55ocdl>¿Aún no tienes una cuenta?</span> <button data-astro-cid-7n55ocdl> <a href="/crear-cuenta" data-astro-cid-7n55ocdl> Regístrate aquí </a> </button> </div> </section> </div> ` })}`;
}, "/Users/alexocsa/Documents/dev/projects/directorio-empresas/Frontend/src/pages/iniciar-sesion/index.astro", void 0);

const $$file = "/Users/alexocsa/Documents/dev/projects/directorio-empresas/Frontend/src/pages/iniciar-sesion/index.astro";
const $$url = "/iniciar-sesion";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
