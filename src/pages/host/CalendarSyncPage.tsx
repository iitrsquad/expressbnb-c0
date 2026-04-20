import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Link as LinkIcon, Plus, Trash2, RefreshCw, Copy, Check } from 'lucide-react';

export default function CalendarSyncPage() {
  const { host } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

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
        .eq('is_active', true);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (propertyId: string) => {
    const icalUrl = `${window.location.origin}/api/calendar/${propertyId}.ics`;
    navigator.clipboard.writeText(icalUrl);
    setCopied(propertyId);
    setTimeout(() => setCopied(null), 2000);
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
        <h1 className="text-3xl font-bold text-gray-900">Calendar Sync</h1>
        <p className="text-gray-600 mt-2">Sync your bookings with external calendars</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">How Calendar Sync Works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Export your XpressBnB calendar to Airbnb, Booking.com, or other platforms</li>
              <li>• Import external calendars to avoid double bookings</li>
              <li>• Calendars sync automatically every few hours</li>
            </ul>
          </div>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No active properties</h3>
          <p className="text-gray-600">Add and activate properties to enable calendar sync</p>
        </div>
      ) : (
        <div className="space-y-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{property.title}</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    Export Calendar
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Copy this link and add it to your external calendar app
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/api/calendar/${property.id}.ics`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => handleCopyLink(property.id)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {copied === property.id ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-sm">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Import External Calendars
                  </h4>
                  {property.external_calendars && property.external_calendars.length > 0 ? (
                    <div className="space-y-2">
                      {property.external_calendars.map((cal: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{cal.name}</p>
                            <p className="text-xs text-gray-600 truncate max-w-md">{cal.url}</p>
                          </div>
                          <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 mb-3">No external calendars linked yet</p>
                  )}
                  <button className="mt-3 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Calendar URL
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
