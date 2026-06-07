import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function MisPedidos() {
  const [pedidosLegacy, setPedidosLegacy] = useState([]);
  const [pedidosNuevos, setPedidosNuevos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchPedidos = async () => {
    try {
      const [legacyRes, nuevosRes] = await Promise.all([
        api.get('/compras/historial'),
        api.get('/pedidos/mis-pedidos'),
      ]);
      setPedidosLegacy(legacyRes.data);
      setPedidosNuevos(nuevosRes.data);
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar el historial' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPedidos(); }, []);

  const handleConfirmarEntrega = async (compraId) => {
    if (!confirm('¿Confirmar que recibiste este pedido?')) return;
    setActionLoading(true);
    try {
      await api.post('/compras/confirmar-entrega', { compra_id: compraId });
      setMessage({ type: 'success', text: 'Entrega confirmada' });
      fetchPedidos();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmarReserva = async (reservaId) => {
    if (!confirm('¿Confirmar que recibiste esta reserva?')) return;
    setActionLoading(true);
    try {
      await api.post('/compras/confirmar-entrega-reserva', { reserva_id: reservaId });
      setMessage({ type: 'success', text: 'Entrega de reserva confirmada' });
      fetchPedidos();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmarPedido = async (pedidoId) => {
    if (!confirm('¿Confirmar que recibiste este pedido?')) return;
    setActionLoading(true);
    try {
      await api.post('/pedidos/confirmar-entrega', { pedido_id: pedidoId });
      setMessage({ type: 'success', text: 'Entrega confirmada' });
      fetchPedidos();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error' });
    } finally {
      setActionLoading(false);
    }
  };

  const estadoBadge = (estado) => {
    const map = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      PAGO_PENDIENTE: 'bg-orange-100 text-orange-800',
      LISTO_DESPACHO: 'bg-green-100 text-green-800',
      EN_CAMINO: 'bg-blue-100 text-blue-800',
      COMPLETADO: 'bg-green-100 text-green-800',
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

  const totalPedidos = pedidosNuevos.length + pedidosLegacy.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🛍️ Mis Pedidos</h1>
        <p className="text-gray-500">Historial de pedidos, compras y reservas</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm flex justify-between ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      {totalPedidos === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">🛒</span>
          <h2 className="text-xl font-semibold mb-2">No tienes pedidos aún</h2>
          <p className="text-gray-500 mb-4">Explora el marketplace y agrega productos al carrito.</p>
          <Link to="/marketplace" className="btn-primary mr-2">Ir al Marketplace</Link>
          <Link to="/carrito" className="btn-outline">Ver Carrito</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {pedidosNuevos.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-700">Pedidos con Carrito (Sprint 3)</h2>
              {pedidosNuevos.map((p) => (
                <div key={`pedido-${p.id}`} className="card-hover">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">Pedido #{p.id}</h3>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${estadoBadge(p.estado)}`}>
                          {p.estado_label}
                        </span>
                        {p.transportista_nombre && (
                          <span className="text-xs text-gray-500">🚚 {p.transportista_nombre}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {p.detalles?.map(d => `${d.nombre} x${d.cantidad}`).join(', ')}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span className="font-semibold text-primary-600">Bs {p.monto_total?.toFixed(2)}</span>
                        <span>{new Date(p.fecha_pedido).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {['PENDIENTE', 'PAGO_PENDIENTE'].includes(p.estado) && (
                          <Link to={`/pago/${p.id}`} className="btn-primary text-xs py-1 px-3">
                            {p.estado === 'PENDIENTE' ? 'Ir a Pagar' : 'Continuar Pago'}
                          </Link>
                        )}
                        {p.estado === 'EN_CAMINO' && (
                          <button
                            onClick={() => handleConfirmarPedido(p.id)}
                            disabled={actionLoading}
                            className="btn-primary text-xs py-1 px-3"
                          >
                            Confirmar Entrega
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pedidosLegacy.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-700">Compras y Reservas Anteriores</h2>
              {pedidosLegacy.map((p, idx) => (
                <div key={`${p.tipo}-${p.id}-${idx}`} className="card-hover">
                  <div className="flex items-start gap-4">
                    <img
                      src={p.imagen ? `/${p.imagen}` : '/uploads/productos/placeholder.jpg'}
                      alt={p.producto_nombre}
                      className="w-16 h-16 object-cover rounded-lg border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{p.producto_nombre}</h3>
                          <p className="text-xs text-gray-500">{p.productor_nombre} • {p.nombre_finca}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${estadoBadge(p.estado)}`}>
                            {p.estado}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.tipo === 'COMPRA' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.tipo}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span>{p.cantidad} {p.unidad_medida.toLowerCase()}</span>
                        <span>Bs {p.total?.toFixed(2)}</span>
                        <span>{new Date(p.fecha).toLocaleDateString()}</span>
                      </div>
                      {p.estado === 'ENVIADO' && (
                        <div className="mt-2 flex gap-2">
                          {p.tipo === 'COMPRA' ? (
                            <button
                              onClick={() => handleConfirmarEntrega(p.id)}
                              disabled={actionLoading}
                              className="btn-primary text-xs py-1 px-3"
                            >
                              Confirmar Entrega
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConfirmarReserva(p.id)}
                              disabled={actionLoading}
                              className="btn-primary text-xs py-1 px-3"
                            >
                              Confirmar Entrega
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
