import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreativeListItem } from '../../types/cpi';
import { api } from '../../shared/api/client';
import {
  Search,
  Video,
  Image as ImageIcon,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  RefreshCw,
  MessageCircle,
  ShoppingBag,
  Store,
} from 'lucide-react';

export const CreativesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [creatives, setCreatives] = useState<CreativeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedConcept, setSelectedConcept] = useState<string>('all');

  const fetchCreatives = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCreatives();
      setCreatives(res.items || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load creatives');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatives();
  }, []);

  const formats = ['all', 'video', 'static', 'carousel'];
  const concepts = [
    'all',
    'festive_event',
    'corporate_gifting',
    'product_hero',
    'social_proof',
  ];

  const filteredCreatives = creatives.filter((c) => {
    const matchesSearch =
      c.creative_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.headline && c.headline.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.product_theme && c.product_theme.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.campaign?.name && c.campaign.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFormat = selectedFormat === 'all' || c.format.toLowerCase() === selectedFormat.toLowerCase();
    const matchesConcept =
      selectedConcept === 'all' || (c.concept && c.concept.toLowerCase() === selectedConcept.toLowerCase());

    return matchesSearch && matchesFormat && matchesConcept;
  });

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'video':
        return <Video className="w-4 h-4 shrink-0" />;
      case 'carousel':
        return <Layers className="w-4 h-4 shrink-0" />;
      case 'static':
      default:
        return <ImageIcon className="w-4 h-4 shrink-0" />;
    }
  };

  const getCtaBadge = (cta: string | null) => {
    if (!cta) return null;
    if (cta.includes('WHATSAPP')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          WhatsApp
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
        <ShoppingBag className="w-4 h-4 text-blue-600 shrink-0" />
        {cta.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 tracking-tight">
            Creative Intelligence Library
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Paid Social Performance Matrix • Aura Lifestyle Store Creative Vault
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCreatives}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Library</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col lg:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Creative ID, headline, theme, or campaign..."
            className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
          />
        </div>

        {/* Format Filter Pills */}
        <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-4 h-4" /> Format:
          </span>
          {formats.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFormat(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize shrink-0 transition-colors ${
                selectedFormat === f
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Concept Filter */}
        <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1 shrink-0">
            Concept:
          </span>
          {concepts.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedConcept(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize shrink-0 transition-colors ${
                selectedConcept === c
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Creatives Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-stone-200 rounded" />
                <div className="h-5 w-16 bg-stone-200 rounded" />
              </div>
              <div className="h-6 w-3/4 bg-stone-200 rounded" />
              <div className="h-4 w-1/2 bg-stone-200 rounded" />
              <div className="h-10 bg-stone-100 rounded-lg" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={fetchCreatives}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredCreatives.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
          <Sparkles className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">No creatives match your filter</h3>
          <p className="text-xs text-stone-500 mt-1">Try resetting the search query or concept filters.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredCreatives.map((creative, index) => (
            <motion.div
              key={creative.creative_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              onClick={() => navigate(`/creatives/${creative.creative_id}`)}
              className="bg-white rounded-2xl border border-stone-200 p-5 cursor-pointer flex flex-col justify-between group shadow-xs hover:shadow-md hover:border-slate-400 transition-all"
            >
              <div>
                {/* Top Bar: ID, Format Badge, Provenance */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-stone-800 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200">
                    {creative.creative_id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 capitalize border border-stone-200">
                      {getFormatIcon(creative.format)}
                      {creative.format}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {creative.provenance}
                    </span>
                  </div>
                </div>

                {/* Headline */}
                <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 mb-2.5 leading-snug">
                  {creative.headline || 'Ad Creative'}
                </h3>

                {/* Campaign & Theme Info */}
                <div className="space-y-1.5 text-xs text-stone-500 mb-4">
                  {creative.campaign && (
                    <div className="truncate">
                      <span className="font-semibold text-stone-700">Campaign:</span> {creative.campaign.name}
                    </div>
                  )}
                  {creative.product_theme && (
                    <div>
                      <span className="font-semibold text-stone-700">Theme:</span>{' '}
                      <span className="capitalize">{creative.product_theme.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer: Tags and CTA trigger */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {creative.concept && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 capitalize border border-stone-200">
                      {creative.concept.replace(/_/g, ' ')}
                    </span>
                  )}
                  {getCtaBadge(creative.cta)}
                </div>

                <div className="p-2 rounded-xl bg-stone-100 text-stone-600 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
