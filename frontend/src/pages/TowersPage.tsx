import React from 'react';
import { TowerMatrixVisualizer } from '../components/towers/TowerMatrixVisualizer';
import { Building2 } from 'lucide-react';

export const TowersPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="saas-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Fase Operativa Activa &bull; 10 Torres
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Mapa y Matriz Visual de Torres (A1..D2)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualizador arquitectónico 2D con semáforo de disponibilidad, ocupación y cobros en tiempo real.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold bg-slate-50 p-2 rounded-xl border border-slate-200">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Disponible
          </span>
          <span className="flex items-center gap-1 text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Alquilado
          </span>
          <span className="flex items-center gap-1 text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Vence 30d
          </span>
          <span className="flex items-center gap-1 text-red-700 bg-red-100/70 px-2 py-0.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> En Mora
          </span>
        </div>
      </div>

      {/* Main Interactive Visualizer */}
      <TowerMatrixVisualizer />
    </div>
  );
};
