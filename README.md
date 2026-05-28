# 🌾 AgroDirecto Santa Cruz

**Marketplace Agropecuario Inteligente** — Conectando productores, compradores y transportistas en Santa Cruz, Bolivia.

## 📋 Requisitos

- Node.js 18+
- Docker & Docker Compose (opcional)
- npm

## 🚀 Instalación y Ejecución

### Con Docker (recomendado)

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd agrodirecto

# Levantar servicios
docker compose up --build

# Frontend: http://localhost
# Backend API: http://localhost:3001/api
```

### Desarrollo Local

```bash
# 1. Backend
cd backend
cp .env.example .env
npm install
npm run dev
# Backend en http://localhost:3001

# 2. Frontend (otra terminal)
cd frontend
npm install
npm run dev
# Frontend en http://localhost:5173
```

## 🏗️ Estructura del Proyecto

```
agrodirecto/
├── docker-compose.yml
├── .env.example
├── README.md
├── database/
│   └── init.sql              # Esquema completo SQLite
├── backend/
│   ├── package.json
│   ├── Dockerfile
│   ├── app.js                # Configuración Express
│   ├── server.js             # Punto de entrada
│   ├── database/
│   │   ├── connection.js     # Conexión SQLite (better-sqlite3)
│   │   └── init.js           # Inicialización de BD
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productorController.js
│   │   ├── documentoController.js
│   │   └── mapsController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productorRoutes.js
│   │   ├── documentoRoutes.js
│   │   └── mapsRoutes.js
│   ├── middlewares/
│   │   ├── auth.js           # JWT Authentication
│   │   ├── roles.js          # Role-based access
│   │   └── upload.js         # Multer config
│   ├── services/
│   │   ├── authService.js
│   │   └── documentoService.js
│   ├── utils/
│   │   └── validators.js
│   └── uploads/documentos/
└── frontend/
    ├── package.json
    ├── Dockerfile
    ├── nginx.conf
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── index.css
    │   ├── services/api.js       # Axios instance
    │   ├── store/useAuthStore.js # Zustand auth
    │   ├── routes/index.jsx      # React Router
    │   ├── layouts/
    │   │   ├── MainLayout.jsx
    │   │   ├── DashboardLayout.jsx
    │   │   └── Sidebar.jsx
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── GeoLocation.jsx
    │   │   ├── Documentos.jsx
    │   │   └── dashboard/
    │   │       ├── ProductorDashboard.jsx
    │   │       ├── CompradorDashboard.jsx
    │   │       ├── TransportistaDashboard.jsx
    │   │       └── AdminDashboard.jsx
    │   └── components/
    └── public/
```

## 👥 Roles del Sistema

| Rol | Descripción | Funcionalidades |
|-----|-------------|-----------------|
| **PRODUCTOR** | Vende cosechas directamente | Perfil, geolocalización, documentos, productos |
| **COMPRADOR** | Compra productos del campo | Dashboard, productos, pedidos |
| **TRANSPORTISTA** | Ofrece servicios de flete | Perfil, licencia, viajes |
| **ADMIN** | Administra la plataforma | Verificación, usuarios, documentos |

## 🔌 Endpoints API

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro multitipo |
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/auth/profile` | Perfil del usuario (auth) |

### Usuarios
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | Listar usuarios (ADMIN) |
| GET | `/api/users/:id` | Obtener usuario |
| GET | `/api/users/verificacion-pendiente` | Pendientes (ADMIN) |

### Productores
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productores` | Lista pública |
| GET | `/api/productores/:id` | Detalle |
| GET | `/api/productores/mi-perfil` | Perfil propio (PRODUCTOR) |

### Documentos
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/documentos/subir` | Subir documento (auth) |
| GET | `/api/documentos/mis-documentos` | Mis documentos |
| GET | `/api/documentos/pendientes` | Pendientes (ADMIN) |
| PUT | `/api/documentos/:id/aprobar` | Aprobar (ADMIN) |
| PUT | `/api/documentos/:id/rechazar` | Rechazar (ADMIN) |

### Mapas
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/maps/ubicacion` | Guardar ubicación (PRODUCTOR) |
| GET | `/api/maps/ubicacion` | Obtener mi ubicación |
| GET | `/api/maps/productores` | Todas las ubicaciones |

## 🔐 Credenciales Demo

> *Crea usuarios de prueba registrándote en la plataforma.*

Los roles disponibles en registro:
- **PRODUCTOR** — Agricultor, Ganadero, etc.
- **COMPRADOR** — Individual, Empresa, Restaurante
- **TRANSPORTISTA** — Camión, Camioneta, Moto

## 🧱 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS, React Router 6, Zustand, Leaflet |
| **Backend** | Node.js, Express.js, JWT, bcrypt, Multer |
| **Base de Datos** | SQLite (better-sqlite3) |
| **DevOps** | Docker, Docker Compose, Nginx |

## 🌐 Arquitectura

```
┌─────────────┐     ┌──────────────┐     ┌─────────┐
│   Browser   │────▶│  Frontend    │────▶│  API    │
│ (React SPA) │     │  (Vite/80)   │     │ (3001)  │
└─────────────┘     └──────────────┘     └────┬────┘
                                              │
                                       ┌──────▼──────┐
                                       │   SQLite    │
                                       │ agrodirecto │
                                       └─────────────┘
```

## ✅ Sprint 1 — Features Completadas

- [x] Base de datos SQLite con esquema completo (23 tablas)
- [x] Autenticación JWT con registro multitipo
- [x] Middleware de roles (PRODUCTOR, COMPRADOR, TRANSPORTISTA, ADMIN)
- [x] Registro con formularios dinámicos por rol
- [x] Dashboard por rol (4 dashboards)
- [x] Geolocalización con Leaflet (arrastrar, GPS, búsqueda manual)
- [x] Verificación documental con upload y revisión admin
- [x] Landing page profesional
- [x] UI/UX moderna con TailwindCSS
- [x] Docker Compose completo
- [x] Validaciones backend y frontend
- [x] Seguridad: Helmet, CORS, Rate Limiting

## 📸 Screenshots

> *Screenshots de la aplicación:*

| Landing | Login | Registro |
|---------|-------|----------|
| *[placeholder]* | *[placeholder]* | *[placeholder]* |

| Dashboard | Mapa | Documentos |
|-----------|------|------------|
| *[placeholder]* | *[placeholder]* | *[placeholder]* |

---

Desarrollado con ❤️ para el agro boliviano.
