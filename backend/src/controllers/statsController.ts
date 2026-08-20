import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { PaymentStatus, ContractStatus, ApartmentStatus } from '@prisma/client';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalTowers = await prisma.tower.count();
    const totalApartments = await prisma.apartment.count();
    const availableApartments = await prisma.apartment.count({ where: { status: ApartmentStatus.DISPONIBLE } });
    const rentedApartments = await prisma.apartment.count({ where: { status: ApartmentStatus.ALQUILADO } });
    const moraApartments = await prisma.apartment.count({ where: { status: ApartmentStatus.MORA } });
    const maintenanceApartments = await prisma.apartment.count({ where: { status: ApartmentStatus.MANTENIMIENTO } });

    const occupancyRate = totalApartments > 0 ? Math.round(((totalApartments - availableApartments) / totalApartments) * 100) : 0;

    // Contratos que vencen en los próximos 30 días
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const expiringContractsCount = await prisma.tenantContract.count({
      where: {
        status: { in: [ContractStatus.ACTIVO, ContractStatus.POR_VENCER_30D] },
        endDate: { lte: thirtyDaysFromNow },
      },
    });

    // Comprobantes pendientes de revisión
    const pendingVouchersCount = await prisma.payment.count({
      where: { status: PaymentStatus.EN_REVISION },
    });

    // Solicitudes de cambio de perfil pendientes
    const pendingRequestsCount = await prisma.profileChangeRequest.count({
      where: { status: 'PENDIENTE' },
    });

    // Cálculos Financieros del Mes
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Pagos aprobados en el mes
    const collectedPayments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.APROBADO,
        paidAt: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { amountGtq: true },
    });
    const totalCollectedMonthGtq = collectedPayments.reduce((sum, p) => sum + p.amountGtq, 0);

    // Pagos pendientes o en mora del mes
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: { in: [PaymentStatus.PENDIENTE, PaymentStatus.EN_REVISION] },
        dueDate: { lte: endOfMonth },
      },
      select: { amountGtq: true },
    });
    const totalPendingMonthGtq = pendingPayments.reduce((sum, p) => sum + p.amountGtq, 0);

    // Proyección de renta mensual de todos los contratos activos
    const activeContracts = await prisma.tenantContract.findMany({
      where: { status: { in: [ContractStatus.ACTIVO, ContractStatus.POR_VENCER_30D] } },
      select: { monthlyRentGtq: true },
    });
    const totalProjectedRentGtq = activeContracts.reduce((sum, c) => sum + c.monthlyRentGtq, 0);

    // Actividad reciente
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        apartment: { include: { tower: true } },
        user: { include: { tenantProfile: true, ownerProfile: true } },
      },
    });

    return res.json({
      success: true,
      stats: {
        towers: {
          total: totalTowers,
          activeModules: 10,
        },
        apartments: {
          total: totalApartments,
          available: availableApartments,
          rented: rentedApartments,
          mora: moraApartments,
          maintenance: maintenanceApartments,
          occupancyRate,
        },
        contracts: {
          expiringIn30Days: expiringContractsCount,
          activeTotal: activeContracts.length,
        },
        finances: {
          totalCollectedMonthGtq,
          totalPendingMonthGtq,
          totalProjectedRentGtq,
        },
        pendingTasks: {
          vouchersToReview: pendingVouchersCount,
          profileChangeRequests: pendingRequestsCount,
        },
        recentPayments,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return res.status(500).json({ success: false, message: 'Error al consultar métricas del dashboard.' });
  }
};
