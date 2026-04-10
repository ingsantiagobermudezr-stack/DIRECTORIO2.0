import { createContext, useContext } from "react";
import { toast as reactToast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContext = createContext(null);

// Tipo de toast a configuración de react-toastify
const toastConfig = {
  success: {
    icon: "✅",
    theme: "colored",
    position: "top-right",
    autoClose: 3000,
  },
  error: {
    icon: "❌",
    theme: "colored",
    position: "top-right",
    autoClose: 4000,
  },
  warning: {
    icon: "⚠️",
    theme: "colored",
    position: "top-right",
    autoClose: 3500,
  },
  info: {
    icon: "ℹ️",
    theme: "colored",
    position: "top-right",
    autoClose: 3000,
  },
};

export function ToastProvider({ children }) {
  const pushToast = ({ title, message, type = "info" }) => {
    const config = toastConfig[type] || toastConfig.info;
    
    reactToast(
      <div>
        <div className="font-semibold">{title}</div>
        {message && <div className="text-sm opacity-90">{message}</div>}
      </div>,
      config,
    );
  };

  const value = { pushToast };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return ctx;
}

