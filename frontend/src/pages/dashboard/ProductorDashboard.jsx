import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

export default function ProductorDashboard() {
  const { user } = useAuthStore();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/productores/mi-perfil')
      .then(({ data }) => setPerfil(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Productor</h1>
        <p className="text-gray-500">Bienvenido, {user?.nombre_completo}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <p className="text-primary-100 text-sm">Estado de Verificación</p>
          <p className="text-2xl font-bold mt-1">
            {user?.estado_verificacion === 'VERIFICADO' ? '✅ Verificado' :
             user?.estado_verificacion === 'PENDIENTE' ? '⏳ Pendiente' :
             user?.estado_verificacion === 'RECHAZADO' ? '❌ Rechazado' : '📝 Registrado'}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Finca</p>
          <p className="text-xl font-bold mt-1">{perfil?.nombre_finca || 'Sin registrar'}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Ubicación</p>
          <p className="text-xl font-bold mt-1">{perfil?.localidad || perfil?.municipio || 'No definida'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/dashboard/geolocalizacion" className="card-hover flex items-center space-x-4">
          <span className="text-3xl">📍</span>
          <div>
            <h3 className="font-semibold">Mi Ubicación</h3>
            <p className="text-sm text-gray-500">Configura tu ubicación en el mapa</p>
          </div>
        </Link>
        <Link to="/dashboard/documentos" className="card-hover flex items-center space-x-4">
          <span className="text-3xl">📄</span>
          <div>
            <h3 className="font-semibold">Documentos</h3>
            <p className="text-sm text-gray-500">Sube tus documentos de verificación</p>
          </div>
        </Link>
        <div className="card-hover flex items-center space-x-4 opacity-50 cursor-not-allowed">
          <span className="text-3xl">🌽</span>
          <div>
            <h3 className="font-semibold">Mis Productos</h3>
            <p className="text-sm text-gray-500">Próximamente</p>
          </div>
        </div>
      </div>

      {perfil?.latitud && perfil?.longitud && (
        <div className="card">
          <h3 className="font-semibold mb-2">Ubicación Registrada</h3>
          <p className="text-sm text-gray-500">
            Lat: {perfil.latitud}, Lng: {perfil.longitud}
          </p>
        </div>
      )}
    </div>
  );
}
