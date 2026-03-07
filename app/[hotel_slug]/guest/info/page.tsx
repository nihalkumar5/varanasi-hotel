"use client";

import React from "react";
import { ArrowLeft, MapPin, Clock, Phone } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useHotelBranding } from "@/utils/store";

export default function InfoPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);

    return (
        <div className="pb-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={() => router.back()} className="mb-6 flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-1" /> Back
            </button>

            <h1 className="text-3xl font-bold mb-6">Hotel Information</h1>

            <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start">
                    <Clock className="w-6 h-6 mr-4 mt-0.5" style={{ color: branding?.primaryColor || "#3b82f6" }} />
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Check-in / Check-out</h3>
                        <p className="text-sm text-gray-600">Check-in: 3:00 PM</p>
                        <p className="text-sm text-gray-600">Check-out: 11:00 AM</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start">
                    <MapPin className="w-6 h-6 mr-4 mt-0.5" style={{ color: branding?.primaryColor || "#3b82f6" }} />
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Location & Transport</h3>
                        <p className="text-sm text-gray-600">123 Azure Coastal Ave.</p>
                        <p className="text-sm text-gray-600 mt-2">Airport shuttle runs every 30 minutes from the main lobby.</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start">
                    <Phone className="w-6 h-6 mr-4 mt-0.5" style={{ color: branding?.primaryColor || "#3b82f6" }} />
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Important Numbers</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>Reception: Dial 0</li>
                            <li>Room Service: Dial 101</li>
                            <li>Spa: Dial 204</li>
                            <li>Emergency: Dial 911</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
