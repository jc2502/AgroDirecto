import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return <span className="font-semibold text-green-600">¡Cosecha lista para recolección!</span>;
  }

  return (
    <div className="flex gap-2 text-center text-xs font-bold mt-2">
      <div className="bg-amber-100 text-amber-800 rounded px-2.5 py-1.5 border border-amber-200">
        <span className="block text-lg font-extrabold">{timeLeft.days}</span> Días
      </div>
      <div className="bg-amber-100 text-amber-800 rounded px-2.5 py-1.5 border border-amber-200">
        <span className="block text-lg font-extrabold">{timeLeft.hours}</span> Hrs
      </div>
      <div className="bg-amber-100 text-amber-800 rounded px-2.5 py-1.5 border border-amber-200">
        <span className="block text-lg font-extrabold">{timeLeft.minutes}</span> Min
      </div>
      <div className="bg-amber-100 text-amber-800 rounded px-2.5 py-1.5 border border-amber-200">
        <span className="block text-lg font-extrabold">{timeLeft.seconds}</span> Seg
      </div>
    </div>
  );
}

export default function ProductoDetalle() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  // Estados de reserva
  const [reservaCantidad, setReservaCantidad] = useState('');
  const [reservaLoading, setReservaLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchProducto = () => {
    api.get(`/productos/${id}`)
      .then(({ data }) => setProducto(data))
      .catch(() => setProducto(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducto();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 p-6">
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

  const handleReservar = async (e) => {
    e.preventDefault();
    if (!reservaCantidad || parseFloat(reservaCantidad) <= 0) {
      setErrorMsg('Ingrese una cantidad válida mayor a 0');
      return;
    }
    setReservaLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post('/preventas/reservar', {
        producto_id: producto.id,
        cantidad: parseFloat(reservaCantidad)
      });
      setSuccessMsg(`Reserva de ${reservaCantidad} ${producto.unidad_medida} completada exitosamente.`);
      setReservaCantidad('');
      // Recargar datos del producto para actualizar stock
      fetchProducto();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error al procesar la reserva');
    } finally {
      setReservaLoading(false);
    }
  };

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

  const esComprador = user?.rol_nombre === 'COMPRADOR';
  const totalEstimado = reservaCantidad ? (parseFloat(reservaCantidad) * producto.precio).toFixed(2) : '0.00';

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <Link to="/marketplace" className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
        &larr; Volver al catálogo público
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagen del Producto */}
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

        {/* Detalles del Producto */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{producto.nombre}</h1>
              {producto.variedad && <p className="text-gray-500">{producto.variedad}</p>}
            </div>
            <span className={estadoBadge()}>{producto.estado}</span>
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary-600">Bs {producto.precio}</span>
            <span className="text-xs text-gray-400">Precio Sugerido Mercado: Bs {producto.precio_referencial || (producto.precio * 1.2).toFixed(1)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-gray-500">Stock Disponible</p>
              <p className="font-semibold text-gray-900">{producto.cantidad_disponible} {producto.unidad_medida}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-gray-500">Categoría</p>
              <p className="font-semibold text-gray-900">{producto.categoria_nombre}</p>
            </div>
          </div>

          {producto.descripcion && (
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-1">Descripción</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{producto.descripcion}</p>
            </div>
          )}

          {producto.fecha_disponibilidad && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                <span>📅</span>
                <span>Cosecha en Preventa — Disponibilidad Estimada:</span>
              </p>
              <p className="text-xs text-amber-700 font-medium">
                Fecha de recolección: {new Date(producto.fecha_disponibilidad).toLocaleDateString()}
              </p>
              <Countdown targetDate={producto.fecha_disponibilidad} />
            </div>
          )}

          {/* Formulario de Reserva para Preventa */}
          {producto.estado === 'PREVENTA' && (
            <div className="border-t pt-4">
              {esComprador ? (
                <form onSubmit={handleReservar} className="bg-green-50/50 p-4 border border-green-200/60 rounded-xl space-y-3">
                  <h3 className="font-bold text-sm text-green-950 flex items-center gap-1.5">
                    <span>🌾</span>
                    <span>Reservar esta cosecha anticipadamente</span>
                  </h3>
                  
                  {errorMsg && <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{errorMsg}</p>}
                  {successMsg && <p className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100">{successMsg}</p>}

                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Cantidad a Reservar</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={producto.cantidad_disponible}
                        value={reservaCantidad}
                        onChange={(e) => setReservaCantidad(e.target.value)}
                        placeholder="Ej: 5"
                        className="input-field py-2 text-sm"
                      />
                    </div>
                    <div className="bg-white p-2 rounded-lg border text-right">
                      <p className="text-[10px] text-gray-500 font-medium">Total Estimado</p>
                      <p className="text-sm font-bold text-gray-900">Bs {totalEstimado}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-700 bg-amber-50/60 px-2 py-1.5 rounded border border-amber-100/50">
                    💡 <strong>Nota:</strong> Las reservas no generan cobro inmediato. Comprometen el inventario y se notifica al productor de tu compromiso.
                  </p>

                  <button
                    type="submit"
                    disabled={reservaLoading || !reservaCantidad || parseFloat(reservaCantidad) <= 0}
                    className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-1.5"
                  >
                    {reservaLoading ? 'Procesando Reserva...' : 'Reservar Cosecha'}
                  </button>
                </form>
              ) : (
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl text-center">
                  <p className="text-xs text-gray-500">
                    {user
                      ? '⚠️ Solo compradores pueden reservar cosechas.'
                      : '🔑 Inicia sesión como Comprador para poder reservar.'}
                  </p>
                  {!user && (
                    <Link to="/login" className="btn-primary text-xs mt-2 inline-block">
                      Iniciar Sesión
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Información del Productor */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Productor</h3>
            <p className="font-medium text-gray-900">{producto.productor_nombre}</p>
            <p className="text-sm text-gray-500">🌾 {producto.nombre_finca}</p>
            {producto.localidad && <p className="text-sm text-gray-500">📍 {producto.localidad}</p>}
            {user && (
              <p className="text-xs text-gray-400 mt-1">📞 Celular de contacto: {producto.celular}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
