import React, { useMemo, useState } from "react";
import CardEmpresa from "./CardEmpresa";

interface Empresa {
  id_empresa?: number;
  nombre?: string;
  id_categoria?: number | null;
  [key: string]: any;
}

interface Props {
  empresas: Empresa[];
}

const PAGE_SIZE = 9;

const EmpresasList: React.FC<Props> = ({ empresas }) => {
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState<number | "all">("all");
  const [page, setPage] = useState(1);

  const categorias = useMemo(() => {
    const ids = Array.from(new Set(empresas.map((e) => e.id_categoria).filter(Boolean)));
    return ids.sort((a: any, b: any) => (a as number) - (b as number));
  }, [empresas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = empresas;
    if (categoria !== "all") {
      list = list.filter((e) => e.id_categoria === categoria);
    }
    if (q) {
      list = list.filter((e) => (e.nombre || "").toLowerCase().includes(q));
    }
    return list;
  }, [empresas, query, categoria]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          aria-label="Buscar empresas"
          className="w-full border rounded px-3 py-2 col-span-2"
          placeholder="Buscar por nombre de empresa..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />

        <select
          aria-label="Filtrar por categoría"
          className="border rounded px-3 py-2 w-full"
          value={categoria}
          onChange={(e) => { const v = e.target.value === "all" ? "all" : Number(e.target.value); setCategoria(v); setPage(1); }}
        >
          <option value="all">Todas las categorías</option>
          {categorias.map((id) => (
            <option key={String(id)} value={String(id)}>{`Categoria ${id}`}</option>
          ))}
        </select>
      </div>

      <CardEmpresa empresas={pageItems} />

      <div className="mt-6 flex items-center justify-between">
        <button onClick={onPrev} className="px-3 py-2 bg-gray-100 rounded disabled:opacity-50" disabled={page === 1}>Anterior</button>
        <div className="text-sm text-gray-600">Página {page} de {totalPages}</div>
        <button onClick={onNext} className="px-3 py-2 bg-gray-100 rounded disabled:opacity-50" disabled={page === totalPages}>Siguiente</button>
      </div>
    </div>
  );
};

export default EmpresasList;
