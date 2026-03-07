"use client";

import React, { useState } from "react";
import { ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useHotelBranding } from "@/utils/store";

export default function WifiPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);

    const [copied, setCopied] = useState(false);

    const wifiNetwork = branding?.name ? `${branding.name.replace(/\s+/g, '')}_Guest` : "Hotel_Guest";
    const wifiPassword = "RelaxAndUnwind";

    const handleCopy = () => {
        navigator.clipboard.writeText(wifiPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="pb-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={() => router.back()} className="mb-6 flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-1" /> Back
            </button>

            <h1 className="text-3xl font-bold mb-2">Complimentary Wi-Fi</h1>
            <p className="text-gray-500 mb-8">Enjoy high-speed internet throughout the property.</p>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Network Name (SSID)</p>
                    <p className="text-xl font-bold text-gray-900">{wifiNetwork}</p>
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Password</p>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <span className="font-mono text-lg tracking-wider text-gray-800">{wifiPassword}</span>
                        <button
                            onClick={handleCopy}
                            className="flex items-center justify-center p-2 rounded-lg transition-colors"
                            style={{ color: branding?.primaryColor || "#3b82f6" }}
                        >
                            {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed" style={{ backgroundColor: `${branding?.primaryColor}10`, color: branding?.primaryColor }}>
                Connect to the network and when prompted, click "Accept Terms" via the portal. If you experience issues, please contact Reception.
            </div>
        </div>
    );
}
