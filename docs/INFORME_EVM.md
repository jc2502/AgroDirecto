# Informe EVM Final — AgroDirecto Santa Cruz

**Earned Value Management (Gestión de Valor Ganado)**  
**Fecha de cierre:** 7 de Junio 2026  
**Duración total del proyecto:** 3 Sprints (~9 semanas)

---

## 1. Parámetros del proyecto

| Parámetro | Valor |
|-----------|-------|
| **BAC** (Presupuesto total planificado) | 120 SP (Story Points) |
| **Duración planificada** | 63 días (7 Mar – 7 Jun 2026) |
| **Equipo** | 5 personas (1 PO, 1 Scrum Master, 3 Developers) |
| **Metodología** | Scrum + entregables PMI por sprint |

---

## 2. Desglose por sprint

| Sprint | Período | Alcance planificado (SP) | Alcance entregado (SP) | % Completado |
|--------|---------|--------------------------|------------------------|--------------|
| Sprint 1 — Fundación | 7 Mar – 17 Abr | 35 | 34 | 97% |
| Sprint 2 — Marketplace | 18 Abr – 17 May | 40 | 38 | 95% |
| Sprint 3 — Transacciones y Cierre | 18 May – 7 Jun | 45 | 42 | 93% |
| **Total** | | **120** | **114** | **95%** |

---

## 3. Métricas EVM al cierre

### 3.1 Valores base

- **PV** (Valor Planificado acumulado al día 63): **120 SP**
- **EV** (Valor Ganado — trabajo completado): **114 SP**
- **AC** (Costo Real — esfuerzo invertido): **118 SP** *(equivalente en horas-persona)*

### 3.2 Índices de desempeño

| Índice | Fórmula | Resultado | Interpretación |
|--------|---------|-----------|----------------|
| **CPI** (Cost Performance) | EV / AC = 114/118 | **0.97** | Ligero sobrecosto (~3%) |
| **SPI** (Schedule Performance) | EV / PV = 114/120 | **0.95** | Retraso leve (~5%) |
| **EAC** (Estimación al completar) | BAC / CPI = 120/0.97 | **~124 SP** | +4 SP sobre plan |
| **VAC** (Variación al completar) | BAC − EAC | **~−4 SP** | Desviación aceptable |

### 3.3 Variaciones

- **CV** (Cost Variance) = EV − AC = **−4 SP** → el equipo consumió algo más de esfuerzo del planificado para el valor entregado.
- **SV** (Schedule Variance) = EV − PV = **−6 SP** → entrega final ~5% por debajo del plan en puntos de historia.

---

## 4. Análisis de desempeño del equipo

### 4.1 Fortalezas

1. **Velocidad estable:** Promedio de ~38 SP/sprint en Sprints 2 y 3.
2. **Calidad de entrega:** Funcionalidades demo-ready con datos semilla y Docker.
3. **Adaptabilidad:** Reutilización del esquema BD Sprint 3 aceleró desarrollo en ~20%.
4. **Colaboración:** Separación clara frontend/backend permitió trabajo paralelo.

### 4.2 Áreas de mejora

1. **Subestimación Sprint 3:** Módulo transportista + BI consumió 6 SP extra no planificados inicialmente.
2. **Deuda técnica:** Coexistencia `compras` vs `pedidos` generará refactor futuro.
3. **Testing:** Pruebas manuales únicamente; cobertura automatizada = 0%.
4. **Documentación PMI:** Manual y EVM entregados al cierre; idealmente incremental por sprint.

---

## 5. Burndown acumulado (resumen)

```
SP restantes
120 |█
100 |██
 80 |████  ← Sprint 1 cierre
 60 |██████
 40 |████████  ← Sprint 2 cierre
 20 |██████████
  0 |████████████  ← Sprint 3 cierre (6 SP carry-over menores)
    Mar    Abr    May    Jun
```

**Carry-over (6 SP):** firma digital en entrega, calificaciones post-pedido, Web Push nativo — registrados en backlog futuro.

---

## 6. Entregables Sprint 3 — verificación

| Entregable | Estado | Evidencia |
|------------|--------|-----------|
| Carrito + flujo Pendiente/Pagado/Enviado | ✅ | `/carrito`, `/api/pedidos`, `/api/carrito` |
| QR dinámico + notificación pago | ✅ | `/pago/:id`, `/api/pagos` |
| Módulo transportista rutas | ✅ | `/rutas-transportista`, `/api/transportista` |
| Dashboard BI KPIs | ✅ | `/dashboard/bi`, `/api/analytics/kpis` |
| Manual de Usuario | ✅ | `docs/MANUAL_USUARIO.md` |
| Lecciones Aprendidas | ✅ | `docs/LECCIONES_APRENDIDAS.md` |
| Informe EVM | ✅ | Este documento |

---

## 7. Recomendaciones al Sponsor

1. **Aprobar piloto** con 10 productores y 5 compradores en Warnes–Santa Cruz.
2. **Financiar fase 4** para pasarela de pago real y app móvil (~30 SP estimados).
3. **Conectar Power BI** al endpoint REST de analytics para reportes ejecutivos mensuales.

---

## 8. Firma de cierre

| Rol | Conclusión |
|-----|------------|
| Product Owner | Alcance Sprint 3 cumplido al 93%; aceptable para cierre de fase MVP. |
| Scrum Master | SPI 0.95 dentro de tolerancia; retrospectiva documentada en lecciones aprendidas. |
| Equipo Dev | CPI 0.97; eficiencia razonable para proyecto académico/piloto. |

**Estado del proyecto:** ✅ **CERRADO — MVP ENTREGADO**
