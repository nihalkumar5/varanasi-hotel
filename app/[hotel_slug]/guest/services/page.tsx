"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Send, MessageSquare } from "lucide-react";
import { RequestButton } from "@/components/RequestButton";
import { addSupabaseRequest, useHotelBranding } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { motion, AnimatePresence } from "framer-motion";

function ServiceContent() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { roomNumber } = useGuestRoom();

    const type = searchParams.get("type") || "general";

    const [notes, setNotes] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const serviceTitles: Record<string, string> = {
        laundry: "Laundry Service",
        housekeeping: "Housekeeping",
        reception: "Front Desk",
        general: "General Request"
    };

    const handleSubmit = async () => {
        if (!branding?.id) return;
        setIsLoading(true);
        // Simulate network delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 1500));

        await addSupabaseRequest(branding.id, {
            room: roomNumber,
            type: serviceTitles[type] || serviceTitles.general,
            notes: notes,
            status: "Pending",
            price: 0,
            total: 0
        });

        setIsLoading(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.2 }}
                    className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-100/50"
                >
                    <CheckCircle className="w-12 h-12" />
                </motion.div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Request Sent!</h2>
                <p className="text-slate-500 font-medium mb-8">Our team has been notified and is on their way.</p>
                <button
                    onClick={() => router.push(`/${hotelSlug}/guest/status`)}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 active:scale-95 transition-transform"
                >
                    Track Request
                </button>
            </motion.div>
        );
    }

    return (
        <div className="pb-8">
            <button onClick={() => router.back()} className="mb-8 flex items-center text-slate-400 hover:text-slate-900 font-bold transition-colors group">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-shadow">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                Go Back
            </button>

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10"
            >
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    How can we<br /><span className="text-blue-600" style={{ color: branding?.primaryColor }}>help you?</span>
                </h1>
                <p className="text-slate-400 mt-4 font-bold uppercase tracking-wider text-xs">Service: {serviceTitles[type]}</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50"
            >
                <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mr-4" style={{ backgroundColor: `${branding?.primaryColor}10`, color: branding?.primaryColor }}>
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <label className="text-lg font-bold text-slate-800">Special Instructions</label>
                </div>

                <textarea
                    className="w-full h-40 p-5 bg-slate-50 border-none rounded-2xl mb-8 focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium transition-all placeholder:text-slate-300 resize-none"
                    placeholder="Tell us what you need (e.g., more pillows, foam bath, etc.)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />

                <RequestButton
                    onClick={handleSubmit}
                    loading={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center"
                    style={{ backgroundColor: branding?.primaryColor }}
                >
                    <Send className="w-5 h-5 mr-2" /> Send Request
                </RequestButton>
            </motion.div>
        </div>
    );
}

export default function ServicesPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
            <ServiceContent />
        </Suspense>
    );
}
