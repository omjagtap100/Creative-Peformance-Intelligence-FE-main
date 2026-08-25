import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CreativeBundle } from '../../types/cpi';
import { api } from '../../shared/api/client';
import { ArgPanel } from '../analysis/ArgPanel';
import {
  ArrowLeft,
  Video,
  Image as ImageIcon,
  Layers,
  MessageCircle,
  TrendingUp,
  Clock,
  Eye,
  MousePointer,
  IndianRupee,
  ShoppingBag,
  Target,
  FileCode,
  Sparkles,
  Award,
  CheckCircle,
  XCircle,
  Store,
} from 'lucide-react';

export const CreativeDetailPage: React.FC = () => {
  const { creativeId } = useParams<{ creativeId: string }>();
  const [bundle, setBundle] = useState<CreativeBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBundle = async () => {
    if (!creativeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCreativeById(creativeId);
      setBundle(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load creative bundle');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundle();
  }, [creativeId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-stone-200 rounded" />
        <div className="h-36 bg-white rounded-2xl border border-stone-200 p-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-stone-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-red-200">
        <p className="text-sm font-semibold text-red-600 mb-4">{error || 'Creative not found'}</p>
        <Link
          to="/creatives"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Creatives</span>
        </Link>
      </div>
    );
  }

  const { creative, campaign, brand, content_matrix, video_dropoff, metrics_daily, targeting_stats } =
    bundle;

  // Aggregate Metrics Summary
  const totalImpressions = metrics_daily.reduce((acc, m) => acc + (m.impressions || 0), 0);
  const totalClicks = metrics_daily.reduce((acc, m) => acc + (m.clicks || 0), 0);
  const totalSpend = metrics_daily.reduce((acc, m) => acc + (Number(m.spend_inr) || 0), 0);
  const totalConvs = metrics_daily.reduce(
    (acc, m) => acc + (m.messaging_conversations_started || 0),
    0
  );
  const avgCtr =
    metrics_daily.length > 0
      ? (
          metrics_daily.reduce((acc, m) => acc + (Number(m.ctr) || 0), 0) / metrics_daily.length
        ).toFixed(3)
      : '0.000';
  const avgCpc =
    metrics_daily.length > 0
      ? (
          metrics_daily.reduce((acc, m) => acc + (Number(m.cpc_inr) || 0), 0) / metrics_daily.length
        ).toFixed(2)
      : '0.00';

  // Chart data formatted
  const chartData = metrics_daily.map((m) => ({
    date: m.metric_date.slice(5),
    impressions: m.impressions,
    clicks: m.clicks,
    spend: Number(m.spend_inr) || 0,
    convs: m.messaging_conversations_started,
  }));

  // Video Dropoff Curve data
  const dropoffCurveData = Array.isArray(video_dropoff?.curve)
    ? video_dropoff.curve.map((pt: { t: number; retention: number }) => ({
        seconds: `${pt.t}s`,
        retentionPct: Math.round(pt.retention * 100),
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <div>
        <Link
          to="/creatives"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Creatives Library</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-md bg-stone-100 border border-stone-200 text-stone-900">
                {creative.creative_id}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 capitalize border border-stone-200">
                {creative.format}
              </span>
              {creative.concept && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 capitalize">
                  {creative.concept.replace(/_/g, ' ')}
                </span>
              )}
              {creative.cta && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {creative.cta.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-stone-900 pt-1">
              {creative.headline || 'Ad Creative Workspace'}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-left md:text-right">
              <div className="text-xs font-bold text-stone-900">{brand?.name || 'Aura Lifestyle Store'}</div>
              <div className="text-[11px] text-stone-500">{campaign?.name}</div>
            </div>
          </div>
        </div>

        {/* Ad Copy Box */}
        <div className="p-4 sm:p-5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Primary Ad Copy & Objective
          </div>
          <p className="text-sm text-stone-800 leading-relaxed font-sans">
            {creative.primary_text || 'No primary text supplied'}
          </p>
          {creative.description && (
            <p className="text-xs text-stone-500 italic">{creative.description}</p>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-500 border-t border-stone-200/60">
            {creative.started_running_on && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Running since: <strong>{creative.started_running_on}</strong></span>
              </span>
            )}
            {creative.destination && (
              <span>
                Destination: <strong className="capitalize">{creative.destination}</strong>
              </span>
            )}
            {creative.source_tag && (
              <span>
                Source: <strong className="capitalize">{creative.source_tag}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1.5">
            <span>Spend (INR)</span>
            <IndianRupee className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-stone-900">
            ₹{totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Total active window</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1.5">
            <span>Impressions</span>
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-stone-900">
            {totalImpressions.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Ad views generated</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1.5">
            <span>Clicks</span>
            <MousePointer className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-stone-900">
            {totalClicks.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Avg CTR: {avgCtr}%</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1.5">
            <span>Avg CPC</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-stone-900">₹{avgCpc}</div>
          <div className="text-[11px] text-stone-400 mt-1">Cost per click</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1.5">
            <span>WhatsApp Convs</span>
            <MessageCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700">{totalConvs}</div>
          <div className="text-[11px] text-stone-400 mt-1">Inbound chats</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1.5">
            <span>ROAS</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-stone-900">
            {metrics_daily[0]?.results_roas ? `${Number(metrics_daily[0].results_roas).toFixed(2)}x` : '—'}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Return on ad spend</div>
        </div>
      </div>

      {/* PERFORMANCE TIMELINE & VIDEO RETENTION CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Daily Timeline Chart */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-800" />
              Daily Performance Trajectory
            </h3>
            <span className="text-xs text-stone-500 font-medium">Impressions vs Clicks</span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E293B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1E293B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis dataKey="date" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  name="Impressions"
                  stroke="#1E293B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorImpressions)"
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke="#D97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Video Retention Dropoff Curve (if video) or Targeting Distribution */}
        {video_dropoff && dropoffCurveData.length > 0 ? (
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-700" />
                Video Viewer Retention Curve ({video_dropoff.duration_seconds}s)
              </h3>
              <span className="text-xs text-stone-500 font-medium">% Watching</span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dropoffCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis dataKey="seconds" stroke="#888" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#888" fontSize={11} />
                  <Tooltip
                    formatter={(val: number) => [`${val}%`, 'Retention']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="retentionPct"
                    name="Retention %"
                    stroke="#9333ea"
                    strokeWidth={3}
                    dot={{ fill: '#9333ea', r: 4 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-stone-700" />
                Targeting & Audience Breakdown
              </h3>
            </div>
            <div className="space-y-2.5">
              {targeting_stats.map((t, idx) => (
                <div key={idx} className="p-3.5 bg-stone-50 rounded-xl text-xs space-y-1.5 border border-stone-100">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>{t.geo} • {t.gender} ({t.age_bucket})</span>
                    <span>₹{Number(t.spend_inr || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 flex justify-between">
                    <span>Placement: {t.placement}</span>
                    <span>{t.clicks} clicks • {t.messaging_conversations_started} WhatsApp leads</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CONTENT MATRIX INSPECTOR */}
      {content_matrix && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="text-base font-display font-bold text-stone-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-slate-800" />
              Content Matrix Diagnostic Features
            </h3>
            <span className="text-xs font-mono text-stone-500">
              Model: {content_matrix.model_version || 'matrix_v1'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-stone-400 text-[10px] uppercase font-bold block mb-1">Tone</span>
              <span className="font-bold text-stone-800 capitalize">
                {content_matrix.tone?.replace(/_/g, ' ') || 'Standard'}
              </span>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-stone-400 text-[10px] uppercase font-bold block mb-1">
                Logo Clarity Score
              </span>
              <div className="flex items-center gap-1 font-bold text-amber-700">
                <span>{content_matrix.logo_clarity || 0} / 5</span>
                <span className="text-stone-400 text-xs">★</span>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-stone-400 text-[10px] uppercase font-bold block mb-1">
                Opening Hook Timing
              </span>
              <span className="font-bold text-stone-800">
                {content_matrix.hook_seconds ? `${content_matrix.hook_seconds}s` : 'N/A'}
              </span>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-stone-400 text-[10px] uppercase font-bold block mb-1">
                Human Presenter
              </span>
              <div className="flex items-center gap-1 font-bold">
                {content_matrix.has_human_figure ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Present
                  </span>
                ) : (
                  <span className="text-stone-500 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Product Only
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Script Summary & Color Palette */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="md:col-span-2 p-4 bg-stone-50 rounded-xl border border-stone-100 text-xs">
              <span className="text-stone-400 text-[10px] uppercase font-bold block mb-1.5">
                Scene & Script Flow
              </span>
              <p className="text-stone-700 leading-relaxed font-mono text-xs">
                {content_matrix.script_summary || 'No script breakdown available'}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-xs">
              <span className="text-stone-400 text-[10px] uppercase font-bold block mb-2.5">
                Primary Ad Palette
              </span>
              <div className="flex items-center gap-3">
                {Array.isArray(content_matrix.colour_palette) &&
                  content_matrix.colour_palette.map((hex: string, i: number) => (
                    <div key={i} className="text-center">
                      <div
                        className="w-9 h-9 rounded-xl border border-stone-300 shadow-2xs"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                      <span className="text-[10px] font-mono text-stone-500 block mt-1">{hex}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ARG INTELLIGENCE PANEL (CORE INTERACTION) */}
      <ArgPanel creativeId={creative.creative_id} onRunSuccess={fetchBundle} />
    </div>
  );
};
