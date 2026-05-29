import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const ref = useRef(null);

  const fetchNotificaciones = async () => {
    try {
      const { data } = await api.get('/notificaciones');
      setNotificaciones(data);
      setNoLeidas(data.filter(n => !n.leido).length);
    } catch {}
  };

  useEffect(() => {
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarcarLeido = async (id) => {
    try {
      await api.put(`/notificaciones/${id}/leer`);
      fetchNotificaciones();
    } catch {}
  };

  const handleMarcarTodas = async () => {
    try {
      await api.put('/notificaciones/leer-todas');
      fetchNotificaciones();
    } catch {}
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <span className="text-lg">🔔</span>
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Notificaciones</p>
            {noLeidas > 0 && (
              <button onClick={handleMarcarTodas} className="text-[11px] text-primary-600 hover:text-primary-700 font-medium">
                Marcar todas leídas
              </button>
            )}
          </div>
          {notificaciones.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              <p>Sin notificaciones</p>
            </div>
          ) : (
            notificaciones.map(n => (
              <div
                key={n.id}
                className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.leido ? 'bg-primary-50/30' : ''}`}
                onClick={() => { if (!n.leido) handleMarcarLeido(n.id); }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">{!n.leido ? '🆕' : '📩'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">{n.titulo}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">{n.mensaje}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(n.fecha_envio).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          {notificaciones.length > 0 && (
            <Link
              to="/notificaciones"
              onClick={() => setOpen(false)}
              className="block p-2.5 text-center text-xs font-medium text-primary-600 hover:bg-gray-50 rounded-b-xl border-t border-gray-100"
            >
              Ver todas
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
