import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, LogOut, Phone, Menu, Check, Clock, AlertTriangle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const { user, logout, notifications, unreadCount, markNotificationRead } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Dueña / Administradora';
      case 'ADMIN': return 'Gestión Inmobiliaria';
      case 'OWNER': return 'Propietario / Dueño';
      case 'TENANT': return 'Inquilino Residente';
      default: return 'Usuario Altabrisa';
    }
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-clean">
      {/* Left: Mobile Hamburger Menu & Breadcrumb */}
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden"
          title="Abrir Menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Title */}
        <Link to="/" className="flex items-center space-x-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-altabrisa-500 to-amber-500 flex items-center justify-center font-display font-bold text-white text-xs">
            AB
          </div>
          <span className="font-display font-extrabold text-slate-900 text-sm">Altabrisa</span>
        </Link>

        {/* Desktop Breadcrumb */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500">
          <span className="font-display font-bold text-slate-900">Altabrisa Residencial</span>
          <span>/</span>
          <span className="text-slate-500">Villa Canales, Guatemala</span>
        </div>
      </div>

      {/* Right Controls: PBX, Notifications & User */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* PBX Support Pill */}
        <a
          href="tel:37373745"
          className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-altabrisa-500" />
          <span className="font-semibold">PBX: 3737-3745</span>
        </a>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition-colors"
            title="Notificaciones y Alertas"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-altabrisa-500" />
                  <h3 className="font-display font-bold text-xs text-slate-900">Notificaciones</h3>
                </div>
                <span className="text-[11px] text-slate-500">{unreadCount} nuevas</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">No tienes notificaciones pendientes.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.isRead ? 'bg-orange-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          {n.type === 'ALERT' && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                          {n.type === 'WARNING' && <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          {n.type === 'SUCCESS' && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-altabrisa-500 shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2.5 p-1 sm:pl-3 sm:pr-2 sm:py-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <div className="hidden sm:block text-right">
              <p className="font-display text-xs font-bold text-slate-900 leading-tight">{user?.name || 'Usuario'}</p>
              <p className="text-[10px] text-slate-500 font-medium">{getRoleLabel(user?.role)}</p>
            </div>
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-altabrisa-500 to-amber-500 text-white font-display font-bold flex items-center justify-center text-xs shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-xs">
              <div className="p-2 border-b border-slate-100 mb-1">
                <p className="font-display font-bold text-slate-900">{user?.name}</p>
                <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2 p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
