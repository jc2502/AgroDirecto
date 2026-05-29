# 🌾 AgroDirecto Santa Cruz - Sprint 2

AgroDirecto es un **Marketplace Agropecuario Inteligente** diseñado para conectar directamente a productores locales, compradores y transportistas de Santa Cruz y toda Bolivia, con el objetivo de reducir costos logísticos, optimizar la cadena de valor alimentaria y asegurar la venta anticipada de cosechas.

---

## 🚀 Nuevas Características (Sprint 2)

### 🌽 US05 — Publicación de Cosecha
- **CRUD Completo**: Creación, edición, eliminación y listado de cosechas.
- **Unidades de Medida**: Soporte para Quintal (46kg), Arroba (11.5kg), Kilogramo, Caja, Bolsa y Unidad con equivalencia visual en kg.
- **Compresión de Imágenes**: Optimización automática mediante Multer y Sharp a formato JPG de alta calidad (1-5 imágenes, máx. 10MB).
- **Carrusel de Fotos**: Visor responsivo de imágenes y vistas previas en el frontend.

### 📅 US06 — Disponibilidad Futura (Preventa)
- **Validación de Fechas**: En el backend y frontend se restringe que la fecha futura de preventa sea mayor a 3 días y menor a 90 días a partir de hoy.
- **Cuenta Regresiva**: Contador en tiempo real (días, horas, minutos y segundos) visible en la card de preventa.
- **Reservas Anticipadas**: Permite reservar stock sin cobro inmediato, descontando del inventario disponible y comprometiéndolo.
- **Notificaciones**: Avisos internos a compradores y productores cuando se reserva, se confirma la disponibilidad o se cancela una preventa.
- **Flujo Productor**: El productor puede **Confirmar Disponibilidad** (pasando la preventa a `DISPONIBLE`) o **Cancelar Preventa** (pasando el producto a `AGOTADO` y anulando las reservas).

### 📍 US07 — Buscador por Cercanía
- **Geolocalización Real**: Cálculo de distancias en km mediante la **Fórmula Haversine** utilizando las coordenadas del productor y del comprador.
- **Filtros Avanzados**: Búsqueda por texto, categoría, rango de precios, disponibilidad (Disponible / Preventa) y radio de distancia (25km, 50km, 100km, 200km, Sin límite).
- **Mapa Leaflet**: Visualización de productores y cosechas en un mapa interactivo con popups con enlaces directos a las cosechas.
- **Precio Sugerido**: Comparación visual del precio del productor con el precio de referencia del mercado (Bs).

---

## 🛠️ Stack Tecnológico

- **Frontend**: React (Vite), TailwindCSS, React Router DOM, React Leaflet (Mapas), Zustand.
- **Backend**: Node.js, Express.js, JWT, Multer (Subida de archivos), Sharp (Procesamiento de imágenes).
- **Base de Datos**: SQLite nativo (`node:sqlite` DatabaseSync) con WAL y claves foráneas activadas.
- **DevOps**: Docker, Docker Compose.

---

## 💾 Migraciones y Datos Semilla (Seeds)

Al iniciar la aplicación por primera vez, el sistema ejecuta automáticamente:
1. **Migraciones**:
   - Agrega `latitud` y `longitud` a la tabla `compradores` para el cálculo geográfico.
   - Agrega `estado` (`'PENDIENTE'`, `'CONFIRMADA'`, `'CANCELADA'`) a `reservas_preventa`.
2. **Seeds (Datos Semilla)**: Crea los siguientes usuarios de prueba (contraseña común: `Test1234`):
   - 👩‍🌾 **Productor**: `juan@test.com` (Finca "El Paraíso" en Warnes, Santa Cruz. Ubicación georreferenciada).
   - 🛒 **Comprador**: `maria@test.com` (Ubicada en el centro de Santa Cruz).
   - 🚚 **Transportista**: `pedro@test.com`.
   - 👑 **Administrador**: `admin@test.com` (Contraseña: `Admin1234`).
   - Carga cosechas disponibles (Tomate Perita, Papa Imilla) y cosechas en preventa (Mangos Dulces) con reservas previas.

---

## 📦 Instrucciones de Ejecución

### Opción A: Con Docker Compose (Recomendado)
Desde la raíz del proyecto ejecuta:
```bash
docker compose up --build
```
- Frontend: **http://localhost** o **http://localhost:5173** (si estás mapeando puertos alternos)
- Backend API: **http://localhost:3001**

### Opción B: Ejecución Local en Desarrollo
Necesitas tener Node.js 18+ o superior instalado.

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 🔌 Principales Endpoints API

### Búsqueda y Catálogo
- `GET /api/busqueda` - Realiza búsquedas advanced por categoría, rango de precios, radio de distancia y estado. Calcula la distancia a cada productor con Haversine.
- `GET /api/categorias` - Retorna el catálogo de categorías disponibles.
- `GET /api/productos` - Lista cosechas activas generales.

### Preventa y Reservas
- `POST /api/preventas/reservar` - Crea una reserva de preventa (Comprador).
- `POST /api/preventas/confirmar` - Confirma disponibilidad de la preventa (Productor).
- `POST /api/preventas/cancelar` - Cancela la preventa y anula reservas (Productor).
- `GET /api/preventas/mis-reservas` - Listado de reservas hechas por el Comprador.
- `GET /api/preventas/productor/reservas` - Listado de reservas recibidas por el Productor.
