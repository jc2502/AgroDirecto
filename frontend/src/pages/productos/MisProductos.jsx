import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function MisProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchProductos = async () => {
    try {
      const { data } = await api.get('/productos/mis-productos/lista');
      setProductos(data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProductos(); }, []);

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/productos/${id}`);
      setMessage({ type: 'success', text: 'Producto eliminado' });
      fetchProductos();
    } catch {
      setMessage({ type: 'error', text: 'Error al eliminar' });
    }
  };

  const handleStock = async (id, cantidad) => {
    try {
      await api.put(`/productos/${id}/stock`, { cantidad: parseFloat(cantidad) });
      setMessage({ type: 'success', text: 'Stock actualizado' });
      fetchProductos();
    } catch {
      setMessage({ type: 'error', text: 'Error al actualizar stock' });
    }
  };

  const estadoBadge = (estado) => {
    switch (estado) {
      case 'DISPONIBLE': return 'badge-success';
      case 'PREVENTA': return 'badge-info';
      case 'AGOTADO': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🌽 Mis Productos</h1>
          <p className="text-gray-500">{productos.length} producto{productos.length !== 1 ? 's' : ''} registrado{productos.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/dashboard/publicar-cosecha" className="btn-primary">+ Nueva Cosecha</Link>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm flex justify-between ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      {productos.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">🌾</span>
          <h2 className="text-xl font-semibold mb-2">Aún no tienes productos</h2>
          <p className="text-gray-500 mb-4">Publica tu primera cosecha para que los compradores la encuentren.</p>
          <Link to="/dashboard/publicar-cosecha" className="btn-primary">Publicar Cosecha</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productos.map(p => (
            <div key={p.id} className="card-hover">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{p.nombre}</h3>
                  {p.variedad && <p className="text-sm text-gray-500">{p.variedad}</p>}
                </div>
                <span className={estadoBadge(p.estado)}>{p.estado}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div><span className="text-gray-500">Categoría:</span> {p.categoria_nombre}</div>
                <div><span className="text-gray-500">Precio:</span> Bs {p.precio}</div>
                <div><span className="text-gray-500">Stock:</span> {p.cantidad_disponible} {p.unidad_medida}</div>
                <div><span className="text-gray-500">Imágenes:</span> {p.total_imagenes || 0}</div>
              </div>
              {p.fecha_disponibilidad && (
                <p className="text-xs text-amber-600 mb-2">📅 Disponible desde: {new Date(p.fecha_disponibilidad).toLocaleDateString()}</p>
              )}
              <div className="flex gap-2 pt-2 border-t">
                <Link to={`/dashboard/editar-cosecha/${p.id}`} className="text-xs btn-secondary py-1.5 px-3">✏️ Editar</Link>
                <button onClick={() => {
                  const c = prompt('Nuevo stock:', p.cantidad_disponible);
                  if (c !== null) handleStock(p.id, c);
                }} className="text-xs btn-outline py-1.5 px-3">📦 Stock</button>
                <button onClick={() => handleDelete(p.id, p.nombre)} className="text-xs btn-danger py-1.5 px-3 ml-auto">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
