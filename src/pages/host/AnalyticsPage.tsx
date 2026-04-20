import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, Eye, TrendingUp, Users, Calendar, Sparkles } from 'lucide-react';
import { hasPremiumAccess } from '../../lib/premium';
import VisibilityDiagnostics from '../../components/premium/VisibilityDiagnostics';
import SmartPricing from '../../components/premium/SmartPricing';
import AIHostCoach from '../../components/premium/AIHostCoach';
import EarningsSimulator from '../../components/premium/EarningsSimulator';

export default function AnalyticsPage() {
  const { host } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalBookings: 0,
    conversionRate: 0,
    avgBookingValue: 0,
    popularProperty: '',
  });
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  useEffect(() => {
    if (host?.id) {
      loadAnalytics();
    }
  }, [host?.id]);
useEffect(() => {
  if (!host?.id) return;

  const channel = supabase
    .channel('realtime-views')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'hosts',
        filter: `id=eq.${host.id}`,
      },
      (payload) => {
        setAnalytics((prev) => ({
          ...prev,
          totalViews: payload.new.total_views,
        }));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [host?.id]);

  const loadAnalytics = async () => {
    if (!host?.id) return;

    try {
      // Get all properties owned by this host
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, is_premium, premium_plan, premium_expiry')
        .eq('host_id', host.id);

      if (propertiesError) throw propertiesError;

      const propertyIds = properties?.map(p => p.id) || [];

      // Get bookings and views for these properties
      const [bookingsRes, viewsRes] = await Promise.all([
        supabase.from('bookings').select('*').eq('host_id', host.id),
        propertyIds.length > 0
          ? supabase
              .from('view_events')
              .select('entity_id, timestamp')
              .eq('entity_type', 'property')
              .in('entity_id', propertyIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      const bookings = bookingsRes.data || [];
      const views = viewsRes.data || [];

      const totalViews = views.length;
      const totalBookings = bookings.length;
      const conversionRate = totalViews > 0 ? (totalBookings / totalViews * 100) : 0;
      const avgBookingValue = bookings.length > 0
        ? bookings.reduce((sum, b) => sum + Number(b.amount_total || 0), 0) / bookings.length
        : 0;

      // Calculate views per property
      const propertyViews = (properties || []).map(p => ({
        name: p.title,
        views: views.filter((v: any) => v.entity_id === p.id).length,
      }));

      const popularProperty = propertyViews.sort((a, b) => b.views - a.views)[0]?.name || 'N/A';

      setProperties(properties || []);
      if (properties && properties.length > 0 && !selectedProperty) {
        setSelectedProperty(properties[0]);
      }

      setAnalytics({
        totalViews,
        totalBookings,
        conversionRate,
        avgBookingValue,
        popularProperty,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Realtime insights about your properties</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Views</span>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalViews}</p>
          <p className="text-sm text-gray-600 mt-1">Property page views</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Bookings</span>
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalBookings}</p>
          <p className="text-sm text-gray-600 mt-1">Successful bookings</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.conversionRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-600 mt-1">Views to bookings</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Avg Booking Value</span>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{analytics.avgBookingValue.toFixed(0)}</p>
          <p className="text-sm text-gray-600 mt-1">Per booking</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Most Popular Property</span>
            <div className="p-2 bg-pink-100 rounded-lg">
              <Users className="w-5 h-5 text-pink-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900">{analytics.popularProperty}</p>
          <p className="text-sm text-gray-600 mt-1">Highest views</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Insights</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Good Conversion Rate</h3>
              <p className="text-sm text-blue-800 mt-1">
                Your conversion rate of {analytics.conversionRate.toFixed(1)}% is {analytics.conversionRate > 5 ? 'above' : 'below'} the platform average of 5%.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <Activity className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Booking Performance</h3>
              <p className="text-sm text-green-800 mt-1">
                You have {analytics.totalBookings} total bookings with an average value of ₹{analytics.avgBookingValue.toFixed(0)}.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
            <Eye className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900">Visibility</h3>
              <p className="text-sm text-purple-800 mt-1">
                Your properties have received {analytics.totalViews} total views. Keep your listings updated to maintain visibility.
              </p>
            </div>
          </div>
        </div>
      </div>

      {properties.length > 0 && selectedProperty && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Premium Analytics</h2>
                <p className="text-sm text-gray-600">Advanced intelligence for property optimization</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VisibilityDiagnostics
              property={selectedProperty}
              locked={!hasPremiumAccess(selectedProperty)}
            />
            <SmartPricing
              property={selectedProperty}
              locked={!hasPremiumAccess(selectedProperty)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EarningsSimulator
              property={selectedProperty}
              locked={!hasPremiumAccess(selectedProperty)}
            />
            <AIHostCoach
              property={selectedProperty}
              locked={!hasPremiumAccess(selectedProperty)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
