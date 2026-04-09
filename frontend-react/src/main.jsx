import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { PermissionsProvider } from "./context/PermissionsContext";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <PermissionsProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </PermissionsProvider>
    </AuthProvider>
  </BrowserRouter>
);
