import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Payment } from '../types';
import { CreditCard, CheckCircle, FileText, Plus } from 'lucide-react';
import { ReceiptModal } from '../components/payments/ReceiptModal';
import { VoucherUploadModal } from '../components/payments/VoucherUploadModal';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);
  const [showManualPayModal, setShowManualPayModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/payments', { params });
      if (res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (error) {
      console.error('Error al consultar pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId: string, action: 'APPROVE' | 'REJECT') => {
    let notes = '';
    if (action === 'REJECT') {
      notes = prompt('Motivo del rechazo de la boleta (ej. monto no coincide o imagen borrosa):') || '';
      if (!notes) return;
    }

    try {
      await api.post(`/payments/${paymentId}/verify`, { action, notes });
      fetchPayments();
    } catch (error) {
      console.error('Error al verificar pago:', error);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="saas-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Control de Cobranza & Validación de Boletas
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registro de Pagos y Comprobantes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Conciliación de boletas de Banrural, Banco Industrial, BAC y G&T con emisión automática de recibos digitales.
          </p>
        </div>

        <button
          onClick={() => setShowManualPayModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-clean transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Pago / Boleta</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 saas-card p-2">
        {[
          { key: '', label: 'Todos los Pagos' },
          { key: 'EN_REVISION', label: '📥 Boletas por Validar', highlight: true },
          { key: 'APROBADO', label: '✓ Aprobados / Verificados' },
          { key: 'PENDIENTE', label: '⚠️ Cuotas en Mora / Pendientes' },
          { key: 'RECHAZADO', label: 'Rechazados' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === item.key
                ? 'bg-slate-900 text-white shadow-sm'
                : item.highlight
                ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Payments Ledger Table */}
      <div className="saas-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Unidad & Residente</th>
                <th className="p-4">Concepto</th>
                <th className="p-4">Monto (Q)</th>
                <th className="p-4">Fecha / Vencimiento</th>
                <th className="p-4">Banco & Referencia</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Validación / Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">Cargando pagos...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">No hay registros de pago en este filtro.</td>
                </tr>
              ) : (
                payments.map((p) => {
                  const payerName = p.user?.tenantProfile?.fullName || p.user?.ownerProfile?.fullName || p.user?.email;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="font-extrabold text-slate-900 text-sm block">
                          {p.apartment?.tower?.code}-{p.apartment?.unitNumber}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{payerName}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-700 px-2 py-0.5 rounded bg-slate-100 text-[11px]">
                          {p.concept}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-extrabold text-emerald-600 text-sm">
                          Q{p.amountGtq.toFixed(2)}
                        </span>
                      </td>

                      <td className="p-4 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-slate-500">
                            {p.paidAt ? `Pagado: ${new Date(p.paidAt).toLocaleDateString()}` : `Vence: ${new Date(p.dueDate).toLocaleDateString()}`}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-mono text-slate-900 font-medium block text-[11px]">
                          {p.voucherReference || 'Sin boleta'}
                        </span>
                        <span className="text-[10px] text-slate-400">{p.bankOrigin || 'Sin registrar'}</span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.status === 'APROBADO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'EN_REVISION'
                              ? 'bg-amber-100 text-amber-800'
                              : p.status === 'PENDIENTE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {p.status === 'EN_REVISION' ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleVerify(p.id, 'APPROVE')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Aprobar</span>
                            </button>
                            <button
                              onClick={() => handleVerify(p.id, 'REJECT')}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-semibold"
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : p.status === 'APROBADO' ? (
                          <button
                            onClick={() => setActiveReceiptId(p.id)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Ver Recibo</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
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

      {/* Modals */}
      {activeReceiptId && (
        <ReceiptModal paymentId={activeReceiptId} onClose={() => setActiveReceiptId(null)} />
      )}

      {showManualPayModal && (
        <VoucherUploadModal
          onClose={() => setShowManualPayModal(false)}
          onSuccess={() => fetchPayments()}
        />
      )}
    </div>
  );
};
