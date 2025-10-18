import { navigate } from "astro:transitions/client";
import { TableAdmin } from "../TableAdmin";

export const ReviewAdmin: React.FC = () => {
  return (
    <>
      <TableAdmin
        tableName="Reviews"
        columns={[
          { key: "id_review", label: "ID" },
          { key: "id_empresa", label: "ID Empresa" },
          { key: "id_usuario", label: "ID Usuario" },
          { key: "comentario", label: "Comentario" },
          { key: "calificacion", label: "Calificación" },
          { key: "fecha", label: "Fecha" },
        ]}
        endpoint="http://localhost:8000/reviews"
        primaryKey="id_review"
        onCreate={() => navigate("/admin/reviews/agregar")}
        onEdit={(id: number) => navigate(`/admin/reviews/editar/${id}`)}
        onDelete={(id: number) =>
          console.log("Deleting review with ID:", id)
        }
      />
    </>
  );
};
