import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ContractStatus, ApartmentStatus } from '@prisma/client';

export const getAllContracts = async (req: Request, res: Response) => {
  try {
    const { status, towerCode } = req.query;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status as ContractStatus;
    }
    if (towerCode) {
      whereClause.apartment = { tower: { code: String(towerCode).toUpperCase() } };
    }

    const contracts = await prisma.tenantContract.findMany({
      where: whereClause,
      include: {
        apartment: {
          include: { tower: true, model: true },
        },
        tenant: true,
        payments: {
          orderBy: { dueDate: 'desc' },
          take: 3,
        },
      },
      orderBy: { endDate: 'asc' },
    });

    return res.json({ success: true, count: contracts.length, contracts });
  } catch (error) {
    console.error('Error al consultar contratos:', error);
    return res.status(500).json({ success: false, message: 'Error al consultar contratos.' });
  }
};

export const createTenantContract = async (req: Request, res: Response) => {
  try {
    const { apartmentId, tenantId, startDate, monthlyRentGtq, depositGtq, paymentDay } = req.body;

    if (!apartmentId || !tenantId || !startDate || !monthlyRentGtq) {
      return res.status(400).json({
        success: false,
        message: 'Apartamento, inquilino, fecha de inicio y monto de renta son obligatorios.',
      });
    }

    const start = new Date(startDate);
    // Calcular exactamente 6 meses
    const end = new Date(start);
    end.setMonth(end.getMonth() + 6);

    // Crear el contrato
    const contract = await prisma.tenantContract.create({
      data: {
        apartmentId,
        tenantId,
        startDate: start,
        endDate: end,
        monthlyRentGtq: parseFloat(monthlyRentGtq),
        depositGtq: depositGtq ? parseFloat(depositGtq) : parseFloat(monthlyRentGtq),
        paymentDay: paymentDay ? parseInt(paymentDay) : 5,
        status: ContractStatus.ACTIVO,
      },
      include: {
        apartment: { include: { tower: true } },
        tenant: true,
      },
    });

    // Actualizar estado del apartamento a ALQUILADO
    await prisma.apartment.update({
      where: { id: apartmentId },
      data: { status: ApartmentStatus.ALQUILADO },
    });

    return res.status(201).json({
      success: true,
      message: 'Contrato de 6 meses creado exitosamente.',
      contract,
    });
  } catch (error) {
    console.error('Error al crear contrato:', error);
    return res.status(500).json({ success: false, message: 'Error al registrar contrato de arrendamiento.' });
  }
};

export const renewContract = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newMonthlyRentGtq } = req.body;

    const existing = await prisma.tenantContract.findUnique({
      where: { id },
      include: { apartment: true, tenant: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Contrato no encontrado.' });
    }

    // Marcar el contrato anterior como RENOVADO
    await prisma.tenantContract.update({
      where: { id },
      data: { status: ContractStatus.RENOVADO },
    });

    // Crear el nuevo contrato de 6 meses a partir de la fecha de fin anterior
    const newStart = new Date(existing.endDate);
    const newEnd = new Date(newStart);
    newEnd.setMonth(newEnd.getMonth() + 6);

    const renewed = await prisma.tenantContract.create({
      data: {
        apartmentId: existing.apartmentId,
        tenantId: existing.tenantId,
        startDate: newStart,
        endDate: newEnd,
        monthlyRentGtq: newMonthlyRentGtq ? parseFloat(newMonthlyRentGtq) : existing.monthlyRentGtq,
        depositGtq: existing.depositGtq,
        paymentDay: existing.paymentDay,
        status: ContractStatus.ACTIVO,
      },
      include: { apartment: { include: { tower: true } }, tenant: true },
    });

    return res.json({
      success: true,
      message: 'Contrato renovado exitosamente por 6 meses adicionales.',
      contract: renewed,
    });
  } catch (error) {
    console.error('Error al renovar contrato:', error);
    return res.status(500).json({ success: false, message: 'Error al renovar contrato.' });
  }
};

export const terminateContract = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newApartmentStatus, notes } = req.body;

    const contract = await prisma.tenantContract.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contrato no encontrado.' });
    }

    // Archivar en historial
    await prisma.rentalHistory.create({
      data: {
        apartmentId: contract.apartmentId,
        tenantName: contract.tenant.fullName,
        tenantDpi: contract.tenant.dpi,
        startDate: contract.startDate,
        endDate: new Date(),
        monthlyRentGtq: contract.monthlyRentGtq,
        notes: notes || 'Finalización regular de contrato.',
      },
    });

    await prisma.tenantContract.update({
      where: { id },
      data: { status: ContractStatus.FINALIZADO },
    });

    await prisma.apartment.update({
      where: { id: contract.apartmentId },
      data: { status: (newApartmentStatus as ApartmentStatus) || ApartmentStatus.DISPONIBLE },
    });

    return res.json({ success: true, message: 'Contrato finalizado y archivado en el historial.' });
  } catch (error) {
    console.error('Error al finalizar contrato:', error);
    return res.status(500).json({ success: false, message: 'Error al finalizar contrato.' });
  }
};
