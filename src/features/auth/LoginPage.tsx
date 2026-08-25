import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';
import {
  Lock,
  Mail,
  Shield,
  UserCheck,
  Eye,
  AlertCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Store,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/creatives';

  const [email, setEmail] = useState('admin@cpi.demo');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    {
      role: 'admin' as const,
      email: 'admin@cpi.demo',
      password: 'Admin123!',
      label: 'Admin (Full Access)',
      desc: 'Analyse, Recommend, Generate + Approve/Reject',
      icon: Shield,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      role: 'analyst' as const,
      email: 'analyst@cpi.demo',
      password: 'Analyst123!',
      label: 'Growth Analyst',
      desc: 'Run ARG pipeline, update CRM lead stages',
      icon: UserCheck,
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    {
      role: 'viewer' as const,
      email: 'viewer@cpi.demo',
      password: 'Viewer123!',
      label: 'Brand Viewer (Read Only)',
      desc: 'Explore creatives, metrics & brand kit',
      icon: Eye,
      badgeColor: 'bg-stone-100 text-stone-700 border-stone-300',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Login failed. Please check credentials.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-heritage-pattern">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 flex items-center justify-center shadow-xl shadow-slate-950/20 border border-amber-500/40 mb-4"
        >
          <Store className="w-9 h-9 text-amber-400" />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 tracking-tight">
          Creative Performance Intelligence
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Paid Social Performance Engine • <span className="font-semibold text-stone-900">Aura Lifestyle Store</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white py-8 px-6 sm:px-8 shadow-xl rounded-2xl border border-stone-200"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-colors"
                  placeholder="analyst@cpi.demo"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Password
                </label>
              </div>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-md shadow-slate-900/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in to Workspace</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo User Switcher Chips */}
          <div className="mt-7 pt-6 border-t border-stone-200">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-3.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Select Demo Account Role</span>
            </div>

            <div className="space-y-2.5">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickLogin(acc.email, acc.password)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/60 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2 rounded-lg border ${acc.badgeColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">{acc.label}</div>
                        <div className="text-[11px] text-stone-500">{acc.email}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-center text-[11px] text-stone-400">
              Registration disabled in demo sandbox. All 3 roles are pre-seeded.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
