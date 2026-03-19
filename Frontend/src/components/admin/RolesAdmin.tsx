import { navigate } from "astro:transitions/client";
import { TableAdmin } from "./TableAdmin";

export const RolesAdmin: React.FC = () => {
  return (
    <>
      <TableAdmin
        tableName="Roles"
        columns={[
          { key: "id_rol", label: "ID" },
          { key: "nombre", label: "Nombre" },
          { key: "descripcion", label: "Descripción" },
        ]}
        endpoint="/api/roles"
        primaryKey="id_rol"
        onCreate={() => navigate("/admin/roles/agregar")}
        onEdit={(id: number) => navigate(`/admin/roles/editar/${id}`)}
        onDelete={(id: number) => console.log("Eliminar rol", id)}
      />
    </>
  );
};

export default RolesAdmin;
