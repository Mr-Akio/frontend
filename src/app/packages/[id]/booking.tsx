"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface TourPackage {
  id: number;
  title: string;
  image: string;
  location: string;
  price: string;
  description: string;
}

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tour, setTour] = useState<TourPackage | null>(null);
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8000/api/packages/${id}/`)
      .then((res) => res.json())
      .then(setTour)
      .catch(() => {
        console.error("Error loading tour");
        setMessage("❌ Unable to load package information");
      });
  }, [id]);

  const handleBooking = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ Please log in before booking");
      return;
    }

    if (!date) {
      setMessage("⚠️ Please select a travel date");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/bookings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          package_id: id,
          travel_date: date,
          number_of_people: people,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Booking successful!");
        setTimeout(() => router.push("/profile"), 2000);
      } else {
        setMessage(`❌ ${data.detail || "An error occurred during booking"}`);
      }
    } catch {
      setMessage("❌ Connection error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!tour) return <div className="p-6 text-center text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-white px-4 py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">{tour.title}</h1>
      <Image
        src={`http://localhost:8000${tour.image}`}
        alt={tour.title}
        width={800}
        height={400}
        className="rounded-lg mb-6"
      />
      <p className="text-gray-700 mb-2">
        <strong>Location:</strong> {tour.location}
      </p>
      <p className="text-gray-700 mb-2">
        <strong>Price:</strong> {Number(tour.price).toLocaleString()} ฿
      </p>
      <p className="text-gray-700 mb-4">{tour.description}</p>

      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          📅 Travel Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        />
        <label className="block mb-2 text-sm font-medium text-gray-700">
          👥 Number of People
        </label>
        <input
          type="number"
          value={people}
          min="1"
          onChange={(e) => setPeople(Number(e.target.value))}
          className="w-full p-3 mb-4 border rounded-lg"
        />
        <button
          onClick={handleBooking}
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-60"
        >
          {loading ? "⏳ Booking..." : "Confirm Booking"}
        </button>
        {message && (
          <p className="text-center text-sm text-red-600 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}
