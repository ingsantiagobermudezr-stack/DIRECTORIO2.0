import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { navigate } from 'astro:transitions/client';

export const RoleForm: React.FC<{ editId?: number }> = ({ editId }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [permisos, setPermisos] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    axiosInstance.get('/api/permisos').then(res => setPermisos(res.data)).catch(() => setPermisos([]));
    if (editId) {
      axiosInstance.get(`/api/roles/${editId}`).then(r => {
        setNombre(r.data.nombre);
        setDescripcion(r.data.descripcion);
        setSelected((r.data.permisos || []).map((p: any) => p.id_permiso));
      }).catch(()=>{});
    }
  }, []);

  const toggle = (id: number) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      if (editId) {
        await axiosInstance.put(`/api/roles/${editId}`, { nombre, descripcion, permiso_ids: selected });
      } else {
        await axiosInstance.post('/api/roles', { nombre, descripcion, permiso_ids: selected });
      }
      navigate('/admin/roles');
    }catch(err){
      console.error('Error saving role', err);
    }
  };

  return (
    <form onSubmit={submit} className="content-form p-6 bg-white rounded shadow max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">{editId ? 'Editar' : 'Agregar'} Rol</h2>
      <div className="content-input">
        <label>Nombre</label>
        <input value={nombre} onChange={e=>setNombre(e.target.value)} required />
      </div>
      <div className="content-input">
        <label>Descripción</label>
        <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} />
      </div>
      <div className="content-input">
        <label>Permisos</label>
        <div className="grid grid-cols-2 gap-2">
          {permisos.map(p=> (
            <label key={p.id_permiso} className="flex items-center gap-2">
              <input type="checkbox" checked={selected.includes(p.id_permiso)} onChange={()=>toggle(p.id_permiso)} />
              <span>{p.nombre}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="content-submit mt-4">
        <button className="btn btn-primary" type="submit">Guardar</button>
      </div>
    </form>
  );
};

export default RoleForm;
