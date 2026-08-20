import {
  TowerSummary,
  Apartment,
  DashboardStats,
  OwnerProfile,
  TenantProfile,
  TenantContract,
  NotificationItem,
  ApartmentModel,
  Payment,
  ProfileChangeRequest,
} from '../types';

export const mockModels: ApartmentModel[] = [
  {
    id: 'mod-roma',
    name: 'Roma',
    areaM2: 21.0,
    rooms: 1,
    bathrooms: 1,
    hasKitchenette: true,
    hasLaundry: false,
    description: 'Apartamento de 1 dormitorio con cocineta integrada y baño completo.',
    floorPlanImage: '/assets/images/tab-1-roma.jpg',
  },
  {
    id: 'mod-milan',
    name: 'Milán',
    areaM2: 45.0,
    rooms: 2,
    bathrooms: 1,
    hasKitchenette: false,
    hasLaundry: true,
    description: 'Apartamento de 2 habitaciones, sala-comedor, cocina independiente y baño completo.',
    floorPlanImage: '/assets/images/galeria-4.jpg',
  },
  {
    id: 'mod-turin',
    name: 'Turín',
    areaM2: 60.0,
    rooms: 3,
    bathrooms: 1,
    hasKitchenette: false,
    hasLaundry: true,
    description: 'Apartamento espacioso de 3 habitaciones, sala, comedor, cocina y área de lavandería.',
    floorPlanImage: '/assets/images/slide-proyecto.jpg',
  },
];

export const mockOwnerProfiles: OwnerProfile[] = [
  {
    id: 'own-1',
    userId: 'usr-owner-1',
    fullName: 'Lic. Carlos Roberto Mendoza Ruiz',
    dpi: '2548 78912 0101',
    nit: '4587962-1',
    phonePrimary: '+502 5487-1234',
    phoneSecondary: '+502 2365-8899',
    email: 'carlos.mendoza@gmail.com',
    address: 'Zona 10, Ciudad de Guatemala',
    emergencyContact: 'Ana Sofía Mendoza (Hermana) - 5544-3322',
    purchaseMode: 'HIPOTECA_BANCO',
    bankName: 'Banco Industrial (BI)',
    loanTermYears: 20,
    monthlyBankQuotaGtq: 2850.0,
    estimatedBalanceGtq: 380000.0,
    ownerContracts: [{ id: 'oc-1', apartment: { tower: { id: 'tow-A1', code: 'A1', sector: 'A' }, unitNumber: '101' } }],
  },
  {
    id: 'own-2',
    userId: 'usr-owner-2',
    fullName: 'Dra. Marta Elena Gómez Morales',
    dpi: '1890 45612 0101',
    nit: '3256987-4',
    phonePrimary: '+502 4789-6541',
    email: 'marta.gomez@yahoo.com',
    address: 'Carretera a El Salvador, Km 14.5',
    purchaseMode: 'CONTADO',
    ownerContracts: [{ id: 'oc-2', apartment: { tower: { id: 'tow-B1', code: 'B1', sector: 'B' }, unitNumber: '201' } }],
  },
  {
    id: 'own-3',
    userId: 'usr-owner-3',
    fullName: 'Ing. Fernando Jose Castillo',
    dpi: '1984 56214 0101',
    nit: '1245789-0',
    phonePrimary: '+502 5123-9874',
    email: 'fernando.castillo@inversion.gt',
    purchaseMode: 'HIPOTECA_FHA',
    bankName: 'Banrural',
    monthlyBankQuotaGtq: 2600.0,
    ownerContracts: [{ id: 'oc-3', apartment: { tower: { id: 'tow-C1', code: 'C1', sector: 'C' }, unitNumber: '302' } }],
  },
];

export const mockTenantProfiles: TenantProfile[] = [
  {
    id: 'ten-1',
    userId: 'usr-tenant-1',
    fullName: 'Juan José Pérez Castillo',
    dpi: '3001 89452 0101',
    nit: '8956231-9',
    phonePrimary: '+502 5874-9632',
    email: 'juan.perez@inquilino.gt',
    emergencyContact: 'María Castillo (Madre) - 5698-7412',
    workplace: 'Corporación Multi Inversiones (CMI)',
    tenantContracts: [
      {
        id: 'tc-1',
        apartmentId: 'apt-A1-101',
        tenantId: 'ten-1',
        paymentDay: 5,
        startDate: '2026-03-01',
        endDate: '2026-09-01',
        monthlyRentGtq: 2400.0,
        depositGtq: 2400.0,
        status: 'POR_VENCER_30D',
      },
    ],
  },
  {
    id: 'ten-2',
    userId: 'usr-tenant-2',
    fullName: 'Lucía Andrea Álvarez Sandoval',
    dpi: '2645 12789 0101',
    nit: '7412589-3',
    phonePrimary: '+502 4215-8963',
    email: 'lucia.alvarez@inquilino.gt',
    emergencyContact: 'David Álvarez (Esposo) - 4512-3698',
    workplace: 'Hospital Roosevelt / Residente Médica',
    tenantContracts: [
      {
        id: 'tc-2',
        apartmentId: 'apt-B2-204',
        tenantId: 'ten-2',
        paymentDay: 5,
        startDate: '2026-04-01',
        endDate: '2026-10-01',
        monthlyRentGtq: 2600.0,
        depositGtq: 2600.0,
        status: 'ACTIVO',
      },
    ],
  },
  {
    id: 'ten-3',
    userId: 'usr-tenant-3',
    fullName: 'Mario Roberto Estrada Lima',
    dpi: '2145 98765 0101',
    nit: '6547891-2',
    phonePrimary: '+502 5987-1234',
    email: 'mario.estrada@gmail.com',
    workplace: 'Banco G&T Continental',
    tenantContracts: [
      {
        id: 'tc-3',
        apartmentId: 'apt-C1-301',
        tenantId: 'ten-3',
        paymentDay: 5,
        startDate: '2026-05-01',
        endDate: '2026-11-01',
        monthlyRentGtq: 2400.0,
        depositGtq: 2400.0,
        status: 'ACTIVO',
      },
    ],
  },
];

// Generar las 10 Torres
const towerCodes = ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'];

export const mockTowers: TowerSummary[] = towerCodes.map((code) => ({
  id: `tow-${code}`,
  code,
  sector: code.charAt(0),
  totalLevels: 4,
  description: `Torre ${code} - Sector ${code.charAt(0)}, Residenciales Altabrisa`,
  stats: {
    total: 16,
    available: code === 'A1' ? 11 : code === 'B2' ? 12 : 13,
    rented: code === 'A1' ? 4 : code === 'B2' ? 3 : 3,
    mora: code === 'B2' || code === 'A1' ? 1 : 0,
    maintenance: code === 'A2' ? 1 : 0,
    reserved: 0,
    occupancyRate: code === 'A1' ? 31 : code === 'B2' ? 25 : 20,
  },
}));

// Generar los 176 Apartamentos
export const mockApartments: Apartment[] = [];
towerCodes.forEach((towerCode) => {
  for (let level = 1; level <= 4; level++) {
    for (let door = 1; door <= 4; door++) {
      const unitNumber = `${level}0${door}`;
      const model = mockModels[(level + door) % 3];
      let status: any = 'DISPONIBLE';
      let tenant: any = null;
      let owner: any = null;
      let activeContract: any = null;

      if (towerCode === 'A1' && unitNumber === '101') {
        status = 'ALQUILADO';
        tenant = mockTenantProfiles[0];
        owner = mockOwnerProfiles[0];
        activeContract = {
          id: 'tc-1',
          apartmentId: `apt-${towerCode}-${unitNumber}`,
          tenantId: 'ten-1',
          paymentDay: 5,
          startDate: '2026-03-01T00:00:00Z',
          endDate: '2026-09-01T00:00:00Z',
          monthlyRentGtq: 2400.0,
          depositGtq: 2400.0,
          status: 'POR_VENCER_30D',
        };
      } else if (towerCode === 'B2' && unitNumber === '204') {
        status = 'MORA';
        tenant = mockTenantProfiles[1];
        owner = mockOwnerProfiles[1];
        activeContract = {
          id: 'tc-2',
          apartmentId: `apt-${towerCode}-${unitNumber}`,
          tenantId: 'ten-2',
          paymentDay: 5,
          startDate: '2026-02-01T00:00:00Z',
          endDate: '2026-08-01T00:00:00Z',
          monthlyRentGtq: 2600.0,
          depositGtq: 2600.0,
          status: 'ACTIVO',
        };
      } else if (towerCode === 'A2' && unitNumber === '302') {
        status = 'MANTENIMIENTO';
      } else if ((level + door) % 5 === 0) {
        status = 'ALQUILADO';
        tenant = mockTenantProfiles[2];
        owner = mockOwnerProfiles[2];
        activeContract = {
          id: `tc-${towerCode}-${unitNumber}`,
          apartmentId: `apt-${towerCode}-${unitNumber}`,
          tenantId: 'ten-3',
          paymentDay: 5,
          startDate: '2026-05-01T00:00:00Z',
          endDate: '2026-11-01T00:00:00Z',
          monthlyRentGtq: 2400.0,
          depositGtq: 2400.0,
          status: 'ACTIVO',
        };
      }

      mockApartments.push({
        id: `apt-${towerCode}-${unitNumber}`,
        towerId: `tow-${towerCode}`,
        towerCode,
        tower: { id: `tow-${towerCode}`, code: towerCode, sector: towerCode.charAt(0) },
        model,
        unitNumber,
        level,
        parkingSpot: `P-${towerCode}-${unitNumber}`,
        status,
        powerMeterNumber: `EEGSA-${towerCode}-${unitNumber}-7481`,
        waterMeterNumber: `AGUA-ALT-${towerCode}-${unitNumber}`,
        internetProvider: 'Claro Fibra Óptica 100Mbps',
        maintenanceFeeGtq: 350.0,
        tenant,
        owner,
        activeContract,
        paymentHistory: [
          {
            id: `pay-${towerCode}-${unitNumber}-1`,
            apartmentId: `apt-${towerCode}-${unitNumber}`,
            userId: 'usr-tenant-1',
            concept: 'RENTA',
            amountGtq: 2400.0,
            dueDate: '2026-08-05T00:00:00Z',
            paidAt: '2026-08-04T12:00:00Z',
            status: 'APROBADO',
            voucherReference: 'BI-8894125',
            bankOrigin: 'Banco Industrial (BI)',
          },
        ],
      });
    }
  }
});

// Lista completa de pagos para PaymentsPage
export const mockPaymentsList: Payment[] = [
  {
    id: 'pay-1',
    userId: 'usr-tenant-1',
    apartmentId: 'apt-A1-101',
    apartment: mockApartments.find((a) => a.id === 'apt-A1-101') || mockApartments[0],
    user: { id: 'usr-tenant-1', email: 'juan.perez@inquilino.gt', role: 'TENANT', tenantProfile: mockTenantProfiles[0] },
    concept: 'RENTA',
    amountGtq: 2400.0,
    dueDate: '2026-08-05T00:00:00Z',
    paidAt: '2026-08-04T12:00:00Z',
    status: 'APROBADO',
    voucherReference: 'TRANS-884125',
    bankOrigin: 'Banco Industrial (BI)',
    verifiedAt: '2026-08-04T14:00:00Z',
    verifiedBy: 'SuperAdmin Altabrisa',
  },
  {
    id: 'pay-2',
    userId: 'usr-tenant-2',
    apartmentId: 'apt-B2-204',
    apartment: mockApartments.find((a) => a.id === 'apt-B2-204') || mockApartments[1],
    user: { id: 'usr-tenant-2', email: 'lucia.alvarez@inquilino.gt', role: 'TENANT', tenantProfile: mockTenantProfiles[1] },
    concept: 'RENTA',
    amountGtq: 2600.0,
    dueDate: '2026-08-05T00:00:00Z',
    status: 'EN_REVISION',
    voucherReference: 'BANRURAL-44589',
    bankOrigin: 'Banrural',
    notes: 'Boleta de depósito en agencia bancaria.',
  },
  {
    id: 'pay-3',
    userId: 'usr-tenant-3',
    apartmentId: 'apt-C1-301',
    apartment: mockApartments.find((a) => a.id === 'apt-C1-301') || mockApartments[2],
    user: { id: 'usr-tenant-3', email: 'mario.estrada@gmail.com', role: 'TENANT', tenantProfile: mockTenantProfiles[2] },
    concept: 'RENTA',
    amountGtq: 2400.0,
    dueDate: '2026-08-05T00:00:00Z',
    paidAt: '2026-08-03T10:00:00Z',
    status: 'APROBADO',
    voucherReference: 'BAC-774129',
    bankOrigin: 'BAC Credomatic',
    verifiedAt: '2026-08-03T11:30:00Z',
    verifiedBy: 'SuperAdmin Altabrisa',
  },
  {
    id: 'pay-4',
    userId: 'usr-owner-1',
    apartmentId: 'apt-A1-101',
    apartment: mockApartments.find((a) => a.id === 'apt-A1-101') || mockApartments[0],
    user: { id: 'usr-owner-1', email: 'carlos.mendoza@gmail.com', role: 'OWNER', ownerProfile: mockOwnerProfiles[0] },
    concept: 'MANTENIMIENTO',
    amountGtq: 350.0,
    dueDate: '2026-08-10T00:00:00Z',
    paidAt: '2026-08-08T16:00:00Z',
    status: 'APROBADO',
    voucherReference: 'BI-995123',
    bankOrigin: 'Banco Industrial (BI)',
    verifiedAt: '2026-08-08T17:00:00Z',
    verifiedBy: 'SuperAdmin Altabrisa',
  },
  {
    id: 'pay-5',
    userId: 'usr-tenant-2',
    apartmentId: 'apt-B2-204',
    apartment: mockApartments.find((a) => a.id === 'apt-B2-204') || mockApartments[1],
    user: { id: 'usr-tenant-2', email: 'lucia.alvarez@inquilino.gt', role: 'TENANT', tenantProfile: mockTenantProfiles[1] },
    concept: 'MANTENIMIENTO',
    amountGtq: 350.0,
    dueDate: '2026-08-10T00:00:00Z',
    status: 'PENDIENTE',
  },
  {
    id: 'pay-6',
    userId: 'usr-tenant-1',
    apartmentId: 'apt-A1-101',
    apartment: mockApartments.find((a) => a.id === 'apt-A1-101') || mockApartments[0],
    user: { id: 'usr-tenant-1', email: 'juan.perez@inquilino.gt', role: 'TENANT', tenantProfile: mockTenantProfiles[0] },
    concept: 'AGUA',
    amountGtq: 150.0,
    dueDate: '2026-08-15T00:00:00Z',
    paidAt: '2026-08-14T09:00:00Z',
    status: 'APROBADO',
    voucherReference: 'BI-112458',
    bankOrigin: 'Banco Industrial (BI)',
  },
];

export const mockDashboardStats: DashboardStats = {
  towers: {
    total: 10,
    activeModules: 10,
  },
  apartments: {
    total: 176,
    available: 130,
    rented: 44,
    mora: 1,
    maintenance: 1,
    occupancyRate: 26,
  },
  contracts: {
    activeTotal: 44,
    expiringIn30Days: 2,
  },
  finances: {
    totalProjectedRentGtq: 105600.0,
    totalCollectedMonthGtq: 98750.0,
    totalPendingMonthGtq: 6850.0,
  },
  pendingTasks: {
    vouchersToReview: 1,
    profileChangeRequests: 1,
  },
  recentPayments: mockPaymentsList.slice(0, 4),
};

export const mockContracts: TenantContract[] = [
  {
    id: 'tc-1',
    apartmentId: 'apt-A1-101',
    apartment: mockApartments.find((a) => a.id === 'apt-A1-101') || mockApartments[0],
    tenantId: 'ten-1',
    tenant: mockTenantProfiles[0],
    paymentDay: 5,
    startDate: '2026-03-01T00:00:00Z',
    endDate: '2026-09-01T00:00:00Z',
    monthlyRentGtq: 2400.0,
    depositGtq: 2400.0,
    status: 'POR_VENCER_30D',
  },
  {
    id: 'tc-2',
    apartmentId: 'apt-B2-204',
    apartment: mockApartments.find((a) => a.id === 'apt-B2-204') || mockApartments[1],
    tenantId: 'ten-2',
    tenant: mockTenantProfiles[1],
    paymentDay: 5,
    startDate: '2026-02-01T00:00:00Z',
    endDate: '2026-08-01T00:00:00Z',
    monthlyRentGtq: 2600.0,
    depositGtq: 2600.0,
    status: 'ACTIVO',
  },
  {
    id: 'tc-3',
    apartmentId: 'apt-C1-301',
    apartment: mockApartments.find((a) => a.id === 'apt-C1-301') || mockApartments[2],
    tenantId: 'ten-3',
    tenant: mockTenantProfiles[2],
    paymentDay: 5,
    startDate: '2026-05-01T00:00:00Z',
    endDate: '2026-11-01T00:00:00Z',
    monthlyRentGtq: 2400.0,
    depositGtq: 2400.0,
    status: 'ACTIVO',
  },
];

export const mockProfileChangeRequests: ProfileChangeRequest[] = [
  {
    id: 'req-1',
    userId: 'usr-tenant-1',
    fieldName: 'phonePrimary',
    oldValue: '+502 5874-9632',
    newValue: '+502 4112-9900',
    reason: 'Nueva línea corporativa de residencia',
    status: 'PENDIENTE',
    createdAt: new Date().toISOString(),
    user: {
      email: 'juan.perez@inquilino.gt',
      tenantProfile: mockTenantProfiles[0],
    },
  },
  {
    id: 'req-2',
    userId: 'usr-owner-1',
    fieldName: 'nit',
    oldValue: '4587962-1',
    newValue: '9984125-3',
    reason: 'Actualización ante SAT para emisión de facturas',
    status: 'PENDIENTE',
    createdAt: new Date().toISOString(),
    user: {
      email: 'carlos.mendoza@gmail.com',
      ownerProfile: mockOwnerProfiles[0],
    },
  },
  {
    id: 'req-3',
    userId: 'usr-tenant-2',
    fieldName: 'emergencyContact',
    oldValue: 'David Álvarez - 4512-3698',
    newValue: 'David Álvarez (Esposo) - 3322-1100',
    reason: 'Nuevo número de contacto',
    status: 'APROBADO',
    resolvedAt: '2026-08-15T10:00:00Z',
    createdAt: '2026-08-14T08:00:00Z',
    user: {
      email: 'lucia.alvarez@inquilino.gt',
      tenantProfile: mockTenantProfiles[1],
    },
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'usr-admin-1',
    title: '⚠️ Contrato por vencer (< 30 Días)',
    message: 'El contrato de la unidad A1-101 (Juan Pérez) vence en 12 días.',
    type: 'WARNING',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'usr-admin-1',
    title: '📥 Nueva Boleta de Pago Recibida',
    message: 'Se ha cargado una boleta de Banrural por Q2,600 para la unidad B2-204.',
    type: 'ALERT',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];
