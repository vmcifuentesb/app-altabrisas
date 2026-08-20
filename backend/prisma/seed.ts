import { PrismaClient, Role, ApartmentStatus, PurchaseMode, ContractStatus, PaymentConcept, PaymentStatus, RequestStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeder para Apartamentos Altabrisa...');

  // 1. Limpiar base de datos
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.profileChangeRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rentalHistory.deleteMany();
  await prisma.tenantContract.deleteMany();
  await prisma.ownerContract.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.apartmentModel.deleteMany();
  await prisma.tower.deleteMany();
  await prisma.ownerProfile.deleteMany();
  await prisma.tenantProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Altabrisa2026!', 10);

  // 2. Crear Usuarios Administrativos
  const superAdmin = await prisma.user.create({
    data: {
      email: 'duena@altabrisa.gt',
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  const employee = await prisma.user.create({
    data: {
      email: 'vendedor@altabrisa.gt',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Usuarios administrativos creados');

  // 3. Crear Modelos de Apartamentos Oficiales
  const modelRoma = await prisma.apartmentModel.create({
    data: {
      name: 'Roma',
      areaM2: 21.0,
      rooms: 1,
      bathrooms: 1,
      hasKitchenette: true,
      hasLaundry: false,
      description: 'Apartamento de 1 dormitorio con cocineta y baño completo. Ideal para personas independientes.',
      floorPlanImage: '/assets/images/tab-1-roma.jpg',
    },
  });

  const modelMilan = await prisma.apartmentModel.create({
    data: {
      name: 'Milán',
      areaM2: 45.0,
      rooms: 2,
      bathrooms: 1,
      hasKitchenette: false,
      hasLaundry: true,
      description: 'Apartamento de 2 habitaciones, sala-comedor, cocina independiente y baño completo.',
      floorPlanImage: '/assets/images/tab-2-milan.jpg',
    },
  });

  const modelTurin = await prisma.apartmentModel.create({
    data: {
      name: 'Turín',
      areaM2: 60.0,
      rooms: 3,
      bathrooms: 1,
      hasKitchenette: false,
      hasLaundry: true,
      description: 'Apartamento espacioso de 3 habitaciones / estudio, sala, comedor, cocina y área de lavandería.',
      floorPlanImage: '/assets/images/slide-proyecto.jpg',
    },
  });

  console.log('✅ Modelos de apartamentos creados (Roma, Milán, Turín)');

  // 4. Crear las 10 Torres Activas de Altabrisa (A1..A5, B1..B2, C1..C2, D1..D2)
  const towerDefs = [
    { code: 'A1', sector: 'A', totalLevels: 4 },
    { code: 'A2', sector: 'A', totalLevels: 4 },
    { code: 'A3', sector: 'A', totalLevels: 4 },
    { code: 'A4', sector: 'A', totalLevels: 4 },
    { code: 'A5', sector: 'A', totalLevels: 4 },
    { code: 'B1', sector: 'B', totalLevels: 4 },
    { code: 'B2', sector: 'B', totalLevels: 4 },
    { code: 'C1', sector: 'C', totalLevels: 4 },
    { code: 'C2', sector: 'C', totalLevels: 4 },
    { code: 'D1', sector: 'D', totalLevels: 4 },
    { code: 'D2', sector: 'D', totalLevels: 4 },
  ];

  const towers = [];
  for (const t of towerDefs) {
    const tower = await prisma.tower.create({
      data: {
        code: t.code,
        sector: t.sector,
        totalLevels: t.totalLevels,
        description: `Torre ${t.code} - Sector ${t.sector}, Residenciales Altabrisa`,
      },
    });
    towers.push(tower);
  }

  console.log(`✅ ${towers.length} Torres creadas (A1..A5, B1..B2, C1..C2, D1..D2)`);

  // 5. Crear Propietarios de Muestra
  const ownerUser1 = await prisma.user.create({
    data: {
      email: 'carlos.mendoza@gmail.com',
      passwordHash,
      role: Role.OWNER,
      ownerProfile: {
        create: {
          fullName: 'Lic. Carlos Roberto Mendoza Ruiz',
          dpi: '2548 78912 0101',
          nit: '4587962-1',
          phonePrimary: '+502 5487-1234',
          phoneSecondary: '+502 2365-8899',
          email: 'carlos.mendoza@gmail.com',
          address: 'Zona 10, Ciudad de Guatemala',
          emergencyContact: 'Ana Sofía Mendoza (Hermana) - 5544-3322',
          purchaseMode: PurchaseMode.HIPOTECA_BANCO,
          bankName: 'Banco Industrial (BI)',
          loanTermYears: 20,
          monthlyBankQuotaGtq: 2850.00,
          estimatedBalanceGtq: 380000.00,
        },
      },
    },
    include: { ownerProfile: true },
  });

  const ownerUser2 = await prisma.user.create({
    data: {
      email: 'marta.gomez@yahoo.com',
      passwordHash,
      role: Role.OWNER,
      ownerProfile: {
        create: {
          fullName: 'Dra. Marta Elena Gómez Morales',
          dpi: '1890 45612 0101',
          nit: '3256987-4',
          phonePrimary: '+502 4789-6541',
          email: 'marta.gomez@yahoo.com',
          address: 'Carretera a El Salvador, Km 14.5',
          emergencyContact: 'Roberto Gómez (Padre) - 4123-9874',
          purchaseMode: PurchaseMode.CONTADO,
        },
      },
    },
    include: { ownerProfile: true },
  });

  console.log('✅ Propietarios de prueba creados');

  // 6. Crear Inquilinos de Muestra
  const tenantUser1 = await prisma.user.create({
    data: {
      email: 'juan.perez@inquilino.gt',
      passwordHash,
      role: Role.TENANT,
      tenantProfile: {
        create: {
          fullName: 'Juan José Pérez Castillo',
          dpi: '3001 89452 0101',
          nit: '8956231-9',
          phonePrimary: '+502 5874-9632',
          email: 'juan.perez@inquilino.gt',
          emergencyContact: 'María Castillo (Madre) - 5698-7412',
          workplace: 'Corporación Multi Inversiones (CMI)',
        },
      },
    },
    include: { tenantProfile: true },
  });

  const tenantUser2 = await prisma.user.create({
    data: {
      email: 'lucia.alvarez@inquilino.gt',
      passwordHash,
      role: Role.TENANT,
      tenantProfile: {
        create: {
          fullName: 'Lucía Andrea Álvarez Sandoval',
          dpi: '2645 12789 0101',
          nit: '7412589-3',
          phonePrimary: '+502 4215-8963',
          email: 'lucia.alvarez@inquilino.gt',
          emergencyContact: 'David Álvarez (Esposo) - 4512-3698',
          workplace: 'Hospital Roosevelt / Residente Médica',
        },
      },
    },
    include: { tenantProfile: true },
  });

  console.log('✅ Inquilinos de prueba creados');

  // 7. Generar Apartamentos para todas las Torres
  const models = [modelRoma, modelMilan, modelTurin];
  const now = new Date();
  
  for (const tower of towers) {
    for (let level = 1; level <= tower.totalLevels; level++) {
      for (let door = 1; door <= 4; door++) {
        const unitNumber = `${level}0${door}`;
        const model = models[(level + door) % 3];
        
        let status: ApartmentStatus = ApartmentStatus.DISPONIBLE;
        let isSpecialOccupied = false;
        
        // Apartamento especial 1: A1-101 (Alquilado al día)
        if (tower.code === 'A1' && unitNumber === '101') {
          status = ApartmentStatus.ALQUILADO;
          isSpecialOccupied = true;
        }
        // Apartamento especial 2: B2-204 (En Mora)
        else if (tower.code === 'B2' && unitNumber === '204') {
          status = ApartmentStatus.MORA;
          isSpecialOccupied = true;
        }
        // Apartamento especial 3: A2-302 (Mantenimiento)
        else if (tower.code === 'A2' && unitNumber === '302') {
          status = ApartmentStatus.MANTENIMIENTO;
        } else if ((level + door) % 5 === 0) {
          status = ApartmentStatus.ALQUILADO;
        }

        const apt = await prisma.apartment.create({
          data: {
            towerId: tower.id,
            modelId: model.id,
            unitNumber,
            level,
            parkingSpot: `P-${tower.code}-${unitNumber}`,
            status,
            powerMeterNumber: `EEGSA-${tower.code}-${unitNumber}-${Math.floor(1000 + Math.random() * 9000)}`,
            waterMeterNumber: `AGUA-ALT-${tower.code}-${unitNumber}`,
            internetProvider: 'Claro Fibra Óptica 100Mbps',
            maintenanceFeeGtq: 350.00,
          },
        });

        // Contratos para el apartamento especial A1-101
        if (tower.code === 'A1' && unitNumber === '101' && ownerUser1.ownerProfile && tenantUser1.tenantProfile) {
          // Contrato con Dueño
          await prisma.ownerContract.create({
            data: {
              apartmentId: apt.id,
              ownerId: ownerUser1.ownerProfile.id,
              contractType: 'ADMINISTRACION',
              startDate: new Date('2026-01-01'),
              commissionPct: 8.0,
            },
          });

          // Contrato con Inquilino (Exactamente 6 meses)
          const startDate = new Date('2026-03-01');
          const endDate = new Date('2026-09-01'); // 6 meses
          const tenantContract = await prisma.tenantContract.create({
            data: {
              apartmentId: apt.id,
              tenantId: tenantUser1.tenantProfile.id,
              startDate,
              endDate,
              monthlyRentGtq: 2400.00,
              depositGtq: 2400.00,
              paymentDay: 5,
              status: ContractStatus.ACTIVO,
            },
          });

          // Pago aprobado reciente
          await prisma.payment.create({
            data: {
              contractId: tenantContract.id,
              apartmentId: apt.id,
              userId: tenantUser1.id,
              concept: PaymentConcept.RENTA,
              amountGtq: 2400.00,
              dueDate: new Date('2026-08-05'),
              paidAt: new Date('2026-08-04'),
              bankOrigin: 'Banco Industrial (BI)',
              voucherReference: 'TRANS-BI-88945612',
              status: PaymentStatus.APROBADO,
              notes: 'Pago mensual de agosto verificado',
              verifiedAt: new Date('2026-08-04'),
              verifiedBy: superAdmin.email,
            },
          });

          await prisma.payment.create({
            data: {
              contractId: tenantContract.id,
              apartmentId: apt.id,
              userId: tenantUser1.id,
              concept: PaymentConcept.MANTENIMIENTO,
              amountGtq: 350.00,
              dueDate: new Date('2026-08-05'),
              paidAt: new Date('2026-08-04'),
              bankOrigin: 'Banco Industrial (BI)',
              voucherReference: 'TRANS-BI-88945613',
              status: PaymentStatus.APROBADO,
            },
          });
        }

        // Contratos para el apartamento especial B2-204 (En Mora)
        if (tower.code === 'B2' && unitNumber === '204' && ownerUser2.ownerProfile && tenantUser2.tenantProfile) {
          await prisma.ownerContract.create({
            data: {
              apartmentId: apt.id,
              ownerId: ownerUser2.ownerProfile.id,
              contractType: 'ADMINISTRACION',
              startDate: new Date('2025-10-01'),
              commissionPct: 10.0,
            },
          });

          const tenantContract = await prisma.tenantContract.create({
            data: {
              apartmentId: apt.id,
              tenantId: tenantUser2.tenantProfile.id,
              startDate: new Date('2026-03-01'),
              endDate: new Date('2026-09-01'),
              monthlyRentGtq: 2600.00,
              depositGtq: 2600.00,
              paymentDay: 5,
              status: ContractStatus.POR_VENCER_30D,
            },
          });

          // Pago en mora (Vencido el 5 de agosto sin pagar)
          await prisma.payment.create({
            data: {
              contractId: tenantContract.id,
              apartmentId: apt.id,
              userId: tenantUser2.id,
              concept: PaymentConcept.RENTA,
              amountGtq: 2600.00,
              dueDate: new Date('2026-08-05'),
              status: PaymentStatus.PENDIENTE,
              notes: 'Cuota vencida hace más de 10 días. Notificación enviada.',
            },
          });
        }
      }
    }
  }

  // 8. Crear Solicitudes de Cambio de Perfil pendientes
  await prisma.profileChangeRequest.create({
    data: {
      userId: tenantUser1.id,
      fieldName: 'phonePrimary',
      oldValue: '+502 5874-9632',
      newValue: '+502 5500-1122',
      reason: 'Cambié de número telefónico por pérdida de celular.',
      status: RequestStatus.PENDIENTE,
    },
  });

  // 9. Crear Notificaciones iniciales
  await prisma.notification.create({
    data: {
      userId: superAdmin.id,
      title: 'Contrato Próximo a Vencer (30 Días)',
      message: 'El contrato de arrendamiento de la Torre B2 - Apto 204 vence el 01/09/2026. Se requiere iniciar gestión de renovación de 6 meses.',
      type: 'WARNING',
      link: '/contratos',
    },
  });

  await prisma.notification.create({
    data: {
      userId: superAdmin.id,
      title: 'Alerta de Mora',
      message: 'Torre B2 - Apto 204 tiene pendiente el pago de renta de Agosto (Q2,600.00).',
      type: 'ALERT',
      link: '/pagos',
    },
  });

  console.log('✅ Base de datos Altabrisa inicializada exitosamente con 10 Torres y datos operativos.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
