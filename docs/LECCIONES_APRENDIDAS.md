# Lecciones Aprendidas — AgroDirecto (Cierre de Proyecto)

**Sprint 3 — Transacciones, Logística y Cierre**  
**Período:** 18 de Mayo – 7 de Junio 2026

---

## 1. Resumen ejecutivo

El proyecto AgroDirecto completó tres sprints que cubren registro multi-rol, marketplace con preventas, geolocalización, transacciones con carrito, pagos QR simulados, logística transportista y dashboard de BI para el Sponsor.

---

## 2. Lecciones técnicas

### 2.1 Diseño anticipado del esquema de BD

**Lección:** Definir tablas de Sprint 3 (`carritos`, `pedidos`, `pagos_qr`, `hojas_ruta`) desde el inicio aceleró la implementación.

**Recomendación:** Mantener migraciones incrementales documentadas y separar esquema base de datos semilla.

### 2.2 Convivencia de flujos legacy y nuevos

**Lección:** El flujo de `compras` directas (Sprint 2) coexistió con `pedidos` + carrito (Sprint 3). Unificar en una sola entidad de venta simplificaría reportes.

**Recomendación:** En una fase posterior, migrar compras legacy al modelo de pedidos.

### 2.3 Pagos simulados vs. producción

**Lección:** Simular QR con referencia JSON + API externa de imagen QR permitió demostrar el flujo sin integrar pasarela real (Stripe, QR bancario).

**Recomendación:** Planificar integración con billetera móvil boliviana en fase de producción.

### 2.4 Notificaciones in-app como “push”

**Lección:** Las notificaciones en tabla `notificaciones` cumplieron el requisito de aviso de pago; no se implementó Web Push nativo por alcance.

**Recomendación:** Agregar Service Workers y Firebase Cloud Messaging si se requiere push en móvil.

### 2.5 BI embebido vs. herramientas externas

**Lección:** Un dashboard React con endpoint `/api/analytics/kpis` satisface al Sponsor en demo; Power BI/Looker requieren solo conectar el API REST.

**Recomendación:** Documentar esquema de datos y publicar endpoint OData si el Sponsor usa Power BI corporativo.

---

## 3. Lecciones de gestión (PMI)

### 3.1 Planificación por sprints

| Sprint | Enfoque | Resultado |
|--------|---------|-----------|
| 1 | Registro, roles, documentos | Base sólida de usuarios |
| 2 | Marketplace, preventas, geo | Valor de negocio visible |
| 3 | Transacciones, logística, BI | Ciclo de venta completo |

**Lección:** Entregar valor incremental evitó el “big bang” al final.

### 3.2 Comunicación entre roles Scrum y PMI

**Lección:** Entregables de gestión (EVM, manual, lecciones) deben planificarse en el mismo backlog, no como tarea final apresurada.

### 3.3 Alcance del transportista

**Lección:** El módulo de rutas provincia→ciudad requirió coordinar estados de pedido, postulaciones y paradas. La complejidad superó la estimación inicial.

**Recomendación:** Desglosar en historias: listar rutas, aceptar, paradas, firma digital.

---

## 4. Qué funcionó bien

- Arquitectura **routes → controllers → services** consistente y fácil de extender.
- Docker Compose para despliegue reproducible en cualquier máquina del equipo.
- Seeds de usuarios y productos que permiten demo inmediata al Sponsor.
- TailwindCSS + componentes reutilizables (`card`, `btn-primary`, badges de estado).

---

## 5. Qué mejorar en futuras iteraciones

- Tests automatizados (Jest/Supertest backend, Vitest frontend).
- Autenticación OAuth / recuperación de contraseña.
- Chat comprador–productor en tiempo real.
- Integración GPS en vivo para transportistas.
- Firma digital y calificaciones post-entrega (tablas ya definidas, sin UI).

---

## 6. Conclusión

AgroDirecto demostró viabilidad técnica y de negocio para un marketplace agropecuario regional. El equipo aprendió a balancear deuda técnica (compras legacy) con entregables de valor (carrito, pagos, rutas, BI). El proyecto está listo para piloto controlado con usuarios reales en Santa Cruz.
