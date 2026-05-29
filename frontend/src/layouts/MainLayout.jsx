import { Outlet, Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function MainLayout() {
  const { user, token, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🌾</span>
              <span className="text-xl font-bold text-gray-900">AgroDirecto</span>
              <span className="hidden sm:inline text-sm text-primary-600 font-medium">Santa Cruz</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/marketplace" className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors mr-2">Marketplace</Link>
              {token && user ? (
                <>
                  <Link to="/dashboard" className="btn-primary text-sm">Ir al Dashboard</Link>
                  <button onClick={logout} className="btn-secondary text-sm">Cerrar Sesión</button>
                </>
              ) : (
                <>
                  {location.pathname !== '/login' && (
                    <Link to="/login" className="btn-outline text-sm">Iniciar Sesión</Link>
                  )}
                  {location.pathname !== '/register' && (
                    <Link to="/register" className="btn-primary text-sm">Registrarse</Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} AgroDirecto Santa Cruz - Marketplace Agropecuario</p>
          <p className="mt-1">Conectando productores con compradores en toda Bolivia</p>
        </div>
      </footer>
    </div>
  );
}
