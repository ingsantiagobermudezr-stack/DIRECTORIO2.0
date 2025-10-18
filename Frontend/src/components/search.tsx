import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utils/axiosInstance";

import "../styles/searchbar.css";
import { navigate } from "astro:transitions/client";

export function Search() {
  const [search, setSearch] = useState("");

  const [listaEmpresas, setListaEmpresas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        params: { skip: 0, limit: 50, nombre: search },
      });

      setListaEmpresas(data);
      setIsLoading(false);
    };
    obtenerListaEmpresas();
  }, [search]);

  const onClickEmpresa = (idEmpresa: string) => {
    setListaEmpresas([]);
    navigate(`/empresas/${idEmpresa}`);
  };

  return (
    <div className="content-search-bar">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar empresas, servicios y más"
          onChange={onChangeSearch}
          value={search}
        />
      </div>
      {(!!listaEmpresas.length || isLoading) && (
        <ul className="list-empresas-encontradas">
          {listaEmpresas.map((empresa: any, index: number) => (
            <li
              className="item-empresa"
              onClick={() => onClickEmpresa(empresa.id_empresa)}
              style={{
                borderBottom:
                  index === listaEmpresas.length - 1
                    ? "none"
                    : "1px solid #adadad",
                marginBottom:
                  index === listaEmpresas.length - 1 ? "0px" : "16px",
              }}
            >
              <h2>{empresa.nombre}</h2>
              <span>
                {empresa.telefono}, {empresa.direccion}{" "}
              </span>
            </li>
          ))}

          {isLoading && <li>Buscando resultados...</li>}
        </ul>
      )}
    </div>
  );
}
