/* empty css                                 */
import { c as createComponent, r as renderTemplate, e as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_C1ltPUuV.mjs';
import 'kleur/colors';
import { $ as $$GlobalLayout } from '../chunks/GlobalLayout_DDrasiYq.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
/* empty css                                 */
import { a as axiosInstance } from '../chunks/axiosInstance_DTElsxCY.mjs';
import { AxiosError } from 'axios';
import { n as navigate } from '../chunks/router_vN4ZPF0m.mjs';
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

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Iniciar sesi\xF3n", "auth": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="flex flex-col items-center justify-center py-12"> <h2 class="text-xl font-semibold mb-6">Iniciar sesión</h2> ${renderComponent($$result2, "InicioSesion", InicioSesion, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/components/Formularios/InicioSesion", "client:component-export": "InicioSesion" })} </section> ` })}`;
}, "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/pages/iniciar-sesion/index.astro", void 0);

const $$file = "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/pages/iniciar-sesion/index.astro";
const $$url = "/iniciar-sesion";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
