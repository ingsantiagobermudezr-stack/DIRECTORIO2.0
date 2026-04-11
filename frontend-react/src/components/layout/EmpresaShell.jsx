import { Outlet } from "react-router-dom";
import { EmpresaSidebar } from "./EmpresaSidebar";

export function EmpresaShell() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 lg:flex-row">
      <div className="w-full lg:w-auto lg:min-w-[280px]">
        <EmpresaSidebar />
      </div>
      <main className="flex-1 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
