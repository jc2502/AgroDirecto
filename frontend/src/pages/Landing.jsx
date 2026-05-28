import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const features = [
  { icon: '🌱', title: 'Productores Locales', desc: 'Conecta directamente con productores de Santa Cruz y toda Bolivia.' },
  { icon: '📍', title: 'Geolocalización', desc: 'Encuentra productos cerca de ti con nuestro mapa interactivo.' },
  { icon: '🔒', title: 'Verificación Segura', desc: 'Productores verificados con documentos y calificaciones reales.' },
  { icon: '🚚', title: 'Logística Integrada', desc: 'Transportistas confiables para llevar tus productos a donde necesites.' },
  { icon: '📊', title: 'Precios Justos', desc: 'Precios de referencia del mercado para compras transparentes.' },
  { icon: '🌿', title: 'Fresco y Directo', desc: 'Del campo a tu mesa, sin intermediarios y al mejor precio.' },
];

const stats = [
  { number: '150+', label: 'Productores' },
  { number: '500+', label: 'Productos' },
  { number: '50+', label: 'Municipios' },
  { number: '98%', label: 'Satisfacción' },
];

export default function Landing() {
  const { token } = useAuthStore();

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-green-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              El Campo y la Ciudad
              <span className="block text-primary-300">Más Conectados que Nunca</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              AgroDirecto Santa Cruz es el marketplace inteligente que conecta productores,
              compradores y transportistas en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {token ? (
                <Link to="/dashboard" className="bg-white text-primary-800 hover:bg-primary-50 font-bold py-3 px-8 rounded-xl text-lg transition-all">
                  Ir al Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="bg-white text-primary-800 hover:bg-primary-50 font-bold py-3 px-8 rounded-xl text-lg transition-all">
                    Comenzar Ahora
                  </Link>
                  <Link to="/login" className="border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-xl text-lg transition-all">
                    Iniciar Sesión
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-primary-600">{stat.number}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por Qué AgroDirecto?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-hover">
                <span className="text-3xl block mb-3">{f.icon}</span>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Eres Productor, Comprador o Transportista?</h2>
          <p className="text-primary-200 mb-8 text-lg">
            Regístrate gratis y únete a la red agropecuaria más grande de Santa Cruz.
          </p>
          <Link to="/register" className="bg-white text-primary-800 hover:bg-primary-50 font-bold py-3 px-8 rounded-xl text-lg transition-all inline-block">
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>
    </div>
  );
}
