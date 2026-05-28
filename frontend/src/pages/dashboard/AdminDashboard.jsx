import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [pendientes, setPendientes] = useState([]);
  const [documentosPendientes, setDocumentosPendientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  const fetchData = async () => {
    try {
      const [pendRes, docsRes, usersRes] = await Promise.all([
        api.get('/users/verificacion-pendiente'),
        api.get('/documentos/pendientes'),
        api.get('/users'),
      ]);
      setPendientes(pendRes.data);
      setDocumentosPendientes(docsRes.data);
      setUsuarios(usersRes.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAprobar = async (docId) => {
    try {
      await api.put(`/documentos/${docId}/aprobar`);
      setActionMsg({ type: 'success', text: 'Documento aprobado' });
      fetchData();
    } catch {
      setActionMsg({ type: 'error', text: 'Error al aprobar' });
    }
  };

  const handleRechazar = async (docId) => {
    const comentario = prompt('Motivo del rechazo (obligatorio):');
    if (!comentario) return;
    try {
      await api.put(`/documentos/${docId}/rechazar`, { comentario });
      setActionMsg({ type: 'success', text: 'Documento rechazado' });
      fetchData();
    } catch {
      setActionMsg({ type: 'error', text: 'Error al rechazar' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-48 rounded-xl" />
        <div className="skeleton h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Admin</h1>
          <p className="text-gray-500">Gestión de verificación de usuarios</p>
        </div>
      </div>

      {actionMsg && (
        <div className={`p-3 rounded-lg text-sm ${actionMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {actionMsg.text}
          <button onClick={() => setActionMsg(null)} className="float-right font-bold">&times;</button>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">
          ⏳ Usuarios Pendientes de Verificación
          {pendientes.length > 0 && (
            <span className="ml-2 badge-warning">{pendientes.length}</span>
          )}
        </h2>
        {pendientes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <span className="text-4xl block mb-2">✅</span>
            <p>No hay usuarios pendientes de verificación</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Nombre</th>
                  <th className="pb-2 font-medium">Rol</th>
                  <th className="pb-2 font-medium">Correo</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 font-medium">Docs</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-3">{u.nombre_completo}</td>
                    <td className="py-3"><span className="badge-info">{u.rol_nombre}</span></td>
                    <td className="py-3 text-gray-500">{u.correo}</td>
                    <td className="py-3">
                      <span className={u.estado_verificacion === 'PENDIENTE' ? 'badge-warning' : 'badge-info'}>
                        {u.estado_verificacion}
                      </span>
                    </td>
                    <td className="py-3">{u.total_documentos || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">
          📄 Documentos Pendientes de Revisión
          {documentosPendientes.length > 0 && (
            <span className="ml-2 badge-warning">{documentosPendientes.length}</span>
          )}
        </h2>
        {documentosPendientes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <span className="text-4xl block mb-2">📄</span>
            <p>No hay documentos pendientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Usuario</th>
                  <th className="pb-2 font-medium">Tipo</th>
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documentosPendientes.map((doc) => (
                  <tr key={doc.id} className="border-b last:border-0">
                    <td className="py-3">{doc.nombre_completo}</td>
                    <td className="py-3">{doc.tipo_documento}</td>
                    <td className="py-3 text-gray-500 text-xs">
                      {new Date(doc.fecha_subida).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <a
                        href={`/${doc.archivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs btn-outline py-1 px-3 mr-2 inline-block text-center mb-1"
                      >
                        Ver
                      </a>
                      <button onClick={() => handleAprobar(doc.id)} className="text-xs btn-primary py-1 px-3 mr-1">
                        Aprobar
                      </button>
                      <button onClick={() => handleRechazar(doc.id)} className="text-xs btn-danger py-1 px-3">
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">👥 Todos los Usuarios ({usuarios.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Nombre</th>
                <th className="pb-2 font-medium">Rol</th>
                <th className="pb-2 font-medium">Correo</th>
                <th className="pb-2 font-medium">Verificación</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2.5">{u.nombre_completo}</td>
                  <td className="py-2.5"><span className="badge-info">{u.rol_nombre}</span></td>
                  <td className="py-2.5 text-gray-500">{u.correo}</td>
                  <td className="py-2.5">
                    <span className={u.estado_verificacion === 'VERIFICADO' ? 'badge-success' : u.estado_verificacion === 'RECHAZADO' ? 'badge-danger' : 'badge-warning'}>
                      {u.estado_verificacion}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
