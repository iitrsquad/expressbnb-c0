import { useState, useEffect } from 'react';
import { Calendar, Plus, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import HostCalendarManager from '../../components/HostCalendarManager';

interface Property {
  id: string;
  title: string;
  price_per_day: number;
  price_full_day: number;
  city: string;
  state: string;
}

interface CalendarPageProps {
  hostId: string;
}

export default function CalendarPage({ hostId }: CalendarPageProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [newBasePrice, setNewBasePrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [hostId]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, price_per_day, price_full_day, city, state')
        .eq('host_id', hostId)
        .eq('is_active', true)
        .order('title');

      if (error) throw error;

      setProperties(data || []);
      if (data && data.length > 0 && !selectedProperty) {
        setSelectedProperty(data[0]);
        setNewBasePrice((data[0].price_per_day || data[0].price_full_day).toString());
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBasePrice = async () => {
    if (!selectedProperty || !newBasePrice) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({ price_per_day: parseInt(newBasePrice) })
        .eq('id', selectedProperty.id);

      if (error) throw error;

      setSelectedProperty({
        ...selectedProperty,
        price_per_day: parseInt(newBasePrice)
      });

      setShowPriceEditor(false);
      fetchProperties();
    } catch (error) {
      console.error('Error updating base price:', error);
      alert('Failed to update base price. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-[#cc2b5e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Properties Yet</h2>
        <p className="text-gray-600 mb-6">
          Add your first property to start managing availability and pricing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar Management</h1>
          <p className="text-gray-600 mt-1">
            Manage availability and pricing for your properties
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Property
          </label>
          <select
            value={selectedProperty?.id || ''}
            onChange={(e) => {
              const property = properties.find(p => p.id === e.target.value);
              if (property) {
                setSelectedProperty(property);
                setNewBasePrice((property.price_per_day || property.price_full_day).toString());
              }
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2b5e] focus:border-transparent"
          >
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.title} - {property.city}, {property.state}
              </option>
            ))}
          </select>
        </div>

        {selectedProperty && (
          <div className="mb-6 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Base Price Per Night</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{(selectedProperty.price_per_day || selectedProperty.price_full_day).toLocaleString()}
                  </span>
                  <span className="text-gray-600">/night</span>
                </div>
              </div>
              {!showPriceEditor ? (
                <button
                  onClick={() => setShowPriceEditor(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <DollarSign className="w-4 h-4" />
                  Update Base Price
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(e.target.value)}
                    placeholder="Enter new price"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2b5e] focus:border-transparent"
                  />
                  <button
                    onClick={handleUpdateBasePrice}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPriceEditor(false);
                      setNewBasePrice((selectedProperty.price_per_day || selectedProperty.price_full_day).toString());
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-3">
              This is the default price for all dates. You can set custom prices for specific dates below.
            </p>
          </div>
        )}
      </div>

      {selectedProperty && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to use the calendar:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Click dates</strong> to select multiple dates at once</li>
              <li>• <strong>Click "Update Selected Dates"</strong> to bulk edit availability and pricing</li>
              <li>• <strong>Hover over dates</strong> and click the lock icon to quickly block/unblock individual dates</li>
              <li>• <strong>Yellow dates</strong> are already booked and cannot be modified</li>
              <li>• <strong>Custom prices</strong> override the base price for specific dates</li>
            </ul>
          </div>

          <HostCalendarManager
            propertyId={selectedProperty.id}
            basePrice={selectedProperty.price_per_day || selectedProperty.price_full_day}
            onUpdateBasePrice={(newPrice) => {
              setSelectedProperty({
                ...selectedProperty,
                price_per_day: newPrice
              });
            }}
          />
        </>
      )}
    </div>
  );
}
