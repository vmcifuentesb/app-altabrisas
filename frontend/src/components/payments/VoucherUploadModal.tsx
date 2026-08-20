import React, { useState } from 'react';
import api from '../../services/api';
import { X, UploadCloud, AlertCircle } from 'lucide-react';
import { PaymentConcept } from '../../types';

interface VoucherUploadModalProps {
  apartmentId?: string;
  contractId?: string;
  defaultAmount?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const VoucherUploadModal: React.FC<VoucherUploadModalProps> = ({
  apartmentId = '',
  contractId = '',
  defaultAmount = 2400,
  onClose,
  onSuccess,
}) => {
  const [aptId, setAptId] = useState(apartmentId);
  const [concept, setConcept] = useState<PaymentConcept>('RENTA');
  const [amountGtq, setAmountGtq] = useState(defaultAmount.toString());
  const [bankOrigin, setBankOrigin] = useState('Banco Industrial (BI)');
  const [voucherReference, setVoucherReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherReference || !amountGtq || !aptId) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/payments/submit-voucher', {
        apartmentId: aptId,
        contractId: contractId || undefined,
        concept,
        amountGtq: parseFloat(amountGtq),
        bankOrigin,
        voucherReference,
        notes,
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar comprobante.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Subir Comprobante de Pago</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white text-slate-400 hover:text-slate-900 shadow-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Concepto de Pago</label>
            <select
              value={concept}
              onChange={(e) => setConcept(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="RENTA">Alquiler Mensual (Renta)</option>
              <option value="MANTENIMIENTO">Cuota de Mantenimiento Altabrisa</option>
              <option value="AGUA">Servicio de Agua Potable</option>
              <option value="LUZ">Servicio de Energía Eléctrica (EEGSA)</option>
              <option value="INTERNET">Servicio de Internet</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Monto Pagado (Q)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amountGtq}
                onChange={(e) => setAmountGtq(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="2400.00"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Banco Emisor</label>
              <select
                value={bankOrigin}
                onChange={(e) => setBankOrigin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Banco Industrial (BI)">Banco Industrial (BI)</option>
                <option value="Banrural">Banrural</option>
                <option value="BAC Credomatic">BAC Credomatic</option>
                <option value="Banco G&T Continental">G&T Continental</option>
                <option value="Interbanco">Interbanco</option>
                <option value="Otro">Otro Banco / Depósito</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              No. de Boleta / Referencia de Transferencia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={voucherReference}
              onChange={(e) => setVoucherReference(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Ej. TRANS-88495612"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Observaciones / Comentarios</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Ej. Pago correspondiente a la renta del mes de Agosto."
            ></textarea>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs shadow-clean transition-colors"
            >
              {loading ? 'Enviando comprobante...' : 'Enviar para Verificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
