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

      <div className="card text-center py-12">
        <span className="text-5xl block mb-4">🛒</span>
        <h2 className="text-xl font-semibold mb-2">Explora Productos</h2>
        <p className="text-gray-500 mb-4">
          Pronto podrás navegar por los productos de productores verificados.
        </p>
        <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-sm">
          <span className="animate-pulse">⏳</span>
          <span>Módulo de productos en desarrollo</span>
        </div>
      </div>
    </div>
  );
}
