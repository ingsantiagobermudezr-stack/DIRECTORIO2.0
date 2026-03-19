/* empty css                                 */
import { c as createComponent, r as renderTemplate, e as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_C1ltPUuV.mjs';
import 'kleur/colors';
import { $ as $$GlobalLayout } from '../chunks/GlobalLayout_DDrasiYq.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Contacto", "data-astro-cid-gdogca4m": true }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<span class="content-banner" data-astro-cid-gdogca4m> <strong data-astro-cid-gdogca4m>
¿Quieres que tu negocio destaque? 🚀 <br data-astro-cid-gdogca4m><br data-astro-cid-gdogca4m> </strong>
Escríbenos a <a href="mailto:paginasamarillas360@gmail.com" data-astro-cid-gdogca4m>paginasamarillas360@gmail.com</a> y sé parte del directorio que conecta empresas con clientes. <br data-astro-cid-gdogca4m><br data-astro-cid-gdogca4m> ¡Publicar
    es fácil!</span> ` })}`;
}, "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/pages/contacto/index.astro", void 0);

const $$file = "C:/Users/santi/Downloads/DIRECTORIO2.0/DIRECTORIO2.0/Frontend/src/pages/contacto/index.astro";
const $$url = "/contacto";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
