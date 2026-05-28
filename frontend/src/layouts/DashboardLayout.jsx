import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl">🌾</span>
              <span className="font-bold text-gray-900">AgroDirecto</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-sm text-gray-500">{user?.nombre_completo}</span>
            <span className="badge-info">{user?.rol_nombre}</span>
            <button onClick={handleLogout} className="btn-secondary text-sm">Salir</button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 lg:p-6 min-h-[calc(100vh-4rem)] overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
