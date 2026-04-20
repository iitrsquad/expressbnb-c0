import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, TrendingUp, Calendar, Download, IndianRupee } from 'lucide-react';

export default function EarningsPage() {
  const { host } = useAuth();
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    pending: 0,
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (host?.id) {
      loadEarnings();
    }
  }, [host?.id]);

  const loadEarnings = async () => {
    if (!host?.id) return;

    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('host_id', host.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const total = bookings
        ?.filter((b) => b.payment_status === 'paid')
        .reduce((sum, b) => sum + Number(b.amount_total || 0), 0) || 0;

      const thisMonth = bookings
        ?.filter((b) =>
          b.payment_status === 'paid' &&
          new Date(b.created_at) >= thisMonthStart
        )
        .reduce((sum, b) => sum + Number(b.amount_total || 0), 0) || 0;

      const lastMonth = bookings
        ?.filter((b) =>
          b.payment_status === 'paid' &&
          new Date(b.created_at) >= lastMonthStart &&
          new Date(b.created_at) <= lastMonthEnd
        )
        .reduce((sum, b) => sum + Number(b.amount_total || 0), 0) || 0;

      const pending = bookings
        ?.filter((b) => b.status === 'confirmed' && b.payment_status === 'paid')
        .reduce((sum, b) => sum + Number(b.amount_total || 0), 0) || 0;

      setEarnings({ total, thisMonth, lastMonth, pending });
      setTransactions(bookings?.filter(b => b.payment_status === 'paid') || []);
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const percentChange = earnings.lastMonth > 0
    ? ((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-[#cc2b5e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-2">Track your revenue and payouts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Earnings</span>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 flex items-center">
            <IndianRupee className="w-7 h-7" />
            {earnings.total.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">This Month</span>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 flex items-center">
            <IndianRupee className="w-7 h-7" />
            {earnings.thisMonth.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className={`w-4 h-4 ${Number(percentChange) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-sm font-medium ${Number(percentChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {percentChange}% from last month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Last Month</span>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 flex items-center">
            <IndianRupee className="w-7 h-7" />
            {earnings.lastMonth.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Pending Payout</span>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 flex items-center">
            <IndianRupee className="w-7 h-7" />
            {earnings.pending.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Guest</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{transaction.guest_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.razorpay_payment_id?.slice(0, 20) || 'N/A'}...
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                        {transaction.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-gray-900 text-right flex items-center justify-end">
                      <IndianRupee className="w-4 h-4" />
                      {transaction.amount_total?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
