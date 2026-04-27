import React from "react";

/*
 * PropertyPage.tsx
 *
 * This component renders a dark‑themed property details page for XpressBnB.
 * It’s written in TypeScript and designed to work in a React (or Next.js)
 * environment with Tailwind CSS. The page adapts gracefully between
 * desktop and mobile layouts. Replace the placeholder data with
 * real listing information when integrating into your application.
 */

// Interfaces for typed data structures.
interface Image {
  src: string;
  alt: string;
}

interface Amenity {
  icon: string;
  label: string;
}

interface Review {
  name: string;
  date: string;
  rating: number;
  text: string;
}

const PropertyPage: React.FC = () => {
  // Sample list of images; update these values to your real property images.
  const images: Image[] = [
    {
      src: "/hf_20260421_035555_1a21c02f-f8a3-493b-a91f-a38b0d35d0e8.png",
      alt: "Primary view of the property",
    },
    {
      src: "/hf_20260421_035601_66b783e2-f00b-4935-a8ab-9a018055df45.png",
      alt: "Secondary view of the property",
    },
    {
      src: "/hf_20260421_035615_b04f7bfa-fec6-4a1b-998c-f50871270636.png",
      alt: "Another angle of the property",
    },
  ];

  // Amenities list. Use emojis or replace with an icon library of your choice.
  const amenities: Amenity[] = [
    { icon: "📶", label: "Free Wi‑Fi" },
    { icon: "❄️", label: "Air conditioning" },
    { icon: "🖥", label: "Smart TV" },
    { icon: "🚗", label: "Free parking" },
    { icon: "🍳", label: "Full kitchen" },
    { icon: "🏊", label: "Swimming pool" },
    { icon: "🧺", label: "Laundry facilities" },
    { icon: "👥", label: "Sleeps 4 guests" },
  ];

  // Sample reviews; replace with actual review data from your backend.
  const reviews: Review[] = [
    {
      name: "Anita",
      date: "Feb 2026",
      rating: 5,
      text:
        "Lovely stay – the apartment was spotless and the river view was stunning. Booking was easy and the host was very responsive!",
    },
    {
      name: "Rohit",
      date: "Jan 2026",
      rating: 4,
      text:
        "Great location and well appointed. Would have loved a little more storage space but overall very comfortable.",
    },
  ];

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Image gallery section */}
        <section className="pt-4">
          {/* Desktop collage */}
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 rounded-lg overflow-hidden">
            {/* Large image spanning two columns and two rows */}
            <div className="col-span-2 row-span-2">
              <img
                src={images[0].src}
                alt={images[0].alt}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Two smaller images stacked */}
            {images.slice(1).map((img: Image, idx: number) => (
              <div key={`img-${idx}`} className="col-span-2">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Mobile carousel */}
          <div className="md:hidden flex overflow-x-scroll space-x-2 hide-scrollbar">
            {images.map((img: Image, idx: number) => (
              <div key={`mobile-img-${idx}`} className="min-w-full rounded-lg overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-64 object-cover"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Title and booking section */}
        <section className="mt-6 md:flex md:justify-between md:items-start">
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Luxury Riverside Apartment
            </h1>
            <div className="mt-2 flex items-center text-sm text-gray-400">
              <span className="mr-1">⭐</span>
              <span>4.8&nbsp;</span>
              <span className="text-gray-500">(120 reviews)</span>
              <span className="mx-2">·</span>
              <span>Delhi, India</span>
            </div>
          </div>

          {/* Booking card for desktop */}
          <aside className="hidden md:block bg-gray-800 rounded-xl p-6 w-80 ml-6 sticky top-28 h-fit">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-2xl font-semibold">₹2,500</span>
                <span className="text-sm text-gray-400"> / night</span>
              </div>
            </div>
            <div className="mt-4 border border-gray-700 rounded-lg divide-y divide-gray-700 overflow-hidden">
              <div className="flex">
                <div className="flex-1 border-r border-gray-700 p-2">
                  <label className="block text-xs uppercase text-gray-500 mb-1">
                    Check‑in
                  </label>
                  <input
                    type="date"
                    className="bg-gray-800 text-gray-100 w-full focus:outline-none"
                  />
                </div>
                <div className="flex-1 p-2">
                  <label className="block text-xs uppercase text-gray-500 mb-1">
                    Check‑out
                  </label>
                  <input
                    type="date"
                    className="bg-gray-800 text-gray-100 w-full focus:outline-none"
                  />
                </div>
              </div>
              <div className="p-2">
                <label className="block text-xs uppercase text-gray-500 mb-1">
                  Guests
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  defaultValue={2}
                  className="bg-gray-800 text-gray-100 w-full focus:outline-none"
                />
              </div>
            </div>
            <button className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition-colors">
              Book Now
            </button>
          </aside>
        </section>

        {/* Mobile booking bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 p-4 shadow-lg flex justify-between items-center z-50">
          <div>
            <span className="text-lg font-semibold">₹2,500</span>
            <span className="text-sm text-gray-400"> / night</span>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
            Book
          </button>
        </div>

        {/* Main content and host info */}
        <section className="mt-8 md:flex md:gap-10">
          {/* Main details */}
          <div className="md:flex-1 md:max-w-3xl">
            {/* Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">About this space</h2>
              <p className="leading-relaxed text-gray-300">
                This elegant riverside apartment offers a peaceful escape right in the heart of Delhi. Enjoy
                breathtaking views of the Yamuna river from the balcony, relax in the spacious living area
                and prepare meals in the fully‑equipped kitchen. Perfect for both short getaways and
                extended stays.
              </p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">What this place offers</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                {amenities.map((item: Amenity, idx: number) => (
                  <div key={`amenity-${idx}`} className="flex items-center space-x-2">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="leading-relaxed text-gray-300">
                The two‑bedroom apartment accommodates up to four guests comfortably with a king‑sized bed
                in the master bedroom and twin beds in the second bedroom. Both bathrooms have hot water
                showers and premium toiletries. High‑speed internet and a smart TV will keep you
                entertained during your stay. The building has 24/7 security and a lift for easy access.
              </p>
            </div>

            {/* Reviews */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Reviews ({reviews.length})</h2>
              <div className="space-y-6">
                {reviews.map((review: Review, idx: number) => (
                  <div key={`review-${idx}`} className="border border-gray-700 p-4 rounded-lg bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{review.name}</p>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                      <div className="text-yellow-400 text-sm">
                        {"⭐".repeat(review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                <span>Map placeholder – embed your map here</span>
              </div>
            </div>
          </div>

          {/* Host information */}
          <div className="md:w-80 md:shrink-0">
            <div className="border border-gray-700 bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Hosted by Neha</h2>
              <div className="flex items-center mb-4">
                <img
                  src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1"
                  alt="Host avatar"
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
                <div>
                  <p className="font-medium">Neha</p>
                  <p className="text-sm text-gray-500">Superhost · Joined 2024</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                Passionate about hospitality and dedicated to providing guests with a memorable stay.
              </p>
              <button className="w-full bg-transparent border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors rounded-lg py-2 font-medium">
                Contact Host
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PropertyPage;