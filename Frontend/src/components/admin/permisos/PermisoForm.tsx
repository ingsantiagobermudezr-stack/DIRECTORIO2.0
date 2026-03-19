import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { navigate } from 'astro:transitions/client';

export const PermisoForm: React.FC<{ editId?: number }> = ({ editId }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (editId) {
      axiosInstance.get(`/api/permisos/${editId}`).then(r => {
        setNombre(r.data.nombre);
        setDescripcion(r.data.descripcion);
      }).catch(()=>{});
    }
  }, [editId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      if (editId) {
        await axiosInstance.put(`/api/permisos/${editId}`, { nombre, descripcion });
      } else {
        await axiosInstance.post('/api/permisos', { nombre, descripcion });
      }
      navigate('/admin/permisos');
    }catch(err){
      console.error('Error saving permiso', err);
    }
  };

  return (
    <form onSubmit={submit} className="content-form p-6 bg-white rounded shadow max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Agregar Permiso</h2>
      <div className="content-input">
        <label>Nombre</label>
        <input value={nombre} onChange={e=>setNombre(e.target.value)} required />
      </div>
      <div className="content-input">
        <label>Descripción</label>
        <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} />
      </div>
      <div className="content-submit mt-4">
        <button className="btn btn-primary" type="submit">Guardar</button>
      </div>
    </form>
  );
};

export default PermisoForm;
