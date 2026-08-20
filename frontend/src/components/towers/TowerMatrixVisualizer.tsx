import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { TowerSummary, Apartment, ApartmentStatus } from '../../types';
import { Building2, Filter, User, CheckCircle, AlertCircle, Wrench } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';

export const TowerMatrixVisualizer: React.FC = () => {
  const [towers, setTowers] = useState<TowerSummary[]>([]);
  const [selectedTowerCode, setSelectedTowerCode] = useState<string>('A1');
  const [towerDetails, setTowerDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modelFilter, setModelFilter] = useState<string>('ALL');
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);

  useEffect(() => {
    fetchTowers();
  }, []);

  useEffect(() => {
    if (selectedTowerCode) {
      fetchTowerDetails(selectedTowerCode);
    }
  }, [selectedTowerCode]);

  const fetchTowers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/towers');
      if (res.data.success) {
        setTowers(res.data.towers);
      }
    } catch (error) {
      console.error('Error al cargar torres:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTowerDetails = async (code: string) => {
    try {
      const res = await api.get(`/towers/${code}`);
      if (res.data.success) {
        setTowerDetails(res.data.tower);
      }
    } catch (error) {
      console.error('Error al cargar detalle de torre:', error);
    }
  };

  const getApartmentCardStyle = (apt: any) => {
    const isFilteredOut =
      (statusFilter !== 'ALL' && apt.status !== statusFilter) ||
      (modelFilter !== 'ALL' && apt.model.name !== modelFilter);

    if (isFilteredOut) {
      return 'opacity-25 grayscale hover:opacity-60';
    }

    switch (apt.status) {
      case 'DISPONIBLE':
        return 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400 text-emerald-950 shadow-clean';
      case 'ALQUILADO':
        return 'bg-blue-50/50 border-blue-200 hover:border-blue-400 text-blue-950 shadow-clean';
      case 'MORA':
        return 'bg-red-50 border-red-300 hover:border-red-500 text-red-950 shadow-clean';
      case 'MANTENIMIENTO':
        return 'bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-800 shadow-clean';
      case 'RESERVADO':
        return 'bg-purple-50 border-purple-200 hover:border-purple-400 text-purple-950 shadow-clean';
      default:
        return 'bg-white border-slate-200 text-slate-800 shadow-clean';
    }
  };

  const getStatusBadge = (status: ApartmentStatus) => {
    switch (status) {
      case 'DISPONIBLE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-display">
            <CheckCircle className="w-2.5 h-2.5" /> Libre
          </span>
        );
      case 'ALQUILADO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-display">
            <User className="w-2.5 h-2.5" /> Alquilado
          </span>
        );
      case 'MORA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-display">
            <AlertCircle className="w-2.5 h-2.5" /> Mora
          </span>
        );
      case 'MANTENIMIENTO':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-display">
            <Wrench className="w-2.5 h-2.5" /> Mtto
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* 1. Tower Selector Bar (10 Active Towers: A1..D2) */}
      <div className="saas-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <h4 className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
              Navegador de Torres (10 Módulos Activos)
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">Torres A1..A5, B1..B2, C1..C2, D1..D2</span>
        </div>

        {/* Responsive Flex Wrap of Tower Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {towers.map((t) => {
            const isSelected = t.code === selectedTowerCode;
            const hasMora = t.stats.mora > 0;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTowerCode(t.code)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center min-w-[68px] sm:min-w-[74px] border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {hasMora && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
                <span className="font-display text-sm sm:text-base font-black tracking-tight">{t.code}</span>
                <span className={`text-[10px] font-medium ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  {t.stats.occupancyRate}% Ocup.
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Filters & Status Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 saas-card p-3 sm:p-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1 text-[11px]">
            <Filter className="w-3.5 h-3.5" /> Estado:
          </span>
          {[
            { key: 'ALL', label: 'Todos' },
            { key: 'DISPONIBLE', label: 'Disponibles' },
            { key: 'ALQUILADO', label: 'Alquilados' },
            { key: 'MORA', label: 'En Mora' },
            { key: 'MANTENIMIENTO', label: 'Mantenimiento' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === item.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Model Filters */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold text-[11px]">Modelo:</span>
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">Todos los Modelos</option>
            <option value="Roma">Roma (21 m²)</option>
            <option value="Milán">Milán (45 m²)</option>
            <option value="Turín">Turín (60 m²)</option>
          </select>
        </div>
      </div>

      {/* 3. Visual 2D Architectural Building Matrix */}
      <div className="saas-card p-4 sm:p-6 space-y-4">
        <div className="space-y-3">
          {towerDetails?.levels ? (
            Object.keys(towerDetails.levels)
              .sort((a, b) => Number(b) - Number(a))
              .map((levelStr) => {
                const level = Number(levelStr);
                const aptsInLevel = towerDetails.levels[level] || [];

                return (
                  <div
                    key={level}
                    className="flex flex-col sm:flex-row items-stretch gap-2.5 bg-slate-50/70 p-2.5 sm:p-3 rounded-2xl border border-slate-200/60"
                  >
                    {/* Level Label Badge */}
                    <div className="sm:w-20 shrink-0 flex sm:flex-col items-center justify-between sm:justify-center bg-white border border-slate-200 rounded-xl p-2 text-center shadow-clean">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nivel</span>
                      <span className="font-display text-base sm:text-lg font-black text-slate-900">0{level}</span>
                      <span className="text-[10px] text-slate-400 sm:hidden">4 Unidades</span>
                    </div>

                    {/* Apartments in this level (Responsive 2 cols on mobile, 4 on desktop) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 flex-1">
                      {aptsInLevel.map((apt: any) => {
                        const styleClass = getApartmentCardStyle(apt);
                        return (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedApartment(apt)}
                            className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between min-h-[88px] ${styleClass}`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="font-display text-xs font-black tracking-tight text-slate-900">
                                {selectedTowerCode}-{apt.unitNumber}
                              </span>
                              {getStatusBadge(apt.status)}
                            </div>

                            <div className="mt-1 space-y-0.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-700">{apt.model?.name}</span>
                                <span className="text-slate-400 font-medium">{apt.model?.areaM2}m²</span>
                              </div>
                              {apt.tenant ? (
                                <p className="text-[10px] text-slate-600 font-semibold truncate">
                                  👤 {apt.tenant.fullName.split(' ')[0]}
                                </p>
                              ) : (
                                <p className="text-[10px] text-slate-400 italic">Vacante</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">Cargando unidades...</div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedApartment && (
        <QuickViewModal
          apartment={selectedApartment}
          towerCode={selectedTowerCode}
          onClose={() => setSelectedApartment(null)}
          onRefresh={() => fetchTowerDetails(selectedTowerCode)}
        />
      )}
    </div>
  );
};
