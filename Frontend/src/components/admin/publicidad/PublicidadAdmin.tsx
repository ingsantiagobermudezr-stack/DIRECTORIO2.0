import { navigate } from "astro:transitions/client";
import { TableAdmin } from "../TableAdmin";

export const PublicidadAdmin: React.FC = () => {
  return (
    <>
      <TableAdmin
        tableName="Publicidad"
        columns={[
          { key: "id_publicidad", label: "ID Publicidad" },
          { key: "id_empresa", label: "ID Empresa" },
          { key: "tipo_anuncio", label: "Tipo de Anuncio" },
          { key: "descripcion", label: "Descripción" },
          { key: "duracion", label: "Duración" },
          { key: "fecha_inicio", label: "Fecha de Inicio" },
          { key: "fecha_fin", label: "Fecha de Fin" },
        ]}
        endpoint="http://localhost:8000/publicidades"
        primaryKey="id_publicidad"
        onCreate={() => navigate("/admin/publicidad/agregar")}
        onEdit={(id: number) => navigate(`/admin/publicidad/editar/${id}`)}
        onDelete={(id: number) => console.log("Deleting publicidad with ID:", id)}
      />
    </>
  );
};
