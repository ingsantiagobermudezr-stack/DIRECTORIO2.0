import React, { useState, useEffect } from "react";
import axios from "axios";

interface ForeignKeySelectProps {
  endpoint: string; // Endpoint para obtener las opciones
  value: string | number | null; // Valor actual seleccionado
  onChange: (value: string | number) => void; // Función para manejar cambios
  labelKey: string; // Clave que se usará para mostrar las opciones
  valueKey: string; // Clave que se usará para el valor de las opciones
  placeholder?: string; // Placeholder opcional
}

export const ForeignKeySelect: React.FC<ForeignKeySelectProps> = ({
  endpoint,
  value,
  onChange,
  labelKey,
  valueKey,
  placeholder = "Seleccione una opción",
}) => {
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(endpoint);
        setOptions(response.data);
      } catch (error) {
        console.error("Error fetching foreign key options:", error);
      }
    };

    fetchOptions();
  }, [endpoint]);

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option[valueKey]} value={option[valueKey]}>
          {option[labelKey]}
        </option>
      ))}
    </select>
  );
};
