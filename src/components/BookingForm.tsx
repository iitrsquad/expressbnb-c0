import { useState, useEffect } from 'react';
import { Calendar, Users, Mail, Phone, User, MessageSquare, Sparkles, Copy, Check } from 'lucide-react';
import type { Property } from '../lib/database.types';
import { supabase } from '../lib/supabase';

interface BookingFormProps {
  property: Property;
  onSuccess: () => void;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  calculatedPrice: number;
}

interface HostContact {
  email: string;
  phone: string;
  name: string;
}

export default function BookingForm({ property, onSuccess, checkInDate, checkOutDate, calculatedPrice }: BookingFormProps) {
  const [includeDecoration, setIncludeDecoration] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    num_guests: 1,
    special_requests: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hostContact, setHostContact] = useState<HostContact | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const calculateNumberOfDays = () => {
    if (!checkInDate || !checkOutDate) {
      return 0;
    }
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const numberOfDays = calculateNumberOfDays();
  const decorationPrice = includeDecoration ? 2000 : 0;
  const totalPrice = calculatedPrice + decorationPrice;

  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates from the calendar above.');
      return;
    }

    setLoading(true);

    try {
      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      const bookingData = {
        property_id: property.id,
        host_id: property.host_id,
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone,
        check_in_date: formatDate(checkInDate),
        check_out_date: formatDate(checkOutDate),
        checkin: formatDate(checkInDate),
        checkout: formatDate(checkOutDate),
        num_guests: formData.num_guests,
        booking_type: 'full_day',
        amount_total: totalPrice,
        total_price: totalPrice,
        status: 'confirmed',
        payment_status: 'pending',
        special_requests: formData.special_requests || null,
      };

      const { error } = await supabase.from('bookings').insert(bookingData);

      if (error) {
        console.error('Booking error details:', error);
        alert(`Failed to create booking: ${error.message}`);
        setLoading(false);
        return;
      }

      const { data: hostData, error: hostError } = await supabase
        .from('hosts')
        .select('email, phone, name')
        .eq('id', property.host_id)
        .maybeSingle();

      if (hostError) {
        console.error('Error fetching host contact:', hostError);
      }

      if (hostData) {
        setHostContact({
          email: hostData.email,
          phone: hostData.phone || 'Not provided',
          name: hostData.name || 'Host',
        });
      }

      setSuccess(true);
      setLoading(false);
    } catch (error: any) {
      console.error('Booking error:', error);
      alert(`Failed to create booking: ${error.message || 'Please try again.'}`);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 py-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Submitted!</h3>
          <p className="text-gray-600 mb-6">Your booking request has been sent to the host. Please contact them directly to confirm and arrange payment.</p>
        </div>

        {hostContact && (
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#cc2b5e]" />
              Host Contact Information
            </h4>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Host Name</p>
                    <p className="font-semibold text-gray-900">{hostContact.name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Email Address</p>
                    <p className="font-semibold text-gray-900 break-all">{hostContact.email}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(hostContact.email, 'email')}
                    className="ml-3 p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    title="Copy email"
                  >
                    {copiedEmail ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900">{hostContact.phone}</p>
                  </div>
                  {hostContact.phone !== 'Not provided' && (
                    <button
                      onClick={() => copyToClipboard(hostContact.phone, 'phone')}
                      className="ml-3 p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      title="Copy phone"
                    >
                      {copiedPhone ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> Contact the host using the information above to confirm your booking and discuss payment details. The host will provide you with payment instructions.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h5 className="font-semibold text-gray-900 mb-3">Booking Summary</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Property:</span>
              <span className="font-medium text-gray-900">{property.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-in:</span>
              <span className="font-medium text-gray-900">{checkInDate?.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-out:</span>
              <span className="font-medium text-gray-900">{checkOutDate?.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guests:</span>
              <span className="font-medium text-gray-900">{formData.num_guests}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-900 font-semibold">Estimated Total:</span>
              <span className="text-lg font-bold text-gray-900">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onSuccess}
          className="w-full py-3 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white font-semibold rounded-xl hover:from-[#d64371] hover:to-[#8a4b9e] transition-all"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {checkInDate && checkOutDate && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Selected Dates
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-600 mb-1">Check-in</p>
              <p className="font-bold text-gray-900">{checkInDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-600 mb-1">Check-out</p>
              <p className="font-bold text-gray-900">{checkOutDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-white rounded-xl p-3">
            <span className="text-sm text-gray-600">Duration:</span>
            <span className="font-bold text-blue-600">{numberOfDays} {numberOfDays === 1 ? 'Night' : 'Nights'}</span>
          </div>
        </div>
      )}

      {!checkInDate || !checkOutDate ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">!</div>
          <div>
            <p className="font-semibold text-amber-900">Please select dates</p>
            <p className="text-sm text-amber-700 mt-1">Use the calendar above to select your check-in and check-out dates before completing the booking form.</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.guest_name}
            onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cc2b5e] focus:border-transparent transition-all"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Email Address
          </label>
          <input
            type="email"
            required
            value={formData.guest_email}
            onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cc2b5e] focus:border-transparent transition-all"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={formData.guest_phone}
            onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cc2b5e] focus:border-transparent transition-all"
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Number of Guests
          </label>
          <select
            value={formData.num_guests}
            onChange={(e) => setFormData({ ...formData, num_guests: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cc2b5e] focus:border-transparent transition-all"
          >
            {Array.from({ length: property.max_guests }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={includeDecoration}
            onChange={(e) => setIncludeDecoration(e.target.checked)}
            className="w-5 h-5 mt-1 text-[#cc2b5e] rounded focus:ring-2 focus:ring-[#cc2b5e]"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-gray-900">Add Decoration Service</span>
              <span className="ml-auto text-lg font-bold text-amber-600">₹2,000</span>
            </div>
            <p className="text-sm text-gray-600">
              Professional decoration setup for your special occasion. Includes balloons, banners, and themed decorations.
            </p>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <MessageSquare className="w-4 h-4 inline mr-1" />
          Special Requests (Optional)
        </label>
        <textarea
          value={formData.special_requests}
          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cc2b5e] focus:border-transparent transition-all resize-none"
          placeholder="Any special requirements or requests..."
        />
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4">Price Summary</h4>
        <div className="space-y-3">
          {numberOfDays > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                Property Price ({numberOfDays} {numberOfDays === 1 ? 'night' : 'nights'}):
              </span>
              <span className="font-semibold text-gray-900">₹{calculatedPrice.toLocaleString()}</span>
            </div>
          )}
          {includeDecoration && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Decoration Service:
              </span>
              <span className="font-semibold text-amber-600">₹{decorationPrice.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
            <span className="text-gray-900 font-bold text-lg">Total Amount:</span>
            <span className="text-3xl font-bold text-gray-900">₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>
        {numberOfDays === 0 && (
          <p className="text-sm text-amber-600 mt-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Select dates in the calendar above to see pricing
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white font-bold rounded-xl hover:from-[#d64371] hover:to-[#8a4b9e] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Booking Request'}
      </button>

      <p className="text-sm text-gray-500 text-center">
        After submitting, you'll receive the host's contact information to arrange payment directly.
      </p>
    </form>
  );
}
