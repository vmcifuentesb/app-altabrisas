import axios, { AxiosResponse } from 'axios';
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

// Mock handler universal para producción estática
export const handleMockFallback = (url: string = '', method: string = 'get', data?: any): any => {
  const cleanUrl = url.replace('/api', '').split('?')[0];

  let responseData: any = { success: true, message: 'Operación completada exitosamente.' };

  // 1. Auth Login
  if (cleanUrl.includes('login')) {
    const email = data?.email || 'duena@altabrisa.gt';
    let role: any = 'SUPER_ADMIN';
    let name = 'Dueña / Administradora General';
    let ownerProfile = undefined;
    let tenantProfile = undefined;

    if (email.includes('vendedor') || email.includes('gestor')) {
      role = 'ADMIN';
      name = 'Asesor Inmobiliario Altabrisa';
    } else if (email.includes('carlos') || email.includes('owner') || email.includes('dueño')) {
      role = 'OWNER';
      name = 'Lic. Carlos Roberto Mendoza';
      ownerProfile = mockOwnerProfiles[0];
    } else if (email.includes('juan') || email.includes('inquilino') || email.includes('tenant')) {
      role = 'TENANT';
      name = 'Juan José Pérez Castillo';
      tenantProfile = mockTenantProfiles[0];
    }

    const mockUser = {
      id: 'usr-mock-active',
      email,
      name,
      role,
      ownerProfile,
      tenantProfile,
    };

    responseData = {
      success: true,
      token: 'mock-jwt-token-altabrisa-2026',
      user: mockUser,
    };
  }

  // 2. Auth Me
  else if (cleanUrl.includes('me')) {
    const storedUser = localStorage.getItem('altabrisa_user');
    const user = storedUser
      ? JSON.parse(storedUser)
      : {
          id: 'usr-mock-active',
          email: 'duena@altabrisa.gt',
          name: 'Dueña / Administradora',
          role: 'SUPER_ADMIN',
        };
    responseData = { success: true, user };
  }

  // 3. Notifications
  else if (cleanUrl.includes('notification')) {
    responseData = { success: true, notifications: mockNotifications };
  }

  // 4. Dashboard Stats
  else if (cleanUrl.includes('stats') || cleanUrl.includes('dashboard')) {
    responseData = { success: true, stats: mockDashboardStats };
  }

  // 5. Towers List & Details
  else if (cleanUrl.includes('tower') || cleanUrl.includes('torre')) {
    if (cleanUrl.includes('/towers/') || cleanUrl.split('/').length > 2) {
      const code = cleanUrl.split('/').pop() || 'A1';
      const towerApts = mockApartments.filter((a) => a.towerCode === code || a.towerCode === code.toUpperCase());
      const finalApts = towerApts.length > 0 ? towerApts : mockApartments.slice(0, 16);

      const levels: any = { 1: [], 2: [], 3: [], 4: [] };
      finalApts.forEach((apt) => {
        if (!levels[apt.level]) levels[apt.level] = [];
        levels[apt.level].push(apt);
      });

      responseData = {
        success: true,
        tower: {
          id: `tow-${code}`,
          code: code.toUpperCase(),
          sector: code.charAt(0).toUpperCase(),
          totalLevels: 4,
          levels,
        },
      };
    } else {
      responseData = { success: true, towers: mockTowers };
    }
  }

  // 6. Apartments Directory & Details
  else if (cleanUrl.includes('apartamento') || cleanUrl.includes('apartment')) {
    if (cleanUrl.split('/').length > 2 && !cleanUrl.includes('status') && !cleanUrl.includes('service')) {
      const id = cleanUrl.split('/').pop();
      const apt = mockApartments.find((a) => a.id === id) || mockApartments[0];
      responseData = { success: true, apartment: apt };
    } else {
      responseData = { success: true, apartments: mockApartments };
    }
  }

  // 7. Clients (Owners & Tenants)
  else if (cleanUrl.includes('owner') || cleanUrl.includes('propietario')) {
    responseData = { success: true, owners: mockOwnerProfiles };
  } else if (cleanUrl.includes('tenant') || cleanUrl.includes('inquilino')) {
    responseData = { success: true, tenants: mockTenantProfiles };
  } else if (cleanUrl.includes('client')) {
    responseData = { success: true, owners: mockOwnerProfiles, tenants: mockTenantProfiles };
  }

  // 8. Contracts
  else if (cleanUrl.includes('contract') || cleanUrl.includes('contrato')) {
    responseData = { success: true, contracts: mockContracts };
  }

  // 9. Payments & Official Receipts
  else if (cleanUrl.includes('receipt') || cleanUrl.includes('recibo')) {
    responseData = {
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
    };
  } else if (cleanUrl.includes('payment') || cleanUrl.includes('pago')) {
    responseData = { success: true, payments: mockDashboardStats.recentPayments };
  }

  // 10. Audit Change Requests
  else if (cleanUrl.includes('request') || cleanUrl.includes('solicitud')) {
    responseData = {
      success: true,
      requests: [
        {
          id: 'req-1',
          userId: 'usr-tenant-1',
          user: { email: 'juan.perez@inquilino.gt', tenantProfile: { fullName: 'Juan José Pérez' } },
          fieldName: 'phonePrimary',
          oldValue: '+502 5874-9632',
          newValue: '+502 4112-9900',
          reason: 'Nueva línea corporativa de residencia',
          status: 'PENDIENTE',
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }

  return {
    data: responseData,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
};

// Response Interceptor: detecta si el hosting devolvió HTML (por rewrite SPA) o error 404/500
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Si el servidor devolvió HTML (porque no hay backend Node en ese hosting), activar mock
    if (
      typeof response.data === 'string' &&
      (response.data.includes('<!doctype html>') ||
        response.data.includes('<html') ||
        response.data.includes('id="root"'))
    ) {
      console.warn('⚡ Servidor devolvió HTML, activando adaptador de datos interactivo:', response.config?.url);
      let parsedData: any = undefined;
      try {
        if (typeof response.config?.data === 'string' && response.config.data.startsWith('{')) {
          parsedData = JSON.parse(response.config.data);
        }
      } catch (e) {
        parsedData = undefined;
      }
      return handleMockFallback(response.config?.url, response.config?.method, parsedData);
    }

    return response;
  },
  async (error) => {
    console.warn('⚡ API Backend no detectada o error de red, usando adaptador interactivo:', error.config?.url);
    let parsedData: any = undefined;
    try {
      if (typeof error.config?.data === 'string' && error.config.data.startsWith('{')) {
        parsedData = JSON.parse(error.config.data);
      }
    } catch (e) {
      parsedData = undefined;
    }
    const mockResult = handleMockFallback(error.config?.url, error.config?.method, parsedData);
    return Promise.resolve(mockResult);
  }
);

export default api;
