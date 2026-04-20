import { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, Sparkles, Shield, Zap, Award, MapPin, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ConversionPropertyCard from './ConversionPropertyCard';
import SEOHead from './SEOHead';
import { generateOrganizationStructuredData } from '../lib/seo';
import type { Property } from '../lib/database.types';

const CITIES = ['Delhi', 'Gurgaon', 'Noida', 'Greater Noida', 'Rishikesh'];

const CITY_META: Record<string, { emoji: string; tagline: string }> = {
  Delhi: { emoji: '🏙️', tagline: 'Capital stays, unbeatable prices' },
  Gurgaon: { emoji: '🏢', tagline: 'Modern living in Millennium City' },
  Noida: { emoji: '🌆', tagline: 'Tech city verified stays' },
  'Greater Noida': { emoji: '🏘️', tagline: 'Spacious homes, serene surroundings' },
  Rishikesh: { emoji: '🏔️', tagline: 'Yoga capital, riverside retreats' },
};

export default function NewHomepage() {
  const [propertiesByCity, setPropertiesByCity] = useState<Record<string, Property[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('homes');
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    loadPropertiesByCity();
    const handleScroll = () => setScrollY(window.scrollY);
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

  const headerScrolled = scrollY > 20;
  const totalProperties = Object.values(propertiesByCity).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        config={{
          title: 'XpressBnB - Verified Stays in Delhi NCR | No Commission, Best Price Guaranteed',
          description: 'Book verified homes and apartments directly from hosts. Couple-friendly stays in Delhi, Gurgaon, Noida at lowest prices. No brokerage, pay at property.',
          keywords: 'couple friendly stays delhi, verified properties noida, no brokerage apartments, hourly stay delhi, best price accommodation gurgaon',
          canonical: 'https://xpressbnb.com',
          structuredData: generateOrganizationStructuredData(),
        }}
      />

      {/* Sticky Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          headerScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100'
            : 'bg-white'
        }`}
      >
        <div className="px-4 pt-3 pb-2">
          {/* Logo row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img src="/90d3767f-65eb-431d-8005-c9f9bb5f2fde.png" alt="XpressBnB" className="h-9" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/host/login');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="text-sm font-semibold text-gray-700 px-4 py-2 rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                Host login
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 rounded-full hover:bg-gray-100 active:scale-95 transition-all border border-gray-200"
              >
                <div className="space-y-1.5">
                  <div className="w-5 h-0.5 bg-gray-800 rounded-full" />
                  <div className="w-5 h-0.5 bg-gray-800 rounded-full" />
                  <div className="w-5 h-0.5 bg-gray-800 rounded-full" />
                </div>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <button
            onClick={handleSearchClick}
            className="w-full group"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300 transition-all duration-200 group-active:scale-[0.99]">
              <div className="p-1.5 bg-rose-500 rounded-xl">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold text-gray-900">Where to?</div>
                <div className="text-xs text-gray-400">Delhi NCR · Rishikesh · Any week</div>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide mt-1">
          {['homes', 'experiences', 'services'].map(tab => (
            <button
              key={tab}
              onClick={() => tab === 'homes' && setActiveTab(tab)}
              disabled={tab !== 'homes'}
              className={`relative pb-2.5 pt-1 px-1 whitespace-nowrap text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'text-gray-900'
                  : 'text-gray-400 cursor-not-allowed'
              } mr-5`}
            >
              {tab}
              {tab !== 'homes' && (
                <span className="ml-1.5 text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">Soon</span>
              )}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Hero Stats Bar */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-100" />
            <span className="text-white text-sm font-medium">
              {loading ? '...' : totalProperties}+ verified properties
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-rose-100 text-xs font-medium">Live availability</span>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {[
            { icon: Sparkles, label: '100% Verified', sub: 'Every property checked', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
            { icon: Zap, label: 'No Commission', sub: 'Zero platform fees', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
            { icon: Shield, label: 'Pay at Property', sub: 'No advance payment', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { icon: Award, label: 'Best Price', sub: 'Guaranteed lowest', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
          ].map(({ icon: Icon, label, sub, color, bg, border }) => (
            <div
              key={label}
              className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border ${bg} ${border}`}
            >
              <div className={`${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 whitespace-nowrap">{label}</div>
                <div className="text-[10px] text-gray-500 whitespace-nowrap">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* City Quick Jump */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CITIES.map(city => (
            <button
              key={city}
              onClick={() => handleCityClick(city)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-gray-700 text-sm font-medium transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto pb-24">
        {loading ? (
          <div className="space-y-10 px-4 pt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-44 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="flex-shrink-0 w-72">
                      <div className="bg-white rounded-3xl overflow-hidden shadow border border-gray-100">
                        <div className="h-52 bg-gray-200 animate-pulse" />
                        <div className="p-4 space-y-3">
                          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                          <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10 pt-8">
            {CITIES.map((city, index) => {
              const properties = propertiesByCity[city] || [];
              if (properties.length === 0) return null;
              const meta = CITY_META[city];

              return (
                <section
                  key={city}
                  className="space-y-4"
                  style={{ animationDelay: `${index * 80}ms`, animation: 'fadeInUp 0.5s ease-out both' }}
                >
                  {/* Section header */}
                  <div className="flex items-end justify-between px-4">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xl">{meta?.emoji}</span>
                        <h2 className="text-xl font-bold text-gray-900">
                          Stays in {city}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500 ml-8">
                        {meta?.tagline} · <span className="font-medium text-gray-700">{properties.length} available</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleCityClick(city)}
                      className="flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700 group transition-colors"
                    >
                      See all
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {/* Horizontal scroll row */}
                  <div
                    ref={el => { scrollRefs.current[city] = el; }}
                    className="overflow-x-auto scrollbar-hide"
                    style={{ scrollSnapType: 'x mandatory' }}
                  >
                    <div className="flex gap-4 px-4 pb-2">
                      {properties.slice(0, 10).map((property, idx) => (
                        <div
                          key={property.id}
                          className="flex-shrink-0 w-72"
                          style={{ scrollSnapAlign: 'start', animationDelay: `${idx * 40}ms` }}
                        >
                          <ConversionPropertyCard property={property} />
                        </div>
                      ))}

                      {/* View all card */}
                      {properties.length > 5 && (
                        <div className="flex-shrink-0 w-52 flex items-center justify-center" style={{ scrollSnapAlign: 'start' }}>
                          <button
                            onClick={() => handleCityClick(city)}
                            className="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-dashed border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-all group w-full h-full min-h-[200px] justify-center"
                          >
                            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                              <ChevronRight className="w-6 h-6 text-rose-600" />
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-gray-900 text-sm">See all</div>
                              <div className="text-xs text-gray-500">{properties.length} in {city}</div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}

            {/* Why XpressBnB */}
            <section className="mx-4 mt-4 rounded-3xl overflow-hidden">
              <div className="bg-gray-900 px-6 pt-10 pb-8">
                <div className="text-center mb-8">
                  <span className="inline-block px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    Why Choose Us
                  </span>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    India's smartest way to book stays
                  </h2>
                  <p className="text-gray-400 text-sm">No middlemen. No hidden fees. Just great stays.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: Sparkles,
                      title: '100% Verified',
                      desc: 'Every property personally checked by our team before listing.',
                      accent: 'text-amber-400',
                      bg: 'bg-amber-400/10',
                    },
                    {
                      icon: Zap,
                      title: 'Zero Commission',
                      desc: 'Book directly with the host. What you see is what you pay.',
                      accent: 'text-green-400',
                      bg: 'bg-green-400/10',
                    },
                    {
                      icon: Shield,
                      title: 'Pay at Property',
                      desc: 'No advance payment stress. Pay when you arrive, leave happy.',
                      accent: 'text-blue-400',
                      bg: 'bg-blue-400/10',
                    },
                  ].map(({ icon: Icon, title, desc, accent, bg }) => (
                    <div key={title} className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className={`flex-shrink-0 w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${accent}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm mb-1">{title}</h3>
                        <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* City Explore Grid */}
            <section className="px-4 mt-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Explore destinations</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CITIES.map(city => {
                  const count = propertiesByCity[city]?.length || 0;
                  if (count === 0) return null;
                  const meta = CITY_META[city];
                  return (
                    <button
                      key={city}
                      onClick={() => handleCityClick(city)}
                      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-left hover:border-rose-200 hover:shadow-md transition-all"
                    >
                      <div className="text-2xl mb-2">{meta?.emoji}</div>
                      <div className="font-bold text-gray-900 text-sm">{city}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{count} properties</div>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-10 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8">
            <img src="/90d3767f-65eb-431d-8005-c9f9bb5f2fde.png" alt="XpressBnB" className="h-10 mb-3" />
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              India's first zero-commission property booking platform. Direct. Simple. Smart.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['100% Verified', 'No Commission', 'Pay at Property', 'Couple Friendly', 'Instant Booking'].map(tag => (
              <span key={tag} className="px-3 py-1.5 bg-gray-50 rounded-full text-xs font-semibold text-gray-600 border border-gray-200">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm text-gray-500">
            <button className="hover:text-gray-900 transition-colors">About</button>
            <button className="hover:text-gray-900 transition-colors">List your property</button>
            <button className="hover:text-gray-900 transition-colors">Privacy</button>
            <button className="hover:text-gray-900 transition-colors">Terms</button>
            <button className="hover:text-gray-900 transition-colors">Contact</button>
          </div>

          <div className="text-center border-t border-gray-100 pt-6">
            <p className="text-gray-400 text-xs mb-1">© 2025 XpressBnB. All rights reserved.</p>
            <p className="text-rose-500 text-sm font-bold">India's Smarter Stay</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
