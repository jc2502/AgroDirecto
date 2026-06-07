import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export default function CartButton() {
  const { user } = useAuthStore();
  const [cantidad, setCantidad] = useState(0);

  const fetchCarrito = async () => {
    try {
      const { data } = await api.get('/carrito');
      setCantidad(data.cantidad_items || 0);
    } catch {
      setCantidad(0);
    }
  };

  useEffect(() => {
    if (user?.rol_nombre !== 'COMPRADOR') return;
    fetchCarrito();
    const interval = setInterval(fetchCarrito, 30000);
    const onUpdate = () => fetchCarrito();
    window.addEventListener('carrito-updated', onUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('carrito-updated', onUpdate);
    };
  }, [user?.rol_nombre]);

  if (user?.rol_nombre !== 'COMPRADOR') return null;

  return (
    <Link
      to="/carrito"
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      title="Mi carrito"
    >
      <span className="text-lg">🛒</span>
      {cantidad > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold min-w-[1rem] h-4 px-1 rounded-full flex items-center justify-center">
          {cantidad > 9 ? '9+' : cantidad}
        </span>
      )}
    </Link>
  );
}
