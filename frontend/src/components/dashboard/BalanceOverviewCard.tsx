import React from 'react';
import { DashboardStats } from '../../types';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BalanceOverviewCardProps {
  finances?: DashboardStats['finances'];
}

export const BalanceOverviewCard: React.FC<BalanceOverviewCardProps> = ({ finances }) => {
  const totalBalance = finances ? finances.totalCollectedMonthGtq : 542890;
  const outstanding = finances ? finances.totalPendingMonthGtq : 12450;
  const monthlyRevenue = finances ? finances.totalProjectedRentGtq : 98750;

  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-5 sm:p-6 text-white shadow-clean-md relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h4 className="font-display text-xs font-bold uppercase tracking-wider text-blue-100">
            Resumen Financiero del Complejo
          </h4>
          <Link
            to="/pagos"
            className="text-[10px] text-blue-200 hover:text-white font-semibold flex items-center gap-0.5"
          >
            Detalles <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Top 2 Numbers: Balance and Outstanding */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <span className="text-[10px] text-blue-200 uppercase font-medium block">
              Recaudación del Mes
            </span>
            <strong className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
              Q{totalBalance.toLocaleString('es-GT', { minimumFractionDigits: 0 })}
            </strong>
          </div>

          <div>
            <span className="text-[10px] text-blue-200 uppercase font-medium block">
              Pagos Pendientes (Mora)
            </span>
            <strong className="font-display text-xl sm:text-2xl font-black text-amber-300 tracking-tight">
              Q{outstanding.toLocaleString('es-GT', { minimumFractionDigits: 0 })}
            </strong>
          </div>
        </div>

        {/* Monthly Revenue & Mini Bar Chart */}
        <div className="pt-3 border-t border-blue-500/40 flex items-end justify-between">
          <div>
            <span className="text-[10px] text-blue-200 uppercase font-medium block">
              Proyección Mensual de Renta
            </span>
            <span className="font-display text-2xl font-extrabold text-white tracking-tight">
              Q{monthlyRevenue.toLocaleString('es-GT', { minimumFractionDigits: 0 })}
            </span>
          </div>

          {/* Bar chart visualizer in white */}
          <div className="flex items-end space-x-1.5 h-12 pb-0.5">
            <div className="w-2 bg-white/30 rounded-t h-4"></div>
            <div className="w-2 bg-white/40 rounded-t h-6"></div>
            <div className="w-2 bg-white/60 rounded-t h-8"></div>
            <div className="w-2 bg-white/80 rounded-t h-10"></div>
            <div className="w-2.5 bg-white rounded-t h-12 shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
