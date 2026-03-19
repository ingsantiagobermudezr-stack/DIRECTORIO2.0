import React, { useMemo, useState } from "react";
import CardEmpresa from "./CardEmpresa";

interface Empresa {
  id_empresa?: number;
  nombre?: string;
  [key: string]: any;
}

interface Props {
  empresas: Empresa[];
}

const EmpresasList: React.FC<Props> = ({ empresas }) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return empresas;
    return empresas.filter((e) => (e.nombre || "").toLowerCase().includes(q));
  }, [empresas, query]);

  return (
    <div>
      <div className="mb-6">
        <input
          aria-label="Buscar empresas"
          className="w-full border rounded px-3 py-2"
          placeholder="Buscar por nombre de empresa..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <CardEmpresa empresas={filtered} />
    </div>
  );
};

export default EmpresasList;
