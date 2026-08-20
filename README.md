# 🏢 Altabrisa - Sistema de Gestión Inmobiliaria & Residencial

**Ubicación del Proyecto**: Km 24 Calle Principal Caserío La Virgen Zona 2, Villa Canales, Guatemala  
**PBX**: +502 3737-3745  
**Fase Operativa**: 10 Torres Activas (`A1, A2, A3, A4, A5, B1, B2, C1, C2, D1, D2`)  
**Metodología y Arquitectura**: GitHub Spec-Kit + Arquitectura 2 (Node.js/Express + Prisma + PostgreSQL + React + Vite + Tailwind CSS)

---

## 📁 Estructura del Proyecto (`app-gestor-clientes-altabrisa`)

```text
app-gestor-clientes-altabrisa/
├── backend/                  # API REST Express + TypeScript + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma     # 12 entidades relacionales
│   │   └── seed.ts           # Seeder con 176 aptos, dueños, contratos e inquilinos
│   └── src/
│       ├── controllers/      # Lógica de torres, aptos, clientes, contratos, pagos, auditoría
│       ├── cron/             # Scheduler diario (alertas 30d para contratos de 6m)
│       └── server.ts         # Servidor Express
├── frontend/                 # Aplicación React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Componentes SaaS UI (Dashboard, Torres 2D, Modales, Pagos)
│   │   ├── pages/            # Vistas (Dashboard, Directorio, Contratos, Auditoría, Portales)
│   │   └── context/          # AuthContext con JWT y RBAC
│   └── public/               # Assets de marca, logotipos y fotos de Altabrisa
├── specs/                    # Especificaciones bajo estándar GitHub Spec-Kit
│   ├── 01-especificacion-funcional.md
│   ├── 02-criterios-aceptacion.md
│   └── 03-matriz-tareas-speckit.md
├── assets/                   # Recursos gráficos originales
├── docker-compose.yml        # Base de datos PostgreSQL
├── PLAN_DE_PROYECTO_ALTABRISA.md
└── DEFINICION_PROYECTO_ALTABRISA.md
```

---

## 🚀 Puesta en Marcha Rápida

### 1. Iniciar Base de Datos PostgreSQL
```bash
docker-compose up -d
```

### 2. Iniciar Backend API
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
# Servidor corriendo en http://localhost:4000
```

### 3. Iniciar Frontend Web
```bash
cd frontend
npm install
npm run dev
# Aplicación web corriendo en http://localhost:5173
```

---

## 🔐 Credenciales de Acceso para Demostración

**Contraseña general para todos los usuarios**: `Altabrisa2026!`

| Rol | Correo Electrónico | Descripción de Acceso |
| :--- | :--- | :--- |
| **SuperAdmin (Dueña)** | `duena@altabrisa.gt` | Control total del complejo, finanzas, contratos y auditoría |
| **Gestor / Empleado** | `vendedor@altabrisa.gt` | Gestión de ventas, registro de clientes y contratos |
| **Propietario (Dueño)** | `carlos.mendoza@gmail.com` | Portal de propietario, control de cuotas y apartamentos |
| **Inquilino Residente** | `juan.perez@inquilino.gt` | Portal de inquilino, subida de boletas bancarias y contratos de 6 meses |
