import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export default function CompradorDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Comprador</h1>
        <p className="text-gray-500">Bienvenido, {user?.nombre_completo}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <p className="text-blue-100 text-sm">Estado de Cuenta</p>
          <p className="text-2xl font-bold mt-1">✅ Activo</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Tipo</p>
          <p className="text-xl font-bold mt-1 capitalize">
            {user?.perfil?.tipo_comprador || 'Comprador'}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Ciudad</p>
          <p className="text-xl font-bold mt-1">
            {user?.perfil?.ciudad_compra || 'Santa Cruz'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-primary-200 bg-primary-50/20 hover:shadow-md transition-shadow">
          <span className="text-4xl block mb-3">🛒</span>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Explorar el Marketplace</h2>
          <p className="text-sm text-gray-600 mb-4">
            Encuentra cosechas frescas cerca de ti de productores locales verificados. Filtra por distancia, precio y categoría.
          </p>
          <Link to="/marketplace" className="btn-primary inline-block text-center text-sm">
            Ir al Marketplace &rarr;
          </Link>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <span className="text-4xl block mb-3">🛍️</span>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Mis Pedidos</h2>
          <p className="text-sm text-gray-600 mb-4">
            Da seguimiento a tus compras, confirma entregas y revisa tu historial de pedidos y reservas.
          </p>
          <Link to="/mis-pedidos" className="btn-primary inline-block text-center text-sm">
            Ver pedidos &rarr;
          </Link>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <span className="text-4xl block mb-3">🌾</span>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Mis Reservas de Preventa</h2>
          <p className="text-sm text-gray-600 mb-4">
            Monitorea el estado de tus reservas de cosechas futuras y comunícate con los productores antes de la recolección.
          </p>
          <Link to="/preventas" className="btn-secondary inline-block text-center text-sm">
            Ver mis reservas &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
