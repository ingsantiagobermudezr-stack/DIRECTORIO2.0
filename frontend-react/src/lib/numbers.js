import numeral from "numeral";

// Nota: numeral usa el locale "en" por defecto, que funciona perfecto
// para nuestros formatos ($0,0, 0.[0]k, etc.)
// No necesitamos cargar locale "es" ya que manejamos el formato manualmente.

/**
 * Formatea un número con notación compacta (ej: 2k, 1.5M)
 */
export const formatCompact = (value) => {
  if (value === null || value === undefined) return "0";
  
  try {
    const num = typeof value === "string" ? parseInput(value) : Number(value);
    if (!num && num !== 0) return "0";
    
    // Usar toLocaleString con notación compacta nativa
    return num.toLocaleString("es-CO", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).toUpperCase();
  } catch {
    return String(value);
  }
};

/**
 * Formatea un número con separadores de miles
 */
export const formatNumber = (value, format = "0,0") => {
  if (!value && value !== 0) return "0";
  
  try {
    return Number(value).toLocaleString("es-CO");
  } catch {
    return String(value);
  }
};

/**
 * Formatea un precio en COP
 */
export const formatPrice = (value) => {
  if (value === null || value === undefined || value === 0) return "$0";
  
  try {
    const num = typeof value === "string" ? parseInput(value) : Number(value);
    if (!num && num !== 0) return "$0";
    
    // Usar formato manual sin depender de locale
    return "$" + Math.round(num).toLocaleString("es-CO");
  } catch {
    return "$0";
  }
};

/**
 * Parsea un string de entrada a número
 * Soporta: "2k" -> 2000, "1.5m" -> 1500000, "500" -> 500
 */
export const parseInput = (value) => {
  if (!value) return 0;
  
  const str = String(value).trim().toLowerCase();
  
  // Manejar notación compacta (k, m, b)
  const compactMatch = str.match(/^([\d.]+)\s*([kmb])$/);
  if (compactMatch) {
    const [, num, suffix] = compactMatch;
    const base = parseFloat(num);
    const multiplier = suffix === "k" ? 1000 : suffix === "m" ? 1000000 : suffix === "b" ? 1000000000 : 1;
    return base * multiplier;
  }
  
  // Manejar números normales
  const parsed = parseFloat(str.replace(/[^0-9.-]/g, ""));
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formatea un número para mostrar en un input (compacto)
 */
export const formatForInput = (value) => {
  if (value === null || value === undefined || value === 0) return "";
  
  try {
    const num = typeof value === "string" ? parseInput(value) : Number(value);
    
    // Si es mayor a 1000, mostrar en formato compacto
    if (num >= 1000000) {
      return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + "m";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "k";
    }
    
    return String(num);
  } catch {
    return String(value);
  }
};
