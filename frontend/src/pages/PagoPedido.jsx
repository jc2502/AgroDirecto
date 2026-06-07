import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function PagoPedido() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [pago, setPago] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchData = async () => {
    try {
      const [pedidoRes, pagoRes] = await Promise.all([
        api.get(`/pedidos/${pedidoId}`),
        api.get(`/pagos/pedido/${pedidoId}`).catch(() => ({ data: null })),
      ]);
      setPedido(pedidoRes.data);
      setPago(pagoRes.data);
    } catch {
      setMessage({ type: 'error', text: 'Pedido no encontrado' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [pedidoId]);

  const handleGenerarQR = async () => {
    setPayLoading(true);
    try {
      const { data } = await api.post('/pagos/generar-qr', { pedido_id: parseInt(pedidoId) });
      setPago(data);
      setPedido(prev => ({ ...prev, estado: 'PAGO_PENDIENTE', estado_label: 'Pendiente de Pago' }));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al generar QR' });
    } finally {
      setPayLoading(false);
    }
  };

  const handleSimularPago = async () => {
    if (!pago?.referencia) return;
    setPayLoading(true);
    try {
      await api.post('/pagos/simular', { referencia: pago.referencia });
      setMessage({ type: 'success', text: '¡Pago exitoso! Recibirás una notificación push.' });
      setTimeout(() => navigate('/mis-pedidos'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al procesar pago' });
    } finally {
      setPayLoading(false);
    }
  };

  const qrUrl = pago?.codigo_qr
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pago.codigo_qr)}`
    : null;

  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <p className="text-red-600">{message?.text || 'Pedido no encontrado'}</p>
        <Link to="/carrito" className="btn-primary mt-4 inline-block">Volver al carrito</Link>
      </div>
    );
  }

  const yaPagado = ['LISTO_DESPACHO', 'EN_CAMINO', 'COMPLETADO'].includes(pedido.estado);

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <Link to="/carrito" className="text-primary-600 hover:text-primary-700 text-sm">&larr; Volver al carrito</Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">💳 Pago del Pedido #{pedidoId}</h1>
        <p className="text-gray-500">Estado: <span className="font-semibold">{pedido.estado_label}</span></p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-800">Resumen</h2>
        {pedido.detalles?.map((d, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{d.nombre} x{d.cantidad}</span>
            <span>Bs {d.subtotal.toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-primary-600">Bs {pedido.monto_total.toFixed(2)}</span>
        </div>
      </div>

      {yaPagado ? (
        <div className="card text-center py-8 bg-green-50 border-green-200">
          <span className="text-4xl block mb-2">✅</span>
          <p className="font-semibold text-green-800">Pago confirmado</p>
          <Link to="/mis-pedidos" className="btn-primary mt-4 inline-block">Ver mis pedidos</Link>
        </div>
      ) : !pago ? (
        <div className="card text-center py-8">
          <span className="text-4xl block mb-4">📱</span>
          <p className="text-gray-600 mb-4">Genera un código QR dinámico para pagar de forma simulada.</p>
          <button onClick={handleGenerarQR} disabled={payLoading} className="btn-primary w-full">
            {payLoading ? 'Generando...' : 'Generar QR de Pago'}
          </button>
        </div>
      ) : (
        <div className="card text-center space-y-4">
          <p className="text-sm text-gray-600">Escanea el QR o usa la referencia para pagar</p>
          {qrUrl && (
            <img src={qrUrl} alt="Código QR de pago" className="mx-auto border rounded-xl p-2 bg-white" />
          )}
          <div className="bg-gray-50 p-3 rounded-lg text-left text-sm space-y-1">
            <p><strong>Referencia:</strong> {pago.referencia}</p>
            <p><strong>Monto:</strong> Bs {pago.monto?.toFixed(2)}</p>
            <p><strong>Vence:</strong> {new Date(pago.fecha_expiracion).toLocaleString()}</p>
          </div>
          <button onClick={handleSimularPago} disabled={payLoading} className="btn-primary w-full py-3">
            {payLoading ? 'Procesando...' : '🔔 Simular Pago Exitoso (Push)'}
          </button>
          <p className="text-xs text-gray-400">Simulación de pago móvil — en producción se integraría con billetera digital.</p>
        </div>
      )}
    </div>
  );
}
