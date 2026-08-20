import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Apartment, ApartmentStatus } from '../types';
import { Search, Zap, Droplets, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WhatsAppButton } from '../components/common/WhatsAppButton';

export const ApartmentsPage: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [towerFilter, setTowerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchApartments();
  }, [towerFilter, statusFilter]);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (towerFilter) params.towerCode = towerFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/apartamentos', { params });
      if (res.data.success) {
        setApartments(res.data.apartments);
      }
    } catch (error) {
      console.error('Error al cargar apartamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApartments();
  };

  const getStatusBadge = (status: ApartmentStatus) => {
    switch (status) {
      case 'DISPONIBLE':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold font-display">Disponible</span>;
      case 'ALQUILADO':
        return <span className="bg-blue-100 text-blue-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold font-display">Alquilado</span>;
      case 'MORA':
        return <span className="bg-red-100 text-red-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold font-display">En Mora</span>;
      case 'MANTENIMIENTO':
        return <span className="bg-slate-200 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-bold font-display">Mantenimiento</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-display">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* Header */}
      <div className="saas-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Catálogo & Fichas Técnicas
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Directorio de Inmuebles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Control de especificaciones físicas, contadores de servicios (EEGSA/Agua) y contratos.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="saas-card p-4 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px] relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por unidad (ej. A1-101), contador EEGSA, nombre de inquilino o dueño..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={towerFilter}
            onChange={(e) => setTowerFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">Todas las Torres (A1..D2)</option>
            {['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'].map((code) => (
              <option key={code} value={code}>Torre {code}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">Todos los Estados</option>
            <option value="DISPONIBLE">Disponibles</option>
            <option value="ALQUILADO">Alquilados</option>
            <option value="MORA">En Mora</option>
            <option value="MANTENIMIENTO">En Mantenimiento</option>
          </select>
        </div>
      </div>

      {/* Apartments Table */}
      <div className="saas-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 font-display">
              <tr>
                <th className="p-4">Unidad & Torre</th>
                <th className="p-4">Modelo</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Inquilino Actual</th>
                <th className="p-4">Propietario</th>
                <th className="p-4">Contadores (EEGSA/Agua)</th>
                <th className="p-4">Mantenimiento</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    Cargando listado de apartamentos...
                  </td>
                </tr>
              ) : apartments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No se encontraron apartamentos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                apartments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-display font-bold text-blue-600">
                          {apt.towerCode}
                        </div>
                        <div>
                          <span className="font-display font-extrabold text-slate-900 text-sm block">
                            {apt.towerCode}-{apt.unitNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Nivel 0{apt.level} &bull; Parqueo: {apt.parkingSpot || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-900 block font-display">{apt.model?.name}</span>
                      <span className="text-[10px] text-slate-500">{apt.model?.areaM2} m² &bull; {apt.model?.rooms} hab</span>
                    </td>

                    <td className="p-4">
                      {getStatusBadge(apt.status)}
                    </td>

                    <td className="p-4">
                      {apt.tenant ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{apt.tenant.fullName}</span>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] text-slate-500 font-mono">{apt.tenant.phonePrimary}</span>
                            <WhatsAppButton
                              phone={apt.tenant.phonePrimary}
                              name={apt.tenant.fullName}
                              towerCode={apt.towerCode}
                              unitNumber={apt.unitNumber}
                              type={apt.status === 'MORA' ? 'AVISO_MORA' : 'RECORDATORIO_PREVIO'}
                              variant="icon"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Vacante</span>
                      )}
                    </td>

                    <td className="p-4">
                      {apt.owner ? (
                        <div>
                          <span className="font-medium text-slate-800 block">{apt.owner.fullName}</span>
                          <span className="text-[10px] text-altabrisa-600 font-bold font-display">{apt.owner.purchaseMode}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Inmobiliaria</span>
                      )}
                    </td>

                    <td className="p-4 text-[11px]">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-700 font-mono font-medium">
                          <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{apt.powerMeterNumber || 'N/R'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 font-mono">
                          <Droplets className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>{apt.waterMeterNumber || 'N/R'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-display font-bold text-slate-900">
                      Q{apt.maintenanceFeeGtq.toFixed(2)}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        to={`/apartamentos/${apt.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white font-display font-bold text-xs transition-colors shadow-clean"
                      >
                        <span>Ficha 360°</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
