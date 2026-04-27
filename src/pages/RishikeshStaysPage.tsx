import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Star,
  MapPin,
  Wifi,
  Car,
  Waves,
  Wind,
  Coffee,
  Utensils,
  Tv,
  Mountain,
  SlidersHorizontal,
  X,
  Heart,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

type PropertyType = 'all' | 'hotel' | 'guesthouse' | 'resort' | 'villa' | 'cottage' | 'hostel';

interface Stay {
  id: string;
  name: string;
  location: string;
  description: string;
  pricePerNight: number;
  rating: number;
  reviews: number;
  type: Exclude<PropertyType, 'all'>;
  amenities: string[];
  images: string[];
}

const FALLBACK_STAYS: Stay[] = [
  {
    id: 'fb-1',
    name: 'Ganga View Riverside Cottage',
    location: 'Tapovan, Rishikesh',
    description: 'A serene cottage perched above the Ganges with panoramic river views and morning yoga decks.',
    pricePerNight: 3800,
    rating: 4.8,
    reviews: 142,
    type: 'cottage',
    amenities: ['WiFi', 'Parking', 'Mountain View', 'Breakfast'],
    images: ['https://images.pexels.com/photos/2104882/pexels-photo-2104882.jpeg?auto=compress&w=900'],
  },
  {
    id: 'fb-2',
    name: 'Laxman Jhula Boutique Resort',
    location: 'Laxman Jhula, Rishikesh',
    description: 'Boutique resort steps from the iconic suspension bridge with a riverside infinity pool.',
    pricePerNight: 6200,
    rating: 4.7,
    reviews: 318,
    type: 'resort',
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Parking', 'AC'],
    images: ['https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&w=900'],
  },
  {
    id: 'fb-3',
    name: 'Tapovan Yoga Retreat House',
    location: 'Tapovan, Rishikesh',
    description: 'Dedicated yoga retreat with daily Hatha and Ashtanga sessions plus organic kitchen.',
    pricePerNight: 2900,
    rating: 4.9,
    reviews: 207,
    type: 'guesthouse',
    amenities: ['WiFi', 'Breakfast', 'Yoga Hall'],
    images: ['https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&w=900'],
  },
  {
    id: 'fb-4',
    name: 'Himalayan Pine Villa',
    location: 'Shivpuri, Rishikesh',
    description: 'Private four-bedroom villa surrounded by pine forest, ideal for families and groups.',
    pricePerNight: 9800,
    rating: 4.6,
    reviews: 84,
    type: 'villa',
    amenities: ['WiFi', 'Parking', 'Pool', 'Kitchen', 'Mountain View'],
    images: ['https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&w=900'],
  },
  {
    id: 'fb-5',
    name: 'Ram Jhula Heritage Hotel',
    location: 'Ram Jhula, Rishikesh',
    description: 'Heritage stay near the temples with rooftop dining and Ganga aarti views.',
    pricePerNight: 4400,
    rating: 4.5,
    reviews: 521,
    type: 'hotel',
    amenities: ['WiFi', 'Restaurant', 'AC', 'TV', 'Parking'],
    images: ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&w=900'],
  },
  {
    id: 'fb-6',
    name: 'Backpackers Riverside Hostel',
    location: 'Swarg Ashram, Rishikesh',
    description: 'Friendly hostel with dorm and private rooms, bonfire evenings and cafe.',
    pricePerNight: 950,
    rating: 4.4,
    reviews: 936,
    type: 'hostel',
    amenities: ['WiFi', 'Cafe', 'Common Kitchen'],
    images: ['https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&w=900'],
  },
  {
    id: 'fb-7',
    name: 'Neelkanth Forest Cottage',
    location: 'Neelkanth Road, Rishikesh',
    description: 'Forest cottage on the Neelkanth route, perfect for trekkers and nature lovers.',
    pricePerNight: 3300,
    rating: 4.6,
    reviews: 67,
    type: 'cottage',
    amenities: ['WiFi', 'Mountain View', 'Breakfast', 'Parking'],
    images: ['https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&w=900'],
  },
  {
    id: 'fb-8',
    name: 'Aurovalley Wellness Resort',
    location: 'Raiwala, Rishikesh',
    description: 'Wellness resort offering Ayurveda, spa rituals and meditation gardens.',
    pricePerNight: 7600,
    rating: 4.8,
    reviews: 188,
    type: 'resort',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'AC', 'Parking'],
    images: ['https://images.pexels.com/photos/2417842/pexels-photo-2417842.jpeg?auto=compress&w=900'],
  },
  {
    id: 'fb-9',
    name: 'Ganga Beach Camp',
    location: 'Shivpuri, Rishikesh',
    description: 'Riverside camp with Swiss tents, rafting access and bonfire dinners.',
    pricePerNight: 2100,
    rating: 4.3,
    reviews: 412,
    type: 'guesthouse',
    amenities: ['Bonfire', 'Rafting', 'Meals'],
    images: ['https://images.pexels.com/photos/2422259/pexels-photo-2422259.jpeg?auto=compress&w=900'],
  },
  {
    id: 'fb-10',
    name: 'Beatles Ashram View Hotel',
    location: 'Swarg Ashram, Rishikesh',
    description: 'Modern hotel near the Beatles Ashram with rooftop yoga and cafe.',
    pricePerNight: 3950,
    rating: 4.5,
    reviews: 271,
    type: 'hotel',
    amenities: ['WiFi', 'AC', 'TV', 'Cafe', 'Yoga Hall'],
    images: ['https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&w=900'],
  },
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'all', label: 'All Stays' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'resort', label: 'Resorts' },
  { value: 'villa', label: 'Villas' },
  { value: 'cottage', label: 'Cottages' },
  { value: 'guesthouse', label: 'Guesthouses' },
  { value: 'hostel', label: 'Hostels' },
];

const AMENITY_OPTIONS = ['WiFi', 'Parking', 'Pool', 'AC', 'Breakfast', 'Restaurant', 'Mountain View'];

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  WiFi: Wifi,
  Parking: Car,
  Pool: Waves,
  AC: Wind,
  Breakfast: Coffee,
  Restaurant: Utensils,
  TV: Tv,
  'Mountain View': Mountain,
};

function AmenityChip({ name }: { name: string }) {
  const Icon = AMENITY_ICONS[name];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] text-gray-200">
      {Icon ? <Icon className="w-3 h-3" /> : null}
      {name}
    </span>
  );
}

function StayCard({ stay, index, saved, onToggleSave }: {
  stay: Stay;
  index: number;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
      whileHover={{ y: -4 }}
      className="group bg-[#2d2d2d] rounded-2xl overflow-hidden border border-white/5 shadow-lg hover:shadow-2xl hover:border-orange-500/30 transition-all"
    >
      <div className="relative h-52 overflow-hidden bg-[#1a1a1a]">
        <img
          src={stay.images[0]}
          alt={stay.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={() => onToggleSave(stay.id)}
          aria-label={saved ? 'Remove from saved' : 'Save stay'}
          aria-pressed={saved}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${saved ? 'fill-orange-500 text-orange-500' : 'text-white'}`}
          />
        </button>
        <span className="absolute top-3 left-3 capitalize text-[11px] font-semibold tracking-wide bg-black/60 backdrop-blur text-white px-2.5 py-1 rounded-full">
          {stay.type}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-white truncate">{stay.name}</h3>
          <span className="inline-flex items-center gap-1 text-sm text-yellow-400 shrink-0">
            <Star className="w-3.5 h-3.5 fill-yellow-400" />
            {stay.rating.toFixed(1)}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-400 inline-flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {stay.location}
        </p>
        <p className="mt-2 text-xs text-gray-400 line-clamp-2">{stay.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {stay.amenities.slice(0, 4).map((a) => (
            <AmenityChip key={a} name={a} />
          ))}
          {stay.amenities.length > 4 && (
            <span className="text-[11px] text-gray-500">+{stay.amenities.length - 4} more</span>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-500">{stay.reviews} reviews</p>
            <p className="text-lg font-extrabold text-white">
              ₹{stay.pricePerNight.toLocaleString('en-IN')}
              <span className="text-xs font-medium text-gray-400"> /night</span>
            </p>
          </div>
          <button className="px-3.5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors">
            View
          </button>
        </div>
      </div>
    </motion.article>
  );
}

const RishikeshStaysPage: React.FC = () => {
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<PropertyType>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const fetchStays = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('properties')
          .select('id, title, description, property_type, address, city, price_per_day, amenities, images, rating, total_reviews')
          .eq('city', 'Rishikesh')
          .eq('is_active', true);

        if (dbError) throw dbError;

        if (!cancelled) {
          if (data && data.length > 0) {
            const mapped: Stay[] = data.map((p: any) => ({
              id: p.id,
              name: p.title ?? 'Unnamed Stay',
              location: p.address || `${p.city ?? 'Rishikesh'}`,
              description: p.description ?? '',
              pricePerNight: Number(p.price_per_day) || 0,
              rating: Number(p.rating) || 0,
              reviews: Number(p.total_reviews) || 0,
              type: (p.property_type as Stay['type']) || 'hotel',
              amenities: Array.isArray(p.amenities) ? p.amenities : [],
              images: Array.isArray(p.images) && p.images.length > 0
                ? p.images
                : ['https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&w=900'],
            }));
            setStays(mapped);
          } else {
            setStays(FALLBACK_STAYS);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to fetch stays', err);
          setError('Could not load live data. Showing curated stays.');
          setStays(FALLBACK_STAYS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchStays();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  };

  const onToggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stays.filter((s) => {
      if (type !== 'all' && s.type !== type) return false;
      if (s.pricePerNight < priceRange[0] || s.pricePerNight > priceRange[1]) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.location.toLowerCase().includes(q)) return false;
      for (const a of selectedAmenities) {
        if (!s.amenities.includes(a)) return false;
      }
      return true;
    });
  }, [stays, search, type, priceRange, selectedAmenities]);

  const clearFilters = () => {
    setSearch('');
    setType('all');
    setPriceRange([0, 15000]);
    setSelectedAmenities(new Set());
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#f5f5f5]">
      <Header />

      <section className="relative overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'url(https://images.pexels.com/photos/2422259/pexels-photo-2422259.jpeg?auto=compress&w=1600)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/40 via-[#1a1a1a]/70 to-[#1a1a1a]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs sm:text-sm tracking-[0.32em] font-semibold text-orange-400"
          >
            RISHIKESH
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-2 text-3xl sm:text-5xl font-extrabold leading-tight max-w-2xl"
          >
            Stays beside the Ganges, in the foothills of the Himalayas
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-base text-gray-300 max-w-xl"
          >
            Hand-picked hotels, riverside cottages, yoga retreats and family villas across Rishikesh.
          </motion.p>
        </div>
      </section>

      <section className="sticky top-0 z-30 bg-[#1a1a1a]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search stays</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or area..."
              className="w-full bg-[#2d2d2d] border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500"
            />
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {PROPERTY_TYPES.map((t) => {
              const active = type === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  aria-pressed={active}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    active
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-transparent border-white/15 text-gray-300 hover:border-orange-500/60 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#2d2d2d] border border-white/10 hover:border-orange-500 text-sm font-semibold text-white transition-colors"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {selectedAmenities.size > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                {selectedAmenities.size}
              </span>
            )}
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading stays...
          </div>
        ) : (
          <>
            {error && (
              <p className="mb-4 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-400">
                Showing <span className="text-white font-semibold">{filtered.length}</span> stays
              </p>
              {(search || type !== 'all' || selectedAmenities.size > 0 || priceRange[1] !== 15000 || priceRange[0] !== 0) && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-orange-400 hover:text-orange-300"
                >
                  Clear filters
                </button>
              )}
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-semibold text-white">No stays match your filters</p>
                <p className="mt-1 text-sm">Try removing a filter or widening your price range.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((s, i) => (
                  <StayCard
                    key={s.id}
                    stay={s}
                    index={i}
                    saved={saved.has(s.id)}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setFiltersOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-[#2d2d2d] rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
              role="dialog"
              aria-label="Filters"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 className="text-base font-bold text-white">Filters</h2>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">Price per night</h3>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="number"
                      value={priceRange[0]}
                      min={0}
                      max={priceRange[1]}
                      onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                      aria-label="Minimum price"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      min={priceRange[0]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 0])}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                      aria-label="Maximum price"
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15000}
                    step={500}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="mt-3 w-full accent-orange-500"
                    aria-label="Maximum price slider"
                  />
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">Amenities</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {AMENITY_OPTIONS.map((a) => {
                      const Icon = AMENITY_ICONS[a];
                      const active = selectedAmenities.has(a);
                      return (
                        <button
                          key={a}
                          onClick={() => toggleAmenity(a)}
                          aria-pressed={active}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                            active
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'bg-transparent border-white/15 text-gray-300 hover:border-orange-500/60 hover:text-white'
                          }`}
                        >
                          {Icon && <Icon className="w-3.5 h-3.5" />}
                          {a}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10 bg-[#252525]">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-2.5 rounded-full border border-white/15 text-sm font-semibold text-gray-200 hover:border-white/40"
                >
                  Reset
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="flex-1 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-sm font-bold text-white"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RishikeshStaysPage;
