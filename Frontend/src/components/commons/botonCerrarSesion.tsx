import { navigate } from "astro:transitions/client";
import React from "react";
import "../../styles/botones.css";

export function BotonCerrarSesion() {
  const onCloseSesion = () => {
    console.log("Hola");
    document.cookie =
      "rol=; path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=None; Secure";
    document.cookie =
      "token=; path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=None; Secure";
    document.cookie =
      "id_usuario=;  path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=None; Secure";
    navigate("/");
  };

  return (
    <li>
      <button className="dropdown-item" onClick={onCloseSesion}>
        Cerrar sesión
      </button>
    </li>
  );
}
