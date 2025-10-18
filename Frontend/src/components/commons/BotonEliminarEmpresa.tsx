import React, { useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import "../../styles/botones.css";
import { navigate } from "astro:transitions/client";
type Props = {
  id: string;
};

export function BotonEliminarEmpresa({ id }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    setIsLoading(true);
    try {
      await axiosInstance(`/empresas/${id}`, {
        method: "DELETE",
      });
      navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button className="btn-delete" onClick={onDelete} disabled={isLoading}>
      {isLoading ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-loader-circle spinner"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        "Eliminar"
      )}
    </button>
  );
}
