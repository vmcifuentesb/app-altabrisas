import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { ContractStatus, ApartmentStatus, PaymentStatus } from '@prisma/client';

export const startScheduler = () => {
  console.log('⏰ Inicializando Scheduler de Altabrisa (Chequeo de vencimiento a 30 días y cobros)...');

  // Ejecutar todos los días a las 00:05 AM (y una vez al iniciar la aplicación)
  cron.schedule('5 0 * * *', async () => {
    await runAutomatedChecks();
  });

  // Ejecución inmediata al arrancar el servidor
  runAutomatedChecks();
};

export const runAutomatedChecks = async () => {
  try {
    console.log('🔍 [Scheduler] Ejecutando escaneo de contratos a 30 días y estados de mora...');
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // 1. Detectar Contratos a 30 días de vencer
    const expiringContracts = await prisma.tenantContract.findMany({
      where: {
        status: ContractStatus.ACTIVO,
        endDate: { lte: thirtyDaysFromNow },
      },
      include: {
        apartment: { include: { tower: true } },
        tenant: true,
      },
    });

    for (const contract of expiringContracts) {
      await prisma.tenantContract.update({
        where: { id: contract.id },
        data: { status: ContractStatus.POR_VENCER_30D },
      });

      // Notificar a administradores
      const admins = await prisma.user.findMany({ where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: `Alerta: Contrato por Vencer (${contract.apartment.tower.code}-${contract.apartment.unitNumber})`,
            message: `El contrato del inquilino ${contract.tenant.fullName} vence el ${contract.endDate.toLocaleDateString()}. Se debe gestionar la renovación de 6 meses.`,
            type: 'WARNING',
            link: `/apartamentos/${contract.apartmentId}`,
          },
        });
      }

      // Notificar al inquilino
      await prisma.notification.create({
        data: {
          userId: contract.tenant.userId,
          title: 'Aviso de Renovación de Arrendamiento',
          message: `Tu contrato de arrendamiento para el apartamento Torre ${contract.apartment.tower.code} - ${contract.apartment.unitNumber} vence el ${contract.endDate.toLocaleDateString()} (en 30 días). Por favor coordina tu renovación semestral con la administración.`,
          type: 'WARNING',
        },
      });

      console.log(`⚠️ Contrato ${contract.id} marcado como POR_VENCER_30D (${contract.apartment.tower.code}-${contract.apartment.unitNumber})`);
    }

    // 2. Detectar pagos vencidos por más de 3 días para marcar estado MORA
    const graceDate = new Date();
    graceDate.setDate(now.getDate() - 3);

    const overduePayments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDIENTE,
        dueDate: { lt: graceDate },
      },
      include: {
        apartment: true,
      },
    });

    for (const payment of overduePayments) {
      if (payment.apartment.status === ApartmentStatus.ALQUILADO) {
        await prisma.apartment.update({
          where: { id: payment.apartmentId },
          data: { status: ApartmentStatus.MORA },
        });
        console.log(`🚨 Apartamento ${payment.apartmentId} actualizado a estado MORA por cuota pendiente.`);
      }
    }

    console.log(`✅ [Scheduler] Escaneo completado: ${expiringContracts.length} contratos alertados.`);
  } catch (error) {
    console.error('❌ Error en ejecución del scheduler:', error);
  }
};
