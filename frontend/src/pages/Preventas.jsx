import { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export default function Preventas() {
  const { user } = useAuthStore();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const esProductor = user?.rol_nombre === 'PRODUCTOR';

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const endpoint = esProductor ? '/preventas/productor/reservas' : '/preventas/mis-reservas';
      const { data } = await api.get(endpoint);
      setReservas(data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al cargar las reservas' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchReservas();
  }, [user]);

  const handleConfirmar = async (productoId, productoNombre) => {
    if (!confirm(`¿Confirmar disponibilidad para "${productoNombre}"? Esto notificará a todos los compradores.`)) return;
    setActionLoading(true);
    setMessage(null);
    try {
      await api.post('/preventas/confirmar', { producto_id: productoId });
      setMessage({ type: 'success', text: `Disponibilidad de "${productoNombre}" confirmada.` });
      fetchReservas();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al confirmar disponibilidad' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelar = async (productoId, productoNombre) => {
    if (!confirm(`¿Cancelar la preventa para "${productoNombre}"? Esto anulará las reservas y notificará a los compradores.`)) return;
    setActionLoading(true);
    setMessage(null);
    try {
      await api.post('/preventas/cancelar', { producto_id: productoId });
      setMessage({ type: 'success', text: `Preventa de "${productoNombre}" cancelada exitosamente.` });
      fetchReservas();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al cancelar preventa' });
    } finally {
      setActionLoading(false);
    }
  };

  const estadoBadge = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMADA': return 'bg-green-100 text-green-800';
      case 'CANCELADA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto p-6">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-48 rounded-xl" />
        <div className="skeleton h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {esProductor ? '📋 Reservas Recibidas (Preventa)' : '🌾 Mis Reservas de Cosechas'}
          </h1>
          <p className="text-gray-500">
            {esProductor
              ? 'Administra las reservas hechas por compradores en tus cosechas futuras'
              : 'Verifica el estado de las cosechas que has reservado'}
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm flex justify-between ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      {reservas.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">📅</span>
          <h3 className="text-lg font-semibold text-gray-700">No hay reservas registradas</h3>
          <p className="text-sm text-gray-500 mt-1">
            {esProductor
              ? 'Cuando un comprador reserve tus productos en preventa, aparecerán aquí.'
              : 'Navega por el marketplace y busca productos etiquetados como preventa para reservar.'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0 border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">Producto</th>
                  <th className="px-6 py-4 text-left">{esProductor ? 'Comprador' : 'Productor / Finca'}</th>
                  <th className="px-6 py-4 text-center">Cantidad Reservada</th>
                  <th className="px-6 py-4 text-right">Precio Unitario</th>
                  <th className="px-6 py-4 text-right">Total Bs</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-left">Fecha Reserva</th>
                  {esProductor && <th className="px-6 py-4 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservas.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{r.producto_nombre}</td>
                    <td className="px-6 py-4">
                      {esProductor ? (
                        <div>
                          <p className="font-medium text-gray-900">{r.comprador_nombre}</p>
                          <p className="text-xs text-gray-500">📞 {r.comprador_celular}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900">{r.productor_nombre}</p>
                          <p className="text-xs text-gray-500">🌾 {r.nombre_finca} ({r.localidad})</p>
                          <p className="text-[11px] text-gray-400">📞 {r.productor_celular}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {r.cantidad} {r.unidad_medida.toLowerCase()}
                    </td>
                    <td className="px-6 py-4 text-right">Bs {r.precio.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      Bs {(r.cantidad * r.precio).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${estadoBadge(r.estado)}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(r.fecha_reserva).toLocaleDateString()}
                    </td>
                    {esProductor && (
                      <td className="px-6 py-4 text-center">
                        {r.estado === 'PENDIENTE' ? (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleConfirmar(r.producto_id, r.producto_nombre)}
                              disabled={actionLoading}
                              className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs py-1 px-2.5 rounded transition-colors disabled:opacity-50"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => handleCancelar(r.producto_id, r.producto_nombre)}
                              disabled={actionLoading}
                              className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs py-1 px-2.5 rounded transition-colors disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Acción completada</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
