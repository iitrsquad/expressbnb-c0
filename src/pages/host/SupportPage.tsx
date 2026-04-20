import { useState } from 'react';
import { HelpCircle, MessageSquare, Mail, Phone, Send } from 'lucide-react';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'normal',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setFormData({ subject: '', message: '', priority: 'normal' });

      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support</h1>
        <p className="text-gray-600 mt-2">Get help from our team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
          <p className="text-sm text-gray-600 mb-4">Get help via email</p>
          <a
            href="mailto:support@xpressbnb.com"
            className="text-[#cc2b5e] hover:underline text-sm font-medium"
          >
            support@xpressbnb.com
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Phone Support</h3>
          <p className="text-sm text-gray-600 mb-4">Mon-Fri, 9AM-6PM IST</p>
          <a
            href="tel:+911234567890"
            className="text-[#cc2b5e] hover:underline text-sm font-medium"
          >
            +91 123 456 7890
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
          <p className="text-sm text-gray-600 mb-4">Chat with our team</p>
          <button className="text-[#cc2b5e] hover:underline text-sm font-medium">
            Start Chat
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Submit a Support Request</h2>

        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <p className="font-semibold">Request submitted successfully!</p>
            <p className="text-sm mt-1">We'll get back to you within 24 hours.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2b5e] focus:border-transparent"
              placeholder="Brief description of your issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2b5e] focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2b5e] focus:border-transparent resize-none"
              placeholder="Please describe your issue in detail..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {loading ? 'Sending...' : 'Submit Request'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Common Questions</h2>
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-[#cc2b5e] mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I add a new property?</h3>
                <p className="text-sm text-gray-600">
                  Go to the Properties page and click "Add Property". Fill in all required details and submit the form.
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-[#cc2b5e] mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do bookings work?</h3>
                <p className="text-sm text-gray-600">
                  Guests book through the platform and pay via Razorpay. You'll receive notifications and can manage bookings from the Bookings page.
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-[#cc2b5e] mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">When do I receive payments?</h3>
                <p className="text-sm text-gray-600">
                  Payments are processed immediately through Razorpay. Payouts are made to your bank account within 2-3 business days after the booking is completed.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-[#cc2b5e] mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I cancel or refund a booking?</h3>
                <p className="text-sm text-gray-600">
                  Go to the Bookings page, find the booking, and use the "Cancel" button. For refunds, contact our support team for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
