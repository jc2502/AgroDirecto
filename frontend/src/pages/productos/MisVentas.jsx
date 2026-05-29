import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function MisVentas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchVentas = async () => {
    try {
      const { data } = await api.get('/compras/ventas');
      setVentas(data);
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar ventas' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVentas(); }, []);

  const handleEnviar = async (compraId) => {
    if (!confirm('¿Marcar este pedido como enviado?')) return;
    setActionLoading(true);
    try {
      await api.post('/compras/marcar-enviado', { compra_id: compraId });
      setMessage({ type: 'success', text: 'Pedido marcado como enviado' });
      fetchVentas();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnviarReserva = async (reservaId) => {
    if (!confirm('¿Marcar esta reserva como enviada?')) return;
    setActionLoading(true);
    try {
      await api.post('/compras/marcar-reserva-enviada', { reserva_id: reservaId });
      setMessage({ type: 'success', text: 'Reserva marcada como enviada' });
      fetchVentas();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error' });
    } finally {
      setActionLoading(false);
    }
  };

  const estadoBadge = (estado) => {
    const map = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      CONFIRMADA: 'bg-green-100 text-green-800',
      ENVIADO: 'bg-blue-100 text-blue-800',
      ENTREGADO: 'bg-green-100 text-green-800',
      CANCELADA: 'bg-red-100 text-red-800',
    };
    return map[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">💰 Mis Ventas</h1>
        <p className="text-gray-500">Compras directas y reservas recibidas</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm flex justify-between ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      {ventas.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">📦</span>
          <h2 className="text-xl font-semibold mb-2">No tienes ventas aún</h2>
          <p className="text-gray-500">Cuando un comprador adquiera tus productos, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ventas.map((v, idx) => (
            <div key={`${v.tipo}-${v.id}-${idx}`} className="card-hover">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{v.producto_nombre}</h3>
                      <p className="text-xs text-gray-500">
                        🧑‍🌾 {v.comprador_nombre} &mdash; 📞 {v.comprador_celular}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${estadoBadge(v.estado)}`}>
                        {v.estado}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.tipo === 'COMPRA' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {v.tipo}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span>{v.cantidad} {v.unidad_medida?.toLowerCase() || ''}</span>
                    <span>Bs {v.total?.toFixed(2)}</span>
                    <span>{new Date(v.fecha).toLocaleDateString()}</span>
                  </div>
                  {v.estado === 'PENDIENTE' && (
                    <div className="mt-2 flex gap-2">
                      {v.tipo === 'COMPRA' ? (
                        <button
                          onClick={() => handleEnviar(v.id)}
                          disabled={actionLoading}
                          className="btn-primary text-xs py-1 px-3"
                        >
                          Marcar Enviado
                        </button>
                      ) : null}
                    </div>
                  )}
                  {v.estado === 'CONFIRMADA' && (
                    <div className="mt-2">
                      <button
                        onClick={() => handleEnviarReserva(v.id)}
                        disabled={actionLoading}
                        className="btn-primary text-xs py-1 px-3"
                      >
                        Marcar Reserva Enviada
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
