import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Carrito() {
  const [carrito, setCarrito] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const fetchCarrito = async () => {
    try {
      const { data } = await api.get('/carrito');
      setCarrito(data);
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar el carrito' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCarrito(); }, []);

  const handleUpdate = async (itemId, cantidad) => {
    setActionLoading(true);
    try {
      const { data } = await api.put(`/carrito/items/${itemId}`, { cantidad: parseFloat(cantidad) });
      setCarrito(data);
      window.dispatchEvent(new Event('carrito-updated'));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al actualizar' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    setActionLoading(true);
    try {
      const { data } = await api.delete(`/carrito/items/${itemId}`);
      setCarrito(data);
      window.dispatchEvent(new Event('carrito-updated'));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al eliminar' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!confirm('¿Confirmar pedido y proceder al pago?')) return;
    setActionLoading(true);
    try {
      const { data } = await api.post('/pedidos/checkout');
      navigate(`/pago/${data.pedido_id}`);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al crear pedido' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🛒 Mi Carrito</h1>
        <p className="text-gray-500">Revisa tus productos antes de pagar</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm flex justify-between ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      {carrito.items.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">🛒</span>
          <h2 className="text-xl font-semibold mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-4">Agrega productos desde el marketplace.</p>
          <Link to="/marketplace" className="btn-primary">Ir al Marketplace</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {carrito.items.map((item) => (
              <div key={item.id} className="card-hover flex items-start gap-4">
                <img
                  src={item.imagen ? `/${item.imagen}` : '/uploads/productos/placeholder.jpg'}
                  alt={item.nombre}
                  className="w-16 h-16 object-cover rounded-lg border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{item.nombre}</h3>
                  <p className="text-xs text-gray-500">{item.nombre_finca} • {item.provincia || item.localidad}</p>
                  <p className="text-sm text-primary-600 font-bold mt-1">Bs {item.precio} / {item.unidad_medida.toLowerCase()}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      max={item.cantidad_disponible}
                      defaultValue={item.cantidad}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val !== item.cantidad && val > 0) handleUpdate(item.id, val);
                      }}
                      className="input-field w-20 py-1 text-sm"
                      disabled={actionLoading}
                    />
                    <span className="text-xs text-gray-500">= Bs {(item.cantidad * item.precio).toFixed(2)}</span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={actionLoading}
                      className="text-xs text-red-600 hover:text-red-800 ml-auto"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total ({carrito.cantidad_items} productos)</span>
              <span className="text-2xl font-bold text-primary-600">Bs {carrito.total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={actionLoading}
              className="btn-primary w-full py-3"
            >
              {actionLoading ? 'Procesando...' : 'Confirmar Pedido y Pagar'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
