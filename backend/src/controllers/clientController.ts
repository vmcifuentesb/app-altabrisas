import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import * as bcrypt from 'bcryptjs';
import { Role, PurchaseMode } from '@prisma/client';

export const getOwners = async (req: Request, res: Response) => {
  try {
    const owners = await prisma.ownerProfile.findMany({
      include: {
        user: { select: { id: true, email: true, isActive: true } },
        ownerContracts: {
          include: {
            apartment: {
              include: { tower: true, model: true },
            },
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return res.json({ success: true, count: owners.length, owners });
  } catch (error) {
    console.error('Error al listar propietarios:', error);
    return res.status(500).json({ success: false, message: 'Error al consultar propietarios.' });
  }
};

export const getTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await prisma.tenantProfile.findMany({
      include: {
        user: { select: { id: true, email: true, isActive: true } },
        tenantContracts: {
          where: { status: { in: ['ACTIVO', 'POR_VENCER_30D'] } },
          include: {
            apartment: {
              include: { tower: true, model: true },
            },
            payments: {
              orderBy: { dueDate: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return res.json({ success: true, count: tenants.length, tenants });
  } catch (error) {
    console.error('Error al listar inquilinos:', error);
    return res.status(500).json({ success: false, message: 'Error al consultar inquilinos.' });
  }
};

export const createOwner = async (req: Request, res: Response) => {
  try {
    const {
      email,
      fullName,
      dpi,
      nit,
      phonePrimary,
      phoneSecondary,
      address,
      emergencyContact,
      purchaseMode,
      bankName,
      loanTermYears,
      monthlyBankQuotaGtq,
      estimatedBalanceGtq,
      apartmentId,
    } = req.body;

    if (!email || !fullName || !dpi || !phonePrimary) {
      return res.status(400).json({ success: false, message: 'Nombre, DPI, Teléfono y Correo son obligatorios.' });
    }

    const defaultPassword = await bcrypt.hash('Altabrisa2026!', 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash: defaultPassword,
        role: Role.OWNER,
        ownerProfile: {
          create: {
            fullName,
            dpi,
            nit,
            phonePrimary,
            phoneSecondary,
            email: email.toLowerCase().trim(),
            address,
            emergencyContact,
            purchaseMode: purchaseMode || PurchaseMode.CONTADO,
            bankName,
            loanTermYears: loanTermYears ? parseInt(loanTermYears) : null,
            monthlyBankQuotaGtq: monthlyBankQuotaGtq ? parseFloat(monthlyBankQuotaGtq) : null,
            estimatedBalanceGtq: estimatedBalanceGtq ? parseFloat(estimatedBalanceGtq) : null,
          },
        },
      },
      include: { ownerProfile: true },
    });

    // Si se especificó un apartamento, vincular contrato de administración
    if (apartmentId && user.ownerProfile) {
      await prisma.ownerContract.create({
        data: {
          apartmentId,
          ownerId: user.ownerProfile.id,
          startDate: new Date(),
          contractType: 'ADMINISTRACION',
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Propietario registrado exitosamente. Contraseña inicial: Altabrisa2026!',
      owner: user.ownerProfile,
    });
  } catch (error: any) {
    console.error('Error al crear propietario:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'El correo electrónico o DPI ya se encuentra registrado.' });
    }
    return res.status(500).json({ success: false, message: 'Error interno al registrar propietario.' });
  }
};

export const createTenant = async (req: Request, res: Response) => {
  try {
    const { email, fullName, dpi, nit, phonePrimary, phoneSecondary, emergencyContact, workplace } = req.body;

    if (!email || !fullName || !dpi || !phonePrimary) {
      return res.status(400).json({ success: false, message: 'Nombre, DPI, Teléfono y Correo son obligatorios.' });
    }

    const defaultPassword = await bcrypt.hash('Altabrisa2026!', 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash: defaultPassword,
        role: Role.TENANT,
        tenantProfile: {
          create: {
            fullName,
            dpi,
            nit,
            phonePrimary,
            phoneSecondary,
            email: email.toLowerCase().trim(),
            emergencyContact,
            workplace,
          },
        },
      },
      include: { tenantProfile: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Inquilino registrado exitosamente. Contraseña inicial: Altabrisa2026!',
      tenant: user.tenantProfile,
    });
  } catch (error: any) {
    console.error('Error al crear inquilino:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'El correo electrónico o DPI ya se encuentra registrado.' });
    }
    return res.status(500).json({ success: false, message: 'Error interno al registrar inquilino.' });
  }
};

export const generateWhatsAppLink = (req: Request, res: Response) => {
  const { phone, type, name, towerCode, unitNumber, amount, dueDate } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Número de teléfono requerido.' });
  }

  // Limpiar número (remover espacios, guiones) y asegurar código de país +502
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 8) {
    cleanPhone = `502${cleanPhone}`;
  }

  let text = '';

  switch (type) {
    case 'RECORDATORIO_PREVIO':
      text = `Hola ${name || 'estimado residente'}, te saludamos de Administración Altabrisa. Te recordamos cordialmente que la cuota de tu apartamento Torre ${towerCode} - Apto ${unitNumber} por un valor de Q${amount || '0.00'} vence el próximo ${dueDate || '5 de este mes'}. Puedes subir tu boleta desde el portal o por este medio. ¡Feliz día!`;
      break;
    case 'AVISO_MORA':
      text = `Estimado(a) ${name || 'residente'}, le saludamos de Administración Altabrisa. Le informamos que el pago de la cuota correspondiente a la Torre ${towerCode} - Apto ${unitNumber} por monto de Q${amount || '0.00'} presenta saldo pendiente de pago. Le solicitamos regularizar su pago a la brevedad para evitar recargos. Quedamos a su disposición.`;
      break;
    case 'RENOVACION_CONTRATO_30D':
      text = `Estimado(a) ${name || 'residente'}, le saludamos de Inmobiliaria Altabrisa. Le notificamos que su contrato de arrendamiento de 6 meses para la Torre ${towerCode} - Apto ${unitNumber} vencerá en 30 días (${dueDate || ''}). Por favor confírmenos si desea renovar por un nuevo período de 6 meses para preparar su adenda correspondiente.`;
      break;
    default:
      text = `Hola ${name || ''}, te saludamos de Administración Altabrisa. Quedamos a tu servicio por cualquier consulta sobre tu apartamento Torre ${towerCode} - Apto ${unitNumber}.`;
  }

  const encoded = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

  return res.json({
    success: true,
    whatsappUrl,
    messageText: text,
  });
};
