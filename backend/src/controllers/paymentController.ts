import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { PaymentConcept, PaymentStatus, ApartmentStatus } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth';
import * as QRCode from 'qrcode';

export const getPayments = async (req: Request, res: Response) => {
  try {
    const { status, concept, towerCode, apartmentId } = req.query;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status as PaymentStatus;
    }
    if (concept) {
      whereClause.concept = concept as PaymentConcept;
    }
    if (apartmentId) {
      whereClause.apartmentId = String(apartmentId);
    }
    if (towerCode) {
      whereClause.apartment = { tower: { code: String(towerCode).toUpperCase() } };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        apartment: {
          include: { tower: true, model: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            tenantProfile: true,
            ownerProfile: true,
          },
        },
        contract: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    console.error('Error al consultar pagos:', error);
    return res.status(500).json({ success: false, message: 'Error al consultar pagos.' });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { apartmentId, contractId, userId, concept, amountGtq, dueDate, paidAt, bankOrigin, voucherReference, notes } = req.body;

    if (!apartmentId || !userId || !concept || !amountGtq) {
      return res.status(400).json({
        success: false,
        message: 'Apartamento, usuario, concepto y monto son obligatorios.',
      });
    }

    const payment = await prisma.payment.create({
      data: {
        apartmentId,
        contractId,
        userId,
        concept: concept as PaymentConcept,
        amountGtq: parseFloat(amountGtq),
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        bankOrigin,
        voucherReference,
        status: PaymentStatus.APROBADO,
        notes,
        verifiedAt: new Date(),
        verifiedBy: req.user?.email || 'Administrador',
      },
      include: {
        apartment: { include: { tower: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Pago registrado exitosamente.',
      payment,
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    return res.status(500).json({ success: false, message: 'Error al registrar pago.' });
  }
};

export const submitVoucher = async (req: AuthRequest, res: Response) => {
  try {
    const { apartmentId, contractId, concept, amountGtq, bankOrigin, voucherReference, voucherUrl, notes } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado.' });
    }

    if (!apartmentId || !amountGtq || !voucherReference) {
      return res.status(400).json({
        success: false,
        message: 'Apartamento, monto y número de boleta/referencia son obligatorios.',
      });
    }

    const payment = await prisma.payment.create({
      data: {
        apartmentId,
        contractId,
        userId: req.user.id,
        concept: (concept as PaymentConcept) || PaymentConcept.RENTA,
        amountGtq: parseFloat(amountGtq),
        dueDate: new Date(),
        paidAt: new Date(),
        bankOrigin: bankOrigin || 'Transferencia Bancaria',
        voucherReference,
        voucherUrl,
        status: PaymentStatus.EN_REVISION,
        notes: notes || 'Comprobante subido por el residente.',
      },
      include: { apartment: { include: { tower: true } } },
    });

    // Notificar al administrador
    const superAdmins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
    for (const admin of superAdmins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'Nuevo Comprobante de Pago Subido',
          message: `El residente del Apto ${payment.apartment.tower.code}-${payment.apartment.unitNumber} subió comprobante por Q${payment.amountGtq}. Referencia: ${voucherReference}`,
          type: 'INFO',
          link: '/pagos',
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Comprobante enviado para revisión de la administración.',
      payment,
    });
  } catch (error) {
    console.error('Error al subir comprobante:', error);
    return res.status(500).json({ success: false, message: 'Error al subir comprobante.' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'APPROVE' or 'REJECT'

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { apartment: { include: { tower: true } } },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Pago no encontrado.' });
    }

    if (action === 'APPROVE') {
      const updated = await prisma.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.APROBADO,
          verifiedAt: new Date(),
          verifiedBy: req.user?.email || 'Administrador',
          notes: notes ? `${payment.notes || ''} [Verificado]: ${notes}` : payment.notes,
        },
      });

      // Si el apartamento estaba en mora, verificar si ya está al día
      if (payment.apartment.status === ApartmentStatus.MORA) {
        await prisma.apartment.update({
          where: { id: payment.apartmentId },
          data: { status: ApartmentStatus.ALQUILADO },
        });
      }

      // Notificar al inquilino
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          title: 'Comprobante de Pago Aprobado',
          message: `Tu pago de ${payment.concept} por Q${payment.amountGtq} ha sido verificado y aprobado. Ya puedes descargar tu recibo digital.`,
          type: 'SUCCESS',
          link: '/mis-pagos',
        },
      });

      return res.json({ success: true, message: 'Pago aprobado y verificado correctamente.', payment: updated });
    } else {
      const updated = await prisma.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.RECHAZADO,
          notes: notes ? `[RECHAZADO]: ${notes}` : '[RECHAZADO]: Comprobante no válido o no coincide monto.',
        },
      });

      // Notificar al inquilino
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          title: 'Comprobante de Pago Rechazado',
          message: `El comprobante por Q${payment.amountGtq} fue rechazado. Motivo: ${notes || 'Monto o referencia no legible'}. Por favor sube una nueva fotografía clara.`,
          type: 'ALERT',
          link: '/mis-pagos',
        },
      });

      return res.json({ success: true, message: 'Pago rechazado.', payment: updated });
    }
  } catch (error) {
    console.error('Error al verificar pago:', error);
    return res.status(500).json({ success: false, message: 'Error al procesar verificación de pago.' });
  }
};

export const getReceiptData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        apartment: {
          include: { tower: true, model: true },
        },
        user: {
          include: { tenantProfile: true, ownerProfile: true },
        },
      },
    });

    if (!payment || payment.status !== PaymentStatus.APROBADO) {
      return res.status(404).json({ success: false, message: 'Recibo oficial disponible únicamente para pagos aprobados.' });
    }

    const payerName = payment.user.tenantProfile?.fullName || payment.user.ownerProfile?.fullName || payment.user.email;
    const payerNit = payment.user.tenantProfile?.nit || payment.user.ownerProfile?.nit || 'CF';
    const receiptNumber = `REC-ALT-${payment.id.substring(0, 8).toUpperCase()}`;

    // Generar código QR para verificación
    const qrData = `COMPROBANTE ALTABRISA\nNo: ${receiptNumber}\nUnidad: ${payment.apartment.tower.code}-${payment.apartment.unitNumber}\nMonto: Q${payment.amountGtq.toFixed(2)}\nFecha: ${payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : ''}\nEstado: APROBADO`;
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    return res.json({
      success: true,
      receipt: {
        receiptNumber,
        paymentId: payment.id,
        payerName,
        payerNit,
        towerCode: payment.apartment.tower.code,
        unitNumber: payment.apartment.unitNumber,
        concept: payment.concept,
        amountGtq: payment.amountGtq,
        paidAt: payment.paidAt,
        bankOrigin: payment.bankOrigin,
        voucherReference: payment.voucherReference,
        verifiedBy: payment.verifiedBy,
        qrCodeBase64,
        company: {
          name: 'Residenciales Altabrisa',
          location: 'Km 24 Calle Principal Caserío La Virgen Zona 2, Villa Canales, Guatemala',
          pbx: '+502 3737-3745',
        },
      },
    });
  } catch (error) {
    console.error('Error al generar datos de recibo:', error);
    return res.status(500).json({ success: false, message: 'Error al generar recibo digital.' });
  }
};
