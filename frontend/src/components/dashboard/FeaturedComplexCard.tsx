import React from 'react';
import { Home, Calendar, MapPin, DollarSign, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturedComplexCard: React.FC = () => {
  return (
    <div className="saas-card p-5 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: High-Res Real Estate Photo */}
        <div className="md:col-span-5 h-48 sm:h-52 rounded-2xl overflow-hidden relative group">
          <img
            src="/assets/images/slide-proyecto.jpg"
            alt="Residenciales Altabrisa"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
            Complejo Altabrisa
          </div>
        </div>

        {/* Right: Key Details (Renzo Style) */}
        <div className="md:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
              Resumen General del Complejo
            </h4>
            <Link
              to="/torres"
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              Explorar <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Home className="w-3.5 h-3.5" />
              </div>
              <p>
                <span className="font-semibold text-slate-900">Capacidad Total:</span> 10 Torres Operativas (176 Unidades)
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <p>
                <span className="font-semibold text-slate-900">Ciclo de Arrendamiento:</span> Contratos Semestrales (6 Meses)
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <p className="truncate">
                <span className="font-semibold text-slate-900">Ubicación:</span> Km 24 Calle Principal Zona 2, Villa Canales
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <p>
                <span className="font-semibold text-slate-900">Modelos Habitacionales:</span> Roma (21m²), Milán (45m²), Turín (60m²)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
