export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'OWNER' | 'TENANT';

export type ApartmentStatus = 'DISPONIBLE' | 'ALQUILADO' | 'MORA' | 'MANTENIMIENTO' | 'RESERVADO';

export type PurchaseMode = 'CONTADO' | 'HIPOTECA_FHA' | 'HIPOTECA_BANCO' | 'PRESTAMO_DIRECTO';

export type ContractStatus = 'ACTIVO' | 'POR_VENCER_30D' | 'RENOVADO' | 'FINALIZADO' | 'CANCELADO';

export type PaymentConcept = 'RENTA' | 'MANTENIMIENTO' | 'AGUA' | 'LUZ' | 'INTERNET' | 'OTRO';

export type PaymentStatus = 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';

export type RequestStatus = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  ownerProfile?: OwnerProfile | null;
  tenantProfile?: TenantProfile | null;
}

export interface TowerStats {
  total: number;
  available: number;
  rented: number;
  mora: number;
  maintenance: number;
  reserved: number;
  occupancyRate: number;
}

export interface TowerSummary {
  id: string;
  code: string; // A1..A5, B1..B2, C1..C2, D1..D2
  sector: string;
  totalLevels: number;
  description?: string;
  stats: TowerStats;
}

export interface ApartmentModel {
  id: string;
  name: string; // Roma, Milán, Turín
  areaM2: number;
  rooms: number;
  bathrooms: number;
  hasKitchenette: boolean;
  hasLaundry: boolean;
  description?: string;
  floorPlanImage?: string;
}

export interface OwnerProfile {
  id: string;
  userId: string;
  fullName: string;
  dpi: string;
  nit?: string;
  phonePrimary: string;
  phoneSecondary?: string;
  email: string;
  address?: string;
  emergencyContact?: string;
  purchaseMode: PurchaseMode;
  bankName?: string;
  loanTermYears?: number;
  monthlyBankQuotaGtq?: number;
  estimatedBalanceGtq?: number;
  ownerContracts?: any[];
}

export interface TenantProfile {
  id: string;
  userId: string;
  fullName: string;
  dpi: string;
  nit?: string;
  phonePrimary: string;
  phoneSecondary?: string;
  email: string;
  emergencyContact?: string;
  workplace?: string;
  tenantContracts?: any[];
}

export interface TenantContract {
  id: string;
  apartmentId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRentGtq: number;
  depositGtq: number;
  paymentDay: number;
  status: ContractStatus;
  documentUrl?: string;
  tenant?: TenantProfile;
  apartment?: Apartment;
}

export interface Apartment {
  id: string;
  towerId: string;
  tower?: {
    id: string;
    code: string;
    sector: string;
  };
  towerCode?: string;
  sector?: string;
  unitNumber: string;
  level: number;
  status: ApartmentStatus;
  parkingSpot?: string;
  powerMeterNumber?: string;
  waterMeterNumber?: string;
  internetProvider?: string;
  maintenanceFeeGtq: number;
  model: ApartmentModel;
  owner?: OwnerProfile | null;
  ownerContract?: any | null;
  tenant?: TenantProfile | null;
  activeContract?: TenantContract | null;
  contractHistory?: TenantContract[];
  paymentHistory?: Payment[];
  rentalHistories?: any[];
  recentPayments?: Payment[];
}

export interface Payment {
  id: string;
  contractId?: string;
  apartmentId: string;
  userId: string;
  concept: PaymentConcept;
  amountGtq: number;
  dueDate: string;
  paidAt?: string;
  bankOrigin?: string;
  voucherReference?: string;
  voucherUrl?: string;
  status: PaymentStatus;
  notes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  apartment?: Apartment;
  user?: {
    id: string;
    email: string;
    role: Role;
    tenantProfile?: TenantProfile;
    ownerProfile?: OwnerProfile;
  };
}

export interface ProfileChangeRequest {
  id: string;
  userId: string;
  fieldName: string;
  oldValue?: string;
  newValue: string;
  reason?: string;
  status: RequestStatus;
  adminNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  user?: {
    email: string;
    ownerProfile?: OwnerProfile;
    tenantProfile?: TenantProfile;
  };
}

export interface DashboardStats {
  towers: {
    total: number;
    activeModules: number;
  };
  apartments: {
    total: number;
    available: number;
    rented: number;
    mora: number;
    maintenance: number;
    occupancyRate: number;
  };
  contracts: {
    expiringIn30Days: number;
    activeTotal: number;
  };
  finances: {
    totalCollectedMonthGtq: number;
    totalPendingMonthGtq: number;
    totalProjectedRentGtq: number;
  };
  pendingTasks: {
    vouchersToReview: number;
    profileChangeRequests: number;
  };
  recentPayments: Payment[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
  isRead: boolean;
  link?: string;
  createdAt: string;
}
