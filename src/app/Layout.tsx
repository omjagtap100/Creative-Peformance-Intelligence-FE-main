import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../features/auth/AuthContext';
import { DemoBadge } from '../features/demo/DemoBadge';
import {
  Layers,
  Sparkles,
  FileCheck,
  Users,
  Palette,
  LogOut,
  Shield,
  UserCheck,
  Eye,
  Menu,
  X,
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/creatives', label: 'Creatives', icon: Layers },
    { to: '/recommendations', label: 'Recommendations', icon: FileCheck },
    { to: '/generations', label: 'Generations', icon: Sparkles },
    { to: '/crm', label: 'CRM', icon: Users },
    { to: '/brand', label: 'Brand Kit', icon: Palette },
  ];

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Shield className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            Admin
          </span>
        );
      case 'analyst':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <UserCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            Analyst
          </span>
        );
      case 'viewer':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-300">
            <Eye className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            Viewer
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-amber-500/30 overflow-x-hidden">
      {/* Top Accent Strip */}
      <div className="h-1 bg-gradient-to-r from-slate-900 via-amber-500 to-slate-900 w-full" />

      {/* Main App Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-6 shrink-0">
              <NavLink to="/creatives" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0 border border-amber-500/30">
                  <span className="font-display font-bold text-amber-400 text-sm tracking-wider">CPI</span>
                </div>
                <div className="hidden sm:block">
                  <div className="font-display font-bold text-stone-900 text-sm leading-none group-hover:text-amber-700 transition-colors">
                    Creative Intelligence
                  </div>
                  <div className="text-[10px] font-medium text-stone-400 mt-0.5">
                    Aura Lifestyle
                  </div>
                </div>
              </NavLink>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Right Header Area */}
            <div className="flex items-center gap-3 shrink-0">
              <DemoBadge />

              {/* User Session Info */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="text-right max-w-[130px] truncate">
                  <div className="text-xs font-bold text-stone-900 truncate">
                    {user?.display_name || user?.email}
                  </div>
                </div>
                {getRoleBadge()}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-1.5 rounded-lg text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg text-stone-700 hover:bg-stone-100 border border-stone-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-4 space-y-2 shadow-lg"
            >
              <div className="flex items-center justify-between py-1.5 border-b border-stone-100 mb-2">
                <div className="text-xs font-bold text-stone-900">
                  {user?.display_name || user?.email}
                </div>
                {getRoleBadge()}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                          isActive
                            ? 'bg-slate-900 text-white'
                            : 'text-stone-700 hover:bg-stone-100'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-3.5 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-stone-800">Aura Lifestyle</span>
            <span>•</span>
            <span>Creative Performance Intelligence</span>
          </div>
          <div className="text-stone-400 text-[11px]">
            Role: <strong className="capitalize text-stone-700">{role}</strong>
          </div>
        </div>
      </footer>
    </div>
  );
};
