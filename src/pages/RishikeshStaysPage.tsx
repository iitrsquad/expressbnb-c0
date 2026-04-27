import { useEffect, useMemo, useRef, useState } from 'react';import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';import {Search,MapPin,Calendar,Users,User,Sparkles,Heart,Star,Shield,Zap,Home as HomeIcon,Waves,Flower2,Clock,Sun,X,Check,IndianRupee,Music2,BookOpen,Wand2,Bookmark,} from 'lucide-react';import { supabase } from '../lib/supabase';

const COLORS = {saffron: '#E8610A',forest: '#1A2E1A',gold: '#F5A623',artist: '#7B2FBE',bg: '#F9F7F4',text: '#1A1A1A',muted: '#6B7280',} as const;

type FilterKey =| 'recommended'| 'couple'| 'hourly'| 'verified'| 'instant'| 'private'| 'riverside'| 'yoga'| 'artist';

interface Property {id: string;name: string;price: number;rating: number;artistFriendly: boolean;verified: boolean;privateSpace: boolean;guestFavourite: boolean;couple: boolean;hourly: boolean;instant: boolean;riverside: boolean;yoga: boolean;imageQuery: string;}

interface Artist {id: string;name: string;genre: 'Guitarist' | 'Yoga Guru' | 'Storyteller' | 'Classical Dancer';price: number;rating: number;imageQuery: string;}

const PROPERTIES: Property[] = [{ id: 'hopstel', name: 'Hopstel.', price: 4500, rating: 4.5, artistFriendly: true, verified: true, privateSpace: true, guestFavourite: true, couple: true, hourly: false, instant: true, riverside: false, yoga: true, imageQuery: 'rishikesh-hostel-room' },{ id: 'prana-evolve', name: 'Prana Evolve Studio Tapovan', price: 2250, rating: 4.5, artistFriendly: false, verified: true, privateSpace: true, guestFavourite: false, couple: true, hourly: true, instant: false, riverside: false, yoga: true, imageQuery: 'tapovan-yoga-studio' },{ id: 'ameliea', name: 'AMELIEA - by GatewayZ', price: 3700, rating: 4.5, artistFriendly: true, verified: true, privateSpace: true, guestFavourite: true, couple: true, hourly: false, instant: true, riverside: true, yoga: false, imageQuery: 'rishikesh-modern-villa' },{ id: 'cynthia', name: 'CYNTHIA - by GetawayZ', price: 3200, rating: 4.5, artistFriendly: false, verified: true, privateSpace: true, guestFavourite: false, couple: true, hourly: false, instant: true, riverside: true, yoga: false, imageQuery: 'rishikesh-getaway-villa' },{ id: 'ganga-cottage', name: 'Ganga View Cottage', price: 3800, rating: 4.7, artistFriendly: true, verified: true, privateSpace: true, guestFavourite: true, couple: true, hourly: false, instant: false, riverside: true, yoga: true, imageQuery: 'ganga-river-cottage' },{ id: 'tapovan-treehouse', name: 'Tapovan Treehouse', price: 5200, rating: 4.8, artistFriendly: true, verified: true, privateSpace: true, guestFavourite: true, couple: true, hourly: false, instant: true, riverside: false, yoga: true, imageQuery: 'rishikesh-treehouse' },{ id: 'laxman-jhula', name: 'Laxman Jhula Studio', price: 2800, rating: 4.6, artistFriendly: false, verified: true, privateSpace: false, guestFavourite: false, couple: false, hourly: true, instant: true, riverside: true, yoga: false, imageQuery: 'laxman-jhula-bridge' },{ id: 'riverside-zen', name: 'Riverside Zen Room', price: 4100, rating: 4.9, artistFriendly: true, verified: true, privateSpace: true, guestFavourite: true, couple: true, hourly: false, instant: true, riverside: true, yoga: true, imageQuery: 'riverside-zen-room' },];

const ARTISTS: Artist[] = [{ id: 'arjun-mehta', name: 'Arjun Mehta', genre: 'Guitarist', price: 1500, rating: 4.9, imageQuery: 'guitarist-portrait' },{ id: 'priya-sharma', name: 'Priya Sharma', genre: 'Yoga Guru', price: 2000, rating: 5.0, imageQuery: 'yoga-teacher-portrait' },{ id: 'ravi-das', name: 'Ravi Das', genre: 'Storyteller', price: 1200, rating: 4.8, imageQuery: 'indian-storyteller-portrait' },{ id: 'meera-nair', name: 'Meera Nair', genre: 'Classical Dancer', price: 2500, rating: 4.9, imageQuery: 'classical-dancer-portrait' },];

const FILTERS: { key: FilterKey; label: string; icon: typeof Star; artist?: boolean }[] = [{ key: 'recommended', label: 'Recommended', icon: Sparkles },{ key: 'couple', label: 'Couple Friendly', icon: Heart },{ key: 'hourly', label: 'Hourly Stay', icon: Clock },{ key: 'verified', label: 'Verified', icon: Shield },{ key: 'instant', label: 'Instant Book', icon: Zap },{ key: 'private', label: 'Private Space', icon: HomeIcon },{ key: 'riverside', label: 'Riverside View', icon: Waves },{ key: 'yoga', label: 'Yoga Retreat', icon: Sun },{ key: 'artist', label: 'Artist Friendly', icon: Star, artist: true },];

function hashString(s: string): number {let h = 0;for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;return h;}

function gradientFor(seed: string): string {const palettes = [['#E8610A', '#F5A623'],['#1A2E1A', '#3F6A3F'],['#F5A623', '#E8610A'],['#7B2FBE', '#E8610A'],['#1A2E1A', '#E8610A'],['#3F6A3F', '#F5A623'],['#7B2FBE', '#F5A623'],['#0F4C5C', '#5F0F40'],];const [a, b] = palettes[hashString(seed) % palettes.length];const angle = (hashString(seed + 'a') % 360);return linear-gradient(${angle}deg, ${a} 0%, ${b} 100%);}

function unsplashUrl(query: string, w = 600, h = 400): string {return https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(query)};}

function getSessionId(): string {const KEY = 'xpressbnb_session_id';let id = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;if (!id) {id = (crypto?.randomUUID?.() ?? s_${Date.now()}_${Math.random().toString(36).slice(2)});window.localStorage.setItem(KEY, id);}return id;}

interface ToastMsg {id: number;text: string;tone?: 'info' | 'success';}

function useToasts() {const [toasts, setToasts] = useState<ToastMsg[]>([]);const push = (text: string, tone: ToastMsg['tone'] = 'info') => {const id = Date.now() + Math.random();setToasts((t) => [...t, { id, text, tone }]);setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);};return { toasts, push };}

function ToastStack({ toasts }: { toasts: ToastMsg[] }) {return ({toasts.map((t) => (<motion.divkey={t.id}initial={{ opacity: 0, y: 20, scale: 0.95 }}animate={{ opacity: 1, y: 0, scale: 1 }}exit={{ opacity: 0, y: 20, scale: 0.95 }}className={px-5 py-3 rounded-full shadow-lg text-sm font-medium pointer-events-auto ${
              t.tone === 'success' ? 'bg-emerald-600 text-white' : 'bg-[#1A2E1A] text-white'
            }}>{t.text}</motion.div>))});}

function CountUp({ end, duration = 1400, suffix = '', decimals = 0 }: { end: number; duration?: number; suffix?: string; decimals?: number }) {const [val, setVal] = useState(0);const reduce = useReducedMotion();useEffect(() => {if (reduce) {setVal(end);return;}let raf = 0;const start = performance.now();const tick = (now: number) => {const p = Math.min(1, (now - start) / duration);const eased = 1 - Math.pow(1 - p, 3);setVal(end * eased);if (p < 1) raf = requestAnimationFrame(tick);};raf = requestAnimationFrame(tick);return () => cancelAnimationFrame(raf);}, [end, duration, reduce]);return {val.toFixed(decimals)}{suffix};}

function LotusMark({ className = 'w-6 h-6' }: { className?: string }) {return ();}

function MandalaOverlay() {return ({Array.from({ length: 12 }).map((, i) => (<circle key={i} cx="160" cy="100" r={10 + i * 6} />))}{Array.from({ length: 16 }).map((, i) => {const a = (i * Math.PI * 2) / 16;return (<linekey={l${i}}x1="160"y1="100"x2={160 + Math.cos(a) * 80}y2={100 + Math.sin(a) * 80}/>);})}{Array.from({ length: 8 }).map((_, i) => {const a = (i * Math.PI * 2) / 8;return (<ellipsekey={e${i}}cx={160 + Math.cos(a) * 40}cy={100 + Math.sin(a) * 40}rx="14"ry="6"transform={rotate(${(i * 360) / 8} ${160 + Math.cos(a) * 40} ${100 + Math.sin(a) * 40})}/>);})});}

function Navbar({onSearch,onComingSoon,onArtistClick,hidden,}: {onSearch: () => void;onComingSoon: () => void;onArtistClick: () => void;hidden: boolean;}) {return (<motion.headeranimate={{ y: hidden ? -100 : 0 }}transition={{ duration: 0.25, ease: 'easeOut' }}className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-black/5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">XpressBnB

    <div className="hidden md:flex flex-1 justify-center">
      <div className="flex items-center gap-1 bg-white rounded-full border border-black/10 shadow-sm pl-2 pr-1 py-1">
        <div className="flex items-center gap-2 px-3 py-1.5">
          <MapPin className="w-4 h-4 text-[#E8610A]" />
          <input
            aria-label="Location"
            defaultValue="Rishikesh"
            className="bg-transparent text-sm font-medium text-[#1A1A1A] focus:outline-none w-24"
          />
        </div>
        <div className="w-px h-6 bg-black/10" />
        <button
          onClick={onComingSoon}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
          aria-label="Check-in date"
        >
          <Calendar className="w-4 h-4" />
          <span>Check-in</span>
        </button>
        <div className="w-px h-6 bg-black/10" />
        <button
          onClick={onComingSoon}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
          aria-label="Check-out date"
        >
          <Calendar className="w-4 h-4" />
          <span>Check-out</span>
        </button>
        <div className="w-px h-6 bg-black/10" />
        <button
          onClick={onComingSoon}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
          aria-label="Guests"
        >
          <Users className="w-4 h-4" />
          <span>2 Guests</span>
        </button>
        <button
          onClick={onSearch}
          className="ml-1 inline-flex items-center gap-1.5 bg-[#E8610A] hover:bg-[#cf550a] text-white text-sm font-semibold pl-3 pr-4 py-2 rounded-full transition-colors shadow-sm"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>
    </div>

    <div className="ml-auto flex items-center gap-3 shrink-0">
      <button
        onClick={onArtistClick}
        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-[#1A1A1A] bg-gradient-to-r from-[#FFE9B0] to-[#F5A623] shadow-[0_0_18px_rgba(245,166,35,0.55)] hover:shadow-[0_0_26px_rgba(245,166,35,0.85)] transition-shadow"
        aria-label="Book an Artist"
      >
        <Sparkles className="w-4 h-4" />
        Book an Artist
      </button>
      <button
        className="w-9 h-9 rounded-full bg-[#1A2E1A] text-white flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Account"
      >
        <User className="w-4 h-4" />
      </button>
    </div>
  </div>
</motion.header>

);}

function HeroBanner() {return (<sectionclassName="relative w-full overflow-hidden"style={{ height: 280, background: linear-gradient(90deg, ${COLORS.saffron} 0%, ${COLORS.saffron} 25%, ${COLORS.forest} 100%) }}><motion.pinitial={{ opacity: 0, y: 8 }}animate={{ opacity: 1, y: 0 }}transition={{ duration: 0.5 }}className="text-xs sm tracking-[0.32em] font-semibold text-white/80">RISHIKESH</motion.p><motion.h1initial={{ opacity: 0, y: 12 }}animate={{ opacity: 1, y: 0 }}transition={{ duration: 0.55, delay: 0.05 }}className="mt-2 text-2xl sm font-extrabold leading-[1.15]">Yoga Capital Riverside Retreats</motion.h1><motion.divinitial={{ opacity: 0, y: 12 }}animate={{ opacity: 1, y: 0 }}transition={{ duration: 0.55, delay: 0.1 }}className="mt-4 flex flex-wrap gap-2">{['23 Properties', 'No Commission', 'Pay at Property'].map((t) => ({t}))}</motion.div>

    <div className="hidden md:flex items-center gap-3">
      {[
        { label: 'Stays', end: 23, decimals: 0, suffix: '' },
        { label: 'Avg Rating', end: 4.5, decimals: 1, suffix: '' },
        { label: 'Commission', end: 0, decimals: 0, suffix: '%' },
      ].map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
          className="bg-white/95 backdrop-blur rounded-2xl px-5 py-4 min-w-[120px] text-center shadow-xl"
        >
          <div className="text-2xl font-extrabold text-[#1A2E1A]">
            {s.label === 'Commission' ? (
              <>Zero</>
            ) : (
              <CountUp end={s.end} decimals={s.decimals} suffix={s.suffix} />
            )}
          </div>
          <div className="text-xs font-medium text-[#6B7280] mt-1">{s.label}</div>
        </motion.div>
      ))}
    </div>
  </div>
</section>

);}

function FilterBar({active,onToggle,}: {active: Set;onToggle: (k: FilterKey) => void;}) {return ({FILTERS.map((f) => {const isActive = active.has(f.key);const Icon = f.icon;const isArtist = !!f.artist;return (<buttonkey={f.key}onClick={() => onToggle(f.key)}aria-pressed={isActive}className={group inline-flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  isActive
                    ? isArtist
                      ? 'bg-[#7B2FBE] border-[#7B2FBE] text-white shadow-[0_0_18px_rgba(123,47,190,0.55)]'
                      : 'bg-[#E8610A] border-[#E8610A] text-white shadow-[0_4px_14px_rgba(232,97,10,0.35)]'
                    : isArtist
                      ? 'bg-white border-[#7B2FBE]/50 text-[#7B2FBE] shadow-[0_0_14px_rgba(123,47,190,0.25)] hover:shadow-[0_0_20px_rgba(123,47,190,0.45)]'
                      : 'bg-white border-black/10 text-[#1A1A1A] hover:border-[#1A2E1A]/40'
                }}>{isArtist ? (<Sparkles className={w-4 h-4 ${isActive ? 'text-white' : 'text-[#7B2FBE]'}} />) : ()}{f.label});})});}

function GenreIcon({ genre, className = 'w-3.5 h-3.5' }: { genre: Artist['genre']; className?: string }) {if (genre === 'Guitarist') return ;if (genre === 'Yoga Guru') return ;if (genre === 'Storyteller') return ;return ;}

function ArtistCard({ artist, onBook, index }: { artist: Artist; onBook: (a: Artist) => void; index: number }) {return (<motion.divinitial={{ opacity: 0, x: 60 }}whileInView={{ opacity: 1, x: 0 }}viewport={{ once: true, margin: '-50px' }}transition={{ duration: 0.5, delay: index * 0.08 }}whileHover={{ y: -6 }}className="snap-start shrink-0 w-[260px] bg-white rounded-2xl p-5 border border-black/5 shadow-sm hover transition-shadow"><divclassName="w-20 h-20 rounded-full ring-4 ring-white shadow-md flex items-center justify-center text-white font-bold text-xl"style={{ background: gradientFor(artist.name) }}>{artist.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}{artist.name}{artist.genre}{artist.rating.toFixed(1)}{artist.price.toLocaleString('en-IN')}per sessionAvailable in Rishikesh<buttononClick={() => onBook(artist)}className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-[#7B2FBE] hover:bg-[#691fa9] text-white text-sm font-semibold py-2.5 rounded-full transition-colors shadow-sm hover">Book Artist</motion.div>);}

function ArtistSection({ onBook }: { onBook: (a: Artist) => void }) {return (New ExperienceBook a Live Artist for Your StayMusicians, Yogis, Storytellers — perform at your booked property.{ARTISTS.map((a, i) => ())});}

function PropertyCard({property,saved,onToggleSave,index,}: {property: Property;saved: boolean;onToggleSave: (id: string) => void;index: number;}) {const [imgOk, setImgOk] = useState(true);return (<motion.articleinitial={{ opacity: 0, y: 24 }}whileInView={{ opacity: 1, y: 0 }}viewport={{ once: true, margin: '-40px' }}transition={{ duration: 0.45, delay: (index % 8) * 0.05 }}whileHover={{ y: -4 }}className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover transition-shadow"><div className="relative h-[200px] overflow-hidden" style={{ background: gradientFor(property.name) }}>{imgOk && (<imgsrc={unsplashUrl(property.imageQuery, 800, 500)}alt={property.name}loading="lazy"onError={() => setImgOk(false)}className="w-full h-full object-cover transition-transform duration-500 group-hover"/>)}{property.verified && (Verified)}{property.privateSpace && (Private Space)}{property.artistFriendly && (Artist Friendly)}<buttononClick={() => onToggleSave(property.id)}aria-label={saved ? 'Remove from saved' : 'Save property'}aria-pressed={saved}className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow hover active transition-transform"><motion.spankey={saved ? 'on' : 'off'}initial={{ scale: 0.6 }}animate={{ scale: 1 }}transition={{ type: 'spring', stiffness: 500, damping: 14 }}className="inline-flex"><HeartclassName={w-4 h-4 transition-colors ${saved ? 'fill-[#E8610A] text-[#E8610A]' : 'text-[#1A1A1A]'}}/></motion.span>{property.guestFavourite && (Guest Favourite)}

  <div className="p-4">
    <h3 className="text-base font-bold text-[#1A1A1A] truncate">{property.name}</h3>
    <div className="mt-1 flex items-center gap-1 text-xs text-[#6B7280]">
      <MapPin className="w-3.5 h-3.5" />
      Rishikesh
    </div>

    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF7E6] text-[#7A4A00] text-[11px] font-semibold border border-[#F5A623]/30">
        <Star className="w-3 h-3 fill-[#F5A623] text-[#F5A623]" />
        {property.rating.toFixed(1)}
      </span>
      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
        No Brokerage
      </span>
      <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-semibold border border-sky-200">
        Pay Later
      </span>
    </div>

    {property.artistFriendly && (
      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#7B2FBE]/10 text-[#7B2FBE] text-[11px] font-semibold">
        <Sparkles className="w-3 h-3" />
        Artists Welcome
      </div>
    )}

    <div className="mt-3 flex items-center justify-between">
      <div className="text-base font-extrabold text-[#1A1A1A]">
        ₹{property.price.toLocaleString('en-IN')}
        <span className="text-xs font-medium text-[#6B7280]"> /night</span>
      </div>
      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Best Price
      </div>
    </div>
  </div>
</motion.article>

);}

function PropertyGrid({items,saved,onToggleSave,}: {items: Property[];saved: Set;onToggleSave: (id: string) => void;}) {return (Showing {items.length} stays in Rishikesh{items.length === 0 ? (No stays match these filters. Try removing one.) : ({items.map((p, i) => ())})});}

function TrustBar() {const stats: { icon: typeof HomeIcon; label: string }[] = [{ icon: HomeIcon, label: '23 Rishikesh Properties' },{ icon: IndianRupee, label: 'Zero Commission' },{ icon: MapPin, label: 'Pay at Property' },{ icon: Zap, label: 'Instant Booking Available' },{ icon: Star, label: '4.5 Average Rating' },];return ({stats.map((s) => {const Icon = s.icon;return ({s.label});})});}

function ArtistBookingModal({artist,onClose,onConfirm,}: {artist: Artist | null;onClose: () => void;onConfirm: (data: { artist: Artist; slot: string; name: string; phone: string; notes: string }) => Promise;}) {const [slot, setSlot] = useState('');const [name, setName] = useState('');const [phone, setPhone] = useState('');const [notes, setNotes] = useState('');const [submitting, setSubmitting] = useState(false);const [done, setDone] = useState(false);

useEffect(() => {if (artist) {setSlot('');setName('');setPhone('');setNotes('');setDone(false);setSubmitting(false);}}, [artist]);

const slots = ['Today 6pm', 'Today 8pm', 'Tomorrow 10am', 'Tomorrow 6pm', 'This Weekend'];

const submit = async () => {if (!artist || !slot || !name) return;setSubmitting(true);try {await onConfirm({ artist, slot, name, phone, notes });setDone(true);} finally {setSubmitting(false);}};

return ({artist && (<motion.divinitial={{ opacity: 0 }}animate={{ opacity: 1 }}exit={{ opacity: 0 }}className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"onClick={onClose}><motion.divinitial={{ y: 30, opacity: 0, scale: 0.97 }}animate={{ y: 0, opacity: 1, scale: 1 }}exit={{ y: 30, opacity: 0, scale: 0.97 }}transition={{ duration: 0.25 }}onClick={(e) => e.stopPropagation()}className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {done ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-[#1A1A1A]">Booking requested</h3>
            <p className="mt-2 text-sm text-[#6B7280]">
              We have shared your request with {artist.name}. They will confirm shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2.5 rounded-full bg-[#7B2FBE] text-white font-semibold hover:bg-[#691fa9]"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 bg-gradient-to-br from-[#7B2FBE] to-[#3a165e] text-white">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full ring-4 ring-white/30 flex items-center justify-center font-bold text-lg"
                  style={{ background: gradientFor(artist.name) }}
                >
                  {artist.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{artist.name}</h3>
                  <p className="text-xs opacity-80 inline-flex items-center gap-1 mt-0.5">
                    <GenreIcon genre={artist.genre} />
                    {artist.genre} • ₹{artist.price.toLocaleString('en-IN')} per session
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1A1A1A]">Choose a time slot</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSlot(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        slot === s
                          ? 'bg-[#7B2FBE] border-[#7B2FBE] text-white'
                          : 'bg-white border-black/15 text-[#1A1A1A] hover:border-[#7B2FBE]/60'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#1A1A1A]">Your name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm focus:border-[#7B2FBE] focus:outline-none"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#1A1A1A]">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm focus:border-[#7B2FBE] focus:outline-none"
                  placeholder="+91"
                  inputMode="tel"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#1A1A1A]">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm focus:border-[#7B2FBE] focus:outline-none resize-none"
                  placeholder="Any preferences?"
                />
              </div>
              <button
                onClick={submit}
                disabled={!slot || !name || submitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#7B2FBE] disabled:bg-[#7B2FBE]/40 hover:bg-[#691fa9] text-white text-sm font-bold py-3 rounded-full transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {submitting ? 'Sending…' : 'Confirm booking'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

);}

function SignInNudge({ open, onClose }: { open: boolean; onClose: () => void }) {return ({open && (<motion.divinitial={{ opacity: 0 }}animate={{ opacity: 1 }}exit={{ opacity: 0 }}className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50"onClick={onClose}><motion.divinitial={{ y: 24, scale: 0.97, opacity: 0 }}animate={{ y: 0, scale: 1, opacity: 1 }}exit={{ y: 24, scale: 0.97, opacity: 0 }}onClick={(e) => e.stopPropagation()}className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl">Sign in to save moreCreate a free account to keep your saved stays across devices.Not nowSign in</motion.div></motion.div>)});}

export default function RishikeshStaysPage() {const sessionId = useMemo(() => getSessionId(), []);const [active, setActive] = useState<Set>(new Set(['recommended']));const [saved, setSaved] = useState<Set>(new Set());const [navHidden, setNavHidden] = useState(false);const [artistOpen, setArtistOpen] = useState<Artist | null>(null);const [nudgeOpen, setNudgeOpen] = useState(false);const lastY = useRef(0);const { toasts, push } = useToasts();

useEffect(() => {let ticking = false;const onScroll = () => {if (ticking) return;ticking = true;requestAnimationFrame(() => {const y = window.scrollY;if (y > 120 && y > lastY.current) setNavHidden(true);else setNavHidden(false);lastY.current = y;ticking = false;});};window.addEventListener('scroll', onScroll, { passive: true });return () => window.removeEventListener('scroll', onScroll);}, []);

useEffect(() => {let cancelled = false;(async () => {const { data } = await supabase.from('rishikesh_saved_properties').select('property_id').eq('session_id', sessionId);if (!cancelled && data) {setSaved(new Set(data.map((r: { property_id: string }) => r.property_id)));}})();return () => {cancelled = true;};}, [sessionId]);

const toggleFilter = (k: FilterKey) => {setActive((prev) => {const next = new Set(prev);if (k === 'recommended') {return new Set(['recommended']);}next.delete('recommended');if (next.has(k)) next.delete(k);else next.add(k);if (next.size === 0) next.add('recommended');return next;});};

const filtered = useMemo(() => {if (active.has('recommended')) return PROPERTIES;return PROPERTIES.filter((p) => {if (active.has('couple') && !p.couple) return false;if (active.has('hourly') && !p.hourly) return false;if (active.has('verified') && !p.verified) return false;if (active.has('instant') && !p.instant) return false;if (active.has('private') && !p.privateSpace) return false;if (active.has('riverside') && !p.riverside) return false;if (active.has('yoga') && !p.yoga) return false;if (active.has('artist') && !p.artistFriendly) return false;return true;});}, [active]);

const onToggleSave = async (id: string) => {const isSaved = saved.has(id);const next = new Set(saved);if (isSaved) {next.delete(id);setSaved(next);await supabase.from('rishikesh_saved_properties').delete().eq('session_id', sessionId).eq('property_id', id);push('Removed from saved');} else {next.add(id);setSaved(next);await supabase.from('rishikesh_saved_properties').insert({ session_id: sessionId, property_id: id });push('Saved to your wishlist', 'success');if (next.size >= 3) setNudgeOpen(true);}};

const handleSearch = () => push('Live availability coming soon');const handleComingSoon = () => push('Live availability coming soon');

const onConfirmArtist = async (data: { artist: Artist; slot: string; name: string; phone: string; notes: string }) => {await supabase.from('rishikesh_artist_bookings').insert({session_id: sessionId,artist_id: data.artist.id,artist_name: data.artist.name,slot: data.slot,guest_name: data.name,guest_phone: data.phone,notes: data.notes,});push('Artist booking sent', 'success');};

return (<Navbarhidden={navHidden}onSearch={handleSearch}onComingSoon={handleComingSoon}onArtistClick={() => setArtistOpen(ARTISTS[0])}/><ArtistSection onBook={(a) => setArtistOpen(a)} /><ArtistBookingModalartist={artistOpen}onClose={() => setArtistOpen(null)}onConfirm={onConfirmArtist}/><SignInNudge open={nudgeOpen} onClose={() => setNudgeOpen(false)} />);}