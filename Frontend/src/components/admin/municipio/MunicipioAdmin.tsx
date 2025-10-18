import { navigate } from "astro:transitions/client"
import { TableAdmin } from "../TableAdmin"

export const MunicipioAdmin: React.FC = () => {
    return <>
       <TableAdmin
        tableName="Munipios"
        columns={[
            { key: "id_municipio", label: "ID" },
            { key: "nombre", label: "Nombre" },
            { key: "id_departamento", label: "ID Departamento" },
        ]}
        endpoint="http://localhost:8000/municipios"
        primaryKey="id_municipio"
        onCreate={() => navigate("/admin/municipios/agregar")}
        onEdit={(id: number) => navigate(`/admin/municipios/editar/${id}`)}
        onDelete={(id: number) => console.log("Deleting municipios with ID:", id)}
        />


    </>
}