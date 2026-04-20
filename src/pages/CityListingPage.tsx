import { useState, useEffect } from 'react';
import { ArrowLeft, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ConversionPropertyCard from '../components/ConversionPropertyCard';
import MapView from '../components/MapView';
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

export default function CityListingPage({ city }: CityListingPageProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'rating'>('recommended');

  const [filters, setFilters] = useState({
    coupleFriendly: false,
    hourlyStay: false,
    verified: false,
    instantBooking: false,
    privateSpace: false,
    minPrice: 0,
    maxPrice: 50000,
  });

  const cityName = CITY_DISPLAY_NAMES[city] || city;

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

    if (filters.coupleFriendly) {
      filtered = filtered.filter(p => p.is_couple_friendly);
    }
    if (filters.hourlyStay) {
      filtered = filtered.filter(p => p.hourly_stay_available);
    }
    if (filters.verified) {
      filtered = filtered.filter(p => p.is_verified);
    }
    if (filters.instantBooking) {
      filtered = filtered.filter(p => p.instant_booking);
    }
    if (filters.privateSpace) {
      filtered = filtered.filter(p => p.is_private_space);
    }

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

  const handleBack = () => {
    window.history.back();
  };

  const activeFilterCount = Object.values(filters).filter(v =>
    typeof v === 'boolean' && v === true
  ).length;

  return (
    <div className="min-h-screen bg-white parallax-container">
      <SEOHead
        config={{
          title: `Verified Stays in ${cityName} | Couple Friendly, No Brokerage | XpressBnB`,
          description: `Book verified homes and apartments in ${cityName}. Couple-friendly, hourly stays available. No commission, pay at property. Best prices guaranteed.`,
          keywords: `stays in ${cityName}, couple friendly ${cityName}, verified properties ${cityName}, no brokerage ${cityName}, apartments ${cityName}`,
          canonical: `https://xpressbnb.com/stays/${city}`,
        }}
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={handleBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Homes in {cityName}</h1>
          <div className="w-10" />
        </div>

        {/* Filters Bar */}
        <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto scrollbar-hide border-t border-gray-100">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-full hover:border-gray-400 transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="font-semibold">Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border-2 border-gray-300 rounded-full font-semibold bg-white"
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="relative">
          <div className="fixed top-[140px] left-0 right-0 h-[50vh] z-0 parallax-hero">
            <MapView
              properties={filteredProperties}
              selectedProperty={null}
              onPropertyClick={() => {}}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20" />
          </div>

          <div className="relative z-10 pt-[45vh] parallax-properties">
            <div className="bg-white rounded-t-[2.5rem] shadow-2xl min-h-screen transform transition-all duration-300">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <p className="text-gray-600 mb-6 pt-4">{filteredProperties.length} stays in {cityName}</p>

                {filteredProperties.length === 0 ? (
                  <div className="text-center py-20">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
                    <p className="text-gray-600">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                    {filteredProperties.map(property => (
                      <ConversionPropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center md:justify-center">
          <div className="bg-white w-full md:max-w-lg md:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Options */}
            <div className="p-6 space-y-6">
              {/* Quick Filters */}
              <div>
                <h3 className="font-bold text-lg mb-3">Property Type</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.coupleFriendly}
                      onChange={(e) => setFilters({ ...filters, coupleFriendly: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span>Couple Friendly</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hourlyStay}
                      onChange={(e) => setFilters({ ...filters, hourlyStay: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span>Hourly Stay Available</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.privateSpace}
                      onChange={(e) => setFilters({ ...filters, privateSpace: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span>Private Space</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.instantBooking}
                      onChange={(e) => setFilters({ ...filters, instantBooking: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span>Instant Booking</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span>Verified Properties Only</span>
                  </label>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-bold text-lg mb-3">Price Range</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min Price</label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="₹0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="₹50,000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setFilters({
                    coupleFriendly: false,
                    hourlyStay: false,
                    verified: false,
                    instantBooking: false,
                    privateSpace: false,
                    minPrice: 0,
                    maxPrice: 50000,
                  });
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-900 rounded-full font-semibold hover:bg-gray-50"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-700"
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
