# 🧪 Guía de Pruebas Manual — AgroDirecto Santa Cruz

## Requisitos previos

- Node.js 18+ instalado
- Docker (opcional, para Opción A)

---

## 1. Iniciar el sistema

### Opción A — Docker
```bash
cd C:\Users\Usuario\Desktop\Tareas\spm
docker compose up --build
```

### Opción B — Desarrollo local (dos terminales)
```bash
# Terminal 1
cd C:\Users\Usuario\Desktop\Tareas\spm\backend
npm install
npm run dev

# Terminal 2
cd C:\Users\Usuario\Desktop\Tareas\spm\frontend
npm install
npm run dev
```

Acceder a: **http://localhost:5173**

---

## 2. Registro de usuarios

Probar registro de **3 usuarios distintos**:

### Productor
| Campo | Valor |
|-------|-------|
| Tipo | PRODUCTOR |
| Nombre | Juan Pérez |
| Correo | juan@test.com |
| Celular | 71234567 |
| Contraseña | Test1234 |
| Tipo Productor | Agricultor |
| Nombre Finca | Finca El Paraíso |

### Comprador
| Campo | Valor |
|-------|-------|
| Tipo | COMPRADOR |
| Nombre | María López |
| Correo | maria@test.com |
| Celular | 71234568 |
| Contraseña | Test1234 |
| Tipo Comprador | Empresa |

### Transportista
| Campo | Valor |
|-------|-------|
| Tipo | TRANSPORTISTA |
| Nombre | Pedro Gómez |
| Correo | pedro@test.com |
| Celular | 71234569 |
| Contraseña | Test1234 |
| Tipo Transporte | Camión |
| Capacidad Carga | 5000 |

---

## 3. Inicio de sesión

1. Ir a **http://localhost:5173/login**
2. Ingresar: `juan@test.com` / `Test1234`
3. Click **"Iniciar Sesión"**
4. Verificar que redirige al **Dashboard Productor**

---

## 4. Dashboard por rol

### Productor (`juan@test.com`)
- [ ] Ver tarjeta con nombre de finca: "Finca El Paraíso"
- [ ] Ver estado de verificación: "Registrado"
- [ ] Ver enlaces a "Mi Ubicación" y "Documentos"

### Comprador (`maria@test.com`)
- [ ] Cerrar sesión, iniciar con maria@test.com
- [ ] Ver dashboard con información del perfil
- [ ] Ver sección "Explora Productos" (próximamente)

### Transportista (`pedro@test.com`)
- [ ] Cerrar sesión, iniciar con pedro@test.com
- [ ] Ver tarjeta con tipo de transporte y capacidad
- [ ] Ver enlace a "Subir Licencia"

---

## 5. Geolocalización (Productor)

1. Iniciar sesión como **juan@test.com**
2. Ir a **"Mi Ubicación"** en el sidebar
3. Ver mapa centrado en **Santa Cruz, Bolivia**
4. Click **"Usar mi ubicación"** (si permites GPS)
5. O **arrastrar el marcador** a una ubicación
6. Escribir localidad: `Warnes`
7. Click **"Guardar Ubicación"**
8. Ver mensaje de éxito

---

## 6. Documentos (Productor)

1. Ir a **"Documentos"** en el sidebar
2. Ver sección **"Subir Nuevo Documento"**
3. Seleccionar tipo: `Cédula de Identidad`
4. Click en área de archivo
5. Seleccionar un archivo **JPG, PNG o PDF** (menor a 5MB)
6. Click **"Subir Documento"**
7. Ver documento en la lista con estado **"PENDIENTE"**

---

## 7. Panel Admin

1. Necesitas un usuario ADMIN (solo hay uno por DB).
   - Para crear admin, ejecuta en terminal:
     ```bash
     cd backend && node -e "const { getConnection } = require('./database/connection'); const db = getConnection(); const bcrypt = require('bcryptjs'); db.prepare('INSERT INTO usuarios (rol_id, nombre_completo, correo, password, celular) VALUES (?, ?, ?, ?, ?)').run(4, 'Admin', 'admin@test.com', bcrypt.hashSync('Admin1234', 10), '70000000'); console.log('Admin creado');"
     ```
2. Iniciar sesión: `admin@test.com` / `Admin1234`
3. Ver panel con **2 secciones**:
   - **Usuarios Pendientes de Verificación**
   - **Documentos Pendientes de Revisión**
4. Ver documentos pendientes del productor
5. Click **"Aprobar"** en un documento
6. Verificar que el estado cambia
7. Click **"Rechazar"** en otro (escribe motivo)
8. Verificar que aparece el comentario

---

## 8. Verificar flujo completo

1. Volver a iniciar sesión como **juan@test.com**
2. Ir a **Dashboard** — verificar que estado cambió según acción admin
3. Ir a **Documentos** — verificar estado de cada documento

---

## 9. Validaciones

Probar estos casos:

| Acción | Resultado esperado |
|--------|-------------------|
| Registrar con contraseña `hola` | Error: "mínimo 8 caracteres" |
| Registrar con contraseña `12345678` | Error: "debe tener una mayúscula" |
| Registrar con contraseña `Holahola` | Error: "debe tener un número" |
| Login con credenciales incorrectas | Error: "Credenciales inválidas" |
| Subir archivo > 5MB | Error: "excede el tamaño máximo" |
| Subir archivo .exe | Error: "Solo se permiten JPG, PNG y PDF" |
| Acceder a /dashboard/admin como productor | Redirige a dashboard |

---

## 10. Probar con el mapa abierto

- Hacer zoom en el mapa
- Click en cualquier punto para colocar marcador
- Arrastrar marcador a otra posición
- Ver coordenadas actualizadas en tiempo real

---

## Resumen de enlaces

| Página | URL |
|--------|-----|
| Landing | http://localhost:5173/ |
| Login | http://localhost:5173/login |
| Registro | http://localhost:5173/register |
| Dashboard | http://localhost:5173/dashboard |
| API Health | http://localhost:3001/api/health |
| API Productores | http://localhost:3001/api/productores |
