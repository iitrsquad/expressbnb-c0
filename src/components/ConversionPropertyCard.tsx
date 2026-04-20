import { MapPin, Star, Heart, CheckCircle, Shield, Clock } from 'lucide-react';
import type { Property } from '../lib/database.types';

interface ConversionPropertyCardProps {
  property: Property;
}

export default function ConversionPropertyCard({ property }: ConversionPropertyCardProps) {
  const handleClick = () => {
    window.history.pushState({}, '', `/property/${property.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const primaryBadge = property.is_couple_friendly
    ? { label: 'Couple Friendly', classes: 'bg-rose-500 border-rose-400/50 shadow-rose-500/40' }
    : property.hourly_stay_available
    ? { label: 'Hourly Stay', classes: 'bg-blue-500 border-blue-400/50 shadow-blue-500/40' }
    : property.is_private_space
    ? { label: 'Private Space', classes: 'bg-teal-500 border-teal-400/50 shadow-teal-500/40' }
    : property.instant_booking
    ? { label: 'Instant Book', classes: 'bg-orange-500 border-orange-400/50 shadow-orange-500/40' }
    : null;

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 group active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        {property.images?.[0] ? (
          <img
            src={property.images[0]}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Wishlist */}
        <button
          onClick={e => e.stopPropagation()}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-md group/heart"
        >
          <Heart className="w-4 h-4 text-gray-600 group-hover/heart:text-rose-500 transition-colors" />
        </button>

        {/* Top left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {property.is_verified && (
            <div className="flex items-center gap-1 bg-amber-400 rounded-full px-2.5 py-1 shadow-lg shadow-amber-400/40">
              <CheckCircle className="w-3 h-3 text-amber-900" fill="#78350f" />
              <span className="text-xs font-bold text-amber-900 leading-none">Verified</span>
            </div>
          )}
          {primaryBadge && (
            <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 shadow-lg border ${primaryBadge.classes}`}>
              <span className="text-xs font-bold text-white leading-none">{primaryBadge.label}</span>
            </div>
          )}
        </div>

        {/* Guest favourite */}
        {property.rating && property.rating >= 4.5 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-md border border-amber-100">
            <Star className="w-3.5 h-3.5 text-amber-500" fill="#f59e0b" />
            <span className="text-xs font-bold text-gray-900">Guest favourite</span>
          </div>
        )}

        {/* Hourly stay indicator bottom right */}
        {property.hourly_stay_available && property.price_half_day && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-blue-600/90 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Clock className="w-3 h-3 text-white" />
            <span className="text-xs font-bold text-white">Hourly</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title + location */}
        <div>
          <h3 className="font-bold text-base text-gray-900 line-clamp-1 leading-tight group-hover:text-rose-600 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="line-clamp-1">{property.city}</span>
          </div>
        </div>

        {/* Rating + trust chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {property.rating && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100">
              <Star className="w-3.5 h-3.5 text-amber-500" fill="#f59e0b" />
              <span className="font-bold text-xs text-gray-900">{property.rating}</span>
            </div>
          )}
          {property.no_brokerage && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg border border-green-100">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span className="text-[11px] font-semibold text-green-700">No Brokerage</span>
            </div>
          )}
          {property.pay_at_property && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100">
              <Shield className="w-3 h-3 text-blue-600" />
              <span className="text-[11px] font-semibold text-blue-700">Pay Later</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">
              ₹{(property.price_per_day || property.price_full_day || 0).toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 font-medium">/night</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-full border border-green-100">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-[10px] font-bold text-green-700">Best Price</span>
          </div>
        </div>
      </div>
    </div>
  );
}
