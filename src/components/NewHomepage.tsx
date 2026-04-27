import { useState, useEffect, useRef } from 'react';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Star,
  MapPin,
  Calendar,
  Users,
  Heart,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Zap,
  Lock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEOHead from './SEOHead';
import { generateOrganizationStructuredData } from '../lib/seo';
import type { Property } from '../lib/database.types';

const WARM = '#F4A261';
const BASE = '#1A1A1A';
const SURFACE = '#232323';
const SURFACE_LIGHT = '#2A2A2A';

const HERO_SLIDES = [
  {
    city: 'Gurgaon',
    tagline: 'Corporate hub, premium stays',
    image:
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    city: 'Delhi',
    tagline: 'Capital stays, unbeatable prices',
    image:
      'https://images.pexels.com/photos/2506988/pexels-photo-2506988.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    city: 'Rishikesh',
    tagline: 'Yoga capital, riverside retreats',
    image:
      'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    city: 'Noida',
    tagline: 'Modern city, verified comfort',
    image:
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    city: 'Greater Noida',
    tagline: 'Spacious homes, serene surroundings',
    image:
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
];

const CITIES = ['Delhi', 'Gurgaon', 'Noida', 'Greater Noida', 'Rishikesh'];

const CITY_IMAGES: Record<string, string> = {
  Delhi:
    'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=600',
  Gurgaon:
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600',
  Noida:
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Greater Noida':
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600',
  Rishikesh:
    'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=600',
};

const TRUST_BADGES = [
  { icon: CheckCircle, label: 'Verified Properties' },
  { icon: Lock, label: 'Secure Booking' },
  { icon: Zap, label: 'Zero Commission' },
];

interface Testimonial {
  id: string;
  name: string;
  avatar_url: string;
  location: string;
  rating: number;
  quote: string;
}

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 'f1',
    name: 'Aarav Mehta',
    avatar_url: 'https://i.pravatar.cc/120?img=12',
    location: 'New Delhi',
    rating: 5,
    quote:
      'Booked a verified apartment in Saket and the experience was flawless. Zero hidden fees and the host was incredible.',
  },
  {
    id: 'f2',
    name: 'Priya Sharma',
    avatar_url: 'https://i.pravatar.cc/120?img=47',
    location: 'Mumbai',
    rating: 5,
    quote:
      'XpressBnB feels premium without the premium price tag. The verification badge gave me real peace of mind.',
  },
  {
    id: 'f3',
    name: 'Rohan Iyer',
    avatar_url: 'https://i.pravatar.cc/120?img=33',
    location: 'Bengaluru',
    rating: 5,
    quote:
      'Used it for a 2-week corporate stay in Gurgaon. Direct-with-host model saved me almost 18% versus other platforms.',
  },
];

export default function NewHomepage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesByCity, setPropertiesByCity] = useState<Record<string, Property[]>>({});
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    loadProperties();
    loadTestimonials();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('is_verified', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
      const grouped: Record<string, Property[]> = {};
      CITIES.forEach(c => {
        grouped[c] = (data || []).filter(p => p.city === c);
      });
      setPropertiesByCity(grouped);
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_testimonials')
        .select('id, name, avatar_url, location, rating, quote')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        setTestimonials(data as Testimonial[]);
      }
    } catch {
      /* fallback testimonials remain */
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleCityClick = (city: string) => {
    navigate(`/stays/${city.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const featuredProperties = properties.slice(0, 8);

  return (
    <div className="min-h-screen" style={{ background: BASE, color: '#E8E8E8' }}>
      <SEOHead
        config={{
          title:
            'XpressBnB - Verified Stays in Delhi NCR | No Commission, Best Price Guaranteed',
          description:
            'Book verified homes and apartments directly from hosts. Premium stays in Delhi, Gurgaon, Noida and Rishikesh. No brokerage, zero commission.',
          keywords:
            'verified stays delhi, no brokerage apartments, premium stays noida, gurgaon serviced apartments, rishikesh retreats',
          canonical: 'https://xpressbnb.com',
          structuredData: generateOrganizationStructuredData(),
        }}
      />

      {/* ──── Navbar ──── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(26,26,26,0.92)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(16px) saturate(1.4)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-[72px] flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2"
          >
            <img
              src="/image.png"
              alt="XpressBnB"
              className="h-9 w-9 object-contain"
            />
            <span className="text-lg md:text-xl font-extrabold tracking-tight text-white">
              Xpress<span style={{ color: WARM }}>BnB</span>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {['Stays', 'Experiences', 'Host', 'About'].map(label => (
              <button
                key={label}
                onClick={() =>
                  label === 'Host'
                    ? navigate('/auth/login')
                    : scrollTo(label === 'Stays' ? 'listings' : label === 'About' ? 'why' : 'listings')
                }
                className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/8 transition-all"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/auth/login')}
              className="hidden md:inline-flex px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/auth/register')}
              className="rounded-full px-5 py-2.5 text-sm font-bold transition-all hover:scale-[1.03]"
              style={{ background: WARM, color: BASE }}
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* ──── Hero ──── */}
      <section className="relative w-full overflow-hidden" style={{ height: '100svh', minHeight: 580 }}>
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.city}
            className="absolute inset-0"
            style={{
              opacity: i === heroIndex ? 1 : 0,
              transition: 'opacity 1800ms ease-in-out',
            }}
          >
            <img
              src={slide.image}
              alt={slide.city}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: i === heroIndex ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 12000ms ease-out',
              }}
            />
          </div>
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.75) 100%)',
          }}
        />

        <div className="relative z-10 h-full flex flex-col justify-center px-4 md:px-8 max-w-7xl mx-auto pt-20 pb-4">
          <div className="flex-1 flex flex-col justify-center">
            <div className="max-w-xl">
              <h1
                className="text-white font-extrabold leading-[1.08] tracking-tight"
                style={{ fontSize: 'clamp(28px, 5vw, 52px)' }}
              >
                Find Your Verified Stay
              </h1>
              <p className="mt-3 text-base md:text-lg font-medium" style={{ color: WARM }}>
                Zero commission. Trusted hosts.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {HERO_SLIDES.map((s, i) => (
                <button
                  key={s.city}
                  onClick={() => setHeroIndex(i)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    background: i === heroIndex ? 'rgba(244,162,97,0.2)' : 'rgba(255,255,255,0.08)',
                    color: i === heroIndex ? WARM : 'rgba(255,255,255,0.5)',
                    border: i === heroIndex ? `1px solid ${WARM}` : '1px solid transparent',
                  }}
                >
                  <MapPin className="w-3 h-3" />
                  {s.city}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar inline at the bottom of the hero flex */}
          <div className="w-full max-w-3xl mt-6 mb-4 md:mb-8">
            <HeroSearchBar onSearch={() => scrollTo('listings')} />
          </div>
        </div>
      </section>

      {/* ──── Trust Strip ──── */}
      <section
        className="relative z-10 -mt-1"
        style={{ background: SURFACE }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-center gap-4 md:gap-12 py-4 overflow-x-auto scrollbar-hide">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 shrink-0 px-4 py-2.5 rounded-xl"
                style={{ background: SURFACE_LIGHT }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${WARM}18` }}
                >
                  <Icon className="w-4 h-4" style={{ color: WARM }} />
                </div>
                <span className="text-sm font-semibold text-white/90 whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Featured Stays ──── */}
      <section id="listings" className="scroll-mt-24" style={{ background: BASE }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-16 pb-10">
          <SectionHeader
            label="HANDPICKED FOR YOU"
            title="Featured Stays"
            subtitle="Premium verified properties from our community"
            action={
              <button
                onClick={() => handleCityClick('Delhi')}
                className="flex items-center gap-1 text-sm font-semibold transition-colors"
                style={{ color: WARM }}
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </button>
            }
          />

          {loading ? (
            <FeaturedSkeleton />
          ) : featuredProperties.length === 0 ? (
            <div className="py-16 text-center text-white/40 text-sm">
              No properties available right now.
            </div>
          ) : (
            <HorizontalScrollCards properties={featuredProperties} />
          )}
        </div>
      </section>

      {/* ──── Top Cities ──── */}
      <section style={{ background: SURFACE }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
          <SectionHeader
            label="EXPLORE"
            title="Top Destinations"
            subtitle="Verified homes across India's best cities"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {CITIES.slice(0, 4).map((city, idx) => {
              const count = propertiesByCity[city]?.length || 0;
              const cover = propertiesByCity[city]?.[0]?.images?.[0] || CITY_IMAGES[city];
              const isLarge = idx === 0 || idx === 3;
              return (
                <button
                  key={city}
                  onClick={() => handleCityClick(city)}
                  className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                    isLarge ? 'row-span-2 aspect-[3/4]' : 'aspect-square'
                  }`}
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                >
                  <img
                    src={cover}
                    alt={city}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute left-4 right-4 bottom-4 text-left">
                    <div className="text-white font-bold text-lg md:text-xl leading-tight">{city}</div>
                    <div className="text-white/60 text-xs mt-0.5">{count} properties</div>
                  </div>
                </button>
              );
            })}
          </div>

          {CITIES.length > 4 && (
            <div className="mt-3 grid grid-cols-1">
              <button
                onClick={() => handleCityClick(CITIES[4])}
                className="group relative h-40 md:h-48 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
              >
                <img
                  src={
                    propertiesByCity[CITIES[4]]?.[0]?.images?.[0] || CITY_IMAGES[CITIES[4]]
                  }
                  alt={CITIES[4]}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
                <div className="absolute left-5 bottom-5 text-left">
                  <div className="text-white font-bold text-xl">{CITIES[4]}</div>
                  <div className="text-white/60 text-xs mt-0.5">
                    {propertiesByCity[CITIES[4]]?.length || 0} properties
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ──── Social Proof ──── */}
      <section style={{ background: BASE }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-6 h-6" style={{ color: WARM }} fill={WARM} />
                ))}
              </div>
              <span className="text-3xl md:text-4xl font-extrabold text-white ml-2">4.8</span>
            </div>
            <p className="text-white/50 text-sm">from 50,000+ verified guest reviews</p>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-5 md:overflow-visible">
            {testimonials.slice(0, 3).map(t => (
              <article
                key={t.id}
                className="snap-start shrink-0 w-[85%] sm:w-[60%] md:w-auto rounded-2xl p-6"
                style={{ background: SURFACE }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar_url}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover ring-2"
                    style={{ ringColor: `${WARM}40` }}
                    loading="lazy"
                  />
                  <div>
                    <div className="font-bold text-white text-sm leading-tight">{t.name}</div>
                    <div className="text-xs text-white/40 mt-0.5">{t.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5"
                      style={{ color: i < t.rating ? WARM : '#444' }}
                      fill={i < t.rating ? WARM : 'transparent'}
                    />
                  ))}
                </div>
                <p className="mt-3 text-white/70 text-sm leading-relaxed line-clamp-2">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Host CTA ──── */}
      <section
        id="host"
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${SURFACE} 0%, ${BASE} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 80% 50%, ${WARM}30, transparent 60%)`,
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <h2
            className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight"
          >
            Earn with XpressBnB
          </h2>
          <p className="mt-3 text-white/50 text-base md:text-lg max-w-lg mx-auto">
            List your property in 5 minutes. Start earning from day one with zero platform fees.
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 font-bold text-base transition-all hover:scale-[1.03]"
            style={{
              background: WARM,
              color: BASE,
              boxShadow: `0 8px 32px ${WARM}40`,
            }}
          >
            Start Hosting
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ──── Why XpressBnB ──── */}
      <section id="why" className="scroll-mt-24" style={{ background: SURFACE }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <SectionHeader
            label="WHY XPRESSBNB"
            title="The premium way to book stays"
            subtitle="Direct relationships, transparent pricing, verified properties"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: ShieldCheck,
                title: '100% Verified',
                desc: 'Every property is personally inspected and approved before going live.',
              },
              {
                icon: Zap,
                title: 'Zero Commission',
                desc: 'Book directly from the host. No middlemen, no surprise fees.',
              },
              {
                icon: Lock,
                title: 'Secure Payments',
                desc: 'PCI-grade encryption and instant refunds keep your money protected.',
              },
              {
                icon: Star,
                title: 'Best Price Guarantee',
                desc: 'See a lower price elsewhere? We match it and credit the difference.',
              },
            ].map(card => (
              <div
                key={card.title}
                className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: SURFACE_LIGHT,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: `${WARM}15` }}
                >
                  <card.icon className="w-5 h-5" style={{ color: WARM }} />
                </div>
                <h3 className="mt-5 font-bold text-white text-lg">{card.title}</h3>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Footer ──── */}
      <footer
        style={{
          background: BASE,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <img
                  src="/image.png"
                  alt="XpressBnB"
                  className="h-9 w-9 object-contain"
                />
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Xpress<span style={{ color: WARM }}>BnB</span>
                </span>
              </div>
              <p className="mt-4 text-sm text-white/40 leading-relaxed max-w-xs">
                India&rsquo;s first zero-commission booking platform. Direct, verified, and
                beautifully simple.
              </p>
            </div>
            <FooterCol
              title="Explore"
              items={CITIES.map(c => ({ label: c, onClick: () => handleCityClick(c) }))}
            />
            <FooterCol
              title="Company"
              items={[
                { label: 'About', onClick: () => scrollTo('why') },
                { label: 'Become a Host', onClick: () => navigate('/auth/login') },
                { label: 'Help Center', onClick: () => scrollTo('why') },
              ]}
            />
            <FooterCol
              title="Legal"
              items={[
                { label: 'Privacy', onClick: () => {} },
                { label: 'Terms', onClick: () => {} },
                { label: 'Contact', onClick: () => {} },
              ]}
            />
          </div>
          <div
            className="pt-8 flex flex-col md:flex-row items-center justify-between gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs text-white/30">
              &copy; 2026 XpressBnB. All rights reserved.
            </p>
            <p className="text-xs font-semibold" style={{ color: WARM }}>
              India&rsquo;s Smarter Stay
            </p>
          </div>
        </div>
      </footer>

      <div className="h-20 md:hidden" />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════ */

function HeroSearchBar({ onSearch }: { onSearch: () => void }) {
  return (
    <>
      {/* Mobile: compact single-row pill */}
      <button
        onClick={onSearch}
        className="md:hidden flex items-center gap-3 w-full rounded-full px-4 py-3.5"
        style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px) saturate(1.6)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: WARM }}
        >
          <Search className="w-4 h-4" style={{ color: BASE }} />
        </div>
        <div className="text-left min-w-0">
          <div className="text-sm font-bold text-white">Where to?</div>
          <div className="text-xs text-white/40 truncate">Anywhere &middot; Any week &middot; Add guests</div>
        </div>
      </button>

      {/* Desktop: expanded search fields */}
      <div
        className="hidden md:block rounded-2xl p-2"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px) saturate(1.6)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}
      >
        <div className="flex items-center gap-1">
          <SearchField
            icon={<MapPin className="w-5 h-5" style={{ color: WARM }} />}
            label="Where to?"
            hint="Search city or area"
          />
          <span className="w-px h-8 bg-white/10" />
          <SearchField
            icon={<Calendar className="w-5 h-5" style={{ color: WARM }} />}
            label="Check-in"
            hint="Add dates"
          />
          <span className="w-px h-8 bg-white/10" />
          <SearchField
            icon={<Calendar className="w-5 h-5" style={{ color: WARM }} />}
            label="Check-out"
            hint="Add dates"
          />
          <span className="w-px h-8 bg-white/10" />
          <SearchField
            icon={<Users className="w-5 h-5" style={{ color: WARM }} />}
            label="Guests"
            hint="Add guests"
          />
          <button
            onClick={onSearch}
            className="flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold text-sm transition-all hover:scale-[1.02] ml-1"
            style={{
              background: WARM,
              color: BASE,
              boxShadow: `0 4px 20px ${WARM}40`,
              minHeight: 52,
            }}
          >
            <Search className="w-4 h-4" />
            Search Stays
          </button>
        </div>
      </div>
    </>
  );
}

function SearchField({
  icon,
  label,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-white/5 transition-colors"
      style={{ minHeight: 48 }}
    >
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex flex-col leading-tight">
        <span className="text-[13px] font-bold text-white">{label}</span>
        <span className="text-[12px] text-white/40 truncate">{hint}</span>
      </span>
    </button>
  );
}

function SectionHeader({
  label,
  title,
  subtitle,
  action,
}: {
  label: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
      <div>
        <span className="text-[11px] font-bold tracking-[0.2em]" style={{ color: WARM }}>
          {label}
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-sm text-white/40 mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function HorizontalScrollCards({ properties }: { properties: Property[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
  }, [properties]);

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  };

  return (
    <div className="relative group/scroll">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full items-center justify-center transition-all opacity-0 group-hover/scroll:opacity-100"
          style={{
            background: SURFACE_LIGHT,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full items-center justify-center transition-all opacity-0 group-hover/scroll:opacity-100"
          style={{
            background: SURFACE_LIGHT,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}
      <div
        ref={ref}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
      >
        {properties.map(p => (
          <FeaturedCard key={p.id} property={p} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-5 md:hidden">
        {properties.slice(0, 6).map((_, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: i === 0 ? WARM : 'rgba(255,255,255,0.2)' }}
          />
        ))}
      </div>
    </div>
  );
}

function FeaturedCard({ property }: { property: Property }) {
  const handleClick = () => {
    window.history.pushState({}, '', `/property/${property.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  const price = (property.price_per_day || property.price_full_day || 0).toLocaleString();
  const reviews = Math.max(40, Math.round((property.rating || 4.8) * 25));

  return (
    <article
      onClick={handleClick}
      className="snap-start shrink-0 w-[240px] md:w-[260px] cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
      style={{
        background: SURFACE,
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}
    >
      <div className="relative h-[180px] overflow-hidden">
        {property.images?.[0] ? (
          <img
            src={property.images[0]}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white/20 text-sm"
            style={{ background: SURFACE_LIGHT }}
          >
            No image
          </div>
        )}
        <div
          className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            color: 'white',
          }}
        >
          &#8377;{price}<span className="font-normal text-white/60">/night</span>
        </div>
        <button
          onClick={e => e.stopPropagation()}
          aria-label="Save"
          className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
        >
          <Heart className="w-4 h-4 text-white" />
        </button>
        {property.is_verified && (
          <div
            className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg"
            style={{
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <CheckCircle className="w-3 h-3" style={{ color: '#34D399' }} />
            <span className="text-[10px] font-bold text-white">Verified</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-sm text-white leading-tight line-clamp-1">
          {property.title}
        </h3>
        <p className="text-xs text-white/40 mt-0.5 line-clamp-1">
          <MapPin className="w-3 h-3 inline mr-1" />
          {property.city}
        </p>
        <div className="flex items-center gap-1 mt-2.5 text-xs">
          <Star className="w-3.5 h-3.5" style={{ color: WARM }} fill={WARM} />
          <span className="font-bold text-white">{property.rating?.toFixed(1) || '4.8'}</span>
          <span className="text-white/30">({reviews})</span>
        </div>
      </div>
    </article>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="shrink-0 w-[240px] rounded-2xl overflow-hidden"
          style={{ background: SURFACE }}
        >
          <div className="h-[180px] animate-pulse" style={{ background: SURFACE_LIGHT }} />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: SURFACE_LIGHT }} />
            <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: SURFACE_LIGHT }} />
            <div className="h-3 w-1/3 rounded animate-pulse" style={{ background: SURFACE_LIGHT }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; onClick: () => void }[];
}) {
  return (
    <div>
      <h4 className="font-bold text-white text-sm mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {items.map(item => (
          <li key={item.label}>
            <button
              onClick={item.onClick}
              className="text-sm text-white/40 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
