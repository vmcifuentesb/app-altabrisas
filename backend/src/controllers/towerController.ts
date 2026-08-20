import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getTowersSummary = async (req: Request, res: Response) => {
  try {
    const towers = await prisma.tower.findMany({
      orderBy: { code: 'asc' },
      include: {
        apartments: {
          select: {
            id: true,
            status: true,
            level: true,
            unitNumber: true,
            model: {
              select: { name: true, areaM2: true },
            },
          },
        },
      },
    });

    const summary = towers.map((tower) => {
      const total = tower.apartments.length;
      const available = tower.apartments.filter((a) => a.status === 'DISPONIBLE').length;
      const rented = tower.apartments.filter((a) => a.status === 'ALQUILADO').length;
      const mora = tower.apartments.filter((a) => a.status === 'MORA').length;
      const maintenance = tower.apartments.filter((a) => a.status === 'MANTENIMIENTO').length;
      const reserved = tower.apartments.filter((a) => a.status === 'RESERVADO').length;
      const occupancyRate = total > 0 ? Math.round(((total - available) / total) * 100) : 0;

      return {
        id: tower.id,
        code: tower.code,
        sector: tower.sector,
        totalLevels: tower.totalLevels,
        description: tower.description,
        stats: {
          total,
          available,
          rented,
          mora,
          maintenance,
          reserved,
          occupancyRate,
        },
      };
    });

    return res.json({ success: true, towers: summary });
  } catch (error) {
    console.error('Error al obtener torres:', error);
    return res.status(500).json({ success: false, message: 'Error al consultar resumen de torres.' });
  }
};

export const getTowerDetails = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const tower = await prisma.tower.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        apartments: {
          orderBy: [{ level: 'desc' }, { unitNumber: 'asc' }],
          include: {
            model: true,
            ownerContracts: {
              include: { owner: true },
            },
            tenantContracts: {
              where: {
                status: { in: ['ACTIVO', 'POR_VENCER_30D'] },
              },
              include: { tenant: true },
            },
            payments: {
              orderBy: { dueDate: 'desc' },
              take: 3,
            },
          },
        },
      },
    });

    if (!tower) {
      return res.status(404).json({ success: false, message: 'Torre no encontrada.' });
    }

    // Organizar por niveles para el visualizador 2D
    const levelsMap: Record<number, any[]> = {};
    for (let l = tower.totalLevels; l >= 1; l--) {
      levelsMap[l] = [];
    }

    for (const apt of tower.apartments) {
      const activeTenantContract = apt.tenantContracts[0] || null;
      const activeOwnerContract = apt.ownerContracts[0] || null;

      const aptData = {
        id: apt.id,
        unitNumber: apt.unitNumber,
        level: apt.level,
        status: apt.status,
        parkingSpot: apt.parkingSpot,
        powerMeterNumber: apt.powerMeterNumber,
        waterMeterNumber: apt.waterMeterNumber,
        internetProvider: apt.internetProvider,
        maintenanceFeeGtq: apt.maintenanceFeeGtq,
        model: apt.model,
        owner: activeOwnerContract?.owner || null,
        tenant: activeTenantContract?.tenant || null,
        activeContract: activeTenantContract,
        recentPayments: apt.payments,
      };

      if (!levelsMap[apt.level]) {
        levelsMap[apt.level] = [];
      }
      levelsMap[apt.level].push(aptData);
    }

    return res.json({
      success: true,
      tower: {
        id: tower.id,
        code: tower.code,
        sector: tower.sector,
        totalLevels: tower.totalLevels,
        description: tower.description,
        levels: levelsMap,
      },
    });
  } catch (error) {
    console.error('Error al obtener detalle de torre:', error);
    return res.status(500).json({ success: false, message: 'Error al consultar torre.' });
  }
};
