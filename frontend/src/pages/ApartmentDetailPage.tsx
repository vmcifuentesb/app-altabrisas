import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Apartment } from '../types';
import { ArrowLeft, User, Shield, Zap, Droplets, Wifi, DollarSign, CreditCard, Wrench, Edit3, CheckCircle } from 'lucide-react';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { ReceiptModal } from '../components/payments/ReceiptModal';

export const ApartmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);

  // Edit services state
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [powerMeter, setPowerMeter] = useState('');
  const [waterMeter, setWaterMeter] = useState('');
  const [internet, setInternet] = useState('');
  const [maintenanceFee, setMaintenanceFee] = useState('');
  const [parking, setParking] = useState('');

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/apartamentos/${id}`);
      if (res.data.success) {
        const apt = res.data.apartment;
        setApartment(apt);
        setPowerMeter(apt.powerMeterNumber || '');
        setWaterMeter(apt.waterMeterNumber || '');
        setInternet(apt.internetProvider || '');
        setMaintenanceFee(apt.maintenanceFeeGtq.toString());
        setParking(apt.parkingSpot || '');
      }
    } catch (error) {
      console.error('Error al cargar expediente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServices = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/apartamentos/${id}/services`, {
        powerMeterNumber: powerMeter,
        waterMeterNumber: waterMeter,
        internetProvider: internet,
        maintenanceFeeGtq: maintenanceFee,
        parkingSpot: parking,
      });
      setIsEditingServices(false);
      fetchDetails();
    } catch (error) {
      console.error('Error al guardar servicios:', error);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Cargando expediente 360° del apartamento...</div>;
  }

  if (!apartment) {
    return <div className="p-12 text-center text-red-500 font-bold">Apartamento no encontrado.</div>;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Back Button */}
      <Link
        to="/apartamentos"
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al Directorio de Inmuebles</span>
      </Link>

      {/* Hero Header */}
      <div className="saas-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-xl shadow-sm">
            {apartment.tower?.code}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-slate-900">
                Apartamento {apartment.tower?.code}-{apartment.unitNumber}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                Nivel 0{apartment.level}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Modelo {apartment.model?.name} ({apartment.model?.areaM2} m²) &bull; Complejo Residencial Altabrisa Villa Canales
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-right">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Estado Actual</span>
            <span className="text-sm font-extrabold text-slate-900">{apartment.status}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Active Contract & Financials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Tenant & 6-Month Contract Card */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Inquilino Actual & Contrato de 6 Meses</h2>
              </div>
              {apartment.tenant && (
                <WhatsAppButton
                  phone={apartment.tenant.phonePrimary}
                  name={apartment.tenant.fullName}
                  towerCode={apartment.tower?.code}
                  unitNumber={apartment.unitNumber}
                  amount={apartment.activeContract?.monthlyRentGtq}
                  type="RECORDATORIO_PREVIO"
                  variant="button"
                />
              )}
            </div>

            {apartment.tenant && apartment.activeContract ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Datos Personales</span>
                  <p className="font-extrabold text-slate-900 text-sm">{apartment.tenant.fullName}</p>
                  <p className="text-slate-600">DPI: {apartment.tenant.dpi}</p>
                  <p className="text-slate-600">NIT: {apartment.tenant.nit || 'CF'}</p>
                  <p className="text-slate-600">Tel: {apartment.tenant.phonePrimary}</p>
                  <p className="text-slate-600">Email: {apartment.tenant.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Términos de Arrendamiento</span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Renta Mensual:</span>
                    <strong className="text-emerald-600">Q{apartment.activeContract.monthlyRentGtq.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Depósito de Garantía:</span>
                    <strong className="text-slate-800">Q{apartment.activeContract.depositGtq.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fecha de Inicio:</span>
                    <span className="text-slate-700">{new Date(apartment.activeContract.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vencimiento (6 meses):</span>
                    <strong className="text-amber-600">{new Date(apartment.activeContract.endDate).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                Esta unidad no tiene inquilino ni contrato de arrendamiento activo actualmente.
              </div>
            )}
          </div>

          {/* Owner Financial Terms Card */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-altabrisa-500" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Perfil del Propietario & Financiamiento</h2>
              </div>
              {apartment.owner && (
                <WhatsAppButton
                  phone={apartment.owner.phonePrimary}
                  name={apartment.owner.fullName}
                  towerCode={apartment.tower?.code}
                  unitNumber={apartment.unitNumber}
                  type="GENERAL"
                  variant="compact"
                />
              )}
            </div>

            {apartment.owner ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Propietario Registrado</span>
                  <p className="font-extrabold text-slate-900 text-sm">{apartment.owner.fullName}</p>
                  <p className="text-slate-600">DPI: {apartment.owner.dpi}</p>
                  <p className="text-slate-600">NIT: {apartment.owner.nit || 'CF'}</p>
                  <p className="text-slate-600">Tel: {apartment.owner.phonePrimary}</p>
                  <p className="text-slate-600">Email: {apartment.owner.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Modalidad de Adquisición</span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipo de Compra:</span>
                    <strong className="text-altabrisa-600">{apartment.owner.purchaseMode}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Banco / Entidad:</span>
                    <span className="text-slate-700">{apartment.owner.bankName || 'Contado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cuota Bancaria Mensual:</span>
                    <strong className="text-slate-800">
                      {apartment.owner.monthlyBankQuotaGtq ? `Q${apartment.owner.monthlyBankQuotaGtq.toFixed(2)}` : 'N/A'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Saldo Estimado:</span>
                    <span className="text-slate-700">
                      {apartment.owner.estimatedBalanceGtq ? `Q${apartment.owner.estimatedBalanceGtq.toLocaleString('es-GT')}` : 'Liquidado'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">Propiedad directa de la inmobiliaria.</div>
            )}
          </div>

          {/* Payment History Ledger */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Historial de Pagos & Recibos</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Concepto</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Banco / Ref</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Recibo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {apartment.paymentHistory?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">Sin pagos registrados.</td>
                    </tr>
                  ) : (
                    apartment.paymentHistory?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{p.concept}</td>
                        <td className="p-3 font-extrabold text-slate-900">Q{p.amountGtq.toFixed(2)}</td>
                        <td className="p-3 text-slate-500">
                          {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : new Date(p.dueDate).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-[11px] font-mono text-slate-600">
                          {p.voucherReference || 'N/A'} ({p.bankOrigin || 'Directo'})
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.status === 'APROBADO'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'PENDIENTE'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {p.status === 'APROBADO' && (
                            <button
                              onClick={() => setActiveReceiptId(p.id)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold"
                            >
                              Ver Recibo
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Services & Floor Plans */}
        <div className="space-y-6">
          {/* Services & Meters Card */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-slate-700" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Servicios & Contadores</h2>
              </div>
              <button
                onClick={() => setIsEditingServices(!isEditingServices)}
                className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingServices ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            {isEditingServices ? (
              <form onSubmit={handleSaveServices} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Contador Luz EEGSA</label>
                  <input
                    type="text"
                    value={powerMeter}
                    onChange={(e) => setPowerMeter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Contador Agua Potable</label>
                  <input
                    type="text"
                    value={waterMeter}
                    onChange={(e) => setWaterMeter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Proveedor Internet</label>
                  <input
                    type="text"
                    value={internet}
                    onChange={(e) => setInternet(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Cuota Mantenimiento (Q)</label>
                  <input
                    type="number"
                    value={maintenanceFee}
                    onChange={(e) => setMaintenanceFee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Guardar Cambios
                </button>
              </form>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" /> Contador EEGSA:
                  </span>
                  <strong className="text-slate-900 font-mono">{apartment.powerMeterNumber || 'N/R'}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-blue-500" /> Contador Agua:
                  </span>
                  <strong className="text-slate-900 font-mono">{apartment.waterMeterNumber || 'N/R'}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Wifi className="w-4 h-4 text-purple-500" /> Internet:
                  </span>
                  <span className="text-slate-900 font-medium">{apartment.internetProvider || 'N/R'}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> Mantenimiento:
                  </span>
                  <strong className="text-emerald-700 font-bold">Q{apartment.maintenanceFeeGtq.toFixed(2)}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Model Floor Plan Card */}
          <div className="saas-card p-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Plano de Distribución: Modelo {apartment.model?.name}
            </h3>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2">
              <img
                src={apartment.model?.floorPlanImage || '/assets/images/tab-1-roma.jpg'}
                alt={`Plano Modelo ${apartment.model?.name}`}
                className="w-full h-44 object-cover rounded-xl"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {apartment.model?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {activeReceiptId && (
        <ReceiptModal
          paymentId={activeReceiptId}
          onClose={() => setActiveReceiptId(null)}
        />
      )}
    </div>
  );
};
