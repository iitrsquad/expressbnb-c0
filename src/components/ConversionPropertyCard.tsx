import { MapPin, Star, Heart, CheckCircle, Shield } from 'lucide-react';
import type { Property } from '../lib/database.types';

interface ConversionPropertyCardProps {
  property: Property;
}

export default function ConversionPropertyCard({ property }: ConversionPropertyCardProps) {
  const handleClick = () => {
    window.history.pushState({}, '', `/property/${property.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const badges = [];
  if (property.is_couple_friendly) badges.push({ label: 'Couple Friendly', color: 'pink' });
  if (property.hourly_stay_available) badges.push({ label: 'Hourly Stay', color: 'blue' });
  if (property.is_private_space) badges.push({ label: 'Private Space', color: 'green' });
  if (property.instant_booking) badges.push({ label: 'Instant Booking', color: 'purple' });

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-3xl overflow-hidden cursor-pointer shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500 group border border-gray-100 active:scale-[0.98]"
    >
      {/* Image Area */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
        {property.images?.[0] ? (
          <>
            <img
              src={property.images[0]}
              alt={property.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-gray-400 text-sm font-medium">No image</div>
          </div>
        )}

        {/* Premium Wishlist Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-3 right-3 w-10 h-10 bg-white/95 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-lg shadow-gray-400/30 hover:shadow-xl hover:shadow-pink-300/50 group/heart"
        >
          <Heart className="w-5 h-5 text-gray-700 group-hover/heart:text-pink-500 transition-colors" />
        </button>

        {/* Premium Badges Stack */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {property.is_verified && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full px-3 py-2 shadow-xl shadow-amber-500/40 backdrop-blur-sm border border-amber-300/50 group-hover:scale-105 transition-transform">
              <CheckCircle className="w-3.5 h-3.5 text-amber-950" fill="#78350f" />
              <span className="text-xs font-bold text-amber-950 tracking-wide">Verified</span>
            </div>
          )}
          {badges[0] && (
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-2 shadow-xl backdrop-blur-sm border group-hover:scale-105 transition-transform ${
              badges[0].color === 'pink'
                ? 'bg-gradient-to-r from-pink-500 to-pink-600 shadow-pink-500/40 border-pink-400/50'
                : badges[0].color === 'blue'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/40 border-blue-400/50'
                : badges[0].color === 'green'
                ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/40 border-green-400/50'
                : 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-500/40 border-purple-400/50'
            }`}>
              <span className="text-xs font-bold text-white tracking-wide">{badges[0].label}</span>
            </div>
          )}
        </div>

        {/* Premium Guest Favourite Badge */}
        {property.rating && property.rating >= 4.5 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/98 backdrop-blur-xl rounded-full px-3 py-2 shadow-xl shadow-amber-200/50 border border-amber-100 group-hover:scale-105 transition-transform">
            <Star className="w-4 h-4 text-amber-500" fill="#f59e0b" />
            <span className="text-xs font-bold text-gray-900">Guest favourite</span>
          </div>
        )}
      </div>

      {/* Premium Content Area */}
      <div className="p-5 space-y-4">
        {/* Title & Location */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-2 group-hover:text-pink-600 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-gray-600 text-sm">
            <div className="p-1 bg-gray-100 rounded-lg mr-2">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <span className="line-clamp-1 font-medium">{property.city}</span>
          </div>
        </div>

        {/* Premium Rating */}
        {property.rating && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 w-fit">
            <Star className="w-4 h-4 text-amber-500" fill="#f59e0b" />
            <span className="font-bold text-sm text-gray-900">{property.rating}</span>
            <span className="text-xs text-gray-500">Rating</span>
          </div>
        )}

        {/* Premium Trust Triggers */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          {property.no_brokerage && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg text-xs text-green-700 font-semibold border border-green-200">
              <CheckCircle className="w-3 h-3" />
              <span>No Brokerage</span>
            </div>
          )}
          {property.pay_at_property && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg text-xs text-blue-700 font-semibold border border-blue-200">
              <Shield className="w-3 h-3" />
              <span>Pay Later</span>
            </div>
          )}
          {property.accepts_local_ids && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg text-xs text-purple-700 font-semibold border border-purple-200">
              <CheckCircle className="w-3 h-3" />
              <span>Local IDs</span>
            </div>
          )}
        </div>

        {/* Premium Price Section */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              ₹{(property.price_per_day || property.price_full_day || 0).toLocaleString()}
            </span>
            <span className="text-sm text-gray-600 font-medium">/night</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-green-700 font-bold">Lowest Price Guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
