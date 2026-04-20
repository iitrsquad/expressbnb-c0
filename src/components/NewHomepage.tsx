import { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, Sparkles, Shield, Zap, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ConversionPropertyCard from './ConversionPropertyCard';
import SEOHead from './SEOHead';
import { generateOrganizationStructuredData } from '../lib/seo';
import type { Property } from '../lib/database.types';

const CITIES = ['Delhi', 'Gurgaon', 'Noida', 'Greater Noida', 'Rishikesh'];

export default function NewHomepage() {
  const [propertiesByCity, setPropertiesByCity] = useState<Record<string, Property[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('homes');
  const [scrollY, setScrollY] = useState(0);
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    loadPropertiesByCity();

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadPropertiesByCity = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('is_verified', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;

      const groupedByCity: Record<string, Property[]> = {};
      CITIES.forEach(city => {
        groupedByCity[city] = (data || []).filter(p => p.city === city);
      });

      setPropertiesByCity(groupedByCity);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCityClick = (city: string) => {
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    window.history.pushState({}, '', `/stays/${citySlug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const headerOpacity = Math.min(scrollY / 100, 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <SEOHead
        config={{
          title: 'XpressBnB - Verified Stays in Delhi NCR | No Commission, Best Price Guaranteed',
          description: 'Book verified homes and apartments directly from hosts. Couple-friendly stays in Delhi, Gurgaon, Noida at lowest prices. No brokerage, pay at property.',
          keywords: 'couple friendly stays delhi, verified properties noida, no brokerage apartments, hourly stay delhi, best price accommodation gurgaon',
          canonical: 'https://xpressbnb.com',
          structuredData: generateOrganizationStructuredData(),
        }}
      />

      {/* Ultra-Premium Sticky Header */}
      <header
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: `rgba(255, 255, 255, ${0.7 + headerOpacity * 0.3})`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid rgba(0, 0, 0, ${0.05 + headerOpacity * 0.05})`,
        }}
      >
        <div className="px-4 py-3">
          {/* Logo & Menu */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img src="/logo.svg" alt="XpressBnB" className="h-9" />
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full opacity-20 blur-md -z-10" />
              </div>
            </div>
            <button className="relative p-2.5 rounded-full hover:bg-gray-100/80 active:scale-95 transition-all">
              <div className="space-y-1.5">
                <div className="w-5 h-0.5 bg-gray-900 rounded-full transition-all" />
                <div className="w-5 h-0.5 bg-gray-900 rounded-full transition-all" />
                <div className="w-5 h-0.5 bg-gray-900 rounded-full transition-all" />
              </div>
            </button>
          </div>

          {/* Premium Search Bar */}
          <button
            onClick={handleSearchClick}
            className="w-full group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            <div className="relative flex items-center gap-3 px-5 py-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg shadow-gray-200/50 group-hover:shadow-xl group-hover:shadow-pink-200/30 transition-all duration-300 group-active:scale-[0.98]">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold text-gray-900">Where to?</div>
                <div className="text-xs text-gray-500">Search destinations</div>
              </div>
            </div>
          </button>
        </div>

        {/* Category Tabs with Gradient */}
        <div className="relative px-4 pb-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('homes')}
              className="relative pb-3 whitespace-nowrap font-bold transition-all group"
            >
              <span className={`transition-all ${
                activeTab === 'homes'
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600'
                  : 'text-gray-500 group-hover:text-gray-900'
              }`}>
                Homes
              </span>
              {activeTab === 'homes' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg shadow-pink-300/50" />
              )}
            </button>
            <button disabled className="relative pb-3 whitespace-nowrap font-bold text-gray-300 cursor-not-allowed">
              Experiences
              <span className="ml-2 text-xs bg-gradient-to-r from-gray-100 to-gray-200 px-2.5 py-1 rounded-full">Soon</span>
            </button>
            <button disabled className="relative pb-3 whitespace-nowrap font-bold text-gray-300 cursor-not-allowed">
              Services
              <span className="ml-2 text-xs bg-gradient-to-r from-gray-100 to-gray-200 px-2.5 py-1 rounded-full">Soon</span>
            </button>
          </div>
        </div>
      </header>

      {/* Premium Trust Badges */}
      <div className="relative py-6 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="relative flex items-center justify-center gap-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-2xl shadow-lg shadow-amber-100/50 border border-amber-100 whitespace-nowrap group hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">100% Verified</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-2xl shadow-lg shadow-green-100/50 border border-green-100 whitespace-nowrap group hover:shadow-xl hover:shadow-green-200/50 transition-all duration-300">
            <div className="p-2 bg-gradient-to-br from-green-400 to-green-500 rounded-xl">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">No Commission</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100 whitespace-nowrap group hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl">
              <Award className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Best Price</span>
          </div>
        </div>
      </div>

      {/* City-Wise Sections */}
      <div className="max-w-7xl mx-auto pb-20">
        {loading ? (
          <div className="space-y-10 px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-8 w-40 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse" />
                  <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse" />
                </div>
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex-shrink-0 w-80">
                      <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                        <div className="h-64 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                        <div className="p-4 space-y-3">
                          <div className="h-5 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
                          <div className="h-4 w-1/2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
                          <div className="h-6 w-1/3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {CITIES.map((city, index) => {
              const properties = propertiesByCity[city] || [];
              if (properties.length === 0) return null;

              return (
                <section key={city} className="space-y-4" style={{ animationDelay: `${index * 100}ms` }}>
                  {/* Premium Section Header */}
                  <div className="flex items-center justify-between px-4">
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Homes in {city}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">{properties.length} properties available</p>
                    </div>
                    <button
                      onClick={() => handleCityClick(city)}
                      className="group flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50 hover:gap-2.5 transition-all duration-300 active:scale-95"
                    >
                      <span className="text-sm">Explore</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>

                  {/* Premium Horizontal Scroll */}
                  <div
                    ref={(el) => scrollRefs.current[city] = el}
                    className="overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ scrollSnapType: 'x mandatory' }}
                  >
                    <div className="flex gap-5 px-4 pb-3">
                      {properties.slice(0, 10).map((property, idx) => (
                        <div
                          key={property.id}
                          className="flex-shrink-0 w-80"
                          style={{
                            scrollSnapAlign: 'start',
                            animation: 'fadeInUp 0.6s ease-out',
                            animationDelay: `${idx * 50}ms`,
                            animationFillMode: 'both'
                          }}
                        >
                          <ConversionPropertyCard property={property} />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Recently Viewed Section */}
        <section className="mt-12 px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recently viewed</h2>
          <p className="text-gray-500">Your recently viewed properties will appear here</p>
        </section>

        {/* Premium Why XpressBnB */}
        <section className="mt-16 px-4 py-12 mx-4 relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

          <div className="relative">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Why XpressBnB?
              </h2>
              <p className="text-gray-600 text-sm font-medium">India's smartest way to book stays</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="group text-center bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                <div className="relative inline-block mb-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-300/50 rotate-3 group-hover:rotate-6 transition-transform duration-500">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">100% Verified</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Every property is personally verified by our team for your safety</p>
              </div>

              <div className="group text-center bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                <div className="relative inline-block mb-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-300/50 -rotate-3 group-hover:-rotate-6 transition-transform duration-500">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">No Commission</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Direct booking with hosts. Zero platform fees, maximum savings</p>
              </div>

              <div className="group text-center bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                <div className="relative inline-block mb-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-300/50 rotate-3 group-hover:rotate-6 transition-transform duration-500">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">Pay at Property</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Flexible payment options. Pay when you check-in, stay stress-free</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Premium Footer */}
      <footer className="relative mt-16 py-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDIiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="XpressBnB" className="h-8" />
            </div>
            <p className="text-gray-600 text-sm font-medium max-w-md mx-auto">
              India's first zero-commission property booking platform. Direct. Simple. Smart.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="px-4 py-2 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-sm border border-gray-200">
              100% Verified
            </span>
            <span className="px-4 py-2 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-sm border border-gray-200">
              No Commission
            </span>
            <span className="px-4 py-2 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-sm border border-gray-200">
              Pay at Property
            </span>
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-xs mb-2">© 2025 XpressBnB. All rights reserved.</p>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 text-sm font-bold">
              India's Smarter Stay
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
