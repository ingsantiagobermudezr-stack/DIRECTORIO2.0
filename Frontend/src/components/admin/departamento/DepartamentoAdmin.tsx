import { navigate } from "astro:transitions/client"
import { TableAdmin } from "../TableAdmin"

export const DepartamentoAdmin: React.FC = () => {
    return <>
       <TableAdmin
  tableName="Departamentos"
  columns={[
    { key: "id_departamento", label: "ID" },
    { key: "nombre", label: "Nombre" },
  ]}
  endpoint="http://localhost:8000/departamentos"
  primaryKey="id_departamento"
  onCreate={() => navigate("/admin/departamentos/agregar")}
  onEdit={(id: number) => navigate(`/admin/departamentos/editar/${id}`)}
  onDelete={(id: number) => console.log("Deleting department with ID:", id)}
/>


    </>
}