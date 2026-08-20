import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ApartmentStatus } from '@prisma/client';

export const getAllApartments = async (req: Request, res: Response) => {
  try {
    const { towerCode, modelName, status, search } = req.query;

    const whereClause: any = {};

    if (towerCode) {
      whereClause.tower = { code: String(towerCode).toUpperCase() };
    }

    if (modelName) {
      whereClause.model = { name: String(modelName) };
    }

    if (status) {
      whereClause.status = status as ApartmentStatus;
    }

    if (search) {
      const q = String(search).toLowerCase();
      whereClause.OR = [
        { unitNumber: { contains: q, mode: 'insensitive' } },
        { powerMeterNumber: { contains: q, mode: 'insensitive' } },
        { waterMeterNumber: { contains: q, mode: 'insensitive' } },
        {
          ownerContracts: {
            some: {
              owner: {
                fullName: { contains: q, mode: 'insensitive' },
              },
            },
          },
        },
        {
          tenantContracts: {
            some: {
              tenant: {
                fullName: { contains: q, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    const apartments = await prisma.apartment.findMany({
      where: whereClause,
      include: {
        tower: true,
        model: true,
        ownerContracts: {
          include: { owner: true },
        },
        tenantContracts: {
          where: { status: { in: ['ACTIVO', 'POR_VENCER_30D'] } },
          include: { tenant: true },
        },
      },
      orderBy: [{ tower: { code: 'asc' } }, { level: 'asc' }, { unitNumber: 'asc' }],
    });

    const result = apartments.map((apt) => ({
      id: apt.id,
      towerCode: apt.tower.code,
      sector: apt.tower.sector,
      unitNumber: apt.unitNumber,
      level: apt.level,
      status: apt.status,
      parkingSpot: apt.parkingSpot,
      powerMeterNumber: apt.powerMeterNumber,
      waterMeterNumber: apt.waterMeterNumber,
      internetProvider: apt.internetProvider,
      maintenanceFeeGtq: apt.maintenanceFeeGtq,
      model: apt.model,
      owner: apt.ownerContracts[0]?.owner || null,
      tenant: apt.tenantContracts[0]?.tenant || null,
      activeContract: apt.tenantContracts[0] || null,
    }));

    return res.json({ success: true, count: result.length, apartments: result });
  } catch (error) {
    console.error('Error al listar apartamentos:', error);
    return res.status(500).json({ success: false, message: 'Error al consultar apartamentos.' });
  }
};

export const getApartmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const apt = await prisma.apartment.findUnique({
      where: { id },
      include: {
        tower: true,
        model: true,
        ownerContracts: {
          include: { owner: true },
        },
        tenantContracts: {
          include: { tenant: true },
          orderBy: { startDate: 'desc' },
        },
        payments: {
          orderBy: { dueDate: 'desc' },
          take: 12,
        },
        rentalHistories: {
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!apt) {
      return res.status(404).json({ success: false, message: 'Apartamento no encontrado.' });
    }

    const activeContract = apt.tenantContracts.find((c) => c.status === 'ACTIVO' || c.status === 'POR_VENCER_30D') || null;
    const activeOwnerContract = apt.ownerContracts[0] || null;

    return res.json({
      success: true,
      apartment: {
        id: apt.id,
        tower: apt.tower,
        model: apt.model,
        unitNumber: apt.unitNumber,
        level: apt.level,
        status: apt.status,
        parkingSpot: apt.parkingSpot,
        powerMeterNumber: apt.powerMeterNumber,
        waterMeterNumber: apt.waterMeterNumber,
        internetProvider: apt.internetProvider,
        maintenanceFeeGtq: apt.maintenanceFeeGtq,
        owner: activeOwnerContract?.owner || null,
        ownerContract: activeOwnerContract,
        tenant: activeContract?.tenant || null,
        activeContract,
        contractHistory: apt.tenantContracts,
        paymentHistory: apt.payments,
        rentalHistories: apt.rentalHistories,
      },
    });
  } catch (error) {
    console.error('Error al consultar detalle del apartamento:', error);
    return res.status(500).json({ success: false, message: 'Error al consultar apartamento.' });
  }
};

export const updateApartmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(ApartmentStatus).includes(status)) {
      return res.status(400).json({ success: false, message: 'Estado no válido.' });
    }

    const updated = await prisma.apartment.update({
      where: { id },
      data: { status },
    });

    return res.json({ success: true, message: 'Estado actualizado correctamente.', apartment: updated });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar estado.' });
  }
};

export const updateApartmentServices = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { powerMeterNumber, waterMeterNumber, internetProvider, maintenanceFeeGtq, parkingSpot } = req.body;

    const updated = await prisma.apartment.update({
      where: { id },
      data: {
        powerMeterNumber,
        waterMeterNumber,
        internetProvider,
        maintenanceFeeGtq: maintenanceFeeGtq ? parseFloat(maintenanceFeeGtq) : undefined,
        parkingSpot,
      },
    });

    return res.json({ success: true, message: 'Servicios del apartamento actualizados.', apartment: updated });
  } catch (error) {
    console.error('Error al actualizar servicios:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar servicios.' });
  }
};
