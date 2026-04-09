import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DataTable } from "../components/common/DataTable";
import { Loading } from "../components/common/Loading";
import { useAsyncData } from "../hooks/useAsyncData";
import { archivosMensajesApi, mensajesApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { PermissionGate } from "../components/common/PermissionGate";

export function MensajesPage() {
  const { pushToast } = useToast();
  const [searchParams] = useSearchParams();
  const initialMarketplaceId = searchParams.get("id_marketplace") || "";
  const [marketplaceFiltro, setMarketplaceFiltro] = useState(initialMarketplaceId);
  const [mensajeDetalle, setMensajeDetalle] = useState(null);
  const [editForm, setEditForm] = useState({ id: "", mensaje: "" });
  const [form, setForm] = useState({ id_marketplace: initialMarketplaceId, id_usuario_creador_chat: "", id_usuario_enviador_mensaje: "", mensaje: "" });
  const [idMensajeArchivo, setIdMensajeArchivo] = useState("");
  const [archivo, setArchivo] = useState(null);

  const mensajes = useAsyncData(async () => {
    const { data } = await mensajesApi.list({ limit: 80, id_marketplace: marketplaceFiltro || undefined });
    return data;
  }, marketplaceFiltro);

  const crearMensaje = async (event) => {
    event.preventDefault();
    try {
      await mensajesApi.create({
        ...form,
        id_marketplace: Number(form.id_marketplace),
        id_usuario_creador_chat: Number(form.id_usuario_creador_chat),
        id_usuario_enviador_mensaje: Number(form.id_usuario_enviador_mensaje),
      });
      pushToast({ title: "Mensaje enviado", message: "Chat actualizado", type: "success" });
      setForm({ id_marketplace: "", id_usuario_creador_chat: "", id_usuario_enviador_mensaje: "", mensaje: "" });
      mensajes.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo enviar", type: "error" });
    }
  };

  const subirArchivo = async () => {
    if (!idMensajeArchivo || !archivo) {
      return;
    }
    try {
      await archivosMensajesApi.upload({ idMensaje: Number(idMensajeArchivo), archivo });
      pushToast({ title: "Archivo subido", message: "Adjunto registrado correctamente", type: "success" });
      setIdMensajeArchivo("");
      setArchivo(null);
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo subir el archivo", type: "error" });
    }
  };

  const cargarDetalle = async (mensajeId) => {
    try {
      const { data } = await mensajesApi.get(mensajeId);
      setMensajeDetalle(data);
      setEditForm({ id: String(data.id), mensaje: data.mensaje || "" });
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo cargar detalle", type: "error" });
    }
  };

  const actualizarMensaje = async (event) => {
    event.preventDefault();
    try {
      await mensajesApi.update(Number(editForm.id), { mensaje: editForm.mensaje });
      pushToast({ title: "Mensaje actualizado", message: "Cambios guardados", type: "success" });
      if (editForm.id) {
        await cargarDetalle(Number(editForm.id));
      }
      mensajes.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo actualizar", type: "error" });
    }
  };

  const eliminarMensaje = async (mensajeId) => {
    const confirmado = window.confirm("¿Seguro que deseas eliminar este mensaje?");
    if (!confirmado) {
      return;
    }
    try {
      await mensajesApi.remove(mensajeId);
      pushToast({ title: "Mensaje eliminado", message: `Mensaje ${mensajeId} desactivado`, type: "success" });
      if (Number(editForm.id) === Number(mensajeId)) {
        setMensajeDetalle(null);
        setEditForm({ id: "", mensaje: "" });
      }
      mensajes.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo eliminar", type: "error" });
    }
  };

  const conversaciones = (mensajes.data || []).reduce((acc, item) => {
    const key = `${item.id_marketplace}-${item.id_usuario_creador_chat}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Filtros de mensajes</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Filtrar por ID marketplace" value={marketplaceFiltro} onChange={(e) => setMarketplaceFiltro(e.target.value)} />
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-white" onClick={mensajes.reload}>Refrescar</button>
        </div>
      </div>

      {mensajes.loading ? <Loading /> : null}
      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "id_marketplace", label: "Marketplace" },
          { key: "id_usuario_enviador_mensaje", label: "Remitente" },
          { key: "mensaje", label: "Mensaje" },
          {
            key: "acciones",
            label: "Acciones",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-white" onClick={() => cargarDetalle(row.id)}>
                  Detalle
                </button>
                <button className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => eliminarMensaje(row.id)}>
                  Eliminar
                </button>
              </div>
            ),
          },
        ]}
        rows={mensajes.data || []}
      />

      {mensajeDetalle ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Detalle mensaje #{mensajeDetalle.id}</h3>
          <p className="mt-1 text-sm text-slate-600">Marketplace: {mensajeDetalle.id_marketplace} | Remitente: {mensajeDetalle.id_usuario_enviador_mensaje}</p>
          <p className="mt-1 text-sm text-slate-700">{mensajeDetalle.mensaje}</p>
        </article>
      ) : null}

      <PermissionGate
        anyOf={["modificar_mensajes"]}
        fallback={
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
            No tienes permiso `modificar_mensajes` para editar mensajes.
          </article>
        }
      >
        <form onSubmit={actualizarMensaje} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
          <h3 className="md:col-span-2 text-lg font-semibold text-slate-900">Editar mensaje</h3>
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID mensaje" value={editForm.id} onChange={(e) => setEditForm((prev) => ({ ...prev, id: e.target.value }))} required />
          <input className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2" placeholder="Contenido" value={editForm.mensaje} onChange={(e) => setEditForm((prev) => ({ ...prev, mensaje: e.target.value }))} required />
          <button className="md:col-span-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white">Guardar edición</button>
        </form>
      </PermissionGate>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Vista de conversaciones</h3>
        <div className="mt-3 space-y-3">
          {Object.entries(conversaciones).map(([key, items]) => (
            <article key={key} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-700">Chat {key.replace("-", " / ")}</p>
              <div className="mt-2 space-y-1">
                {items.slice().sort((a, b) => new Date(a.fecha_hora || 0) - new Date(b.fecha_hora || 0)).map((item) => (
                  <p key={item.id} className="text-sm text-slate-700"><strong>#{item.id}</strong> {item.mensaje}</p>
                ))}
              </div>
            </article>
          ))}
          {!Object.keys(conversaciones).length ? <p className="text-sm text-slate-500">Sin conversaciones para mostrar.</p> : null}
        </div>
      </div>

      <PermissionGate
        anyOf={["crear_mensajes"]}
        fallback={
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
            No tienes permiso `crear_mensajes` para enviar mensajes.
          </article>
        }
      >
        <form onSubmit={crearMensaje} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
          <h3 className="md:col-span-2 text-lg font-semibold text-slate-900">Enviar mensaje</h3>
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID marketplace" value={form.id_marketplace} onChange={(e) => setForm((prev) => ({ ...prev, id_marketplace: e.target.value }))} required />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID usuario creador chat" value={form.id_usuario_creador_chat} onChange={(e) => setForm((prev) => ({ ...prev, id_usuario_creador_chat: e.target.value }))} required />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID usuario remitente" value={form.id_usuario_enviador_mensaje} onChange={(e) => setForm((prev) => ({ ...prev, id_usuario_enviador_mensaje: e.target.value }))} required />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Mensaje" value={form.mensaje} onChange={(e) => setForm((prev) => ({ ...prev, mensaje: e.target.value }))} required />
          <button className="md:col-span-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white">Enviar</button>
        </form>
      </PermissionGate>

      <PermissionGate
        anyOf={["crear_mensajes", "modificar_mensajes"]}
        fallback={
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
            No tienes permiso para adjuntar archivos en mensajes.
          </article>
        }
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Subir archivo de mensaje</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="ID mensaje" value={idMensajeArchivo} onChange={(e) => setIdMensajeArchivo(e.target.value)} />
            <input className="rounded-xl border border-slate-300 px-3 py-2" type="file" onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
            <button className="rounded-xl bg-indigo-600 px-4 py-2 text-white" onClick={subirArchivo}>Subir</button>
          </div>
        </div>
      </PermissionGate>
    </section>
  );
}
