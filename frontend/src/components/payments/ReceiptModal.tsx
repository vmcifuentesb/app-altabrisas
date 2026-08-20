import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { X, Printer, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  paymentId: string;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ paymentId, onClose }) => {
  const [receiptData, setReceiptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipt();
  }, [paymentId]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/payments/${paymentId}/receipt`);
      if (res.data.success) {
        setReceiptData(res.data.receipt);
      }
    } catch (error) {
      console.error('Error al obtener recibo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Modal Top Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Comprobante Oficial de Pago</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-200/60 text-slate-500 hover:text-slate-900 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 text-slate-900 bg-white" id="printable-receipt">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Generando recibo oficial...</div>
          ) : receiptData ? (
            <div className="space-y-5">
              {/* Header with Altabrisa Logo & Details */}
              <div className="flex items-start justify-between border-b pb-4 border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">ALTABRISA</h2>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">
                    Residenciales y Apartamentos Altabrisa<br />
                    Km 24 Calle Principal Caserío La Virgen Zona 2<br />
                    Villa Canales, Guatemala &bull; PBX: 3737-3745
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">RECIBO DE CAJA</span>
                  <span className="font-mono text-xs font-black text-slate-900">{receiptData.receiptNumber}</span>
                  <span className="block mt-1 text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    ✓ APROBADO Y VERIFICADO
                  </span>
                </div>
              </div>

              {/* Payer and Unit Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Residente / Pagador:</span>
                  <strong className="text-slate-900">{receiptData.payerName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">NIT:</span>
                  <strong className="text-slate-900">{receiptData.payerNit}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Unidad Habitacional:</span>
                  <strong className="text-slate-900">Torre {receiptData.towerCode} - Apto {receiptData.unitNumber}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Fecha de Pago:</span>
                  <strong className="text-slate-900">
                    {receiptData.paidAt ? new Date(receiptData.paidAt).toLocaleDateString() : 'Hoy'}
                  </strong>
                </div>
              </div>

              {/* Amount and Concept Line Item */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-100 px-3.5 py-2 font-bold text-slate-700 flex justify-between">
                  <span>CONCEPTO DE PAGO</span>
                  <span>TOTAL (GTQ)</span>
                </div>
                <div className="p-3.5 flex justify-between items-center bg-white">
                  <div>
                    <span className="font-bold text-slate-900 block">Pago de {receiptData.concept}</span>
                    <span className="text-[11px] text-slate-500">
                      Boleta / Ref: {receiptData.voucherReference || 'Transferencia directa'} ({receiptData.bankOrigin || 'Banco'})
                    </span>
                  </div>
                  <span className="text-base font-black text-slate-900">
                    Q{receiptData.amountGtq.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* QR and Verification Seal */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <div className="flex items-center space-x-3">
                  {receiptData.qrCodeBase64 && (
                    <img
                      src={receiptData.qrCodeBase64}
                      alt="Código QR de Verificación"
                      className="w-16 h-16 rounded border border-slate-200"
                    />
                  )}
                  <div className="text-[10px] text-slate-500">
                    <p className="font-bold text-slate-800">Verificación Digital</p>
                    <p>Escanea para comprobar autenticidad con administración.</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Verificado por: {receiptData.verifiedBy || 'Admin'}</p>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 italic">
                  Documento digital emitido por Sistema Altabrisa
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-red-500 text-sm">No se pudo cargar el recibo.</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
