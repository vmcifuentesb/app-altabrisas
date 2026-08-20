# Criterios de Aceptación (GitHub Spec-Kit)

**Proyecto**: Altabrisa Real Estate Management Platform  
**Estándar**: Gherkin / BDD Acceptance Criteria

---

## AC-01: Visualizador de Torres 2D
- **Dado** que un usuario ingresa al panel principal o módulo de torres,
- **Cuando** selecciona cualquiera de las 10 torres activas (`A1..D2`),
- **Entonces** debe visualizar la elevación de 4 niveles con las 16 puertas correspondientes, mostrando el semáforo de color de estado, modelo de apartamento y nombre del inquilino si está ocupado.

## AC-02: Alertas Preventivas de 30 Días para Renovación Semestral
- **Dado** que un contrato de arrendamiento está a 30 días o menos de alcanzar su fecha de fin (6 meses),
- **Cuando** el scheduler diario ejecuta el escaneo o se consulta el listado de contratos,
- **Entonces** el contrato debe mostrar la etiqueta destacada `POR_VENCER_30D` (Ámbar) con el conteo regresivo de días y el botón para contactar por WhatsApp al inquilino.

## AC-03: Conciliación de Boletas Bancarias
- **Dado** que un residente sube una boleta de depósito o transferencia,
- **Cuando** el administrador hace clic en `[Aprobar]`,
- **Entonces** el estado cambia a `APROBADO`, se genera el recibo digital con código QR y se remueve automáticamente el estado de mora del inmueble.

## AC-04: Diseño Visual SaaS Premium (Inspiración Renzo)
- **Dado** que el usuario visualiza cualquier pantalla del sistema,
- **Cuando** navega por la interfaz,
- **Entonces** debe observar una interfaz limpia, fondo claro (`#f8fafc` / `#ffffff`), espaciado amplio, tarjetas bien delimitadas, widget de balance degradado y feed de actividades con miniaturas.
