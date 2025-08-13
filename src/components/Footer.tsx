'use client';

import { FaFacebook, FaTwitter, FaYoutube, FaVimeo } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer
      className="relative bg-cover bg-center text-white py-16"
      style={{ backgroundImage: "url('/images/pexels-asadphoto-457881.jpg')" }}
    >
      {/* Black overlay */}
      <div className="absolute inset-0  bg-opacity-50 z-0"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Subscribe Form */}
        <div className="text-center mb-10">
          <h4 className="text-xl  font-bold">Keep in Touch</h4>
          <div className="mt-4 flex justify-center ">
            <input
              type="email"
              placeholder="Enter your email"
              className="p-3 rounded-l-lg border border-gray-300 w-64 text-black focus:outline-none"
            />
            <button className="bg-orange-500 text-white px-6 py-3 rounded-r-lg hover:bg-orange-600">
              Send
            </button>
          </div>
        </div>

        {/* Footer Content */}
        <div className="container mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-8 bg-white bg-opacity-90 p-10 rounded-lg">
          {/* Logo & Social */}
          <div>
            <h4 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-2">🌊</span> Travel
            </h4>
            <p className="mt-4 text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ut diam et nibh condimentum venenatis.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#"><FaTwitter className="text-gray-600 hover:text-blue-400 text-xl" /></a>
              <a href="#"><FaFacebook className="text-gray-600 hover:text-blue-600 text-xl" /></a>
              <a href="#"><FaYoutube className="text-gray-600 hover:text-red-500 text-xl" /></a>
              <a href="#"><FaVimeo className="text-gray-600 hover:text-blue-400 text-xl" /></a>
            </div>
          </div>

          {/* Our Agency */}
          <div>
            <h4 className="text-2xl font-bold text-gray-900">Our Agency</h4>
            <nav className="mt-4 flex flex-col space-y-2 text-gray-600">
              <a href="#" className="hover:text-gray-900">Services</a>
              <a href="#" className="hover:text-gray-900">Insurance</a>
              <a href="#" className="hover:text-gray-900">Agency</a>
              <a href="#" className="hover:text-gray-900">Tourism</a>
              <a href="#" className="hover:text-gray-900">Payment</a>
            </nav>
          </div>

          {/* Partners */}
          <div>
            <h4 className="text-2xl font-bold text-gray-900">Partners</h4>
            <nav className="mt-4 flex flex-col space-y-2 text-gray-600">
              <a href="#" className="hover:text-gray-900">Booking</a>
              <a href="#" className="hover:text-gray-900">RentalCar</a>
              <a href="#" className="hover:text-gray-900">HostelWorld</a>
              <a href="#" className="hover:text-gray-900">Trivago</a>
              <a href="#" className="hover:text-gray-900">TripAdvisor</a>
            </nav>
          </div>

          {/* Last Minute */}
          <div>
            <h4 className="text-2xl font-bold text-gray-900">Last Minute</h4>
            <nav className="mt-4 flex flex-col space-y-2 text-gray-600">
              <a href="#" className="hover:text-gray-900">London</a>
              <a href="#" className="hover:text-gray-900">California</a>
              <a href="#" className="hover:text-gray-900">Indonesia</a>
              <a href="#" className="hover:text-gray-900">Europe</a>
              <a href="#" className="hover:text-gray-900">Oceania</a>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-10 text-gray-400 text-sm">
          <p>The Best Travel</p>
          <p>Copyright © Themes 2025</p>
        </div>
      </div>
    </footer>
  );
}
