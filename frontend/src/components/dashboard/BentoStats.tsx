import React from 'react';
import { DashboardStats } from '../../types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BentoStatsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const BentoStats: React.FC<BentoStatsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-2xl border border-slate-200"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xs font-bold text-slate-800 uppercase tracking-wider">
          Resumen de Propiedades
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Total Properties / Active Towers */}
        <Link
          to="/torres"
          className="saas-card saas-card-hover p-4 sm:p-5 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Torres Activas</span>
            <span className="font-display text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              3.05% <ArrowDownRight className="w-3 h-3" />
            </span>
          </div>

          <div className="my-2.5 flex items-baseline justify-between">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.towers.activeModules}
            </span>
            {/* Mini Bar Chart Graphic */}
            <div className="flex items-end gap-1 h-5">
              <span className="w-1.5 h-3 bg-red-400 rounded-sm"></span>
              <span className="w-1.5 h-5 bg-red-500 rounded-sm"></span>
              <span className="w-1.5 h-4 bg-red-400 rounded-sm"></span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-100">
            <span className="font-medium">Fase 1 (A1..D2)</span>
            <span className="text-blue-600 font-bold group-hover:underline">Ver más</span>
          </div>
        </Link>

        {/* 2. Total Units */}
        <Link
          to="/apartamentos"
          className="saas-card saas-card-hover p-4 sm:p-5 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Apartamentos</span>
            <span className="font-display text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              2.7k <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>

          <div className="my-2.5 flex items-baseline justify-between">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.apartments.total}
            </span>
            <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin-slow"></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-100">
            <span className="font-medium">{stats.apartments.available} Disponibles</span>
            <span className="text-blue-600 font-bold group-hover:underline">Ver más</span>
          </div>
        </Link>

        {/* 3. Occupancy Rate */}
        <Link
          to="/torres"
          className="saas-card saas-card-hover p-4 sm:p-5 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tasa de Ocupación</span>
            <span className="font-display text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              3.05% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>

          <div className="my-2.5 flex items-baseline justify-between">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {stats.apartments.occupancyRate}%
            </span>
            <div className="flex items-end gap-1 h-5">
              <span className="w-1.5 h-2 bg-emerald-400 rounded-sm"></span>
              <span className="w-1.5 h-3 bg-emerald-500 rounded-sm"></span>
              <span className="w-1.5 h-5 bg-emerald-600 rounded-sm"></span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-100">
            <span className="font-medium">{stats.apartments.rented} Arrendados</span>
            <span className="text-blue-600 font-bold group-hover:underline">Ver más</span>
          </div>
        </Link>
      </div>
    </div>
  );
};
