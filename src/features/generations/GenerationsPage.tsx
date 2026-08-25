import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GenerationDraft, GenerationRow, RecommendationStatus } from '../../types/cpi';
import { api } from '../../shared/api/client';
import { useAuth } from '../auth/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Shield,
  RefreshCw,
  Copy,
  Check,
  FileText,
  Lightbulb,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';

export const GenerationsPage: React.FC = () => {
  const { canApproveReject, role } = useAuth();
  const [generations, setGenerations] = useState<GenerationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchGenerations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getGenerations();
      setGenerations(res.items || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch generations');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: RecommendationStatus) => {
    setActionLoading(id);
    try {
      await api.updateGenerationStatus(id, newStatus);
      setGenerations((prev) =>
        prev.map((g) => (g.generation_id === id ? { ...g, status: newStatus } : g))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const parseDraftContent = (contentString: string | null): GenerationDraft | null => {
    if (!contentString) return null;
    try {
      return JSON.parse(contentString) as GenerationDraft;
    } catch {
      return null;
    }
  };

  const filtered = generations.filter((g) => {
    const matchesType = selectedType === 'all' || g.type.toLowerCase() === selectedType.toLowerCase();
    const matchesStatus =
      selectedStatus === 'all' || g.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 shadow-2xs">
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            Rejected
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            Pending Review
          </span>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'copy':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'concept':
        return <Lightbulb className="w-5 h-5 text-amber-600" />;
      case 'static_image':
      default:
        return <ImageIcon className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 tracking-tight">
            Creative Generation Drafts & Prompt Hub
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Grounded copy, storyboard concepts, and image generation prompts produced by the ARG Engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchGenerations}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Role Notice */}
      {!canApproveReject && (
        <div className="p-4 bg-stone-100 border border-stone-200 rounded-2xl text-xs text-stone-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-stone-500 shrink-0" />
            <span>
              Your current role (<strong className="capitalize">{role}</strong>) is read-only for approvals. Log in as <strong>Admin</strong> to approve or reject drafts.
            </span>
          </span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
        {/* Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1">Type:</span>
          {['all', 'copy', 'concept', 'static_image'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                selectedType === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1">Status:</span>
          {['all', 'draft', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                selectedStatus === s
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Generations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse space-y-4">
              <div className="h-5 w-32 bg-stone-200 rounded" />
              <div className="h-24 bg-stone-100 rounded-xl" />
              <div className="h-8 bg-stone-50 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={fetchGenerations}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
          <Sparkles className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No generated drafts found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Open any creative in the library and execute <strong>Run Generate</strong> in the ARG Engine to synthesize ad copy, storyboard notes, and image prompts.
          </p>
          <Link
            to="/creatives"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold mt-2 hover:bg-slate-800"
          >
            <span>Explore Creatives</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((gen) => {
            const draft = parseDraftContent(gen.content);

            return (
              <motion.div
                key={gen.generation_id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Type Icon, Tag, Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-stone-100 border border-stone-200">
                        {getTypeIcon(gen.type)}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        {gen.type.replace('_', ' ')}
                      </span>
                    </div>
                    {getStatusBadge(gen.status)}
                  </div>

                  {/* Body based on Draft Structure */}
                  {draft ? (
                    <div className="space-y-3 text-xs">
                      {draft.type === 'copy' && (
                        <div className="space-y-2.5">
                          {draft.headline && (
                            <div>
                              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                                Headline
                              </span>
                              <p className="font-bold text-stone-900 text-sm leading-snug">{draft.headline}</p>
                            </div>
                          )}
                          {draft.primary_text && (
                            <div>
                              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                                Primary Text
                              </span>
                              <p className="text-stone-700 leading-relaxed">{draft.primary_text}</p>
                            </div>
                          )}
                          {draft.cta && (
                            <div className="pt-1">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
                                CTA: {draft.cta}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {draft.type === 'concept' && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                            Storyboard Concept Notes
                          </span>
                          <p className="text-stone-700 leading-relaxed font-sans">{draft.concept_notes}</p>
                        </div>
                      )}

                      {draft.type === 'static_image' && (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-stone-400">
                              Image Prompt Specification
                            </span>
                            <button
                              onClick={() => copyToClipboard(draft.image_prompt || '', gen.generation_id)}
                              className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-bold"
                            >
                              {copiedId === gen.generation_id ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-600" />
                                  <span className="text-emerald-600">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 font-mono text-xs text-stone-800 leading-relaxed">
                            {draft.image_prompt}
                          </div>
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium">
                            Prompt only — render/publish not enabled.
                          </div>
                        </div>
                      )}

                      {/* Evidence Citations */}
                      {draft.evidence_citations && draft.evidence_citations.length > 0 && (
                        <div className="pt-2.5 border-t border-stone-100 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-stone-400 font-semibold">Citations:</span>
                          {draft.evidence_citations.map((c, ci) => (
                            <span
                              key={ci}
                              className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-lg text-xs font-mono text-stone-600 break-all">
                      {gen.content}
                    </div>
                  )}
                </div>

                {/* Footer: Date & Admin Approval Actions */}
                <div className="pt-3.5 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-stone-400 font-mono">
                    {new Date(gen.created_at).toLocaleDateString()}
                  </span>

                  {canApproveReject && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusUpdate(gen.generation_id, 'rejected')}
                        disabled={actionLoading === gen.generation_id || gen.status === 'rejected'}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 disabled:opacity-40"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(gen.generation_id, 'approved')}
                        disabled={actionLoading === gen.generation_id || gen.status === 'approved'}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-40"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
