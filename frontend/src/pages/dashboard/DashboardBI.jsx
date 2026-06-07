import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function BarChart({ data, labelKey, valueKey, color = 'bg-primary-500' }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 truncate mr-2">{d[labelKey] || 'Sin dato'}</span>
            <span className="font-semibold shrink-0">{typeof d[valueKey] === 'number' ? d[valueKey].toFixed(2) : d[valueKey]}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${(d[valueKey] / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardBI() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/kpis')
      .then(({ data: kpis }) => setData(kpis))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="card text-center py-12 text-red-600">Error al cargar datos de BI</div>;
  }

  const { resumen, pedidos_por_estado, ventas_por_provincia, ventas_por_categoria, produccion_geografica, ventas_mensuales } = data;
  const mapCenter = produccion_geografica.length > 0
    ? [produccion_geografica[0].latitud, produccion_geografica[0].longitud]
    : [-17.7833, -63.1821];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard BI — Sponsor</h1>
          <p className="text-gray-500">KPIs de ventas y geografía de producción (compatible con Power BI / Looker)</p>
        </div>
        <span className="text-xs text-gray-400">Actualizado: {new Date(data.generado_en).toLocaleString()}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <p className="text-primary-100 text-sm">Ingresos Totales</p>
          <p className="text-2xl font-bold mt-1">Bs {resumen.ingresos_totales.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Total Pedidos</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{resumen.total_pedidos}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Ticket Promedio</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">Bs {resumen.ticket_promedio.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Transportistas Activos</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{resumen.transportistas_activos}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Ventas por Provincia (Bs)</h2>
          {ventas_por_provincia.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Sin datos de ventas aún</p>
          ) : (
            <BarChart data={ventas_por_provincia} labelKey="provincia" valueKey="monto" color="bg-blue-500" />
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Ventas por Categoría (Bs)</h2>
          {ventas_por_categoria.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Sin datos de ventas aún</p>
          ) : (
            <BarChart data={ventas_por_categoria} labelKey="categoria" valueKey="monto" color="bg-amber-500" />
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Pedidos por Estado</h2>
          {pedidos_por_estado.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Sin pedidos registrados</p>
          ) : (
            <div className="space-y-2">
              {pedidos_por_estado.map((e) => (
                <div key={e.estado} className="flex justify-between text-sm">
                  <span className="text-gray-600">{e.estado}</span>
                  <span className="font-bold">{e.cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Ventas Mensuales</h2>
          {ventas_mensuales.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Sin historial mensual</p>
          ) : (
            <BarChart data={ventas_mensuales} labelKey="mes" valueKey="monto" color="bg-green-500" />
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">🗺️ Geografía de la Producción</h2>
        {produccion_geografica.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No hay productores geolocalizados</p>
        ) : (
          <div className="h-80 rounded-xl overflow-hidden border">
            <MapContainer center={mapCenter} zoom={9} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {produccion_geografica.map((p, i) => (
                <Marker key={i} position={[p.latitud, p.longitud]} icon={markerIcon}>
                  <Popup>
                    <strong>{p.nombre_finca}</strong><br />
                    {p.provincia}, {p.municipio}<br />
                    Productos activos: {p.productos_activos}<br />
                    Ventas: {p.total_ventas}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      <div className="card bg-gray-50 text-sm text-gray-600">
        <p><strong>Integración BI:</strong> Los datos provienen del endpoint <code className="bg-white px-1 rounded">GET /api/analytics/kpis</code> y pueden conectarse a Power BI o Looker mediante conector REST/OData. Exportar a CSV desde las tablas <code className="bg-white px-1 rounded">pedidos</code>, <code className="bg-white px-1 rounded">pedido_detalles</code> y <code className="bg-white px-1 rounded">productores</code>.</p>
      </div>
    </div>
  );
}
