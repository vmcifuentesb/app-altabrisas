import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { RequestStatus } from '@prisma/client';

export const getChangeRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status as RequestStatus;
    }

    const requests = await prisma.profileChangeRequest.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            ownerProfile: true,
            tenantProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    console.error('Error al listar solicitudes:', error);
    return res.status(500).json({ success: false, message: 'Error al consultar solicitudes de cambio.' });
  }
};

export const createChangeRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado.' });
    }

    const { fieldName, newValue, reason } = req.body;

    if (!fieldName || !newValue) {
      return res.status(400).json({ success: false, message: 'Campo a modificar y nuevo valor son obligatorios.' });
    }

    // Obtener valor actual
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { ownerProfile: true, tenantProfile: true },
    });

    let oldValue = '';
    if (user?.ownerProfile) {
      oldValue = (user.ownerProfile as any)[fieldName] || '';
    } else if (user?.tenantProfile) {
      oldValue = (user.tenantProfile as any)[fieldName] || '';
    }

    const request = await prisma.profileChangeRequest.create({
      data: {
        userId: req.user.id,
        fieldName,
        oldValue: String(oldValue),
        newValue: String(newValue),
        reason,
        status: RequestStatus.PENDIENTE,
      },
    });

    // Notificar al administrador
    const superAdmins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
    for (const admin of superAdmins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'Nueva Solicitud de Cambio de Datos',
          message: `El usuario ${user?.email} solicitó actualizar ${fieldName} a "${newValue}". Requiere tu autorización.`,
          type: 'INFO',
          link: '/auditoria-solicitudes',
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Solicitud enviada exitosamente. Se aplicará una vez sea autorizada por la administración.',
      request,
    });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    return res.status(500).json({ success: false, message: 'Error al procesar solicitud de cambio.' });
  }
};

export const resolveChangeRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, adminNotes } = req.body; // action: 'APPROVE' or 'REJECT'

    const request = await prisma.profileChangeRequest.findUnique({
      where: { id },
      include: {
        user: {
          include: { ownerProfile: true, tenantProfile: true },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });
    }

    if (action === 'APPROVE') {
      // Aplicar el cambio al perfil correspondiente
      if (request.user.ownerProfile) {
        await prisma.ownerProfile.update({
          where: { id: request.user.ownerProfile.id },
          data: { [request.fieldName]: request.newValue },
        });
      } else if (request.user.tenantProfile) {
        await prisma.tenantProfile.update({
          where: { id: request.user.tenantProfile.id },
          data: { [request.fieldName]: request.newValue },
        });
      }

      const updated = await prisma.profileChangeRequest.update({
        where: { id },
        data: {
          status: RequestStatus.APROBADO,
          adminNotes,
          resolvedAt: new Date(),
        },
      });

      // Notificar al usuario
      await prisma.notification.create({
        data: {
          userId: request.userId,
          title: 'Solicitud de Cambio Aprobada',
          message: `Tu solicitud para actualizar ${request.fieldName} ha sido autorizada y los datos han sido actualizados en el sistema.`,
          type: 'SUCCESS',
        },
      });

      return res.json({ success: true, message: 'Solicitud aprobada y datos actualizados.', request: updated });
    } else {
      const updated = await prisma.profileChangeRequest.update({
        where: { id },
        data: {
          status: RequestStatus.RECHAZADO,
          adminNotes: adminNotes || 'La administración no autorizó la modificación.',
          resolvedAt: new Date(),
        },
      });

      // Notificar al usuario
      await prisma.notification.create({
        data: {
          userId: request.userId,
          title: 'Solicitud de Cambio Rechazada',
          message: `Tu solicitud para actualizar ${request.fieldName} fue denegada. Motivo: ${adminNotes || 'Contacta a administración'}.`,
          type: 'ALERT',
        },
      });

      return res.json({ success: true, message: 'Solicitud rechazada.', request: updated });
    }
  } catch (error) {
    console.error('Error al resolver solicitud:', error);
    return res.status(500).json({ success: false, message: 'Error al procesar resolución de solicitud.' });
  }
};
