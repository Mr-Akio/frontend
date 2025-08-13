'use client';

import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="relative">
     
      <div className="absolute inset-0 h-[450px] w-full -z-10">
        <Image
          src="/images/senbon-torii-6389421_1920.jpg" 
          alt="About Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-opacity-60"></div>
      </div>

      
      <section className="text-white pt-40 pb-10 text-center">
        <h1 className="text-4xl font-extrabold mb-2">About Us</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-200">
          We are a trusted tour and travel agency helping you plan the trip of your dreams.
        </p>
      </section>

    
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:flex items-center gap-10">
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-3xl font-bold">🌍 Our Vision</h2>
            <p className="text-gray-600">
              We are very trusted tour and travel agency, standing up for everyone.
              We provide affordable prices, professional guides, and clear information
              to make your journey enjoyable and safe.
            </p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>✅ Affordable Prices</li>
              <li>✅ Positive Comfort</li>
              <li>✅ Friendly to Customer</li>
            </ul>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0">
            <Image
              src="/images/senbon-torii-6389421_1920.jpg" 
              alt="About Travel"
              width={600}
              height={400}
              className="rounded-xl shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

 
      <section className="bg-[#00b4d8] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-bold mb-2">🧭 Tour Guide</h3>
            <p>Professional guides to assist you throughout your trip.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">🛡️ Safety Safe</h3>
            <p>We prioritize your safety and security at every step.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">💰 Clear Price</h3>
            <p>No hidden fees. Transparent pricing for all packages.</p>
          </div>
        </div>
      </section>

     
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">📢 Get Info From News</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="shadow-md rounded-xl overflow-hidden">
              <Image
                src="/images/senbon-torii-6389421_1920.jpg"
                alt="News 1"
                width={400}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="font-medium">Beautiful Beach to Visit</p>
                <p className="text-sm text-gray-600">Updated: July 2025</p>
              </div>
            </div>
            <div className="shadow-md rounded-xl overflow-hidden">
              <Image
                src="/images/senbon-torii-6389421_1920.jpg"
                alt="News 2"
                width={400}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="font-medium">Colorful Tourist Houses</p>
                <p className="text-sm text-gray-600">Updated: July 2025</p>
              </div>
            </div>
            <div className="shadow-md rounded-xl overflow-hidden">
              <Image
                src="/images/senbon-torii-6389421_1920.jpg"
                alt="News 3"
                width={400}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="font-medium">Top 5 Travel Destinations</p>
                <p className="text-sm text-gray-600">Updated: July 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
