import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Check, Crown, Zap, Loader2, Building2 } from 'lucide-react';
import PropertyUpgradeModal from '../../components/PropertyUpgradeModal';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPage() {
  const { host } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'paid'>('free');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [propertySubscriptions, setPropertySubscriptions] = useState<any[]>([]);

  useEffect(() => {
    if (host?.id) {
      loadPropertySubscriptions();
    }
  }, [host?.id]);

  const loadPropertySubscriptions = async () => {
    if (!host?.id) return;

    try {
      const { data, error } = await supabase
        .from('property_subscriptions')
        .select(`
          *,
          properties:property_id (
            id,
            title,
            city,
            state,
            images
          )
        `)
        .eq('host_id', host.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPropertySubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free Listing',
      price: 0,
      description: 'Get started with basic features',
      features: [
        'List unlimited properties',
        'Basic property management',
        'Accept bookings',
        'Email notifications',
        'Basic support',
      ],
      limitations: [
        'No calendar sync',
        'No analytics',
        'No verified badge',
      ],
    },
    {
      id: 'paid',
      name: 'Paid Listing',
      price: 999,
      description: 'Unlock premium features per property',
      features: [
        'Everything in Free',
        'Calendar sync with Airbnb, Booking.com',
        'Advanced analytics & insights',
        'Verified badge on listings',
        'Priority customer support',
        'Expert listing assistance',
        'Featured placement',
        'Custom branding options',
      ],
      limitations: [],
    },
  ];

  const handleUpgrade = async () => {
    setShowPropertyModal(true);
  };

  const handlePropertySelected = async (propertyId: string) => {
    if (!host) return;

    setSelectedPropertyId(propertyId);
    setProcessing(true);
    setError(null);

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
            await loadPropertySubscriptions();
          } catch (err) {
            console.error('Error updating subscription:', err);
            setError('Payment successful but failed to update subscription. Please contact support.');
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
        setError('Payment failed. Please try again.');
      });
    } catch (err) {
      console.error('Error creating subscription:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process subscription';
      setError(errorMessage);
    } finally {
      setProcessing(false);
      setSelectedPropertyId(null);
    }
  };

  const activePremiumCount = propertySubscriptions.filter(
    sub => sub.subscription_status === 'active'
  ).length;

  return (
    <div className="space-y-6">
      <PropertyUpgradeModal
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        onSelectProperty={handlePropertySelected}
      />

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your property subscriptions</p>
      </div>

      {import.meta.env.VITE_RAZORPAY_KEY_ID === 'rzp_test_your_key_id' && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">⚠️</div>
            <div>
              <h3 className="font-semibold mb-1">Payment System Configuration Required</h3>
              <p className="text-sm">
                To enable subscription payments, Razorpay credentials need to be configured.
                Please add your Razorpay keys to the <code className="bg-yellow-100 px-1 rounded">.env</code> file:
              </p>
              <ul className="text-sm mt-2 space-y-1 ml-4 list-disc">
                <li><code className="bg-yellow-100 px-1 rounded">VITE_RAZORPAY_KEY_ID</code> - Your Razorpay test/live key ID</li>
                <li>Set Razorpay secret in Supabase Edge Function environment variables</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-r from-[#cc2b5e] to-[#753a88] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-6 h-6" />
          <h3 className="text-xl font-bold">
            Premium Properties: {activePremiumCount}
          </h3>
        </div>
        <p className="opacity-90">
          {activePremiumCount === 0
            ? 'Upgrade individual properties to unlock premium features'
            : `You have ${activePremiumCount} ${activePremiumCount === 1 ? 'property' : 'properties'} with premium access`}
        </p>
      </div>

      {propertySubscriptions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Property Subscriptions</h2>
          <div className="space-y-3">
            {propertySubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                    {sub.properties?.images?.[0] ? (
                      <img
                        src={sub.properties.images[0]}
                        alt={sub.properties.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{sub.properties?.title || 'Property'}</h3>
                    <p className="text-sm text-gray-600">
                      {sub.properties?.city}, {sub.properties?.state}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      sub.subscription_status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {sub.subscription_status === 'active' ? 'Premium Active' : 'Trial'}
                  </span>
                  {sub.subscription_end_date && sub.subscription_status === 'active' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Until: {new Date(sub.subscription_end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl shadow-sm border-2 p-8 transition-all ${
              plan.id === 'paid'
                ? 'border-[#cc2b5e] relative'
                : 'border-gray-200'
            }`}
          >
            {plan.id === 'paid' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Recommended
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-bold text-gray-900">₹{plan.price}</span>
                {plan.price > 0 && <span className="text-gray-600">/month/property</span>}
              </div>
              <p className="text-gray-600">{plan.description}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <p className="font-semibold text-gray-900 mb-3">Features:</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900 mb-3">Not included:</p>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-gray-400">×</span>
                        <span className="text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (plan.id === 'paid') {
                  handleUpgrade();
                }
              }}
              disabled={processing || plan.id === 'free'}
              className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                plan.id === 'paid'
                  ? 'bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white hover:shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {processing && plan.id === 'paid' && <Loader2 className="w-5 h-5 animate-spin" />}
              {plan.id === 'paid'
                ? processing
                  ? 'Processing...'
                  : 'Select Property to Upgrade'
                : 'Current Plan'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
            <p className="text-gray-600 text-sm">Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Is the price per property?</h3>
            <p className="text-gray-600 text-sm">Yes, the paid plan costs ₹999/month per property. You can upgrade individual properties as needed.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600 text-sm">We accept all major credit/debit cards, UPI, and net banking through Razorpay.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
