import { navigate } from "astro:transitions/client";
import { TableAdmin } from "../TableAdmin";

export const PermisosAdmin: React.FC = () => {
  return (
    <>
      <TableAdmin
        tableName="Permisos"
        columns={[{ key: "id_permiso", label: "ID" }, { key: "nombre", label: "Nombre" }, { key: "descripcion", label: "Descripción" }]}
        endpoint="/api/permisos"
        primaryKey="id_permiso"
        onCreate={() => navigate("/admin/permisos/agregar")}
        onEdit={(id: number) => navigate(`/admin/permisos/editar/${id}`)}
        onDelete={(id: number) => console.log("Eliminar permiso", id)}
      />
    </>
  );
};

export default PermisosAdmin;
