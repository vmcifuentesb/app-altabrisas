import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  FileText,
  CreditCard,
  ShieldCheck,
  UserCheck,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarLink {
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const isAdminOrSuper = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  // Navigation Links for Admins / SuperAdmins
  const adminLinks: SidebarLink[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/torres', label: 'Mapa de Torres (A1..D2)', icon: Building2 },
    { to: '/apartamentos', label: 'Directorio Inmuebles', icon: Home },
    { to: '/clientes', label: 'Directorio Clientes', icon: Users },
    { to: '/contratos', label: 'Contratos (6 Meses)', icon: FileText },
    { to: '/pagos', label: 'Control de Pagos', icon: CreditCard },
    { to: '/auditoria-solicitudes', label: 'Autorizaciones', icon: ShieldCheck },
  ];

  // Navigation Links for Owners & Tenants (Includes Dashboard return!)
  const clientLinks: SidebarLink[] = [
    { to: '/', label: 'Dashboard General', icon: LayoutDashboard, exact: true },
    { to: '/portal-cliente', label: 'Mi Portal Residente', icon: UserCheck },
    { to: '/torres', label: 'Mapa de Torres (A1..D2)', icon: Building2 },
    { to: '/mis-pagos', label: 'Mis Pagos & Boletas', icon: CreditCard },
  ];

  const links = isAdminOrSuper ? adminLinks : clientLinks;

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      {/* Top Header & Navigation Links */}
      <div className="space-y-5">
        {/* Clickable Brand Header (Always returns to Dashboard) */}
        <div className="flex items-center justify-between px-1">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="flex items-center space-x-3 group transition-transform hover:scale-[1.02]"
            title="Ir al Dashboard General"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-altabrisa-500 to-amber-500 flex items-center justify-center font-display font-black text-white text-base shadow-sm group-hover:shadow-glow-orange transition-shadow">
              AB
            </div>
            <div>
              <h2 className="font-display text-base font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                Altabrisa
              </h2>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">
                Residencial & Inmobiliaria
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 md:hidden hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'
                      }`}
                    />
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Fixed Bottom Controls */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <Link
          to="/torres"
          onClick={handleLinkClick}
          className="block p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 space-y-1 transition-all group"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-display font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              10 Torres Activas
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-[10px] text-slate-500">
            Fase 1: A1..A5, B1..B2, C1..C2, D1..D2
          </p>
        </Link>

        <button
          onClick={() => {
            logout();
            handleLinkClick();
          }}
          className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 fixed left-0 top-0 bottom-0 h-screen bg-white border-r border-slate-200/80 z-30 p-5 shadow-clean overflow-hidden">
        {sidebarContent}
      </aside>

      {/* 2. Mobile / Tablet Slide-over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fadeIn">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          ></div>

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white p-5 shadow-2xl z-50 flex flex-col justify-between animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
