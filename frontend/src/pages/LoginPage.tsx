import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('duena@altabrisa.gt');
  const [password, setPassword] = useState('Altabrisa2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Error al iniciar sesión.');
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('Altabrisa2026!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Soft Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-altabrisa-500 to-amber-500 text-white font-display font-black text-xl shadow-clean-md">
            AB
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ALTABRISA
            </h1>
            <p className="text-xs text-slate-500 font-medium">Gestión Residencial & Inmobiliaria</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="saas-card p-6 sm:p-8 shadow-clean-lg space-y-5 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
              Iniciar Sesión
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">Villa Canales, GT</span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Correo Electrónico</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-medium"
                  placeholder="usuario@altabrisa.gt"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-medium"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs shadow-clean transition-all flex items-center justify-center space-x-1.5"
            >
              <span>{loading ? 'Ingresando...' : 'Acceder al Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="font-display text-[10px] text-slate-400 uppercase font-bold tracking-wider block text-center">
              Acceso Rápido por Rol
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('duena@altabrisa.gt')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <strong className="font-display text-altabrisa-600 block font-bold">👑 Dueña</strong>
                <span className="text-[10px] text-slate-500 truncate block">duena@altabrisa.gt</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('vendedor@altabrisa.gt')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <strong className="font-display text-blue-600 block font-bold">👔 Gestor</strong>
                <span className="text-[10px] text-slate-500 truncate block">vendedor@altabrisa.gt</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('carlos.mendoza@gmail.com')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <strong className="font-display text-slate-800 block font-bold">🏠 Dueño</strong>
                <span className="text-[10px] text-slate-500 truncate block">carlos.mendoza@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('juan.perez@inquilino.gt')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <strong className="font-display text-emerald-600 block font-bold">🔑 Inquilino</strong>
                <span className="text-[10px] text-slate-500 truncate block">juan.perez@...</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-slate-400 text-[11px] space-y-1 font-medium">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sistema Seguro con Autenticación JWT y Roles RBAC</span>
          </p>
          <p>&copy; 2026 Residenciales Altabrisa.</p>
        </div>
      </div>
    </div>
  );
};
