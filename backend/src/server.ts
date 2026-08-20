import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import { login, getMe } from './controllers/authController';
import { getTowersSummary, getTowerDetails } from './controllers/towerController';
import { getAllApartments, getApartmentById, updateApartmentStatus, updateApartmentServices } from './controllers/apartmentController';
import { getOwners, getTenants, createOwner, createTenant, generateWhatsAppLink } from './controllers/clientController';
import { getAllContracts, createTenantContract, renewContract, terminateContract } from './controllers/contractController';
import { getPayments, recordPayment, submitVoucher, verifyPayment, getReceiptData } from './controllers/paymentController';
import { getChangeRequests, createChangeRequest, resolveChangeRequest } from './controllers/requestController';
import { getDashboardStats } from './controllers/statsController';
import { authenticate, requireRoles } from './middlewares/auth';
import { startScheduler } from './cron/scheduler';
import { prisma } from './config/prisma';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir assets estáticos descargados del proyecto
app.use('/assets', express.static(path.join(__dirname, '../../assets')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Altabrisa Real Estate & Residential Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de Autenticación
app.post('/api/auth/login', login);
app.get('/api/auth/me', authenticate, getMe);

// Rutas de Torres (Visualizador 2D)
app.get('/api/towers', getTowersSummary);
app.get('/api/towers/:code', getTowerDetails);

// Rutas de Apartamentos (Ficha 360 y Servicios)
app.get('/api/apartments', getAllApartments);
app.get('/api/apartments/:id', getApartmentById);
app.patch('/api/apartments/:id/status', authenticate, requireRoles(['SUPER_ADMIN', 'ADMIN']), updateApartmentStatus);
app.patch('/api/apartments/:id/services', authenticate, requireRoles(['SUPER_ADMIN', 'ADMIN']), updateApartmentServices);

// Rutas de Clientes (Propietarios, Inquilinos y WhatsApp)
app.get('/api/clients/owners', authenticate, getOwners);
app.get('/api/clients/tenants', authenticate, getTenants);
app.post('/api/clients/owners', authenticate, requireRoles(['SUPER_ADMIN', 'ADMIN']), createOwner);
app.post('/api/clients/tenants', authenticate, requireRoles(['SUPER_ADMIN', 'ADMIN']), createTenant);
app.post('/api/clients/whatsapp-link', generateWhatsAppLink);

// Rutas de Contratos (Ciclos de 6 Meses y Renovaciones)
app.get('/api/contracts', authenticate, getAllContracts);
app.post('/api/contracts/tenant', authenticate, requireRoles(['SUPER_ADMIN', 'ADMIN']), createTenantContract);
app.post('/api/contracts/:id/renew', authenticate, requireRoles(['SUPER_ADMIN', 'ADMIN']), renewContract);
app.post('/api/contracts/:id/terminate', authenticate, requireRoles(['SUPER_ADMIN', 'ADMIN']), terminateContract);

// Rutas de Pagos, Boletas y Recibos
app.get('/api/payments', authenticate, getPayments);
app.post('/api/payments/record', authenticate, requireRoles(['SUPER_ADMIN', 'ADMIN']), recordPayment);
app.post('/api/payments/submit-voucher', authenticate, submitVoucher);
app.post('/api/payments/:id/verify', authenticate, requireRoles(['SUPER_ADMIN', 'ADMIN']), verifyPayment);
app.get('/api/payments/:id/receipt', getReceiptData);

// Rutas de Solicitudes de Cambio de Perfil
app.get('/api/requests', authenticate, requireRoles(['SUPER_ADMIN', 'ADMIN']), getChangeRequests);
app.post('/api/requests', authenticate, createChangeRequest);
app.post('/api/requests/:id/resolve', authenticate, requireRoles(['SUPER_ADMIN', 'ADMIN']), resolveChangeRequest);

// Rutas de Estadísticas y KPIs
app.get('/api/stats/dashboard', authenticate, requireRoles(['SUPER_ADMIN', 'ADMIN']), getDashboardStats);

// Rutas de Notificaciones de Usuario
app.get('/api/notifications', authenticate, async (req: any, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al consultar notificaciones.' });
  }
});

app.patch('/api/notifications/:id/read', authenticate, async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'Notificación marcada como leída.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar notificación.' });
  }
});

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Altabrisa API ejecutándose en http://localhost:${PORT}`);
  startScheduler();
});
