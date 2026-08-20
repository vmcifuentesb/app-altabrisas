# Especificación Funcional del Sistema Altabrisa (GitHub Spec-Kit)

**Proyecto**: Sistema de Gestión Inmobiliaria y Residencial Altabrisa  
**Ubicación**: Km 24 Calle Principal Caserío La Virgen Zona 2, Villa Canales, Guatemala  
**PBX**: +502 3737-3745  
**Metodología**: GitHub Spec-Kit ([github.com/github/spec-kit](https://github.com/github/spec-kit))

---

## 1. Módulos y Requerimientos del Sistema

### SPEC-01: Visualizador 2D de Torres Activas
- Debe permitir la navegación por las **10 Torres Activas** de la primera fase: `A1, A2, A3, A4, A5, B1, B2, C1, C2, D1, D2`.
- Cada torre contiene 4 niveles y 4 puertas por nivel (16 unidades por torre).
- Modelos disponibles:
  - **Roma**: 21 m² (1 ambiente integrado, 1 baño).
  - **Milán**: 45 m² (2 habitaciones, 1 baño, sala/comedor, cocina, lavandería).
  - **Turín**: 60 m² (3 habitaciones, 2 baños, balcón, área integrada).
- Semáforo operativo en vivo:
  - 🟢 **Disponible**
  - 🔵 **Alquilado al día**
  - 🟡 **Por vencer (< 30 días)**
  - 🔴 **En Mora**
  - ⚪ **Mantenimiento**

### SPEC-02: Motor de Contratos Semestrales (6 Meses)
- Todo contrato de inquilino tiene una duración fija y obligatoria de **6 meses**.
- Motor de alerta automático diario (`scheduler.ts`) que identifica contratos a 30 días del vencimiento.
- Generación de notificaciones en la plataforma y enlaces directos de WhatsApp para gestión de adenda de renovación semestral.

### SPEC-03: Control de Cobranza y Boletas Bancarias
- Conciliación de boletas y depósitos de Banco Industrial, Banrural, BAC y G&T Continental.
- Aprobación en 1-clic por la administración con actualización automática del estado de morosidad.
- Generación de recibos digitales oficiales con código QR de verificación de autenticidad.

### SPEC-04: Auditoría y Seguridad de Perfiles
- Los residentes pueden solicitar cambio de número telefónico, correo o NIT.
- Ningún cambio se aplica de forma automática; debe ser revisado y aprobado en el panel de auditoría.
