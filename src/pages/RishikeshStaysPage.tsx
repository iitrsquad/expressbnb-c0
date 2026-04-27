import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

/**
 * Simplified and improved Rishikesh listing page.
 *
 * This page replaces the previous version that relied on static arrays
 * and unsplash placeholder images. It fetches real property data from
 * your Supabase database and attempts to load the first uploaded
 * photo for each property from the Supabase storage bucket. If no
 * photo is found, it still renders the card but without an image. The
 * design uses a dark theme consistent with the new XpressBnB brand
 * aesthetic and scales gracefully across mobile and desktop. Adjust
 * queries and bucket names to match your schema.
 */

interface Property {
  id: string;
  name: string;
  price: number;
  rating: number;
  location?: string;
  imageUrl?: string;
}

const RishikeshPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProps = async () => {
      setLoading(true);
      // Fetch properties tagged for Rishikesh from your Supabase table
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('city', 'Rishikesh');

      if (error) {
        console.error('Error fetching properties', error);
        setLoading(false);
        return;
      }

      if (data) {
        // For each property, attempt to get the first image from the
        // storage bucket named "properties". Adjust the bucket name
        // based on your storage setup (e.g. "property-images").
        const enriched = await Promise.all(
          data.map(async (p: any) => {
            let imageUrl: string | undefined;
            try {
              const { data: files } = await supabase.storage
                .from('properties')
                .list(p.id, { limit: 1 });
              if (files && files.length > 0) {
                const { data: publicUrl } = supabase.storage
                  .from('properties')
                  .getPublicUrl(`${p.id}/${files[0].name}`);
                imageUrl = publicUrl.publicUrl;
              }
            } catch (err) {
              console.warn('Failed to fetch image for property', p.id, err);
            }
            return {
              id: p.id,
              name: p.name,
              price: p.price,
              rating: p.rating,
              location: p.city || 'Rishikesh',
              imageUrl,
            } as Property;
          })
        );
        setProperties(enriched);
      }
      setLoading(false);
    };
    fetchProps();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {/* Hero banner with subtle gradient */}
      <section className="relative bg-gradient-to-r from-orange-600 to-green-700 h-60 flex items-center justify-center text-white">
        <h1 className="text-3xl sm:text-4xl font-bold">Rishikesh Stays</h1>
      </section>
      {/* Property grid */}
      <section className="max-w-7xl mx-auto p-4">
        {loading ? (
          <p className="text-center text-gray-400">Loading stays…</p>
        ) : properties.length === 0 ? (
          <p className="text-center text-gray-400">No properties found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <div
                key={p.id}
                className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-100 truncate">
                    {p.name}
                  </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      {p.location}
                    </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-orange-400">
                      ₹{p.price.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-gray-400"> /night</span>
                    </span>
                    <span className="text-yellow-400 text-sm">⭐ {p.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RishikeshPage;