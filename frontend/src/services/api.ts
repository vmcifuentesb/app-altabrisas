import axios from 'axios';
import {
  mockTowers,
  mockApartments,
  mockDashboardStats,
  mockContracts,
  mockOwnerProfiles,
  mockTenantProfiles,
  mockNotifications,
} from './mockData';

const api = axios.create({
  baseURL: '/api',
});

// Request interceptor para adjuntar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('altabrisa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock handler para cuando la API no está disponible en hosting estático
const handleMockFallback = (url: string = '', method: string = 'get', data?: any) => {
  const cleanUrl = url.replace('/api', '').split('?')[0];

  // 1. Auth Login
  if (cleanUrl === '/auth/login' || cleanUrl.endsWith('/login')) {
    const email = data?.email || 'duena@altabrisa.gt';
    let role = 'SUPER_ADMIN';
    let name = 'Dueña / Administradora';
    let ownerProfile = undefined;
    let tenantProfile = undefined;

    if (email.includes('vendedor')) {
      role = 'ADMIN';
      name = 'Asesor Inmobiliario';
    } else if (email.includes('carlos') || email.includes('owner')) {
      role = 'OWNER';
      name = 'Lic. Carlos Mendoza';
      ownerProfile = mockOwnerProfiles[0];
    } else if (email.includes('juan') || email.includes('inquilino')) {
      role = 'TENANT';
      name = 'Juan José Pérez';
      tenantProfile = mockTenantProfiles[0];
    }

    const mockUser = {
      id: 'mock-user-1',
      email,
      name,
      role,
      ownerProfile,
      tenantProfile,
    };

    return {
      data: {
        success: true,
        token: 'mock-jwt-token-altabrisa-2026',
        user: mockUser,
      },
    };
  }

  // 2. Auth Me
  if (cleanUrl === '/auth/me' || cleanUrl.endsWith('/me')) {
    const storedUser = localStorage.getItem('altabrisa_user');
    const user = storedUser ? JSON.parse(storedUser) : {
      id: 'mock-user-1',
      email: 'duena@altabrisa.gt',
      name: 'Dueña / Administradora',
      role: 'SUPER_ADMIN',
    };
    return { data: { success: true, user } };
  }

  // 3. Notifications
  if (cleanUrl.includes('/notifications')) {
    return { data: { success: true, notifications: mockNotifications } };
  }

  // 4. Dashboard Stats
  if (cleanUrl.includes('/stats/dashboard')) {
    return { data: { success: true, stats: mockDashboardStats } };
  }

  // 5. Towers List
  if (cleanUrl === '/towers') {
    return { data: { success: true, towers: mockTowers } };
  }

  // 6. Tower Details
  if (cleanUrl.startsWith('/towers/')) {
    const code = cleanUrl.split('/')[2] || 'A1';
    const towerApts = mockApartments.filter((a) => a.towerCode === code);
    const levels: any = { 1: [], 2: [], 3: [], 4: [] };
    towerApts.forEach((apt) => {
      if (!levels[apt.level]) levels[apt.level] = [];
      levels[apt.level].push(apt);
    });

    return {
      data: {
        success: true,
        tower: {
          id: `tow-${code}`,
          code,
          sector: code.charAt(0),
          totalLevels: 4,
          levels,
        },
      },
    };
  }

  // 7. Apartments Directory & Details
  if (cleanUrl === '/apartamentos') {
    return { data: { success: true, apartments: mockApartments } };
  }
  if (cleanUrl.startsWith('/apartamentos/')) {
    const id = cleanUrl.split('/')[2];
    const apt = mockApartments.find((a) => a.id === id) || mockApartments[0];
    return { data: { success: true, apartment: apt } };
  }

  // 8. Clients
  if (cleanUrl.includes('/clients/owners')) {
    return { data: { success: true, owners: mockOwnerProfiles } };
  }
  if (cleanUrl.includes('/clients/tenants')) {
    return { data: { success: true, tenants: mockTenantProfiles } };
  }

  // 9. Contracts
  if (cleanUrl.includes('/contracts')) {
    return { data: { success: true, contracts: mockContracts } };
  }

  // 10. Payments & Receipt
  if (cleanUrl.includes('/receipt')) {
    return {
      data: {
        success: true,
        receipt: {
          receiptNumber: 'REC-2026-08-00124',
          payerName: 'Lic. Carlos Roberto Mendoza Ruiz',
          payerNit: '4587962-1',
          towerCode: 'A1',
          unitNumber: '101',
          concept: 'Cuota de Renta Mensual (Agosto 2026)',
          amountGtq: 2400.0,
          paidAt: new Date().toISOString(),
          voucherReference: 'BI-TRANS-884125',
          bankOrigin: 'Banco Industrial (BI)',
          verifiedBy: 'SuperAdmin Altabrisa',
          qrCodeBase64:
            'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ALTABRISA-VALID-REC-00124',
        },
      },
    };
  }
  if (cleanUrl.includes('/payments')) {
    return { data: { success: true, payments: mockDashboardStats.recentPayments } };
  }

  // 11. Requests
  if (cleanUrl.includes('/requests')) {
    return {
      data: {
        success: true,
        requests: [
          {
            id: 'req-1',
            userId: 'usr-tenant-1',
            user: { email: 'juan.perez@inquilino.gt', tenantProfile: { fullName: 'Juan José Pérez' } },
            fieldName: 'phonePrimary',
            oldValue: '+502 5874-9632',
            newValue: '+502 4112-9900',
            reason: 'Nueva línea corporativa',
            status: 'PENDIENTE',
            createdAt: new Date().toISOString(),
          },
        ],
      },
    };
  }

  return { data: { success: true, message: 'Operación simulada completada.' } };
};

// Response interceptor con fallback automático a mock en hosting estático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si la API no responde (404, 500, Network Error, etc.), usar Mock para presentación fluida
    if (
      !error.response ||
      error.response.status === 404 ||
      error.response.status === 502 ||
      error.response.status === 503 ||
      error.code === 'ERR_NETWORK'
    ) {
      console.warn('⚡ API Backend no detectada, activando modo demostración interactivo:', error.config?.url);
      const mockResult = handleMockFallback(
        error.config?.url,
        error.config?.method,
        error.config?.data ? JSON.parse(error.config.data) : undefined
      );
      return Promise.resolve(mockResult);
    }

    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('altabrisa_token');
      localStorage.removeItem('altabrisa_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
