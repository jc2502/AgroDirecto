import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SANTA_CRUZ = [-17.7833, -63.1833];

function DraggableMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  if (!position) return null;

  return (
    <Marker
      draggable
      position={position}
      eventHandlers={{
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          setPosition([lat, lng]);
        },
      }}
    />
  );
}

function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function GeoLocation() {
  const [position, setPosition] = useState(null);
  const [localidad, setLocalidad] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [center, setCenter] = useState(SANTA_CRUZ);

  useEffect(() => {
    api.get('/maps/ubicacion')
      .then(({ data }) => {
        if (data.latitud && data.longitud) {
          setPosition([data.latitud, data.longitud]);
          setLocalidad(data.localidad || '');
          setCenter([data.latitud, data.longitud]);
        }
      })
      .catch(() => {});
  }, []);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocalización no soportada en este navegador' });
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setCenter([latitude, longitude]);
        setLoading(false);
        setMessage({ type: 'success', text: 'Ubicación detectada correctamente' });
      },
      () => {
        setLoading(false);
        setMessage({ type: 'error', text: 'No se pudo obtener la ubicación' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSave = async () => {
    if (!position) {
      setMessage({ type: 'error', text: 'Debe seleccionar una ubicación en el mapa' });
      return;
    }
    setSaving(true);
    try {
      await api.post('/maps/ubicacion', {
        latitud: position[0],
        longitud: position[1],
        localidad,
      });
      setMessage({ type: 'success', text: 'Ubicación guardada correctamente' });
    } catch {
      setMessage({ type: 'error', text: 'Error al guardar la ubicación' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📍 Mi Ubicación</h1>
        <p className="text-gray-500">Selecciona la ubicación de tu finca en el mapa</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm flex items-center justify-between ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-2">
            <div className="h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
              <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker position={position} setPosition={setPosition} />
                <MapCenterUpdater center={center} />
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3">Controles</h3>
            <button
              onClick={handleUseMyLocation}
              disabled={loading}
              className="btn-primary w-full mb-3 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <span>📡</span>
              )}
              <span>{loading ? 'Detectando...' : 'Usar mi ubicación'}</span>
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
              <input
                className="input-field"
                placeholder="Ej: Warnes, Montero..."
                value={localidad}
                onChange={(e) => setLocalidad(e.target.value)}
              />
            </div>

            {position && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                <p>Lat: {position[0].toFixed(6)}</p>
                <p>Lng: {position[1].toFixed(6)}</p>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !position}
              className="btn-primary w-full mt-4"
            >
              {saving ? 'Guardando...' : '💾 Guardar Ubicación'}
            </button>
          </div>

          <div className="card bg-primary-50 border-primary-200">
            <h4 className="text-sm font-semibold text-primary-800 mb-1">💡 Tips</h4>
            <ul className="text-xs text-primary-700 space-y-1">
              <li>• Arrastra el marcador para ajustar</li>
              <li>• Haz clic en el mapa para colocar</li>
              <li>• Usa "mi ubicación" para GPS</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
