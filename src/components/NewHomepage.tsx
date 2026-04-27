import { useState, useEffect } from 'react';
import {
  Search,
  ChevronRight,
  Lock,
  Zap,
  Star,
  MapPin,
  Calendar,
  Users,
  Globe,
  Heart,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import ShaderBackground from './ShaderBackground';
import SEOHead from './SEOHead';
import { generateOrganizationStructuredData } from '../lib/seo';
import type { Property } from '../lib/database.types';

const CITIES = ['Delhi', 'Gurgaon', 'Noida', 'Greater Noida', 'Rishikesh'];

const HERO_IMAGE = '/hf_20260421_035538_aa785417-633b-4f75-82cf-7ad18ce345fe.png';

const NAV_LINKS = [
  { label: 'Stays', target: 'listings' },
  { label: 'Experiences', target: 'listings' },
  { label: 'Host', target: 'host' },
  { label: 'About Us', target: 'why' },
  { label: 'Help', target: 'why' },
];

const TRUST_ITEMS = [
  {
    icon: Star,
    title: '4.8 Average Rating',
    sub: 'From 10,000+ reviews',
    tint: 'bg-amber-50 text-amber-500',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Hosts',
    sub: 'Every host is verified',
    tint: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    sub: 'Your payments are safe',
    tint: 'bg-slate-100 text-slate-700',
  },
  {
    icon: Zap,
    title: 'Zero Commission',
    sub: 'Save more on every booking',
    tint: 'bg-amber-50 text-amber-500',
  },
];

const FEATURE_CARDS = [
  {
    icon: ShieldCheck,
    title: '100% Verified',
    desc: 'Every property is personally inspected and approved by our team before going live.',
  },
  {
    icon: Zap,
    title: 'Zero Commission',
    desc: 'Book directly from the host. No middlemen, no surprise fees, ever.',
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
  {
    id: 'f4',
    name: 'Sanya Kapoor',
    avatar_url: 'https://i.pravatar.cc/120?img=5',
    location: 'Pune',
    rating: 5,
    quote:
      'The skyline penthouse in Noida was a dream. Booking felt as good as the stay itself.',
  },
];

export default function NewHomepage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesByCity, setPropertiesByCity] = useState<Record<string, Property[]>>({});
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    loadProperties();
    loadTestimonials();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
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
    } catch (err) {
      console.error('Error loading testimonials:', err);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleHostLogin = () => {
    window.history.pushState({}, '', '/host/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSignUp = () => {
    window.history.pushState({}, '', '/auth/register');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleLogin = () => {
    window.history.pushState({}, '', '/auth/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleCityClick = (city: string) => {
    const slug = city.toLowerCase().replace(/\s+/g, '-');
    window.history.pushState({}, '', `/stays/${slug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const featuredProperties = properties.slice(0, 8);

  const navTextClass = scrolled ? 'text-gray-900' : 'text-white';
  const navHoverClass = scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10';

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SEOHead
        config={{
          title: 'XpressBnB - Verified Stays in Delhi NCR | No Commission, Best Price Guaranteed',
          description:
            'Book verified homes and apartments directly from hosts. Premium stays in Delhi, Gurgaon, Noida and Rishikesh. No brokerage, zero commission.',
          keywords:
            'verified stays delhi, no brokerage apartments, premium stays noida, gurgaon serviced apartments, rishikesh retreats',
          canonical: 'https://xpressbnb.com',
          structuredData: generateOrganizationStructuredData(),
        }}
      />

      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm'
            : 'bg-transparent border-b border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-[72px] flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2"
          >
            <img
              src="/90d3767f-65eb-431d-8005-c9f9bb5f2fde.png"
              alt="XpressBnB"
              className="h-9 w-9 object-contain"
            />
            <span className={`text-lg md:text-xl font-extrabold tracking-tight ${navTextClass}`}>
              Xpress<span className="text-[#ff385c]">BnB</span>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.target)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${navTextClass} ${navHoverClass}`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              className={`hidden md:flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors ${navTextClass} ${navHoverClass}`}
            >
              INR
              <ChevronRight className="w-3.5 h-3.5 rotate-90" />
            </button>
            <button
              className={`hidden md:flex w-9 h-9 items-center justify-center rounded-full transition-colors ${navTextClass} ${navHoverClass}`}
              aria-label="Language"
            >
              <Globe className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogin}
              className={`hidden md:inline-flex px-3 py-2 rounded-full text-sm font-medium transition-colors ${navTextClass} ${navHoverClass}`}
            >
              Log in
            </button>
            <button
              onClick={handleSignUp}
              className="bg-gray-900 text-white rounded-full px-5 py-2 md:py-2.5 text-sm font-semibold hover:bg-black hover:scale-[1.02] transition-all shadow-sm"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: 'min(88vh, 820px)' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(100deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.15) 100%)',
          }}
        />
        <ShaderBackground intensity={0.7} />
        <div
          className="absolute inset-x-0 bottom-0 h-32"
          style={{ background: 'linear-gradient(to bottom, transparent, white)' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-32 md:pt-40 pb-40 md:pb-48">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.18em] text-gray-900 shadow-sm mb-6 md:mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff385c]" />
              VERIFIED STAYS. TRUSTED HOSTS.
            </span>
            <h1
              className="text-white font-extrabold leading-[1.05] tracking-tight"
              style={{ fontSize: 'clamp(36px, 5.4vw, 64px)' }}
            >
              Find Your Verified
              <br />
              Home Away from Home
            </h1>
            <p
              className="mt-5 text-white/85 leading-relaxed max-w-xl"
              style={{ fontSize: 'clamp(15px, 1.3vw, 18px)' }}
            >
              Book premium stays directly from trusted hosts &mdash; zero commissions,
              transparent pricing, and instant confirmations.
            </p>
          </div>
        </div>

        {/* Glassmorphic Search Bar */}
        <div className="absolute left-0 right-0 z-20" style={{ bottom: '8%' }}>
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <SearchBar onSearch={() => scrollTo('listings')} />
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {TRUST_ITEMS.map(item => (
              <div key={item.title} className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.tint}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm md:text-[15px] font-bold text-gray-900 leading-tight">
                    {item.title}
                  </div>
                  <div className="text-xs md:text-[13px] text-gray-500 leading-tight mt-0.5">
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stays */}
      <section id="listings" className="bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-16 pb-10">
          <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-[32px] font-extrabold text-gray-900 tracking-tight leading-tight">
                Featured Stays
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Handpicked premium stays by our community
              </p>
            </div>
            <button
              onClick={() => handleCityClick('Delhi')}
              className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-[#ff385c] transition-colors group"
            >
              View all
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                  <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No properties available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProperties.map(p => (
                <FeaturedCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Explore by city */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-[28px] font-extrabold text-gray-900 tracking-tight">
                Explore destinations
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Verified homes across India&rsquo;s top destinations
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CITIES.map(city => {
              const count = propertiesByCity[city]?.length || 0;
              const cover = propertiesByCity[city]?.[0]?.images?.[0];
              return (
                <button
                  key={city}
                  onClick={() => handleCityClick(city)}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl transition-all"
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={city}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute left-3 right-3 bottom-3 text-left text-white">
                    <div className="font-bold text-base leading-tight">{city}</div>
                    <div className="text-[12px] text-white/80 mt-0.5">{count} stays</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why XpressBnB */}
      <section id="why" className="bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="max-w-2xl mb-10 md:mb-14">
            <span className="text-xs font-bold tracking-[0.18em] text-[#ff385c]">WHY XPRESSBNB</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              The premium way to book stays in India.
            </h2>
            <p className="mt-3 text-gray-500 text-base md:text-lg leading-relaxed">
              Direct relationships with hosts, transparent pricing, and verified properties &mdash;
              all in one beautifully simple booking experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURE_CARDS.map(card => (
              <div
                key={card.title}
                className="group rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-300 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center group-hover:bg-[#ff385c] transition-colors">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-5 font-bold text-gray-900 text-lg">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold tracking-[0.18em] text-[#ff385c]">REVIEWS</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Loved by travelers across India
              </h2>
            </div>
          </div>
          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
            {testimonials.slice(0, 6).map(t => (
              <article
                key={t.id}
                className="snap-start shrink-0 w-[85%] sm:w-[55%] md:w-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar_url}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-bold text-gray-900 leading-tight">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < t.rating ? 'text-amber-400' : 'text-gray-200'}`}
                      fill={i < t.rating ? '#fbbf24' : 'transparent'}
                    />
                  ))}
                </div>
                <p className="mt-4 text-gray-700 text-[15px] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="host" className="relative bg-gray-900 overflow-hidden">
        <ShaderBackground intensity={0.55} />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/80 to-gray-900" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-20 md:py-28 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
            Your next stay is one click away.
          </h2>
          <p className="mt-4 text-white/75 text-base md:text-lg max-w-2xl mx-auto">
            Discover verified homes from trusted hosts, all without commissions or hidden fees.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => scrollTo('listings')}
              className="inline-flex items-center gap-2 bg-white text-gray-900 rounded-full px-7 py-3.5 font-bold text-sm hover:scale-[1.03] hover:shadow-2xl transition-all"
            >
              Find Your Stay
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleHostLogin}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white rounded-full px-7 py-3.5 font-semibold text-sm border border-white/25 hover:bg-white/20 transition-all"
            >
              Become a Host
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <img
                  src="/90d3767f-65eb-431d-8005-c9f9bb5f2fde.png"
                  alt="XpressBnB"
                  className="h-9 w-9 object-contain"
                />
                <span className="text-lg font-extrabold tracking-tight">
                  Xpress<span className="text-[#ff385c]">BnB</span>
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs">
                India&rsquo;s first zero-commission booking platform. Direct, verified, and beautifully simple.
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
                { label: 'Become a Host', onClick: handleHostLogin },
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
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">© 2026 XpressBnB. All rights reserved.</p>
            <p className="text-xs text-gray-500 font-semibold">India&rsquo;s Smarter Stay</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SearchBar({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 ring-1 ring-black/5 p-2 md:p-2.5">
      <div className="flex flex-col md:flex-row md:items-center">
        <SearchField
          icon={<MapPin className="w-5 h-5 text-gray-700" />}
          label="Where to?"
          hint="Search city, area or property"
        />
        <Divider />
        <SearchField
          icon={<Calendar className="w-5 h-5 text-gray-700" />}
          label="Check-in"
          hint="Add dates"
        />
        <Divider />
        <SearchField
          icon={<Calendar className="w-5 h-5 text-gray-700" />}
          label="Check-out"
          hint="Add dates"
        />
        <Divider />
        <SearchField
          icon={<Users className="w-5 h-5 text-gray-700" />}
          label="Guests"
          hint="Add guests"
        />
        <button
          onClick={onSearch}
          className="mt-2 md:mt-0 md:ml-2 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-semibold text-sm rounded-xl px-6 py-3.5 md:py-4 transition-all hover:scale-[1.02] shadow-lg shadow-gray-900/20"
        >
          <Search className="w-4 h-4" />
          Search Stays
        </button>
      </div>
    </div>
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
    <button className="flex-1 flex items-center gap-3 px-4 md:px-5 py-3 md:py-3 rounded-xl text-left hover:bg-gray-50 transition-colors min-w-0">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex flex-col leading-tight">
        <span className="text-[13px] font-bold text-gray-900">{label}</span>
        <span className="text-[12px] text-gray-500 truncate">{hint}</span>
      </span>
    </button>
  );
}

function Divider() {
  return <span className="hidden md:block w-px h-8 bg-gray-200" />;
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
      className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-xl hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {property.images?.[0] ? (
          <img
            src={property.images[0]}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
        <button
          onClick={e => e.stopPropagation()}
          aria-label="Save"
          className="absolute top-3 right-3 w-9 h-9 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
        >
          <Heart className="w-4 h-4 text-gray-700" />
        </button>
        {property.is_verified && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-white rounded-full pl-1.5 pr-2.5 py-1 shadow">
            <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </span>
            <span className="text-[11px] font-bold text-gray-900">Verified</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[15px] text-gray-900 leading-tight line-clamp-1">
          {property.title}
        </h3>
        <p className="text-[13px] text-gray-500 mt-0.5 line-clamp-1">{property.city}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-[13px]">
            <Star className="w-3.5 h-3.5 text-amber-400" fill="#fbbf24" />
            <span className="font-bold text-gray-900">{property.rating?.toFixed(1) || '4.8'}</span>
            <span className="text-gray-400">({reviews})</span>
          </div>
          <div className="text-right">
            <span className="text-[15px] font-bold text-gray-900">&#8377;{price}</span>
            <span className="text-[12px] text-gray-500"> /night</span>
          </div>
        </div>
      </div>
    </article>
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
      <h4 className="font-bold text-gray-900 text-sm mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {items.map(item => (
          <li key={item.label}>
            <button
              onClick={item.onClick}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
