import React, { useState } from 'react';
import { MessageSquare, ExternalLink } from 'lucide-react';
import api from '../../services/api';

interface WhatsAppButtonProps {
  phone: string;
  name: string;
  towerCode?: string;
  unitNumber?: string;
  amount?: number;
  dueDate?: string;
  type?: 'RECORDATORIO_PREVIO' | 'AVISO_MORA' | 'RENOVACION_CONTRATO_30D' | 'GENERAL';
  variant?: 'button' | 'icon' | 'compact';
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone,
  name,
  towerCode = 'A1',
  unitNumber = '101',
  amount = 2400,
  dueDate,
  type = 'GENERAL',
  variant = 'button',
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const res = await api.post('/clients/whatsapp-link', {
        phone,
        name,
        towerCode,
        unitNumber,
        amount: amount.toFixed(2),
        dueDate,
        type,
      });

      if (res.data.success && res.data.whatsappUrl) {
        window.open(res.data.whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error al generar enlace de WhatsApp:', error);
      // Fallback directo
      let clean = phone.replace(/\D/g, '');
      if (clean.length === 8) clean = `502${clean}`;
      window.open(`https://wa.me/${clean}`, '_blank');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        title={`Contactar a ${name} vía WhatsApp`}
        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all hover:scale-105"
      >
        <MessageSquare className="w-4 h-4" />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>WhatsApp</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:shadow-emerald-600/40"
    >
      <MessageSquare className="w-4 h-4" />
      <span>Enviar Notificación WhatsApp</span>
      <ExternalLink className="w-3 h-3 opacity-70" />
    </button>
  );
};
