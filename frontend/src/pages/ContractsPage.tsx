import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TenantContract } from '../types';
import { Plus, Clock, RefreshCw, X, FileText } from 'lucide-react';
import { WhatsAppButton } from '../components/common/WhatsAppButton';

export const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<TenantContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedContractToRenew, setSelectedContractToRenew] = useState<TenantContract | null>(null);
  const [newRentPrice, setNewRentPrice] = useState('');
  const [showNewContractModal, setShowNewContractModal] = useState(false);

  // New contract form
  const [apartments, setApartments] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedAptId, setSelectedAptId] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyRent, setMonthlyRent] = useState('2400');
  const [deposit, setDeposit] = useState('2400');

  useEffect(() => {
    fetchContracts();
  }, [statusFilter]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/contracts', { params });
      if (res.data.success) {
        setContracts(res.data.contracts);
      }
    } catch (error) {
      console.error('Error al cargar contratos:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNewContractModal = async () => {
    try {
      const [aptRes, tenRes] = await Promise.all([
        api.get('/apartamentos?status=DISPONIBLE'),
        api.get('/clients/tenants'),
      ]);
      if (aptRes.data.success) setApartments(aptRes.data.apartments);
      if (tenRes.data.success) setTenants(tenRes.data.tenants);
      setShowNewContractModal(true);
    } catch (error) {
      console.error('Error al preparar formulario de contrato:', error);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/contracts/tenant', {
        apartmentId: selectedAptId,
        tenantId: selectedTenantId,
        startDate,
        monthlyRentGtq: monthlyRent,
        depositGtq: deposit,
      });
      setShowNewContractModal(false);
      fetchContracts();
    } catch (error) {
      console.error('Error al crear contrato:', error);
    }
  };

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractToRenew) return;
    try {
      await api.post(`/contracts/${selectedContractToRenew.id}/renew`, {
        newMonthlyRentGtq: newRentPrice ? parseFloat(newRentPrice) : undefined,
      });
      setSelectedContractToRenew(null);
      fetchContracts();
    } catch (error) {
      console.error('Error al renovar contrato:', error);
    }
  };

  const handleTerminate = async (contractId: string) => {
    if (!window.confirm('¿Confirmas la finalización de este contrato de arrendamiento? La unidad quedará disponible.')) {
      return;
    }
    try {
      await api.post(`/contracts/${contractId}/terminate`, {
        newApartmentStatus: 'DISPONIBLE',
      });
      fetchContracts();
    } catch (error) {
      console.error('Error al finalizar contrato:', error);
    }
  };

  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="saas-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Ciclos Semestrales & Alertas de 30 Días
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contratos de Arrendamiento</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Todos los contratos de inquilinos tienen vigencia estricta de 6 meses con motor de alerta automática previo al vencimiento.
          </p>
        </div>

        <button
          onClick={openNewContractModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-clean transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Contrato (6 Meses)</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 saas-card p-2">
        {[
          { key: '', label: 'Todos los Contratos' },
          { key: 'POR_VENCER_30D', label: '⚠️ Alerta de Renovación (< 30 Días)', highlight: true },
          { key: 'ACTIVO', label: 'Vigentes (Al día)' },
          { key: 'RENOVADO', label: 'Historial Renovados' },
          { key: 'FINALIZADO', label: 'Finalizados' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === item.key
                ? 'bg-slate-900 text-white shadow-sm'
                : item.highlight
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Contracts Table */}
      <div className="saas-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Unidad</th>
                <th className="p-4">Inquilino</th>
                <th className="p-4">Vigencia (6 Meses)</th>
                <th className="p-4">Tiempo Restante</th>
                <th className="p-4">Renta Mensual</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones de Renovación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">Cargando contratos...</td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">No hay contratos en esta categoría.</td>
                </tr>
              ) : (
                contracts.map((c) => {
                  const daysLeft = getDaysRemaining(c.endDate);
                  const isExpiringSoon = daysLeft <= 30 && daysLeft >= 0 && c.status !== 'FINALIZADO' && c.status !== 'RENOVADO';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="font-extrabold text-slate-900 text-sm block">
                          {c.apartment?.tower?.code}-{c.apartment?.unitNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">Modelo {c.apartment?.model?.name}</span>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{c.tenant?.fullName}</span>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] text-slate-500">{c.tenant?.phonePrimary}</span>
                            {c.tenant && (
                              <WhatsAppButton
                                phone={c.tenant.phonePrimary}
                                name={c.tenant.fullName}
                                towerCode={c.apartment?.tower?.code}
                                unitNumber={c.apartment?.unitNumber}
                                dueDate={new Date(c.endDate).toLocaleDateString()}
                                type={isExpiringSoon ? 'RENOVACION_CONTRATO_30D' : 'GENERAL'}
                                variant="icon"
                              />
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-slate-500">Inicio: {new Date(c.startDate).toLocaleDateString()}</span>
                          <span className="text-slate-900 font-bold block">Fin: {new Date(c.endDate).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {c.status === 'FINALIZADO' ? (
                          <span className="text-slate-400 text-xs">Concluido</span>
                        ) : c.status === 'RENOVADO' ? (
                          <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded">Renovado</span>
                        ) : daysLeft < 0 ? (
                          <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">Vencido</span>
                        ) : daysLeft <= 30 ? (
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg inline-block shadow-sm">
                            ⚠️ Vence en {daysLeft} días
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600 font-medium">Quedan {daysLeft} días</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-extrabold text-emerald-600 text-sm">
                          Q{c.monthlyRentGtq.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Depósito: Q{c.depositGtq.toFixed(2)}</span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === 'ACTIVO'
                              ? 'bg-blue-100 text-blue-800'
                              : c.status === 'POR_VENCER_30D'
                              ? 'bg-amber-100 text-amber-800'
                              : c.status === 'RENOVADO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {c.status !== 'FINALIZADO' && c.status !== 'RENOVADO' && (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setSelectedContractToRenew(c);
                                setNewRentPrice(c.monthlyRentGtq.toString());
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Renovar 6m</span>
                            </button>
                            <button
                              onClick={() => handleTerminate(c.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-semibold"
                            >
                              Finalizar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renew Modal */}
      {selectedContractToRenew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Renovación Semestral de Contrato (6 Meses)</h3>
              <button onClick={() => setSelectedContractToRenew(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Renovar contrato para el inquilino <strong>{selectedContractToRenew.tenant?.fullName}</strong> en la unidad{' '}
              <strong>{selectedContractToRenew.apartment?.tower?.code}-{selectedContractToRenew.apartment?.unitNumber}</strong>.
            </p>

            <form onSubmit={handleRenew} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nuevo Canon de Renta Mensual (Q)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newRentPrice}
                  onChange={(e) => setNewRentPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                <p>✓ El contrato anterior quedará registrado como RENOVADO.</p>
                <p>✓ Se creará un nuevo período de 6 meses a partir de la fecha de término anterior.</p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-clean"
              >
                Confirmar Renovación por 6 Meses
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New 6-Month Contract Modal */}
      {showNewContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Suscribir Contrato de Arrendamiento (6 Meses)</h3>
              <button onClick={() => setShowNewContractModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Apartamento Disponible *</label>
                <select
                  required
                  value={selectedAptId}
                  onChange={(e) => setSelectedAptId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                >
                  <option value="">Seleccione un apartamento disponible</option>
                  {apartments.map((a) => (
                    <option key={a.id} value={a.id}>
                      Torre {a.towerCode} - Apto {a.unitNumber} (Modelo {a.model?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Inquilino (Arrendatario) *</label>
                <select
                  required
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                >
                  <option value="">Seleccione al inquilino registrado</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} (DPI: {t.dpi})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Plazo Forzoso</label>
                  <input
                    type="text"
                    disabled
                    value="6 Meses (Calculado)"
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-blue-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Renta Mensual (Q) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Depósito de Garantía (Q) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-clean"
                >
                  Registrar Contrato y Activar Inquilino
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
