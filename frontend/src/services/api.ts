import axios, { AxiosResponse } from 'axios';
import {
  mockTowers,
  mockApartments,
  mockDashboardStats,
  mockContracts,
  mockOwnerProfiles,
  mockTenantProfiles,
  mockNotifications,
  mockPaymentsList,
  mockProfileChangeRequests,
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

// Mock handler universal e interactivo para producción estática
export const handleMockFallback = (url: string = '', method: string = 'get', data?: any, params?: any): any => {
  const cleanUrl = url.toLowerCase().replace('/api', '').split('?')[0];

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
          name: 'Dueña / Administradora General',
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

  // 5. Towers List & Details (2D Matrix)
  else if (cleanUrl.includes('tower') || cleanUrl.includes('torre')) {
    const parts = cleanUrl.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];

    if (parts.length >= 2 && lastPart !== 'towers' && lastPart !== 'torres') {
      const code = lastPart.toUpperCase();
      const towerApts = mockApartments.filter((a) => a.towerCode === code);
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
          code,
          sector: code.charAt(0),
          totalLevels: 4,
          levels,
        },
      };
    } else {
      responseData = { success: true, towers: mockTowers };
    }
  }

  // 6. WhatsApp dynamic links
  else if (cleanUrl.includes('whatsapp')) {
    const phone = (data?.phone || '50237373745').replace(/\D/g, '');
    const cleanPhone = phone.length === 8 ? `502${phone}` : phone;
    const message = encodeURIComponent(`Hola ${data?.name || ''}, le saludamos de Residenciales Altabrisa referente a su unidad ${data?.towerCode || ''}-${data?.unitNumber || ''}.`);
    responseData = { success: true, whatsappUrl: `https://wa.me/${cleanPhone}?text=${message}` };
  }

  // 7. Apartments Directory & Details
  else if (cleanUrl.includes('apartamento') || cleanUrl.includes('apartment')) {
    const parts = cleanUrl.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];

    // Single Apartment Detail 360°
    if (parts.length >= 2 && lastPart !== 'apartamentos' && lastPart !== 'apartments' && !lastPart.includes('status') && !lastPart.includes('service')) {
      const id = lastPart;
      const apt = mockApartments.find((a) => a.id === id || a.unitNumber === id) || mockApartments[0];
      responseData = { success: true, apartment: apt };
    } else {
      // List of Apartments with Filters
      let filtered = [...mockApartments];
      const towerFilter = params?.towerCode;
      const statusFilter = params?.status;
      const searchFilter = params?.search?.toLowerCase();

      if (towerFilter) {
        filtered = filtered.filter((a) => a.towerCode === towerFilter);
      }
      if (statusFilter) {
        filtered = filtered.filter((a) => a.status === statusFilter);
      }
      if (searchFilter) {
        filtered = filtered.filter(
          (a) =>
            a.unitNumber.toLowerCase().includes(searchFilter) ||
            a.towerCode?.toLowerCase().includes(searchFilter) ||
            a.model?.name.toLowerCase().includes(searchFilter) ||
            a.tenant?.fullName.toLowerCase().includes(searchFilter) ||
            a.owner?.fullName.toLowerCase().includes(searchFilter) ||
            a.powerMeterNumber?.toLowerCase().includes(searchFilter)
        );
      }

      responseData = { success: true, apartments: filtered };
    }
  }

  // 8. Clients (Owners & Tenants)
  else if (cleanUrl.includes('owner') || cleanUrl.includes('propietario')) {
    responseData = { success: true, owners: mockOwnerProfiles };
  } else if (cleanUrl.includes('tenant') || cleanUrl.includes('inquilino')) {
    responseData = { success: true, tenants: mockTenantProfiles };
  } else if (cleanUrl.includes('client')) {
    responseData = { success: true, owners: mockOwnerProfiles, tenants: mockTenantProfiles };
  }

  // 9. Contracts
  else if (cleanUrl.includes('contract') || cleanUrl.includes('contrato')) {
    let filtered = [...mockContracts];
    const statusFilter = params?.status;
    if (statusFilter) {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    responseData = { success: true, contracts: filtered };
  }

  // 10. Official Receipts
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
  }

  // 11. Payments Control
  else if (cleanUrl.includes('payment') || cleanUrl.includes('pago')) {
    let filtered = [...mockPaymentsList];
    const statusFilter = params?.status;
    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    responseData = { success: true, payments: filtered };
  }

  // 12. Audit Authorization Requests
  else if (cleanUrl.includes('request') || cleanUrl.includes('solicitud') || cleanUrl.includes('auditoria')) {
    responseData = {
      success: true,
      requests: mockProfileChangeRequests,
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
      let parsedData: any = undefined;
      try {
        if (typeof response.config?.data === 'string' && response.config.data.startsWith('{')) {
          parsedData = JSON.parse(response.config.data);
        }
      } catch (e) {
        parsedData = undefined;
      }
      return handleMockFallback(response.config?.url, response.config?.method, parsedData, response.config?.params);
    }

    return response;
  },
  async (error) => {
    let parsedData: any = undefined;
    try {
      if (typeof error.config?.data === 'string' && error.config.data.startsWith('{')) {
        parsedData = JSON.parse(error.config.data);
      }
    } catch (e) {
      parsedData = undefined;
    }
    const mockResult = handleMockFallback(error.config?.url, error.config?.method, parsedData, error.config?.params);
    return Promise.resolve(mockResult);
  }
);

export default api;
