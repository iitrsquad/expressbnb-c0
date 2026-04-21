import { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, Sparkles, Shield, Zap, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ConversionPropertyCard from './ConversionPropertyCard';
import SEOHead from './SEOHead';
import { generateOrganizationStructuredData } from '../lib/seo';
import type { Property } from '../lib/database.types';

const CITIES = ['Delhi', 'Gurgaon', 'Noida', 'Greater Noida', 'Rishikesh'];

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1800&q=80',
    city: 'Delhi',
    place: 'India Gate',
    tagline: 'Capital stays, unbeatable prices',
  },
  {
    image: 'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=1800&q=80',
    city: 'Delhi',
    place: 'Connaught Place',
    tagline: 'Heart of the city, verified homes',
  },
  {
    image: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=1800&q=80',
    city: 'Gurgaon',
    place: 'Cyber City',
    tagline: 'Corporate hub, private stays',
  },
  {
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1800&q=80',
    city: 'Noida',
    place: 'Sector 62',
    tagline: 'Modern city, affordable comfort',
  },
  {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&q=80',
    city: 'Rishikesh',
    place: 'The Ganges',
    tagline: 'Escape to the mountains',
  },
];

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
  const [activeCity, setActiveCity] = useState<string>('Delhi');
  const [heroIndex, setHeroIndex] = useState(0);
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    loadPropertiesByCity();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(t);
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

  const scrollToListings = () => {
    const el = document.getElementById('listings');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }
  };

  const handleHostLogin = () => {
    window.history.pushState({}, '', '/host/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleCityClick = (city: string) => {
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    window.history.pushState({}, '', `/stays/${citySlug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleCityPillClick = (city: string) => {
    setActiveCity(city);
    handleCityClick(city);
  };

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

      {/* Sticky Navbar */}
      <header
        className="sticky top-0 z-50 bg-white"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-10 flex items-center justify-between h-[60px] md:h-[72px]">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/90d3767f-65eb-431d-8005-c9f9bb5f2fde.png" alt="XpressBnB" className="h-8 md:h-9 w-8 md:w-9 object-contain" />
            <span className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
              Xpress<span className="text-[#ff385c]">BnB</span>
            </span>
          </div>

          {/* Center nav (desktop only) */}
          <nav className="hidden md:flex items-center gap-1">
            <button className="px-5 py-2 rounded-full text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
              Homes
            </button>
            <button
              disabled
              className="px-5 py-2 rounded-full text-sm font-semibold text-gray-400 cursor-default"
            >
              Experiences
            </button>
            <button
              disabled
              className="px-5 py-2 rounded-full text-sm font-semibold text-gray-400 cursor-default"
            >
              Services
            </button>
          </nav>

          {/* Host login */}
          <button
            onClick={handleHostLogin}
            className="bg-[#ff385c] text-white rounded-full px-5 md:px-6 py-2 md:py-2.5 font-semibold text-sm hover:bg-[#e8314f] transition-colors shadow-sm"
          >
            Host Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="relative w-full overflow-hidden" style={{ height: '92vh', minHeight: '520px' }}>
        {/* Background images — stacked, crossfade */}
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${slide.image})`,
              opacity: i === heroIndex ? 1 : 0,
              transition: 'opacity 1.2s ease-in-out',
              zIndex: 0,
            }}
          />
        ))}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.75) 100%)',
            zIndex: 1,
          }}
        />

        {/* City label — bottom left, changes with slide */}
        <div className="absolute bottom-24 left-10 hidden md:block" style={{ zIndex: 2 }}>
          <p
            key={heroIndex}
            className="text-white font-bold text-sm tracking-widest uppercase opacity-70 mb-1"
            style={{ animation: 'fadeSlideUp 0.6s ease forwards' }}
          >
            {HERO_SLIDES[heroIndex].city}
          </p>
          <p
            key={'place-' + heroIndex}
            className="text-white font-bold text-2xl"
            style={{ animation: 'fadeSlideUp 0.6s ease forwards' }}
          >
            {HERO_SLIDES[heroIndex].place}
          </p>
        </div>

        {/* Dot indicators — bottom center */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2"
          style={{ zIndex: 2 }}
        >
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === heroIndex ? 28 : 8,
                height: 8,
                borderRadius: 9999,
                background: i === heroIndex ? '#ff385c' : 'rgba(255,255,255,0.45)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Main hero content — centered */}
        <div
          className="relative flex flex-col items-center justify-end h-full pb-20 md:pb-24 px-4 text-center"
          style={{ zIndex: 2 }}
        >
          <h1
            className="text-center text-white font-extrabold"
            style={{
              fontSize: 'clamp(32px, 5.5vw, 56px)',
              letterSpacing: '-0.5px',
              textShadow: '0 2px 20px rgba(0,0,0,0.4)',
              lineHeight: 1.1,
            }}
          >
            India's Smarter Stay
          </h1>
          <p
            className="text-center mt-3"
            style={{
              fontSize: 'clamp(14px, 1.4vw, 18px)',
              color: 'rgba(255,255,255,0.92)',
              fontWeight: 400,
              textShadow: '0 1px 8px rgba(0,0,0,0.35)',
            }}
          >
            Verified stays, zero commission, better prices
          </p>

          {/* Search bar */}
          <div
            className="mt-6 md:mt-8 flex items-center bg-white"
            style={{
              width: 'min(560px, calc(100% - 8px))',
              height: '56px',
              borderRadius: '40px',
              boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
              padding: '6px 6px 6px 22px',
            }}
          >
            <input
              type="text"
              placeholder="Luxury Search Here."
              onClick={scrollToListings}
              onFocus={scrollToListings}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
              style={{ fontSize: '14px', fontWeight: 500 }}
            />
            <button
              onClick={scrollToListings}
              aria-label="Filters"
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={scrollToListings}
              aria-label="Search"
              className="w-11 h-11 ml-1 rounded-xl bg-[#ff385c] hover:bg-[#e8314f] flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* City Quick Links */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div
          className="flex overflow-x-auto scrollbar-hide"
          style={{ gap: '10px', padding: '0 16px' }}
        >
          <div className="hidden md:block" style={{ width: '24px', flexShrink: 0 }} />
          {CITIES.map(city => {
            const isActive = activeCity === city;
            return (
              <button
                key={city}
                onClick={() => handleCityPillClick(city)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm border transition-all ${
                  isActive
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                {city}
              </button>
            );
          })}
          <div className="hidden md:block" style={{ width: '24px', flexShrink: 0 }} />
        </div>
      </div>

      {/* Main content */}
      <div id="listings" className="max-w-7xl mx-auto pb-24 scroll-mt-20">
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
            <div className="flex items-center gap-2 mb-3">
              <img src="/90d3767f-65eb-431d-8005-c9f9bb5f2fde.png" alt="XpressBnB" className="h-10 w-10 object-contain" />
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                Xpress<span className="text-rose-600">BnB</span>
              </span>
            </div>
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
