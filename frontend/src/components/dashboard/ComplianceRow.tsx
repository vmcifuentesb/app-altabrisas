import React from 'react';
import { Zap, Droplets, AlertCircle, Wrench, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ComplianceRowProps {
  expiringContractsCount?: number;
  moraCount?: number;
}

export const ComplianceRow: React.FC<ComplianceRowProps> = ({
  expiringContractsCount = 1,
  moraCount = 1,
}) => {
  const items = [
    {
      id: 'eegsa',
      title: 'Energía EEGSA',
      status: 'Al día',
      statusType: 'success',
      icon: Zap,
      note: 'Contadores verificados',
      link: '/apartamentos',
    },
    {
      id: 'water',
      title: 'Agua Potable',
      status: 'Operativo',
      statusType: 'success',
      icon: Droplets,
      note: 'Pozo propio activo',
      link: '/apartamentos',
    },
    {
      id: 'mora',
      title: 'Morosidad / Cobro',
      status: moraCount > 0 ? `${moraCount} Pendiente` : 'Al día',
      statusType: moraCount > 0 ? 'alert' : 'success',
      icon: AlertCircle,
      note: 'Cuotas pendientes',
      link: '/apartamentos?status=MORA',
    },
    {
      id: 'maintenance',
      title: 'Mantenimiento',
      status: 'Regular',
      statusType: 'success',
      icon: Wrench,
      note: 'Áreas y garita',
      link: '/apartamentos',
    },
    {
      id: 'contracts',
      title: 'Contratos (30d)',
      status: expiringContractsCount > 0 ? `${expiringContractsCount} Por renovar` : 'Al día',
      statusType: expiringContractsCount > 0 ? 'warning' : 'success',
      icon: Clock,
      note: 'Ciclo semestral (6m)',
      link: '/contratos?status=POR_VENCER_30D',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display text-xs font-bold text-slate-800 uppercase tracking-wider">
            Monitoreo Operativo & Servicios
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">Supervisión de infraestructura y servicios del complejo</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.link}
              className="saas-card saas-card-hover p-3.5 sm:p-4 flex flex-col justify-between group"
            >
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors shrink-0" />
                <span className="font-display text-xs font-bold text-slate-800 truncate">{item.title}</span>
              </div>

              <div className="my-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    item.statusType === 'success'
                      ? 'bg-emerald-50 text-emerald-700'
                      : item.statusType === 'warning'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <span className="text-[10px] text-slate-400 block truncate font-medium">
                {item.note}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
