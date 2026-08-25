import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BrandKitRow, BrandRow } from '../../types/cpi';
import { api } from '../../shared/api/client';
import {
  Palette,
  Type,
  Volume2,
  CheckCircle,
  XCircle,
  ShoppingBag,
  MapPin,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Store,
} from 'lucide-react';

export const BrandKitPage: React.FC = () => {
  const [brand, setBrand] = useState<BrandRow | null>(null);
  const [kit, setKit] = useState<BrandKitRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [brandData, kitData] = await Promise.all([api.getBrand(), api.getBrandKit()]);
      setBrand(brandData);
      setKit(kitData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load brand kit');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-white rounded-2xl border border-stone-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-white rounded-2xl border border-stone-200" />
          <div className="h-48 bg-white rounded-2xl border border-stone-200" />
        </div>
      </div>
    );
  }

  if (error || !kit) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-red-200">
        <p className="text-sm font-semibold text-red-600 mb-4">{error || 'Brand Kit not found'}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const colours = kit.colours || {};
  const paletteEntries = [
    { label: 'Primary Brand Slate', hex: (colours.primary as string) || '#1E293B', text: 'text-white' },
    { label: 'Secondary Amber Gold', hex: (colours.secondary as string) || '#D97706', text: 'text-stone-900' },
    { label: 'Accent Champagne', hex: (colours.accent as string) || '#F59E0B', text: 'text-stone-900' },
    { label: 'Background Sand', hex: (colours.background as string) || '#F8FAFC', text: 'text-stone-900' },
    { label: 'Deep Charcoal Text', hex: (colours.text as string) || '#0F172A', text: 'text-white' },
  ];

  const toneList = Array.isArray(kit.tone) ? kit.tone : [];
  const mustIncludeList = Array.isArray(kit.must_include) ? kit.must_include : [];
  const mustAvoidList = Array.isArray(kit.must_avoid) ? kit.must_avoid : [];
  const ctaPreferences = Array.isArray(kit.cta_preferences) ? kit.cta_preferences : [];
  const marketsList = Array.isArray(kit.markets) ? kit.markets : [];

  return (
    <div className="space-y-8">
      {/* Brand Identity Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 border-2 border-amber-500/40 flex items-center justify-center shadow-lg shadow-slate-950/20 shrink-0">
              <Store className="w-9 h-9 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
                  {brand?.name || 'Aura Lifestyle Store'}
                </h1>
                <span className="text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  {brand?.brand_id}
                </span>
              </div>
              <p className="text-sm text-stone-600 mt-1 font-serif italic">
                "{brand?.tagline || 'Curated premium essentials for modern living & celebration'}"
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-stone-50 border border-stone-300 hover:bg-stone-100 transition-colors shadow-2xs self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Kit</span>
          </button>
        </div>
      </div>

      {/* 1. COLOR PALETTE */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h2 className="text-base font-display font-bold text-stone-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-slate-900" />
            Official Brand Color Palette
          </h2>
          <span className="text-xs text-stone-500">Click any swatch to copy HEX code</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {paletteEntries.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              onClick={() => copyHex(item.hex)}
              className="p-4 rounded-xl border border-stone-200 cursor-pointer group shadow-2xs flex flex-col justify-between h-36 relative overflow-hidden transition-all"
              style={{ backgroundColor: item.hex }}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${item.text} opacity-90`}>
                  {item.label}
                </span>
                <div className={`p-1.5 rounded-md bg-black/25 ${item.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  {copiedHex === item.hex ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </div>
              </div>

              <div>
                <span className={`font-mono text-sm font-bold block ${item.text}`}>
                  {item.hex}
                </span>
                {copiedHex === item.hex && (
                  <span className="text-xs font-bold text-emerald-300 block">Copied!</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 2. TYPOGRAPHY & TONE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Typography */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Type className="w-5 h-5 text-slate-900" />
            <h2 className="text-base font-display font-bold text-stone-900">
              Typography Hierarchy
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400">
                Display Font • {kit.fonts?.display || 'Playfair Display'}
              </span>
              <p className="font-display font-bold text-xl text-stone-900 leading-snug">
                Curated Collections for Elevated Living
              </p>
              <p className="font-display italic text-stone-600 text-sm">
                The Gold Standard of Modern Artisan Retail
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400">
                Body Font • {kit.fonts?.body || 'Source Sans 3'}
              </span>
              <p className="font-sans text-xs text-stone-700 leading-relaxed">
                Carefully crafted with sustainable materials, hand-finished detailing, and express pan-metro delivery. Thoughtfully curated for gifting and modern everyday rituals.
              </p>
            </div>
          </div>
        </div>

        {/* Tone of Voice */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Volume2 className="w-5 h-5 text-slate-900" />
            <h2 className="text-base font-display font-bold text-stone-900">
              Tone of Voice Guidelines
            </h2>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {toneList.map((tone, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 text-stone-800 border border-stone-200 text-xs font-bold capitalize"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{tone}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <strong>Voice Principle:</strong> Communicate with modern sophistication, quiet confidence, and authentic warmth. Never rely on cheap high-pressure discount screaming.
          </div>
        </div>
      </div>

      {/* 3. RULES & GUARDRAILS (MUST INCLUDE vs MUST AVOID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Must Include */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3 text-emerald-800">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-display font-bold text-stone-900">
              Must Include in Creatives
            </h2>
          </div>

          <ul className="space-y-2 text-xs text-stone-700">
            {mustIncludeList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
                <span className="capitalize font-semibold">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Must Avoid */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3 text-red-800">
            <XCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-display font-bold text-stone-900">
              Must Avoid Guardrails
            </h2>
          </div>

          <ul className="space-y-2 text-xs text-stone-700">
            {mustAvoidList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 bg-red-50/60 rounded-xl border border-red-100">
                <span className="w-2 h-2 rounded-full bg-red-600 mt-1 shrink-0" />
                <span className="capitalize font-semibold">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. CTA PREFERENCES & MARKETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferred CTAs */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <ShoppingBag className="w-5 h-5 text-slate-900" />
            <h2 className="text-base font-display font-bold text-stone-900">
              Preferred Call-to-Actions (CTAs)
            </h2>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {ctaPreferences.map((cta, idx) => (
              <span
                key={idx}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold shadow-2xs"
              >
                {cta}
              </span>
            ))}
          </div>
        </div>

        {/* Target Markets */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <MapPin className="w-5 h-5 text-slate-900" />
            <h2 className="text-base font-display font-bold text-stone-900">
              Primary Regional Markets
            </h2>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {marketsList.map((market, idx) => (
              <span
                key={idx}
                className="px-3.5 py-2 rounded-xl bg-stone-100 text-stone-800 border border-stone-200 text-xs font-bold"
              >
                {market}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
