import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'altabrisa_super_secret_jwt_key_2026';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Correo y contraseña requeridos.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        ownerProfile: true,
        tenantProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas o cuenta desactivada.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const name = user.ownerProfile?.fullName || user.tenantProfile?.fullName || (user.role === 'SUPER_ADMIN' ? 'Dueña / Administradora' : 'Personal Altabrisa');

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name,
        ownerProfile: user.ownerProfile,
        tenantProfile: user.tenantProfile,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        ownerProfile: true,
        tenantProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const name = user.ownerProfile?.fullName || user.tenantProfile?.fullName || (user.role === 'SUPER_ADMIN' ? 'Dueña / Administradora' : 'Personal Altabrisa');

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name,
        ownerProfile: user.ownerProfile,
        tenantProfile: user.tenantProfile,
      },
    });
  } catch (error) {
    console.error('Error en getMe:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener perfil.' });
  }
};
