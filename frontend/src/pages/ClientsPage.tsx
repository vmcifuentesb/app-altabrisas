import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { OwnerProfile, TenantProfile } from '../types';
import { Users, Search, Shield, User, Plus } from 'lucide-react';
import { WhatsAppButton } from '../components/common/WhatsAppButton';

export const ClientsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'owners' | 'tenants'>('owners');
  const [owners, setOwners] = useState<OwnerProfile[]>([]);
  const [tenants, setTenants] = useState<TenantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dpi, setDpi] = useState('');
  const [nit, setNit] = useState('');
  const [phonePrimary, setPhonePrimary] = useState('');
  const [purchaseMode, setPurchaseMode] = useState('CONTADO');
  const [bankName, setBankName] = useState('');
  const [monthlyBankQuota, setMonthlyBankQuota] = useState('');

  useEffect(() => {
    fetchClients();
  }, [activeTab]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      if (activeTab === 'owners') {
        const res = await api.get('/clients/owners');
        if (res.data.success) setOwners(res.data.owners);
      } else {
        const res = await api.get('/clients/tenants');
        if (res.data.success) setTenants(res.data.tenants);
      }
    } catch (error) {
      console.error('Error al consultar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'owners') {
        await api.post('/clients/owners', {
          fullName,
          email,
          dpi,
          nit,
          phonePrimary,
          purchaseMode,
          bankName: purchaseMode !== 'CONTADO' ? bankName : undefined,
          monthlyBankQuotaGtq: monthlyBankQuota ? parseFloat(monthlyBankQuota) : undefined,
        });
      } else {
        await api.post('/clients/tenants', {
          fullName,
          email,
          dpi,
          nit,
          phonePrimary,
        });
      }

      setShowAddModal(false);
      setFullName('');
      setEmail('');
      setDpi('');
      setNit('');
      setPhonePrimary('');
      fetchClients();
    } catch (error) {
      console.error('Error al registrar cliente:', error);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="saas-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Directorio de Residentes & Clientes
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Propietarios e Inquilinos</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de datos de contacto, financiamiento bancario, DPI, NIT y comunicación rápida por WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-clean transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar {activeTab === 'owners' ? 'Propietario' : 'Inquilino'}</span>
        </button>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 saas-card p-3.5">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('owners')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'owners'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-altabrisa-500" />
            <span>Propietarios (Dueños)</span>
          </button>
          <button
            onClick={() => setActiveTab('tenants')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'tenants'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-blue-600" />
            <span>Inquilinos (Arrendatarios)</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nombre, DPI o teléfono..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">Cargando directorio...</div>
        ) : activeTab === 'owners' ? (
          owners.map((owner) => (
            <div
              key={owner.id}
              className="saas-card saas-card-hover p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{owner.fullName}</h3>
                    <span className="text-[10px] text-altabrisa-600 font-bold px-2 py-0.5 rounded-md bg-orange-50 border border-orange-100 inline-block mt-1">
                      {owner.purchaseMode}
                    </span>
                  </div>
                  <WhatsAppButton
                    phone={owner.phonePrimary}
                    name={owner.fullName}
                    type="GENERAL"
                    variant="icon"
                  />
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">DPI / NIT:</span>
                    <span className="font-medium text-slate-800">{owner.dpi} {owner.nit ? `| ${owner.nit}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Teléfono:</span>
                    <span className="font-medium text-slate-800">{owner.phonePrimary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Correo:</span>
                    <span className="truncate max-w-[150px]">{owner.email}</span>
                  </div>
                  {owner.bankName && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Banco:</span>
                      <span className="font-medium text-slate-800">{owner.bankName}</span>
                    </div>
                  )}
                  {owner.monthlyBankQuotaGtq && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cuota Banco:</span>
                      <strong className="text-slate-900">Q{owner.monthlyBankQuotaGtq.toFixed(2)}/mes</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Units Owned */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Apartamentos Asociados:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {owner.ownerContracts && owner.ownerContracts.length > 0 ? (
                    owner.ownerContracts.map((c: any) => (
                      <span
                        key={c.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200"
                      >
                        {c.apartment?.tower?.code}-{c.apartment?.unitNumber}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Sin unidad asignada</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="saas-card saas-card-hover p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{tenant.fullName}</h3>
                    <span className="text-[10px] text-blue-600 font-bold px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 inline-block mt-1">
                      Inquilino Activo
                    </span>
                  </div>
                  <WhatsAppButton
                    phone={tenant.phonePrimary}
                    name={tenant.fullName}
                    type="RECORDATORIO_PREVIO"
                    variant="icon"
                  />
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">DPI / NIT:</span>
                    <span className="font-medium text-slate-800">{tenant.dpi} {tenant.nit ? `| ${tenant.nit}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Teléfono:</span>
                    <span className="font-medium text-slate-800">{tenant.phonePrimary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Correo:</span>
                    <span className="truncate max-w-[150px]">{tenant.email}</span>
                  </div>
                  {tenant.workplace && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lugar Trabajo:</span>
                      <span className="truncate max-w-[140px] text-slate-700">{tenant.workplace}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Lease Info */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Renta Mensual:</span>
                  <strong className="text-emerald-600 font-bold">
                    {tenant.tenantContracts?.[0] ? `Q${tenant.tenantContracts[0].monthlyRentGtq.toFixed(2)}` : 'N/A'}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Fin Contrato (6m):</span>
                  <strong className="text-amber-600 font-bold">
                    {tenant.tenantContracts?.[0]?.endDate ? new Date(tenant.tenantContracts[0].endDate).toLocaleDateString() : 'N/A'}
                  </strong>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Registrar Nuevo {activeTab === 'owners' ? 'Propietario' : 'Inquilino'}
            </h3>
            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="Ej. Juan Carlos Morales"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">DPI *</label>
                  <input
                    type="text"
                    required
                    value={dpi}
                    onChange={(e) => setDpi(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                    placeholder="2548 78912 0101"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">NIT</label>
                  <input
                    type="text"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                    placeholder="4587962-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Teléfono Principal *</label>
                  <input
                    type="tel"
                    required
                    value={phonePrimary}
                    onChange={(e) => setPhonePrimary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    placeholder="+502 5487-1234"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    placeholder="correo@ejemplo.gt"
                  />
                </div>
              </div>

              {activeTab === 'owners' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Modalidad de Compra</label>
                      <select
                        value={purchaseMode}
                        onChange={(e) => setPurchaseMode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                      >
                        <option value="CONTADO">Contado</option>
                        <option value="HIPOTECA_BANCO">Hipoteca Banco</option>
                        <option value="HIPOTECA_FHA">Hipoteca FHA</option>
                        <option value="PRESTAMO_DIRECTO">Préstamo Directo</option>
                      </select>
                    </div>
                    {purchaseMode !== 'CONTADO' && (
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Banco</label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                          placeholder="Ej. Banco Industrial"
                        />
                      </div>
                    )}
                  </div>

                  {purchaseMode !== 'CONTADO' && (
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Cuota Mensual del Banco (Q)</label>
                      <input
                        type="number"
                        value={monthlyBankQuota}
                        onChange={(e) => setMonthlyBankQuota(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                        placeholder="2850.00"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Guardar y Crear Acceso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
