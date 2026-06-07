# Manual de Usuario — AgroDirecto Santa Cruz

**Versión:** Sprint 3 (Mayo–Junio 2026)  
**Plataforma:** Marketplace agropecuario web

---

## 1. Introducción

AgroDirecto conecta **productores**, **compradores** y **transportistas** en Santa Cruz y Bolivia. Este manual describe el uso de las funciones del Sprint 3: carrito de compras, pagos QR simulados, logística con transportista y panel de BI para administradores.

---

## 2. Acceso al sistema

| Rol | URL | Credenciales de prueba |
|-----|-----|------------------------|
| Comprador | http://localhost:5173 | maria@test.com / Test1234 |
| Productor | http://localhost:5173 | juan@test.com / Test1234 |
| Transportista | http://localhost:5173 | pedro@test.com / Test1234 |
| Admin (Sponsor) | http://localhost:5173 | admin@test.com / Admin1234 |

1. Abra la aplicación en el navegador.
2. Haga clic en **Iniciar Sesión**.
3. Ingrese correo y contraseña.
4. Será redirigido al dashboard según su rol.

---

## 3. Comprador — Carrito y pedidos

### 3.1 Agregar productos al carrito

1. Vaya a **Marketplace**.
2. Seleccione un producto **DISPONIBLE**.
3. Indique la cantidad.
4. Pulse **Agregar al Carrito** (o **Comprar** para compra directa sin carrito).

### 3.2 Confirmar pedido

1. Vaya a **Carrito** en el menú lateral.
2. Revise ítems, cantidades y total.
3. Pulse **Confirmar Pedido y Pagar**.

### 3.3 Pagar con QR (simulado)

1. En la pantalla de pago, pulse **Generar QR de Pago**.
2. Escanee el código o anote la **referencia**.
3. Pulse **Simular Pago Exitoso** para completar el pago de prueba.
4. Recibirá una **notificación push** (campana) confirmando el pago.

**Estados del pedido:**

| Estado | Significado |
|--------|-------------|
| Pendiente | Pedido creado, falta pagar |
| Pendiente de Pago | QR generado |
| Pagado | Pago confirmado, listo para despacho |
| Enviado | Transportista en ruta |
| Completado | Entrega confirmada |

### 3.4 Seguimiento

- **Mis Pedidos**: historial completo con acciones (pagar, confirmar entrega).
- **Notificaciones** (campana): avisos de pago, envío y entrega.

---

## 4. Productor — Ventas y despacho

1. **Mis Ventas**: compras directas y reservas de preventa.
2. Tras el pago de un pedido con carrito, recibirá notificación para **preparar productos**.
3. El transportista recoge en su finca según la hoja de ruta.

---

## 5. Transportista — Rutas de entrega

1. Vaya a **Rutas de Entrega** en el menú.
2. Pestaña **Disponibles**: pedidos pagados sin transportista (provincia → ciudad).
3. Revise paradas de recolección y pulse **Aceptar Ruta**.
4. Pestaña **Mis Rutas**: rutas asignadas en curso.
5. Al llegar al destino, pulse **Registrar Entrega**.
6. El comprador confirma la recepción en **Mis Pedidos**.

---

## 6. Administrador / Sponsor — Dashboard BI

1. Inicie sesión como **admin@test.com**.
2. Vaya a **Dashboard BI** en el menú.
3. Consulte:
   - Ingresos totales y ticket promedio
   - Ventas por provincia y categoría
   - Mapa de geografía de producción
   - Pedidos por estado

Los datos provienen de `GET /api/analytics/kpis` y pueden exportarse a **Power BI** o **Looker** mediante conector REST.

---

## 7. Notificaciones

- Icono de campana en la barra superior.
- Tipos: reservas, pagos exitosos, rutas disponibles, envíos y entregas.
- Marque como leídas desde el panel desplegable.

---

## 8. Soporte

Para incidencias técnicas, contacte al equipo de desarrollo del proyecto AgroDirecto o consulte el archivo `TESTING_GUIDE.md` para pruebas paso a paso.
