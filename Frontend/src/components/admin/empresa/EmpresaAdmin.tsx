import { navigate } from "astro:transitions/client";
import { TableAdmin } from "../TableAdmin";

export const EmpresaAdmin: React.FC = () => {
  return (
    <>
      <TableAdmin
        tableName="Empresas"
        columns={[
          { key: "id_empresa", label: "ID" },
          { key: "nombre", label: "Nombre" },
          { key: "nit", label: "NIT" },
          { key: "correo", label: "Correo" },
          { key: "direccion", label: "Dirección" },
          { key: "telefono", label: "Teléfono" },
          { key: "id_categoria", label: "ID Categoría" },
          { key: "id_municipio", label: "ID Municipio" },
          { key: "logo", label: "Logo" },
        ]}
        endpoint="http://localhost:8000/empresas"
        primaryKey="id_empresa"
        onCreate={() => navigate("/admin/empresas/agregar")}
        onEdit={(id: number) => navigate(`/admin/empresas/editar/${id}`)}
        onDelete={(id: number) => console.log("Deleting empresa with ID:", id)}
      />
    </>
  );
};
