import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Plus, CreditCard as Edit, Trash2, Eye, EyeOff, MapPin, IndianRupee, CheckCircle, ChevronDown, ChevronUp, Sparkles, Crown } from 'lucide-react';
import PropertyListingForm from '../../components/PropertyListingForm';
import { hasPremiumAccess, getPremiumBadgeText } from '../../lib/premium';
import ABTesting from '../../components/premium/ABTesting';
import PremiumUpgradeCTA from '../../components/premium/PremiumUpgradeCTA';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  price_per_day: number;
  price_full_day?: number;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  amenities: string[];
  images: string[];
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  is_premium: boolean;
  premium_plan: string;
  premium_expiry: string | null;
  listing_type: string;
  created_at: string;
  updated_at: string;
}

export default function PropertiesPage() {
  const { host } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null);
  const [upgradingPropertyId, setUpgradingPropertyId] = useState<string | null>(null);

  useEffect(() => {
    if (host?.id) {
      loadProperties();
    }
  }, [host?.id]);

  const loadProperties = async () => {
    if (!host?.id) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('host_id', host.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingProperty(null);
    setShowForm(true);
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const { error } = await supabase.from('properties').delete().eq('id', propertyId);

      if (error) throw error;
      await loadProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const handleToggleActive = async (property: Property) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: !property.is_active })
        .eq('id', property.id);

      if (error) throw error;
      await loadProperties();
    } catch (error) {
      console.error('Error toggling property status:', error);
      alert('Failed to update property status');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProperty(null);
    loadProperties();
  };

  const handleUpgradeProperty = async (propertyId: string) => {
    if (!host) return;

    setUpgradingPropertyId(propertyId);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 999,
          currency: 'INR',
          receipt: `property_${propertyId}_${Date.now()}`,
          notes: {
            host_id: host.id,
            property_id: propertyId,
            subscription_type: 'monthly',
          },
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Order creation failed:', responseData);
        throw new Error(responseData.message || responseData.error || 'Failed to create order');
      }

      const { order } = responseData;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'XpressBnB',
        description: 'Property Premium Subscription',
        order_id: order.id,
        handler: async function (razorpayResponse: any) {
          try {
            const subscriptionEndDate = new Date();
            subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

            const { error: insertError } = await supabase
              .from('property_subscriptions')
              .upsert({
                property_id: propertyId,
                host_id: host.id,
                subscription_status: 'active',
                subscription_plan: 'monthly',
                amount_paid: 999,
                currency: 'INR',
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                subscription_start_date: new Date().toISOString(),
                subscription_end_date: subscriptionEndDate.toISOString(),
                auto_renew: true,
              }, {
                onConflict: 'property_id'
              });

            if (insertError) throw insertError;

            alert('Property upgraded to premium successfully!');
            await loadProperties();
          } catch (err) {
            console.error('Error updating subscription:', err);
            alert('Payment successful but failed to update subscription. Please contact support.');
          }
        },
        prefill: {
          name: host.name,
          email: host.email,
          contact: host.phone,
        },
        theme: {
          color: '#cc2b5e',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      razorpay.on('payment.failed', function () {
        alert('Payment failed. Please try again.');
      });
    } catch (err) {
      console.error('Error creating subscription:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process subscription';
      alert(errorMessage);
    } finally {
      setUpgradingPropertyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-[#cc2b5e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showForm) {
    return <PropertyListingForm property={editingProperty} onClose={handleFormClose} onSuccess={handleFormClose} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-2">Manage your property listings</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No properties yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first property listing</p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Your First Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative">
                {property.images?.[0] ? (
                  <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 flex-wrap">
                  {property.is_verified && (
                    <span className="relative px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-500 shadow-lg flex items-center gap-1.5 motion-safe:hover:shadow-amber-400/50 motion-safe:hover:shadow-xl transition-all duration-300 group/badge">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-950" fill="#78350f" />
                      <span className="text-amber-950 tracking-wide">Verified</span>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent motion-safe:group-hover/badge:animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      property.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {property.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {property.city}, {property.state}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>
                <div className="mb-4">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600">Price per day:</span>
                    <span className="font-bold text-gray-900 ml-1">₹{(property.price_per_day || property.price_full_day || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {property.bedrooms} bed • {property.bathrooms} bath • {property.max_guests} guests
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(property)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    {property.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {property.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(property)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">
                  <button
                    onClick={() =>
                      setExpandedPropertyId(
                        expandedPropertyId === property.id ? null : property.id
                      )
                    }
                    className="w-full flex items-center justify-between px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-900">
                        Premium Insights
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          hasPremiumAccess(property)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {getPremiumBadgeText(property)}
                      </span>
                    </div>
                    {expandedPropertyId === property.id ? (
                      <ChevronUp className="w-4 h-4 text-purple-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-purple-600" />
                    )}
                  </button>

                  {expandedPropertyId === property.id && (
                    <div className="mt-4">
                      {hasPremiumAccess(property) ? (
                        <ABTesting property={property} />
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#cc2b5e] to-[#753a88] rounded-lg flex items-center justify-center flex-shrink-0">
                                <Crown className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-2">Upgrade to Premium</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                  Unlock advanced analytics, AI insights, calendar sync, and verified badge for this property.
                                </p>
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => handleUpgradeProperty(property.id)}
                                    disabled={upgradingPropertyId === property.id}
                                    className="px-6 py-2.5 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    {upgradingPropertyId === property.id ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <Crown className="w-4 h-4" />
                                        Upgrade for ₹999/month
                                      </>
                                    )}
                                  </button>
                                  <span className="text-sm text-gray-600">Cancel anytime</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
