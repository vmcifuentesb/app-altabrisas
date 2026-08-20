import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ProfileChangeRequest } from '../types';
import { ShieldAlert, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export const AuditRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ProfileChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests');
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string, action: 'APPROVE' | 'REJECT') => {
    let adminNotes = '';
    if (action === 'REJECT') {
      adminNotes = prompt('Motivo del rechazo de la solicitud:') || '';
      if (!adminNotes) return;
    }

    try {
      await api.post(`/requests/${id}/resolve`, { action, adminNotes });
      fetchRequests();
    } catch (error) {
      console.error('Error al resolver solicitud:', error);
    }
  };

  const getFieldLabel = (fieldName: string) => {
    switch (fieldName) {
      case 'phonePrimary': return 'Teléfono Principal';
      case 'phoneSecondary': return 'Teléfono Secundario';
      case 'email': return 'Correo Electrónico';
      case 'emergencyContact': return 'Contacto de Emergencia';
      case 'nit': return 'NIT Facturación';
      default: return fieldName;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="saas-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Auditoría & Seguridad de Datos
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Autorizaciones de Modificación de Perfil</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Todo cambio de datos personales solicitado por propietarios o inquilinos debe ser aprobado por la administración.
          </p>
        </div>
      </div>

      {/* Requests List */}
      <div className="saas-card overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
          Cola de Solicitudes Pendientes de Autorización
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Cargando solicitudes...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No hay solicitudes pendientes de autorización en este momento.
            </div>
          ) : (
            requests.map((r) => {
              const userName = r.user?.tenantProfile?.fullName || r.user?.ownerProfile?.fullName || r.user?.email;

              return (
                <div key={r.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{userName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({r.user?.email})</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'PENDIENTE'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'APROBADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-slate-700">
                      <span className="font-semibold text-blue-600">{getFieldLabel(r.fieldName)}:</span>
                      <span className="line-through text-slate-400">{r.oldValue || '(Vacío)'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                      <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {r.newValue}
                      </strong>
                    </div>

                    {r.reason && (
                      <p className="text-[11px] text-slate-500 italic">Motivo: "{r.reason}"</p>
                    )}
                  </div>

                  {r.status === 'PENDIENTE' ? (
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleResolve(r.id, 'APPROVE')}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Aprobar Cambio</span>
                      </button>
                      <button
                        onClick={() => handleResolve(r.id, 'REJECT')}
                        className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-semibold transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Resuelto el {r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
