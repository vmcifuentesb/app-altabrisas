import React from 'react';
import { Link } from 'react-router-dom';
import { Payment } from '../../types';
import { ArrowUpRight } from 'lucide-react';

interface RecentActivitiesFeedProps {
  recentPayments?: Payment[];
}

export const RecentActivitiesFeed: React.FC<RecentActivitiesFeedProps> = () => {
  const defaultActivities = [
    {
      id: 'act-1',
      title: 'Pago de Renta Verificado',
      subtitle: 'Torre A1-101 • Q2,400.00',
      time: 'Hace 2 horas',
      type: 'PAYMENT',
      image: '/assets/images/galeria-1.jpg',
    },
    {
      id: 'act-2',
      title: 'Renovación Semestral Requerida',
      subtitle: 'Torre A1-101 • Vence en 15 días',
      time: 'Hace 4 horas',
      type: 'RENEWAL',
      image: '/assets/images/galeria-4.jpg',
    },
    {
      id: 'act-3',
      title: 'Boleta de Depósito BI Subida',
      subtitle: 'Torre B1-201 • Q2,400.00',
      time: 'Hace 6 horas',
      type: 'VOUCHER',
      image: '/assets/images/galeria-6.jpg',
    },
    {
      id: 'act-4',
      title: 'Revisión Contador EEGSA',
      subtitle: 'Torre C1-302 • Servicio Eléctrico',
      time: 'Hace 1 día',
      type: 'MAINTENANCE',
      image: '/assets/images/galeria-2.jpg',
    },
    {
      id: 'act-5',
      title: 'Pago Cuota Mantenimiento',
      subtitle: 'Torre D1-104 • Q350.00',
      time: 'Hace 2 días',
      type: 'PAYMENT',
      image: '/assets/images/slide-proyecto.jpg',
    },
  ];

  return (
    <div className="saas-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Actividades Recientes
        </h4>
        <Link
          to="/pagos"
          className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
        >
          Ver Todo <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {defaultActivities.map((act) => (
          <div key={act.id} className="py-3 first:pt-0 last:pb-0 flex items-start space-x-3 group">
            {/* Thumbnail Photo with fallback */}
            <img
              src={act.image}
              alt={act.title}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform shadow-clean"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-slate-900 truncate leading-snug">
                {act.title}
              </h5>
              <p className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                {act.subtitle}
              </p>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {act.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
