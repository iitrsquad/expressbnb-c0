import { useState, useEffect } from 'react';
import { ArrowLeft, SlidersHorizontal, X, MapPin, CheckCircle, Clock, Zap, Shield, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ConversionPropertyCard from '../components/ConversionPropertyCard';
import SEOHead from '../components/SEOHead';
import type { Property } from '../lib/database.types';

interface CityListingPageProps {
  city: string;
}

const CITY_DISPLAY_NAMES: Record<string, string> = {
  'delhi': 'Delhi',
  'gurgaon': 'Gurgaon',
  'noida': 'Noida',
  'greater-noida': 'Greater Noida',
  'rishikesh': 'Rishikesh',
};

const CITY_META: Record<string, { tagline: string; bg: string }> = {
  'Delhi': { tagline: 'Capital stays at unbeatable prices', bg: 'from-slate-700 to-slate-900' },
  'Gurgaon': { tagline: 'Modern living in Millennium City', bg: 'from-blue-700 to-slate-900' },
  'Noida': { tagline: 'Tech city verified stays', bg: 'from-teal-700 to-slate-900' },
  'Greater Noida': { tagline: 'Spacious homes, serene surroundings', bg: 'from-green-700 to-slate-900' },
  'Rishikesh': { tagline: 'Yoga capital riverside retreats', bg: 'from-orange-600 to-slate-900' },
};

const QUICK_FILTERS = [
  { key: 'coupleFriendly', label: 'Couple Friendly', icon: Shield },
  { key: 'hourlyStay', label: 'Hourly Stay', icon: Clock },
  { key: 'verified', label: 'Verified', icon: CheckCircle },
  { key: 'instantBooking', label: 'Instant Book', icon: Zap },
  { key: 'privateSpace', label: 'Private Space', icon: Star },
] as const;

type FilterKey = typeof QUICK_FILTERS[number]['key'];

interface Filters {
  coupleFriendly: boolean;
  hourlyStay: boolean;
  verified: boolean;
  instantBooking: boolean;
  privateSpace: boolean;
  minPrice: number;
  maxPrice: number;
}

const DEFAULT_FILTERS: Filters = {
  coupleFriendly: false,
  hourlyStay: false,
  verified: false,
  instantBooking: false,
  privateSpace: false,
  minPrice: 0,
  maxPrice: 50000,
};

export default function CityListingPage({ city }: CityListingPageProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'rating'>('recommended');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const cityName = CITY_DISPLAY_NAMES[city] || city;
  const cityMeta = CITY_META[cityName];

  useEffect(() => {
    loadProperties();
  }, [city]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [properties, filters, sortBy]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .eq('city', cityName)
        .order('is_verified', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...properties];

    if (filters.coupleFriendly) filtered = filtered.filter(p => p.is_couple_friendly);
    if (filters.hourlyStay) filtered = filtered.filter(p => p.hourly_stay_available);
    if (filters.verified) filtered = filtered.filter(p => p.is_verified);
    if (filters.instantBooking) filtered = filtered.filter(p => p.instant_booking);
    if (filters.privateSpace) filtered = filtered.filter(p => p.is_private_space);

    filtered = filtered.filter(p => {
      const price = p.price_per_day || p.price_full_day || 0;
      return price >= filters.minPrice && price <= filters.maxPrice;
    });

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price_per_day || 0) - (b.price_per_day || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price_per_day || 0) - (a.price_per_day || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    setFilteredProperties(filtered);
  };

  const toggleQuickFilter = (key: FilterKey) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeFilterCount = QUICK_FILTERS.filter(f => filters[f.key]).length;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        config={{
          title: `Verified Stays in ${cityName} | Couple Friendly, No Brokerage | XpressBnB`,
          description: `Book verified homes and apartments in ${cityName}. Couple-friendly, hourly stays available. No commission, pay at property. Best prices guaranteed.`,
          keywords: `stays in ${cityName}, couple friendly ${cityName}, verified properties ${cityName}, no brokerage ${cityName}, apartments ${cityName}`,
          canonical: `https://xpressbnb.com/stays/${city}`,
        }}
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 -ml-1 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 leading-tight">Stays in {cityName}</h1>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>
                {loading ? 'Loading...' : `${filteredProperties.length} of ${properties.length} properties`}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-semibold text-sm transition-all ${
              hasActiveFilters
                ? 'bg-gray-900 border-gray-900 text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick filter chips + sort */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="flex-shrink-0 px-3 py-2 border border-gray-200 rounded-full text-sm font-semibold bg-white text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer"
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

          {QUICK_FILTERS.map(({ key, label, icon: Icon }) => {
            const active = filters[key];
            return (
              <button
                key={key}
                onClick={() => toggleQuickFilter(key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all ${
                  active
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </header>

      {/* City hero banner */}
      {!loading && properties.length > 0 && (
        <div className={`bg-gradient-to-r ${cityMeta?.bg || 'from-gray-700 to-gray-900'} px-4 py-5`}>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">{cityName}</p>
          <p className="text-white font-bold text-lg leading-tight">{cityMeta?.tagline}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="px-2.5 py-1 bg-white/15 rounded-full text-white text-xs font-medium">{properties.length} properties</span>
            <span className="px-2.5 py-1 bg-white/15 rounded-full text-white text-xs font-medium">No commission</span>
            <span className="px-2.5 py-1 bg-white/15 rounded-full text-white text-xs font-medium">Pay at property</span>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 pt-5 pb-28">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[4/3] rounded-2xl bg-gray-200 animate-pulse" />
                <div className="h-3.5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                <div className="h-3.5 w-1/3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No stays found</h3>
            <p className="text-gray-500 text-sm mb-5 max-w-xs leading-relaxed">
              {hasActiveFilters
                ? 'Try removing some filters to see more results.'
                : `We don't have listings in ${cityName} yet. Check back soon!`}
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing <span className="font-semibold text-gray-900">{filteredProperties.length}</span> stays
              {hasActiveFilters && (
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="ml-2 text-rose-600 font-semibold hover:underline"
                >
                  Clear filters
                </button>
              )}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProperties.map(property => (
                <ConversionPropertyCard key={property.id} property={property} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Filters Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />

          <div className="relative bg-white w-full md:max-w-lg md:rounded-3xl rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl">
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {/* Property type */}
              <div>
                <h3 className="font-bold text-base text-gray-900 mb-4">Property type</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {QUICK_FILTERS.map(({ key, label, icon: Icon }) => {
                    const active = filters[key];
                    return (
                      <button
                        key={key}
                        onClick={() => toggleQuickFilter(key)}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 text-sm font-semibold transition-all text-left ${
                          active
                            ? 'bg-gray-900 border-gray-900 text-white'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price range */}
              <div>
                <h3 className="font-bold text-base text-gray-900 mb-1">Price range</h3>
                <p className="text-xs text-gray-500 mb-4">Per night in INR</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Min price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                      <input
                        type="number"
                        value={filters.minPrice || ''}
                        onChange={e => setFilters({ ...filters, minPrice: Number(e.target.value) || 0 })}
                        className="w-full pl-7 pr-3 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-gray-900 transition-colors"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                      <input
                        type="number"
                        value={filters.maxPrice || ''}
                        onChange={e => setFilters({ ...filters, maxPrice: Number(e.target.value) || 50000 })}
                        className="w-full pl-7 pr-3 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-gray-900 transition-colors"
                        placeholder="50,000"
                      />
                    </div>
                  </div>
                </div>

                {/* Price presets */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[
                    { label: 'Under ₹1k', min: 0, max: 1000 },
                    { label: '₹1k–3k', min: 1000, max: 3000 },
                    { label: '₹3k–8k', min: 3000, max: 8000 },
                    { label: '₹8k+', min: 8000, max: 50000 },
                  ].map(preset => {
                    const active = filters.minPrice === preset.min && filters.maxPrice === preset.max;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => setFilters({ ...filters, minPrice: preset.min, maxPrice: preset.max })}
                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                          active
                            ? 'bg-gray-900 border-gray-900 text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex gap-3 bg-white">
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="flex-1 px-5 py-3.5 border-2 border-gray-200 rounded-2xl font-semibold text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-5 py-3.5 bg-gray-900 text-white rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-colors"
              >
                Show {filteredProperties.length} stays
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
