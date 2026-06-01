import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export default function TransportistaDashboard() {
  const { user, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (!user?.perfil) fetchProfile();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Transportista</h1>
        <p className="text-gray-500">Bienvenido, {user?.nombre_completo}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-amber-500 to-amber-700 text-white">
          <p className="text-amber-100 text-sm">Estado</p>
          <p className="text-2xl font-bold mt-1">✅ Activo</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Tipo de Transporte</p>
          <p className="text-xl font-bold mt-1 capitalize">
            {user?.perfil?.tipo_transporte || 'No registrado'}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Capacidad</p>
          <p className="text-xl font-bold mt-1">
            {user?.perfil?.capacidad_carga || '0'} kg
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/dashboard/documentos" className="card-hover flex items-center space-x-4">
          <span className="text-3xl">📄</span>
          <div>
            <h3 className="font-semibold">Subir Licencia</h3>
            <p className="text-sm text-gray-500">Adjunta tu licencia de conducir</p>
          </div>
        </Link>
        <div className="card-hover flex items-center space-x-4 opacity-50 cursor-not-allowed">
          <span className="text-3xl">🚚</span>
          <div>
            <h3 className="font-semibold">Viajes Disponibles</h3>
            <p className="text-sm text-gray-500">Próximamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
