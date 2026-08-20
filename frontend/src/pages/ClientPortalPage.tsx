import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Home, CreditCard, UploadCloud, Edit3, CheckCircle, ArrowLeft, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VoucherUploadModal } from '../components/payments/VoucherUploadModal';
import { ReceiptModal } from '../components/payments/ReceiptModal';

export const ClientPortalPage: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';

  const [apartments, setApartments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);

  // Solicitud de cambio de perfil
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [fieldName, setFieldName] = useState('phonePrimary');
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  useEffect(() => {
    fetchPortalData();
  }, [user]);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const [aptRes, payRes] = await Promise.all([
        api.get('/apartamentos'),
        api.get('/payments'),
      ]);

      if (aptRes.data.success) {
        const myApts = aptRes.data.apartments.filter((a: any) =>
          isOwner
            ? a.owner?.id === user?.ownerProfile?.id
            : a.tenant?.id === user?.tenantProfile?.id
        );
        setApartments(myApts);
      }

      if (payRes.data.success) {
        const myPayments = payRes.data.payments.filter((p: any) => p.userId === user?.id);
        setPayments(myPayments);
      }
    } catch (error) {
      console.error('Error al cargar portal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/requests', { fieldName, newValue, reason });
      if (res.data.success) {
        setChangeSuccess(true);
        setTimeout(() => {
          setShowChangeModal(false);
          setChangeSuccess(false);
          setNewValue('');
          setReason('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
    }
  };

  const profile = isOwner ? user?.ownerProfile : user?.tenantProfile;

  return (
    <div className="space-y-6 pb-16 w-full animate-fadeIn">
      {/* Navigation Breadcrumb / Back to Dashboard */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver al Dashboard General</span>
        </Link>

        <Link
          to="/torres"
          className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Ver Mapa de 10 Torres</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="saas-card p-6 sm:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="font-display text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600 inline-block mb-2 shadow-clean">
            {isOwner ? '👑 Portal de Propietario' : '🔑 Portal de Inquilino Residente'}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bienvenido, {profile?.fullName || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Consulta el estado de tu inmueble, contratos vigentes, cuotas de mantenimiento y sube tus comprobantes de pago.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowVoucherModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-display font-bold text-white text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Subir Boleta de Pago</span>
          </button>
          <button
            onClick={() => setShowChangeModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 text-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            <span>Solicitar Cambio de Datos</span>
          </button>
        </div>
      </div>

      {/* 2-Column Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Apartments and Payments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Apartments List */}
          <div className="saas-card p-6 space-y-4">
            <h2 className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-600" />
              {isOwner ? 'Mis Apartamentos Adquiridos' : 'Mi Apartamento en Arrendamiento'}
            </h2>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs animate-pulse">Cargando información...</div>
            ) : apartments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                No tienes apartamentos vinculados actualmente. Contacta a administración Altabrisa.
              </div>
            ) : (
              apartments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 saas-card-hover"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-black text-slate-900">
                        Torre {apt.towerCode} - Apto {apt.unitNumber}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Modelo {apt.model?.name} ({apt.model?.areaM2} m²) &bull; Nivel 0{apt.level}
                      </p>
                    </div>
                    <span className="font-display text-xs px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-800">
                      {apt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-3 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 block font-medium">Cuota Mantenimiento:</span>
                      <strong className="font-display text-slate-900 text-sm">Q{apt.maintenanceFeeGtq.toFixed(2)}/mes</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Contador EEGSA (Luz):</span>
                      <span className="text-amber-600 font-mono font-bold">{apt.powerMeterNumber || 'N/R'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Contador Agua:</span>
                      <span className="text-blue-600 font-mono font-bold">{apt.waterMeterNumber || 'N/R'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment History */}
          <div className="saas-card p-6 space-y-4">
            <h2 className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Historial de Pagos y Boletas Registradas
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-display uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3">Concepto</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">Fecha / Ref</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Recibo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">Sin pagos registrados aún.</td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-display font-bold text-slate-900">{p.concept}</td>
                        <td className="p-3 font-display font-extrabold text-slate-900">Q{p.amountGtq.toFixed(2)}</td>
                        <td className="p-3 text-slate-500">
                          {p.voucherReference || 'N/A'} ({p.bankOrigin || 'Transferencia'})
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-display text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              p.status === 'APROBADO'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'EN_REVISION'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.status === 'EN_REVISION' ? 'En Verificación' : p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {p.status === 'APROBADO' ? (
                            <button
                              onClick={() => setActiveReceiptId(p.id)}
                              className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-display font-bold transition-colors"
                            >
                              Ver Recibo
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
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

        {/* Right Col: Profile Info and Bank Accounts */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="saas-card p-6 space-y-4 text-xs">
            <h3 className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">Mis Datos Personales</h3>
            <div className="space-y-2.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Nombre:</span>
                <strong className="font-display text-slate-900">{profile?.fullName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">DPI:</span>
                <span>{profile?.dpi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">NIT:</span>
                <span>{profile?.nit || 'CF'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Teléfono:</span>
                <span>{profile?.phonePrimary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Correo:</span>
                <span className="truncate max-w-[140px]">{profile?.email}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 italic">
              🔒 Por seguridad, las modificaciones a tus datos de perfil requieren aprobación de la administración.
            </p>
          </div>

          {/* Official Bank Accounts for Payment */}
          <div className="saas-card p-6 space-y-3 text-xs">
            <h3 className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">Cuentas Bancarias de Altabrisa</h3>
            <p className="text-[11px] text-slate-500 font-medium">Deposita tu cuota de renta o mantenimiento a:</p>

            <div className="space-y-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-display font-bold text-blue-700 block">Banco Industrial (BI)</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">Monetaria: 014-0089452-1</p>
                <span className="text-[10px] text-slate-500">Inmobiliaria Altabrisa S.A.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-display font-bold text-emerald-700 block">Banrural</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">Monetaria: 3412-005678-9</p>
                <span className="text-[10px] text-slate-500">Inmobiliaria Altabrisa S.A.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showVoucherModal && (
        <VoucherUploadModal
          apartmentId={apartments[0]?.id || ''}
          onClose={() => setShowVoucherModal(false)}
          onSuccess={() => fetchPortalData()}
        />
      )}

      {activeReceiptId && (
        <ReceiptModal paymentId={activeReceiptId} onClose={() => setActiveReceiptId(null)} />
      )}

      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl animate-scaleIn">
            <h3 className="font-display text-base font-extrabold text-slate-900">Solicitar Modificación de Datos de Perfil</h3>
            {changeSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Solicitud enviada. La administración revisará y autorizará el cambio a la brevedad.</span>
              </div>
            ) : (
              <form onSubmit={handleRequestChange} className="space-y-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Dato a Actualizar *</label>
                  <select
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                  >
                    <option value="phonePrimary">Teléfono Principal</option>
                    <option value="phoneSecondary">Teléfono Secundario</option>
                    <option value="email">Correo Electrónico</option>
                    <option value="emergencyContact">Contacto de Emergencia</option>
                    <option value="nit">NIT de Facturación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nuevo Valor *</label>
                  <input
                    type="text"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    placeholder="Escribe el nuevo número, correo o dato..."
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Motivo del Cambio</label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    placeholder="Ej. Cambio de línea corporativa..."
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowChangeModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold shadow-clean"
                  >
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
