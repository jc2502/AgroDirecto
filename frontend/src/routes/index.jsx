import { createBrowserRouter, Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import GeoLocation from '../pages/GeoLocation';
import Documentos from '../pages/Documentos';
import MisProductos from '../pages/productos/MisProductos';
import PublicarCosecha from '../pages/productos/PublicarCosecha';
import ProductoDetalle from '../pages/productos/ProductoDetalle';
import MisPedidos from '../pages/productos/MisPedidos';
import MisVentas from '../pages/productos/MisVentas';
import ProductorDashboard from '../pages/dashboard/ProductorDashboard';
import CompradorDashboard from '../pages/dashboard/CompradorDashboard';
import TransportistaDashboard from '../pages/dashboard/TransportistaDashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import Marketplace from '../pages/Marketplace';
import Preventas from '../pages/Preventas';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuthStore.getState();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.rol_nombre)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function DashboardRedirect() {
  const { user } = useAuthStore.getState();
  if (!user) return <Navigate to="/login" replace />;
  const routes = {
    PRODUCTOR: '/dashboard/productor',
    COMPRADOR: '/dashboard/comprador',
    TRANSPORTISTA: '/dashboard/transportista',
    ADMIN: '/dashboard/admin',
  };
  return <Navigate to={routes[user.rol_nombre] || '/login'} replace />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'productos', element: <Navigate to="/marketplace" replace /> },
    ],
  },
  {
    path: '/marketplace',
    element: <MainLayout />,
    children: [
      { index: true, element: <Marketplace /> },
      { path: 'producto/:id', element: <ProductoDetalle /> },
    ],
  },
  {
    path: '/preventas',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Preventas /> },
    ],
  },
  {
    path: '/mis-productos',
    element: <ProtectedRoute allowedRoles={['PRODUCTOR']}><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <MisProductos /> },
    ],
  },
  {
    path: '/publicar-cosecha',
    element: <ProtectedRoute allowedRoles={['PRODUCTOR']}><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <PublicarCosecha /> },
    ],
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardRedirect /> },
      { path: 'productor', element: <ProtectedRoute allowedRoles={['PRODUCTOR']}><ProductorDashboard /></ProtectedRoute> },
      { path: 'comprador', element: <ProtectedRoute allowedRoles={['COMPRADOR']}><CompradorDashboard /></ProtectedRoute> },
      { path: 'transportista', element: <ProtectedRoute allowedRoles={['TRANSPORTISTA']}><TransportistaDashboard /></ProtectedRoute> },
      { path: 'admin', element: <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute> },
      { path: 'geolocalizacion', element: <ProtectedRoute allowedRoles={['PRODUCTOR']}><GeoLocation /></ProtectedRoute> },
      { path: 'documentos', element: <ProtectedRoute allowedRoles={['PRODUCTOR', 'TRANSPORTISTA']}><Documentos /></ProtectedRoute> },
      { path: 'mis-productos', element: <ProtectedRoute allowedRoles={['PRODUCTOR']}><MisProductos /></ProtectedRoute> },
      { path: 'publicar-cosecha', element: <ProtectedRoute allowedRoles={['PRODUCTOR']}><PublicarCosecha /></ProtectedRoute> },
      { path: 'editar-cosecha/:id', element: <ProtectedRoute allowedRoles={['PRODUCTOR']}><PublicarCosecha /></ProtectedRoute> },
      { path: 'producto/:id', element: <ProductoDetalle /> },
      { path: 'mis-pedidos', element: <ProtectedRoute allowedRoles={['COMPRADOR']}><MisPedidos /></ProtectedRoute> },
      { path: 'mis-ventas', element: <ProtectedRoute allowedRoles={['PRODUCTOR']}><MisVentas /></ProtectedRoute> },
    ],
  },
  {
    path: '/mis-pedidos',
    element: <ProtectedRoute allowedRoles={['COMPRADOR']}><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <MisPedidos /> },
    ],
  },
  {
    path: '/mis-ventas',
    element: <ProtectedRoute allowedRoles={['PRODUCTOR']}><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <MisVentas /> },
    ],
  },
]);

export default router;
