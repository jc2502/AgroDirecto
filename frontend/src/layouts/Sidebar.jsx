import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const menuItems = {
  PRODUCTOR: [
    { to: '/dashboard/productor', label: 'Dashboard', icon: '📊' },
    { to: '/dashboard/geolocalizacion', label: 'Mi Ubicación', icon: '📍' },
    { to: '/dashboard/documentos', label: 'Documentos', icon: '📄' },
  ],
  COMPRADOR: [
    { to: '/dashboard/comprador', label: 'Dashboard', icon: '📊' },
  ],
  TRANSPORTISTA: [
    { to: '/dashboard/transportista', label: 'Dashboard', icon: '📊' },
    { to: '/dashboard/documentos', label: 'Documentos', icon: '📄' },
  ],
  ADMIN: [
    { to: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
    { to: '/dashboard/geolocalizacion', label: 'Mapa', icon: '📍' },
    { to: '/dashboard/documentos', label: 'Documentos', icon: '📄' },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user } = useAuthStore();
  const items = menuItems[user?.rol_nombre] || [];

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed lg:sticky top-16 lg:top-16 left-0 z-40 h-[calc(100vh-4rem)]
        w-64 bg-white border-r border-gray-200 transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">{user?.nombre_completo}</p>
          <p className="text-xs text-primary-600 font-medium">{user?.rol_nombre}</p>
        </div>
        <nav className="p-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
