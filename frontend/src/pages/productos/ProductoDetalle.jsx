import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

export default function ProductoDetalle() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    api.get(`/productos/${id}`)
      .then(({ data }) => setProducto(data))
      .catch(() => setProducto(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-80 rounded-xl" />
        <div className="skeleton h-32 rounded-xl" />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <span className="text-5xl block mb-4">🔍</span>
        <h2 className="text-xl font-semibold mb-2">Producto no encontrado</h2>
        <Link to="/marketplace" className="btn-primary mt-4 inline-block">Ver catálogo</Link>
      </div>
    );
  }

  const imagenes = producto.imagenes || [];
  const imgActual = imagenes[imgIndex];

  const estadoBadge = () => {
    switch (producto.estado) {
      case 'DISPONIBLE': return 'badge-success';
      case 'PREVENTA': return 'badge-info';
      case 'AGOTADO': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/marketplace" className="text-primary-600 hover:text-primary-700 text-sm">&larr; Volver al catálogo</Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-2">
          {imagenes.length > 0 ? (
            <div>
              <img
                src={`/${imgActual.ruta_imagen}`}
                alt={producto.nombre}
                className="w-full h-72 lg:h-96 object-cover rounded-lg"
              />
              {imagenes.length > 1 && (
                <div className="flex gap-2 mt-2 justify-center">
                  {imagenes.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`w-14 h-14 rounded-lg border-2 overflow-hidden transition-all ${
                        i === imgIndex ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={`/${img.ruta_imagen}`} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400">
              <span className="text-4xl">📷</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{producto.nombre}</h1>
              {producto.variedad && <p className="text-gray-500">{producto.variedad}</p>}
            </div>
            <span className={estadoBadge()}>{producto.estado}</span>
          </div>

          <p className="text-3xl font-bold text-primary-600">Bs {producto.precio}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500">Stock</p>
              <p className="font-semibold">{producto.cantidad_disponible} {producto.unidad_medida}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500">Categoría</p>
              <p className="font-semibold">{producto.categoria_nombre}</p>
            </div>
          </div>

          {producto.descripcion && (
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-1">Descripción</h3>
              <p className="text-gray-600 text-sm">{producto.descripcion}</p>
            </div>
          )}

          {producto.fecha_disponibilidad && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                📅 Preventa — Disponible desde: {new Date(producto.fecha_disponibilidad).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Productor</h3>
            <p className="font-medium">{producto.productor_nombre}</p>
            <p className="text-sm text-gray-500">{producto.nombre_finca}</p>
            {producto.localidad && <p className="text-sm text-gray-500">📍 {producto.localidad}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
