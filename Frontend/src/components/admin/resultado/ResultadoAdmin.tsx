import { navigate } from "astro:transitions/client";
import { TableAdmin } from "../TableAdmin";

export const ResultadoAdmin: React.FC = () => {
    return (
        <>
            <TableAdmin
                tableName="Resultados"
                columns={[
                    { key: "id_resultado", label: "ID" },
                    { key: "id_usuario", label: "ID Usuario" },
                    { key: "criterio", label: "Criterio" },
                    { key: "fecha_hora", label: "Fecha y Hora" },
                ]}
                endpoint="http://localhost:8000/resultados"
                primaryKey="id_resultado"
                onCreate={() => navigate("/admin/resultados/agregar")}
                onEdit={(id: number) => navigate(`/admin/resultados/editar/${id}`)}
                onDelete={(id: number) => console.log("Deleting resultado with ID:", id)}
            />
        </>
    );
};
