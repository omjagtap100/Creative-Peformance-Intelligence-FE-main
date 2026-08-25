import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AnalyseRecommendGenerateResult,
  ArgStopAt,
} from '../../types/cpi';
import { api } from '../../shared/api/client';
import { useAuth } from '../auth/AuthContext';
import {
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Bot,
  Brain,
  FileText,
  Lightbulb,
  Image as ImageIcon,
  ArrowRight,
  Sliders,
  Database,
  ExternalLink,
  Tag,
  Check,
} from 'lucide-react';

interface ArgPanelProps {
  creativeId: string;
  onRunSuccess?: () => void;
}

export const ArgPanel: React.FC<ArgPanelProps> = ({ creativeId, onRunSuccess }) => {
  const { canRunArg, role } = useAuth();

  const [useLlm, setUseLlm] = useState<boolean>(true);
  const [persist, setPersist] = useState<boolean>(true);
  const [loadingStage, setLoadingStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [argResult, setArgResult] = useState<AnalyseRecommendGenerateResult | null>(null);

  const handleRun = async (action: 'analyse' | 'recommend' | 'generate' | 'arg') => {
    setError(null);
    setLoadingStage(action);

    try {
      let res: AnalyseRecommendGenerateResult;
      const req = {
        creativeId,
        useLlm,
        persist,
      };

      if (action === 'analyse') {
        res = await api.runAnalyse(req);
      } else if (action === 'recommend') {
        res = await api.runRecommend(req);
      } else if (action === 'generate') {
        res = await api.runGenerate(req);
      } else {
        res = await api.runArg({ ...req, stopAt: 'generate' });
      }

      setArgResult(res);
      if (onRunSuccess) onRunSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'ARG execution failed');
      } else {
        setError('ARG execution encountered an unexpected error');
      }
    } finally {
      setLoadingStage(null);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            Critical
          </span>
        );
      case 'warn':
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            Warning
          </span>
        );
      case 'info':
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            Insight
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Medium Priority
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            Low Priority
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header with Title and Settings */}
      <div className="bg-slate-950 text-white p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-amber-600 flex items-center justify-center shadow-md shrink-0 border border-amber-500/30">
            <Brain className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold tracking-wide">
              Intelligence Engine (ARG)
            </h2>
            <p className="text-xs text-stone-300">
              Analyse Grounded Metrics → Recommend Interventions → Generate Ad Copy & Prompts
            </p>
          </div>
        </div>

        {/* Controls: LLM & Persist Toggles */}
        <div className="flex items-center gap-4 bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useLlm}
              onChange={(e) => setUseLlm(e.target.checked)}
              disabled={!canRunArg || !!loadingStage}
              className="rounded text-amber-600 focus:ring-amber-600 focus:ring-offset-0 bg-slate-800 border-slate-700 w-4 h-4"
            />
            <span className="flex items-center gap-1.5 font-semibold text-stone-200">
              <Bot className="w-4 h-4 text-amber-400" />
              LLM Enhancement
            </span>
          </label>

          <span className="text-slate-700">|</span>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={persist}
              onChange={(e) => setPersist(e.target.checked)}
              disabled={!canRunArg || !!loadingStage}
              className="rounded text-amber-600 focus:ring-amber-600 focus:ring-offset-0 bg-slate-800 border-slate-700 w-4 h-4"
            />
            <span className="flex items-center gap-1.5 font-semibold text-stone-200">
              <Database className="w-4 h-4 text-amber-400" />
              Persist Drafts
            </span>
          </label>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="bg-stone-50 border-b border-stone-200 p-4 sm:px-7">
        {!canRunArg ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-900 font-medium">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
            <span>
              Viewer Mode: You can view historical diagnoses and recommendations. To trigger a new ARG run, log in as an <strong>Analyst</strong> or <strong>Admin</strong>.
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleRun('analyse')}
                disabled={!!loadingStage}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-stone-800 border border-stone-300 hover:bg-stone-100 transition-colors shadow-2xs disabled:opacity-50 flex items-center gap-2"
              >
                {loadingStage === 'analyse' ? (
                  <div className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4 text-stone-600" />
                )}
                <span>1. Run Analyse</span>
              </button>

              <button
                onClick={() => handleRun('recommend')}
                disabled={!!loadingStage}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-stone-800 border border-stone-300 hover:bg-stone-100 transition-colors shadow-2xs disabled:opacity-50 flex items-center gap-2"
              >
                {loadingStage === 'recommend' ? (
                  <div className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                )}
                <span>2. Run Recommend</span>
              </button>

              <button
                onClick={() => handleRun('generate')}
                disabled={!!loadingStage}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-stone-800 border border-stone-300 hover:bg-stone-100 transition-colors shadow-2xs disabled:opacity-50 flex items-center gap-2"
              >
                {loadingStage === 'generate' ? (
                  <div className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-600" />
                )}
                <span>3. Run Generate</span>
              </button>
            </div>

            {/* Complete Full Loop Button */}
            <button
              onClick={() => handleRun('arg')}
              disabled={!!loadingStage}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingStage === 'arg' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
              <span>Run Full Loop (ARG Pipeline)</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Container */}
      <div className="p-5 sm:p-7 space-y-6">
        {!argResult ? (
          <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
            <Brain className="w-12 h-12 text-stone-400 mx-auto mb-2.5" />
            <h3 className="text-sm font-bold text-stone-800">No active ARG execution</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
              Run Analyse to extract metric grounded insights, Recommend to formulate actionable optimizations, or Run Full Loop for complete end-to-end creative generation.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Step Pipeline Progress Indicator */}
            <div className="flex items-center justify-between bg-stone-100/80 p-3.5 rounded-xl border border-stone-200 text-xs">
              <div className="flex items-center gap-2.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-stone-800">Current Stage:</span>
                <span className="uppercase tracking-wider px-2.5 py-0.5 bg-slate-900 text-white rounded font-bold text-[11px]">
                  {argResult.stage}
                </span>
              </div>

              {argResult.next && (
                <div className="text-stone-600 flex items-center gap-1.5 text-xs">
                  <span>Next Step:</span>
                  <span className="font-bold text-stone-900 capitalize">{argResult.next}</span>
                </div>
              )}
            </div>

            {/* SECTION 1: DIAGNOSIS (ANALYSE STAGE) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-base font-display font-bold text-stone-900">
                    Diagnosis & Grounded Findings
                  </h3>
                </div>
                <span className="text-xs text-stone-500 font-mono">
                  {new Date(argResult.diagnosis.analysed_at).toLocaleTimeString()}
                </span>
              </div>

              {/* Summary Statement */}
              <div className="p-4 sm:p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <p className="text-sm font-semibold text-stone-900 leading-relaxed">
                  "{argResult.diagnosis.summary}"
                </p>
              </div>

              {/* Grounded Findings Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Data-Grounded Findings ({argResult.diagnosis.findings.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {argResult.diagnosis.findings.map((f, i) => (
                    <div
                      key={i}
                      className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-stone-200 text-stone-800">
                            {f.area}
                          </span>
                          {getSeverityBadge(f.severity)}
                        </div>
                        <p className="text-xs text-stone-900 font-medium leading-normal">
                          {f.claim}
                        </p>
                      </div>

                      {/* Evidence Citations */}
                      <div className="pt-2.5 border-t border-stone-200 flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-stone-500 font-semibold">Citations:</span>
                        {f.citations.map((cite, ci) => (
                          <span
                            key={ci}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-white text-slate-900 border border-stone-200 font-medium"
                          >
                            <Tag className="w-3 h-3 text-stone-400" />
                            {cite}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LLM Analysis Box (When available) */}
              {argResult.diagnosis.llm_analysis_available && argResult.diagnosis.llm_analysis && (
                <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-2xl space-y-4 shadow-sm border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        LLM Cognitive Enhancement
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 uppercase tracking-widest font-semibold">
                      Fact vs. Inference
                    </span>
                  </div>

                  <p className="text-xs text-stone-200 leading-relaxed font-sans">
                    {argResult.diagnosis.llm_analysis.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
                    <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                        Strongest Elements
                      </span>
                      <ul className="space-y-1.5 text-stone-300 text-xs">
                        {argResult.diagnosis.llm_analysis.strongest_elements.map((s, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                        Weakest Elements
                      </span>
                      <ul className="space-y-1.5 text-stone-300 text-xs">
                        {argResult.diagnosis.llm_analysis.weakest_elements.map((w, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Fact vs Interpretation findings */}
                  {argResult.diagnosis.llm_analysis.findings.map((lf, lfi) => (
                    <div key={lfi} className="p-3.5 bg-slate-900/70 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                      <div className="text-stone-300">
                        <strong className="text-emerald-300 font-bold">Observation (Fact):</strong> {lf.observation}
                      </div>
                      <div className="text-stone-300">
                        <strong className="text-amber-300 font-bold">Interpretation (Inference):</strong> {lf.interpretation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: RECOMMENDATION PLAN (RECOMMEND STAGE) */}
            {argResult.recommend && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-base font-display font-bold text-stone-900">
                      Optimization Recommendations
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-stone-600 capitalize">
                    Source: {argResult.recommend.source}
                  </span>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 font-medium">
                  "{argResult.recommend.summary}"
                </div>

                <div className="space-y-3">
                  {argResult.recommend.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 bg-white rounded-xl border border-stone-200 shadow-xs space-y-2.5 hover:border-amber-400 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        {getPriorityBadge(item.priority)}
                        <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-0.5 bg-stone-100 text-stone-700 rounded">
                          Kind: {item.kind.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-stone-900">{item.action}</h4>
                      <p className="text-xs text-stone-600 leading-relaxed">{item.reason}</p>

                      <div className="pt-2.5 border-t border-stone-100 flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-stone-400 font-semibold">Evidence:</span>
                        {item.evidence_citations.map((c, ci) => (
                          <span
                            key={ci}
                            className="px-2 py-0.5 rounded text-xs font-mono bg-stone-100 text-stone-700 font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: GENERATION DRAFTS (GENERATE STAGE) */}
            {argResult.generate && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-purple-700 text-white text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-base font-display font-bold text-stone-900">
                      Generated Creative Drafts ({argResult.generate.drafts.length})
                    </h3>
                  </div>
                  {argResult.recommendation_id && (
                    <span className="text-xs font-mono text-stone-500">
                      ID: {argResult.recommendation_id.slice(0, 16)}...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {argResult.generate.drafts.map((draft, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between space-y-3.5 shadow-2xs"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-purple-100 text-purple-800">
                            {draft.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                            {draft.status}
                          </span>
                        </div>

                        {draft.type === 'copy' && (
                          <div className="space-y-2.5 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                                Headline
                              </span>
                              <p className="font-bold text-stone-900 text-sm leading-snug">{draft.headline}</p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                                Primary Text
                              </span>
                              <p className="text-stone-700 leading-relaxed">{draft.primary_text}</p>
                            </div>
                            {draft.cta && (
                              <div className="pt-1">
                                <span className="inline-flex items-center px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg">
                                  CTA: {draft.cta}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {draft.type === 'concept' && (
                          <div className="text-xs">
                            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                              Storyboard & Concept Notes
                            </span>
                            <p className="text-stone-700 leading-relaxed">{draft.concept_notes}</p>
                          </div>
                        )}

                        {draft.type === 'static_image' && (
                          <div className="text-xs space-y-2.5">
                            <span className="text-[10px] uppercase font-bold text-stone-400 block">
                              Image Prompt Specification
                            </span>
                            <p className="text-stone-800 bg-white p-3 rounded-xl border border-stone-200 font-mono text-xs leading-relaxed">
                              {draft.image_prompt}
                            </p>
                            {/* Safety Notice */}
                            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium">
                              Prompt only — render/publish not enabled.
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Evidence Citations */}
                      <div className="pt-2.5 border-t border-stone-200 text-xs text-stone-500">
                        <span className="font-semibold">Citations: </span>
                        {draft.evidence_citations.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Link to Recommendations & Generations Management */}
                <div className="pt-3 flex items-center justify-end gap-4 text-xs font-semibold">
                  <Link
                    to="/recommendations"
                    className="inline-flex items-center gap-1.5 text-slate-900 hover:text-amber-700 hover:underline"
                  >
                    <span>View in Recommendations Inbox</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <span className="text-stone-300">•</span>
                  <Link
                    to="/generations"
                    className="inline-flex items-center gap-1.5 text-slate-900 hover:text-amber-700 hover:underline"
                  >
                    <span>View in Generations Approval Inbox</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
