import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { BentoStats } from '../components/dashboard/BentoStats';
import { FeaturedComplexCard } from '../components/dashboard/FeaturedComplexCard';
import { ComplianceRow } from '../components/dashboard/ComplianceRow';
import { BalanceOverviewCard } from '../components/dashboard/BalanceOverviewCard';
import { RecentActivitiesFeed } from '../components/dashboard/RecentActivitiesFeed';
import { TowerMatrixVisualizer } from '../components/towers/TowerMatrixVisualizer';
import { Calendar, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stats/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    window.print();
  };

  const todayStr = new Intl.DateTimeFormat('es-GT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const firstName = user?.name ? user.name.split(' ')[0] : 'Dueña';

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 w-full">
      {/* Top Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="font-display text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
            Resumen General
          </span>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Buenos Días, <span className="text-blue-600">{firstName}!</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Es un excelente día para mantener el control y metas del complejo residencial Altabrisa.
          </p>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-clean">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{todayStr}</span>
          </div>

          <button
            onClick={handleExportReport}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-clean transition-colors font-display"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Reporte</span>
          </button>
        </div>
      </div>

      {/* Main Full-Width Grid (Responsive: 1 col on Mobile/Tablet, 2 cols on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* LEFT / MAIN COLUMN (7 cols on lg, 8 cols on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-8">
          {/* 1. Property Summary 3 KPI Cards */}
          <BentoStats stats={stats} loading={loading} />

          {/* 2. Featured Complex Overview Card with Photo */}
          <FeaturedComplexCard />

          {/* 3. Compliance & Services Operational Row */}
          <ComplianceRow
            expiringContractsCount={stats?.contracts.expiringIn30Days}
            moraCount={stats?.apartments.mora}
          />

          {/* 4. Tower Elevation 2D Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Visualizador de Torres (Elevación 2D en Vivo)
                </h4>
                <p className="text-[11px] text-slate-500">Monitoreo de niveles y estado de cada unidad habitacional</p>
              </div>
              <Link
                to="/torres"
                className="text-xs text-blue-600 font-bold hover:underline shrink-0"
              >
                Pantalla Completa &rarr;
              </Link>
            </div>
            <TowerMatrixVisualizer />
          </div>
        </div>

        {/* RIGHT RAIL (5 cols on lg, 4 cols on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 sm:space-y-8">
          {/* 1. Property Balance Overview (Vibrant Gradient Card) */}
          <BalanceOverviewCard finances={stats?.finances} />

          {/* 2. Recent Activities Timeline */}
          <RecentActivitiesFeed recentPayments={stats?.recentPayments} />
        </div>
      </div>
    </div>
  );
};
