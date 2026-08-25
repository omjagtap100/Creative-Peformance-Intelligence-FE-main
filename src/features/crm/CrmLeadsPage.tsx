import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LeadRow, LeadStage } from '../../types/cpi';
import { api } from '../../shared/api/client';
import { useAuth } from '../auth/AuthContext';
import {
  Users,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  Kanban,
  Table as TableIcon,
  RefreshCw,
  Clock,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface StageConfig {
  id: LeadStage;
  label: string;
  color: string;
  badge: string;
}

const STAGES: StageConfig[] = [
  { id: 'new', label: '1. Inbound Lead', color: 'border-stone-300 bg-stone-50', badge: 'bg-stone-100 text-stone-700' },
  { id: 'engaged', label: '2. Concierge Chat', color: 'border-blue-300 bg-blue-50/40', badge: 'bg-blue-100 text-blue-800' },
  { id: 'intent', label: '3. High Intent', color: 'border-amber-300 bg-amber-50/40', badge: 'bg-amber-100 text-amber-800' },
  { id: 'visit_booked', label: '4. Store Visit Booked', color: 'border-purple-300 bg-purple-50/40', badge: 'bg-purple-100 text-purple-800' },
  { id: 'visited', label: '5. Visited & Styled', color: 'border-indigo-300 bg-indigo-50/40', badge: 'bg-indigo-100 text-indigo-800' },
  { id: 'sale', label: '6. Sale Converted', color: 'border-emerald-300 bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-800' },
];

export const CrmLeadsPage: React.FC = () => {
  const { canUpdateLeadStage, role } = useAuth();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getLeads();
      setLeads(res.items || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch leads');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStageChange = async (id: string, newStage: LeadStage) => {
    setUpdatingId(id);
    try {
      await api.updateLeadStage(id, newStage);
      setLeads((prev) =>
        prev.map((l) => (l.lead_id === id ? { ...l, stage: newStage } : l))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Stage update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 tracking-tight">
            CRM Lite — Attribution & Leads Pipeline
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Paid Social Inbound Leads Attributed to Active Creatives • Aura Lifestyle Concierge
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-stone-100 p-1.5 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Pipeline</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={fetchLeads}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Role Notice */}
      {!canUpdateLeadStage && (
        <div className="p-4 bg-stone-100 border border-stone-200 rounded-2xl text-xs text-stone-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-stone-500 shrink-0" />
            <span>
              Your current role (<strong className="capitalize">{role}</strong>) is read-only. Log in as <strong>Analyst</strong> or <strong>Admin</strong> to advance lead pipeline stages.
            </span>
          </span>
        </div>
      )}

      {/* Main View Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={fetchLeads}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.id);

            return (
              <div
                key={stage.id}
                className="bg-stone-100/80 rounded-2xl border border-stone-200 p-3.5 flex flex-col min-w-[250px] sm:min-w-0"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-200">
                  <span className="text-xs font-bold text-stone-800 truncate" title={stage.label}>
                    {stage.label}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-stone-700 border border-stone-200 shadow-2xs">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Leads Cards */}
                <div className="space-y-3 flex-1">
                  {stageLeads.length === 0 ? (
                    <div className="py-10 text-center text-xs text-stone-400 font-medium">
                      No leads
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <motion.div
                        key={lead.lead_id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-2xs space-y-2.5 hover:border-slate-400 transition-colors text-xs"
                      >
                        {/* Name & Source */}
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="font-bold text-stone-900 leading-tight">
                            {lead.name || 'Anonymous Visitor'}
                          </span>
                          {lead.source_channel === 'whatsapp' ? (
                            <span className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0" title="WhatsApp Lead">
                              <MessageCircle className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="p-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0" title="Web Form Lead">
                              <Mail className="w-4 h-4" />
                            </span>
                          )}
                        </div>

                        {/* Contact info */}
                        <div className="space-y-1 text-xs text-stone-500">
                          {lead.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center gap-1.5 truncate" title={lead.email}>
                              <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="truncate">{lead.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Creative Attribution */}
                        {lead.creative_id && (
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                            <span className="text-stone-400">Creative:</span>
                            <Link
                              to={`/creatives/${lead.creative_id}`}
                              className="font-mono text-slate-900 hover:text-amber-700 hover:underline font-semibold flex items-center gap-0.5"
                            >
                              <span>{lead.creative_id}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        )}

                        {/* Stage Selector (Analyst+) */}
                        {canUpdateLeadStage && (
                          <div className="pt-2 border-t border-stone-100">
                            <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                              Move Stage
                            </label>
                            <select
                              value={lead.stage}
                              disabled={updatingId === lead.lead_id}
                              onChange={(e) =>
                                handleStageChange(lead.lead_id, e.target.value as LeadStage)
                              }
                              className="w-full text-xs py-1.5 px-2 bg-stone-50 border border-stone-300 rounded-lg font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                            >
                              {STAGES.map((st) => (
                                <option key={st.id} value={st.id}>
                                  {st.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-stone-800 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Phone / Email</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Attributed Creative</th>
                  <th className="py-3.5 px-4">Current Stage</th>
                  <th className="py-3.5 px-4">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {leads.map((lead) => (
                  <tr key={lead.lead_id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {lead.name || 'Anonymous Lead'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      <div>{lead.phone || '—'}</div>
                      <div className="text-xs text-stone-400">{lead.email || ''}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 font-bold">
                        {lead.source_channel || 'Direct'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.creative_id ? (
                        <Link
                          to={`/creatives/${lead.creative_id}`}
                          className="font-mono text-slate-900 hover:text-amber-700 hover:underline font-bold flex items-center gap-1"
                        >
                          <span>{lead.creative_id}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {canUpdateLeadStage ? (
                        <select
                          value={lead.stage}
                          disabled={updatingId === lead.lead_id}
                          onChange={(e) =>
                            handleStageChange(lead.lead_id, e.target.value as LeadStage)
                          }
                          className="text-xs py-1.5 px-2.5 bg-stone-50 border border-stone-300 rounded-lg font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                        >
                          {STAGES.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="capitalize px-3 py-1 rounded-full font-bold bg-stone-100 text-stone-800">
                          {lead.stage.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 font-mono text-xs">
                      {new Date(lead.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
