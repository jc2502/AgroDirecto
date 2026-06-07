import { useState, useEffect } from 'react';
import api from '../services/api';

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    api.get('/notificaciones')
      .then(({ data }) => setNotificaciones(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const marcarLeido = async (id) => {
    await api.put(`/notificaciones/${id}/leer`).catch(() => {});
    fetch();
  };

  const marcarTodas = async () => {
    await api.put('/notificaciones/leer-todas').catch(() => {});
    fetch();
  };

  const noLeidas = notificaciones.filter(n => !n.leido).length;

  if (loading) return (
    <div className="max-w-2xl mx-auto p-6 space-y-3">
      {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-lg" />)}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Notificaciones</h1>
        {noLeidas > 0 && (
          <button onClick={marcarTodas} className="btn-outline text-xs py-1.5 px-3">
            Marcar todas leídas ({noLeidas})
          </button>
        )}
      </div>

      {notificaciones.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <span className="text-4xl block mb-2">🔔</span>
          <p className="text-sm">No tienes notificaciones</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notificaciones.map(n => (
            <div
              key={n.id}
              className={`card flex items-start gap-3 p-3 ${!n.leido ? 'border-primary-200 bg-primary-50/20' : ''}`}
            >
              <span className="text-base mt-0.5">{!n.leido ? '🆕' : '📩'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{n.titulo}</p>
                <p className="text-xs text-gray-600 mt-0.5">{n.mensaje}</p>
                <p className="text-[11px] text-gray-400 mt-1">{new Date(n.fecha_envio).toLocaleString()}</p>
              </div>
              {!n.leido && (
                <button
                  onClick={() => marcarLeido(n.id)}
                  className="text-[11px] text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                >
                  Leído
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
