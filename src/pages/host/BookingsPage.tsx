import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Calendar, User, Mail, Phone, IndianRupee, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Booking {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  amount_total: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: string;
  razorpay_payment_id?: string;
  created_at: string;
  properties: {
    title: string;
    city: string;
  };
}

export default function BookingsPage() {
  const { host } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');

  useEffect(() => {
    if (host?.id) {
      loadBookings();
    }
  }, [host?.id]);

  const loadBookings = async () => {
    if (!host?.id) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, properties(title, city)')
        .eq('host_id', host.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      await loadBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600 mt-2">Manage your property bookings</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'all' && ` (${bookings.length})`}
            {status !== 'all' && ` (${bookings.filter((b) => b.status === status).length})`}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? "You don't have any bookings yet"
              : `No ${filter} bookings at the moment`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.properties.title}</h3>
                      <p className="text-sm text-gray-600">{booking.properties.city}</p>
                    </div>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Guest Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          {booking.guest_name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {booking.guest_email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {booking.guest_phone}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Booking Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          Check-in: {new Date(booking.check_in).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          Check-out: {new Date(booking.check_out).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          {booking.guests} guests
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                      <IndianRupee className="w-5 h-5" />
                      {booking.amount_total?.toLocaleString() || 0}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                        booking.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        Payment: {booking.payment_status || 'pending'}
                      </span>
                      {booking.razorpay_payment_id && (
                        <span className="text-xs text-gray-500">ID: {booking.razorpay_payment_id.slice(0, 15)}...</span>
                      )}
                    </div>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                      className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'completed')}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
