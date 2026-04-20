import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, BookOpen, DollarSign, Eye, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { hasPremiumAccess } from '../../lib/premium';
import HostGrowthScore from '../../components/premium/HostGrowthScore';
import DemandForecast from '../../components/premium/DemandForecast';
import PremiumUpgradeCTA from '../../components/premium/PremiumUpgradeCTA';

interface Stats {
  totalProperties: number;
  activeProperties: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  totalViews: number;
}

interface OverviewPageProps {
  onNavigate?: (page: string) => void;
}

export default function OverviewPage({ onNavigate }: OverviewPageProps = {}) {
  const { host } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    activeProperties: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  useEffect(() => {
    if (host?.id) {
      loadStats();
    }
  }, [host?.id]);

  const loadStats = async () => {
    if (!host?.id) return;

    try {
      const [propertiesRes, bookingsRes, viewsRes] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact' }).eq('host_id', host.id),
        supabase.from('bookings').select('*').eq('host_id', host.id),
        supabase
          .from('view_events')
          .select('*', { count: 'exact' })
          .eq('entity_type', 'property')
          .in(
            'entity_id',
            (await supabase.from('properties').select('id').eq('host_id', host.id)).data?.map((p) => p.id) || []
          ),
      ]);

      const properties = propertiesRes.data || [];
      const bookings = bookingsRes.data || [];
      const activeProperties = properties.filter((p) => p.is_active);

      const totalRevenue = bookings
        .filter((b) => b.status === 'confirmed' && b.amount_total)
        .reduce((sum, b) => sum + Number(b.amount_total || 0), 0);

      const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

      setProperties(properties);
      if (properties.length > 0 && !selectedProperty) {
        setSelectedProperty(properties[0]);
      }

      setStats({
        totalProperties: properties.length,
        activeProperties: activeProperties.length,
        totalBookings: bookings.length,
        pendingBookings,
        totalRevenue,
        totalViews: viewsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Properties',
      value: stats.totalProperties,
      subtitle: `${stats.activeProperties} active`,
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Bookings',
      value: stats.totalBookings,
      subtitle: `${stats.pendingBookings} pending`,
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      subtitle: 'Total earnings',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Views',
      value: stats.totalViews,
      subtitle: 'Total property views',
      icon: Eye,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-[#cc2b5e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back, {host?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate?.('properties')}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-[#cc2b5e] hover:bg-pink-50 transition-colors"
            >
              <p className="font-semibold text-gray-900">Add New Property</p>
              <p className="text-sm text-gray-600">List a new property on XpressBnB</p>
            </button>
            <button
              onClick={() => onNavigate?.('import')}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-[#cc2b5e] hover:bg-pink-50 transition-colors"
            >
              <p className="font-semibold text-gray-900">Import Listings</p>
              <p className="text-sm text-gray-600">Import from Airbnb or Booking.com</p>
            </button>
            <button
              onClick={() => onNavigate?.('realtime')}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-[#cc2b5e] hover:bg-pink-50 transition-colors"
            >
              <p className="font-semibold text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Check your realtime insights</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {stats.totalBookings === 0 && stats.totalProperties === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No activity yet</p>
                <p className="text-sm text-gray-500 mt-1">Start by adding your first property</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-xs text-gray-600">Your host account is active</p>
                  </div>
                </div>
                {stats.totalProperties > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Properties Added</p>
                      <p className="text-xs text-gray-600">{stats.totalProperties} properties listed</p>
                    </div>
                  </div>
                )}
                {stats.totalBookings > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Bookings Received</p>
                      <p className="text-xs text-gray-600">{stats.totalBookings} total bookings</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {properties.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Premium Intelligence</h2>
                <p className="text-sm text-gray-600">Advanced insights for your properties</p>
              </div>
            </div>

            {properties.length > 1 && (
              <select
                value={selectedProperty?.id || ''}
                onChange={(e) => {
                  const property = properties.find((p) => p.id === e.target.value);
                  setSelectedProperty(property);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedProperty && hasPremiumAccess(selectedProperty) ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HostGrowthScore property={selectedProperty} />
              <DemandForecast property={selectedProperty} />
            </div>
          ) : (
            <PremiumUpgradeCTA
              title="Unlock Premium Intelligence"
              description="Get AI-powered insights, smart pricing, demand forecasts, and personalized coaching to maximize your bookings and revenue."
              onUpgrade={() => onNavigate?.('subscription')}
            />
          )}
        </div>
      )}

      {host?.subscription_status === 'trial' && (
        <div className="bg-gradient-to-r from-[#cc2b5e] to-[#753a88] rounded-2xl p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">Upgrade to Paid Listing</h3>
          <p className="mb-4 opacity-90">
            Unlock calendar sync, analytics, verified badge and more for just ₹999/month per property.
          </p>
          <button
            onClick={() => onNavigate?.('subscription')}
            className="bg-white text-[#cc2b5e] px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
}
