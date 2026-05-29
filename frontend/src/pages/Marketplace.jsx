import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

// Reparar iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icono personalizado para productor en el mapa
const producerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2921/2921821.png', // Icono de granja / brote
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

const SANTA_CRUZ_CENTER = [-17.7833, -63.1821];

function MapBoundsUpdater({ products }) {
  const map = useMap();
  useEffect(() => {
    if (!products || products.length === 0) return;
    const points = products
      .filter(p => p.latitud && p.longitud)
      .map(p => [p.latitud, p.longitud]);
    
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 12);
    } else {
      map.fitBounds(points, { padding: [30, 30] });
    }
  }, [products, map]);
  return null;
}

export default function Marketplace() {
  const { user } = useAuthStore();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    categoria_id: '',
    precio_min: '',
    precio_max: '',
    estado: '',
    radio: 'unlimited',
  });
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'grid', 'map'
  const [message, setMessage] = useState(null);

  // Cargar categorías
  useEffect(() => {
    api.get('/categorias')
      .then(({ data }) => setCategorias(data))
      .catch(() => {});
  }, []);

  // Fetch de productos con filtros
  const fetchProductos = useCallback(async (coords = gpsCoords) => {
    setLoading(true);
    try {
      const params = {
        search: filters.search,
        categoria_id: filters.categoria_id,
        precio_min: filters.precio_min,
        precio_max: filters.precio_max,
        estado: filters.estado,
        radio: filters.radio,
      };
      
      if (coords) {
        params.lat = coords.lat;
        params.lng = coords.lng;
      }

      const { data } = await api.get('/busqueda', { params });
      setProductos(data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al buscar productos' });
    } finally {
      setLoading(false);
    }
  }, [filters, gpsCoords]);

  useEffect(() => {
    fetchProductos();
  }, [filters, fetchProductos]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Tu navegador no soporta geolocalización' });
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGpsCoords(coords);
        setGpsLoading(false);
        setMessage({ type: 'success', text: 'Ubicación GPS activada' });
        fetchProductos(coords);
      },
      () => {
        setGpsLoading(false);
        setMessage({ type: 'error', text: 'No se pudo obtener tu ubicación' });
      },
      { enableHighAccuracy: true }
    );
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categoria_id: '',
      precio_min: '',
      precio_max: '',
      estado: '',
      radio: 'unlimited',
    });
    setGpsCoords(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Barra de Filtros y GPS */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-10">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-gray-900">🛒 Marketplace AgroDirecto</h1>
          <button
            onClick={handleUseMyLocation}
            disabled={gpsLoading}
            className={`text-xs px-3 py-1.5 rounded-full font-medium border flex items-center gap-1.5 transition-all ${
              gpsCoords
                ? 'bg-primary-100 border-primary-300 text-primary-800'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>📡</span>
            <span>{gpsLoading ? 'Detectando GPS...' : gpsCoords ? 'GPS: Activo' : 'Calcular por Cercanía'}</span>
          </button>
        </div>

        {/* Control del modo de vista */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'split' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Mixto Map/Grid
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Solo Catálogo
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Solo Mapa
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel Lateral de Filtros */}
        <aside className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto flex flex-col space-y-6">
          {message && (
            <div className={`p-3 rounded-lg text-xs flex items-center justify-between ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="font-bold">&times;</button>
            </div>
          )}

          {/* Buscador de Texto */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Buscador</label>
            <div className="relative">
              <input
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Ej: Tomate, papa, mango..."
                className="input-field pl-9"
              />
              <span className="absolute left-3.5 top-3.5 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Categoría</label>
            <select
              name="categoria_id"
              value={filters.categoria_id}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          {/* Radio de Distancia */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Distancia Máxima</label>
            <select
              name="radio"
              value={filters.radio}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="unlimited">Sin límite de distancia</option>
              <option value="25">A menos de 25 km</option>
              <option value="50">A menos de 50 km</option>
              <option value="100">A menos de 100 km</option>
              <option value="200">A menos de 200 km</option>
            </select>
            {!gpsCoords && !user?.perfil?.latitud && filters.radio !== 'unlimited' && (
              <p className="text-[10px] text-amber-600 mt-1.5">
                ⚠️ Activa "Calcular por Cercanía" para aplicar este filtro.
              </p>
            )}
          </div>

          {/* Rango de Precios */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Rango de Precio (Bs)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="precio_min"
                type="number"
                value={filters.precio_min}
                onChange={handleFilterChange}
                placeholder="Mín"
                className="input-field"
              />
              <input
                name="precio_max"
                type="number"
                value={filters.precio_max}
                onChange={handleFilterChange}
                placeholder="Máx"
                className="input-field"
              />
            </div>
          </div>

          {/* Disponibilidad / Estado */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Disponibilidad</label>
            <select
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">Todos los estados</option>
              <option value="DISPONIBLE">Disponibles ahora</option>
              <option value="PREVENTA">En preventa</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="btn-secondary w-full text-sm"
          >
            Limpiar Filtros
          </button>
        </aside>

        {/* Panel Principal - Catálogo y Mapa */}
        <main className="flex-1 flex overflow-hidden bg-gray-50">
          {/* Listado de Productos */}
          {(viewMode === 'split' || viewMode === 'grid') && (
            <div className={`overflow-y-auto p-6 ${viewMode === 'split' ? 'w-1/2 border-r border-gray-200' : 'w-full'}`}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">Se encontraron {productos.length} cosechas</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="card flex gap-4 animate-pulse">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : productos.length === 0 ? (
                <div className="card text-center py-12">
                  <span className="text-5xl block mb-4">🌾</span>
                  <h3 className="text-lg font-semibold text-gray-700">Sin coincidencias</h3>
                  <p className="text-sm text-gray-500 mt-1">Prueba a relajar los filtros de búsqueda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {productos.map(p => (
                    <div key={p.id} className="card-hover flex p-3 gap-4 items-center">
                      <img
                        src={p.imagen_principal ? `/${p.imagen_principal}` : '/uploads/productos/placeholder.jpg'}
                        alt={p.nombre}
                        className="w-24 h-24 object-cover rounded-lg border bg-gray-50 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 truncate text-base">{p.nombre}</h3>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            p.estado === 'PREVENTA' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {p.estado}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {p.variedad && <p className="text-xs text-gray-500 truncate">{p.variedad}</p>}
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">{p.categoria_nombre}</span>
                        </div>
                        
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-base font-bold text-primary-600">Bs {p.precio} / {p.unidad_medida.toLowerCase()}</span>
                          <span className="text-[10px] text-gray-400 line-through">Ref: Bs {p.precio_referencial}</span>
                        </div>

                        <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                          <p className="truncate">👩‍🌾 {p.productor_nombre} • <span className="font-semibold">{p.nombre_finca}</span></p>
                          <p className="flex items-center gap-1">
                            <span>📍 {p.localidad || p.municipio || 'Ubicación general'}</span>
                            {p.distancia_km !== null && (
                              <span className="bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                a {p.distancia_km} km
                              </span>
                            )}
                          </p>
                          {p.fecha_disponibilidad && (
                            <p className="text-amber-600 font-medium text-[11px]">
                              📅 Disponible desde: {new Date(p.fecha_disponibilidad).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="mt-2.5 pt-2 border-t flex justify-end">
                          <Link
                            to={`/marketplace/producto/${p.id}`}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            Ver Detalles
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vista del Mapa */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className={`h-full ${viewMode === 'split' ? 'w-1/2' : 'w-full'} relative`}>
              <MapContainer center={SANTA_CRUZ_CENTER} zoom={10} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {gpsCoords && (
                  <Marker position={[gpsCoords.lat, gpsCoords.lng]}>
                    <Popup>
                      <div className="text-center font-bold text-blue-600">📡 Tu ubicación actual</div>
                    </Popup>
                  </Marker>
                )}

                {productos
                  .filter(p => p.latitud && p.longitud)
                  .map(p => (
                    <Marker key={p.id} position={[p.latitud, p.longitud]} icon={producerIcon}>
                      <Popup>
                        <div className="p-1 space-y-1">
                          <h4 className="font-bold text-gray-900 border-b pb-1">{p.nombre}</h4>
                          <p className="text-xs text-gray-600 font-semibold">{p.nombre_finca}</p>
                          <p className="text-xs text-primary-700 font-bold">Bs {p.precio} / {p.unidad_medida}</p>
                          {p.distancia_km !== null && (
                            <p className="text-[10px] text-gray-500 font-bold bg-primary-50 inline-block px-1 py-0.5 rounded">
                              Distancia: {p.distancia_km} km
                            </p>
                          )}
                          <div className="pt-1.5">
                            <Link
                              to={`/marketplace/producto/${p.id}`}
                              className="text-xs text-white bg-primary-600 hover:bg-primary-700 py-1 px-2.5 rounded block text-center font-medium"
                            >
                              Ver Cosecha
                            </Link>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                <MapBoundsUpdater products={productos} />
              </MapContainer>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
