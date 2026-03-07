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
                className="flex flex-col items-center justify-center py-20 text-center px-6"
            >
                <div className="relative mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, delay: 0.2 }}
                        className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/10 border border-emerald-100"
                    >
                        <CheckCircle className="w-12 h-12" />
                    </motion.div>
                </div>
                <h2 className="text-3xl font-serif italic text-slate-900 mb-3">Request Received</h2>
                <p className="text-slate-500 font-medium mb-10 max-w-[280px]">Our dedicated concierge team has been notified and is attending to your request.</p>
                <button
                    onClick={() => router.push(`/${hotelSlug}/guest/status`)}
                    className="w-full max-w-[300px] bg-slate-900 text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-slate-200 active:scale-95 transition-all"
                >
                    Track Progress
                </button>
            </motion.div>
        );
    }

    return (
        <div className="pb-32 px-5 pt-10 min-h-screen bg-slate-50/50 text-slate-900 max-w-[520px] mx-auto">
            <button onClick={() => router.back()} className="mb-10 flex items-center text-slate-400 hover:text-slate-600 font-bold transition-all group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-all border border-slate-100">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Back to Dashboard</span>
            </button>

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10"
            >
                <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-[1px] bg-amber-500/50"></div>
                    <p className="text-amber-600 font-black uppercase tracking-[0.25em] text-[10px]">Digital Concierge</p>
                </div>
                <h1 className="text-4xl font-serif text-slate-900 tracking-tight leading-tight italic">
                    How can we<br /><span className="text-amber-600">care for you?</span>
                </h1>
                <p className="text-slate-400 mt-4 font-black uppercase tracking-[0.25em] text-[10px] flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-2"></span>
                    Service: {serviceTitles[type]}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden"
            >
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
                    <MessageSquare className="w-32 h-32 text-slate-900" />
                </div>

                <div className="flex items-center mb-6 relative z-10">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl mr-4 flex items-center justify-center shadow-lg border border-slate-800">
                        <MessageSquare className="w-5 h-5 text-amber-500" />
                    </div>
                    <label className="text-lg font-serif italic text-slate-900">Special Instructions</label>
                </div>

                <div className="relative z-10">
                    <textarea
                        className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] mb-8 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/30 text-slate-900 font-medium transition-all placeholder:text-slate-300 resize-none outline-none"
                        placeholder="Tell us what you need (e.g., more pillows, foam bath, etc.)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />

                    <RequestButton
                        onClick={handleSubmit}
                        loading={isLoading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center border-none"
                    >
                        <Send className="w-4 h-4 mr-3 text-amber-500" /> Send Service Request
                    </RequestButton>
                </div>
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
