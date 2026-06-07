import { useState, useEffect } from 'react';
import api from '../services/api';

export default function RutasTransportista() {
  const [disponibles, setDisponibles] = useState([]);
  const [misRutas, setMisRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [tab, setTab] = useState('disponibles');

  const fetchData = async () => {
    try {
      const [dispRes, rutasRes] = await Promise.all([
        api.get('/transportista/rutas-disponibles'),
        api.get('/transportista/mis-rutas'),
      ]);
      setDisponibles(dispRes.data);
      setMisRutas(rutasRes.data);
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar rutas' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAceptar = async (pedidoId) => {
    if (!confirm('¿Aceptar esta ruta de entrega?')) return;
    setActionLoading(true);
    try {
      await api.post('/transportista/aceptar-ruta', { pedido_id: pedidoId });
      setMessage({ type: 'success', text: 'Ruta aceptada. El pedido está en camino.' });
      fetchData();
      setTab('mis-rutas');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al aceptar ruta' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompletar = async (hojaRutaId) => {
    if (!confirm('¿Registrar entrega en destino?')) return;
    setActionLoading(true);
    try {
      await api.post('/transportista/completar-ruta', { hoja_ruta_id: hojaRutaId });
      setMessage({ type: 'success', text: 'Entrega registrada. Esperando confirmación del comprador.' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🚚 Rutas de Entrega</h1>
        <p className="text-gray-500">Recolección desde provincias hacia la ciudad</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm flex justify-between ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setTab('disponibles')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'disponibles' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Disponibles ({disponibles.length})
        </button>
        <button
          onClick={() => setTab('mis-rutas')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'mis-rutas' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Mis Rutas ({misRutas.length})
        </button>
      </div>

      {tab === 'disponibles' && (
        disponibles.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <span className="text-4xl block mb-2">📭</span>
            <p>No hay rutas disponibles en este momento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disponibles.map((r) => (
              <div key={r.id} className="card-hover">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Pedido #{r.id}</h3>
                    <p className="text-sm text-primary-700 font-medium mt-1">{r.ruta_descripcion}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Comprador: {r.comprador_nombre} • Destino: {r.ciudad_destino}
                    </p>
                    <p className="text-xs text-gray-500">Monto: Bs {r.monto_total?.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleAceptar(r.id)}
                    disabled={actionLoading}
                    className="btn-primary text-sm shrink-0"
                  >
                    Aceptar Ruta
                  </button>
                </div>
                {r.paradas?.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Paradas de recolección:</p>
                    <div className="space-y-1">
                      {r.paradas.map((p, i) => (
                        <div key={i} className="text-xs text-gray-500 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">{i + 1}</span>
                          <span>{p.producto_nombre} ({p.cantidad} {p.unidad_medida}) — {p.nombre_finca}, {p.provincia || p.localidad}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'mis-rutas' && (
        misRutas.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <span className="text-4xl block mb-2">🗺️</span>
            <p>Aún no tienes rutas asignadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {misRutas.map((r) => (
              <div key={r.id} className="card-hover">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">Pedido #{r.pedido_id}</h3>
                    <p className="text-sm text-gray-600">{r.ruta_maps}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Estado: <span className="font-semibold">{r.estado}</span> • Pedido: {r.pedido_estado}
                    </p>
                  </div>
                  {r.estado === 'EN_PROCESO' && r.pedido_estado === 'EN_CAMINO' && (
                    <button
                      onClick={() => handleCompletar(r.id)}
                      disabled={actionLoading}
                      className="btn-primary text-sm"
                    >
                      Registrar Entrega
                    </button>
                  )}
                </div>
                {r.paradas?.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    {r.paradas.map((p) => (
                      <div key={p.id} className="text-xs text-gray-500 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${p.hora_recoleccion ? 'bg-green-500' : 'bg-gray-300'}`} />
                        Parada {p.orden_parada}: {p.nombre_finca} ({p.provincia})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
