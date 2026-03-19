import { navigate } from "astro:transitions/client";
import { TableAdmin } from "../TableAdmin";

export const UsuarioAdmin: React.FC = () => {
    return (
        <>
            <TableAdmin
                tableName="Usuarios"
                columns={[
                    { key: "id_usuario", label: "ID" },
                    { key: "nombre", label: "Nombre" },
                    { key: "apellido", label: "Apellido" },
                    { key: "correo", label: "Correo Electrónico" },
                    { key: "telefono", label: "Teléfono" },
                    { key: "rol", label: "Rol" },
                ]}
                endpoint="/api/usuarios"
                primaryKey="id_usuario"
                onCreate={() => navigate("/admin/usuarios/agregar")}
                onEdit={(id: number) => navigate(`/admin/usuarios/editar/${id}`)}
                onDelete={(id: number) => console.log("Deleting usuario with ID:", id)}
            />
        </>
    );
};
