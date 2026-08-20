import React, { useState } from 'react';
import { Apartment, ApartmentStatus } from '../../types';
import { X, User, Shield, Zap, Droplets, Wifi, DollarSign, ExternalLink } from 'lucide-react';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface QuickViewModalProps {
  apartment: Apartment;
  towerCode: string;
  onClose: () => void;
  onRefresh: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  apartment,
  towerCode,
  onClose,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'people' | 'services'>('info');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: ApartmentStatus) => {
    try {
      setUpdatingStatus(true);
      await api.patch(`/apartamentos/${apartment.id}/status`, { status: newStatus });
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-base shadow-sm">
              {towerCode}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Apartamento {towerCode}-{apartment.unitNumber}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-semibold">
                  Nivel 0{apartment.level}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Modelo {apartment.model.name} &bull; {apartment.model.areaM2} m² &bull; Parqueo: {apartment.parkingSpot || 'Asignado'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-slate-200/60 text-slate-500 hover:text-slate-900 transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-5 text-xs font-semibold">
          {[
            { id: 'info', label: 'Resumen' },
            { id: 'people', label: 'Dueño & Inquilino' },
            { id: 'services', label: 'Servicios & Contadores' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* TAB 1: General Info */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Status and Action banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Estado de la Unidad</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-extrabold text-slate-900 text-sm">{apartment.status}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleStatusChange('DISPONIBLE')}
                    disabled={updatingStatus}
                    className="text-xs px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold transition-colors"
                  >
                    Disponible
                  </button>
                  <button
                    onClick={() => handleStatusChange('MANTENIMIENTO')}
                    disabled={updatingStatus}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors"
                  >
                    Mantenimiento
                  </button>
                </div>
              </div>

              {/* Quick Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 uppercase font-medium">Cuota Mantenimiento</span>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">Q{apartment.maintenanceFeeGtq.toFixed(2)}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 uppercase font-medium">Renta Vigente</span>
                  <p className="text-sm font-extrabold text-emerald-600 mt-0.5">
                    {apartment.activeContract ? `Q${apartment.activeContract.monthlyRentGtq.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 uppercase font-medium">Ciclo Contrato</span>
                  <p className="text-sm font-extrabold text-blue-600 mt-0.5">
                    {apartment.activeContract ? '6 Meses' : 'Sin Contrato'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: People (Owner & Tenant) */}
          {activeTab === 'people' && (
            <div className="space-y-4">
              {/* Tenant Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <User className="w-4 h-4" /> Inquilino Actual (Arrendatario)
                  </span>
                  {apartment.tenant && (
                    <WhatsAppButton
                      phone={apartment.tenant.phonePrimary}
                      name={apartment.tenant.fullName}
                      towerCode={towerCode}
                      unitNumber={apartment.unitNumber}
                      amount={apartment.activeContract?.monthlyRentGtq}
                      type={apartment.status === 'MORA' ? 'AVISO_MORA' : 'RECORDATORIO_PREVIO'}
                      variant="compact"
                    />
                  )}
                </div>

                {apartment.tenant ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <span className="text-slate-500">Nombre Completo:</span>
                      <p className="font-bold text-slate-900">{apartment.tenant.fullName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">DPI / NIT:</span>
                      <p className="text-slate-700">{apartment.tenant.dpi} {apartment.tenant.nit ? `| NIT: ${apartment.tenant.nit}` : ''}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Teléfono:</span>
                      <p className="text-slate-700">{apartment.tenant.phonePrimary}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Vencimiento (6 meses):</span>
                      <p className="text-amber-700 font-bold">
                        {apartment.activeContract?.endDate ? new Date(apartment.activeContract.endDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">No hay un inquilino asignado actualmente.</p>
                )}
              </div>

              {/* Owner Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-altabrisa-500" /> Propietario (Dueño)
                  </span>
                  {apartment.owner && (
                    <WhatsAppButton
                      phone={apartment.owner.phonePrimary}
                      name={apartment.owner.fullName}
                      towerCode={towerCode}
                      unitNumber={apartment.unitNumber}
                      type="GENERAL"
                      variant="compact"
                    />
                  )}
                </div>

                {apartment.owner ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <span className="text-slate-500">Propietario:</span>
                      <p className="font-bold text-slate-900">{apartment.owner.fullName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Modalidad Compra:</span>
                      <p className="text-altabrisa-600 font-bold">{apartment.owner.purchaseMode}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Banco Financista:</span>
                      <p className="text-slate-700">{apartment.owner.bankName || 'Contado'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Cuota Bancaria:</span>
                      <p className="text-slate-700">
                        {apartment.owner.monthlyBankQuotaGtq ? `Q${apartment.owner.monthlyBankQuotaGtq.toFixed(2)}/mes` : 'N/A'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">Propiedad de la inmobiliaria.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Services & Meters */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-500">Contador EEGSA (Luz):</span>
                  <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {apartment.powerMeterNumber || 'No registrado'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-500">Contador Agua Potable:</span>
                  <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {apartment.waterMeterNumber || 'No registrado'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-500">Proveedor Internet:</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {apartment.internetProvider || 'Instalación pendiente'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-500">Cuota Mantenimiento:</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    Q{apartment.maintenanceFeeGtq.toFixed(2)} / mes
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <Link
            to={`/apartamentos/${apartment.id}`}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <span>Ver Expediente Técnico 360°</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
