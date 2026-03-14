"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Send, MessageSquare, Home, Utensils, Layout, User, Search } from "lucide-react";
import { RequestButton } from "@/components/RequestButton";
import { addSupabaseRequest, useHotelBranding, useSupabaseRequests } from "@/utils/store";
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
        maintenance: "Maintenance Support",
        late_checkout: "Late Checkout Request",
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
            <div className="min-h-screen noise-bg flex flex-col items-center justify-center py-20 text-center px-10 max-w-[520px] mx-auto font-sans text-[#1F1F1F]">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="w-24 h-24 bg-[#4E8F7A]/10 text-[#4E8F7A] rounded-full flex items-center justify-center shadow-xl shadow-[#4E8F7A]/5 mb-8 border border-[#4E8F7A]/10"
                >
                    <CheckCircle className="w-12 h-12" />
                </motion.div>
                <h2 className="text-3xl font-serif font-medium text-slate-900 mb-4">Request Received</h2>
                <p className="text-slate-500 text-sm font-medium mb-12 max-w-[280px] leading-relaxed">Our dedicated concierge team has been notified and is attending to your request.</p>
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push(`/${hotelSlug}/guest/status`)}
                    className="w-full max-w-[320px] bg-[#4E8F7A] text-white py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#4E8F7A]/20 transition-all font-sans"
                >
                    Track Progress
                </motion.button>
            </div>
        );
    }

    return (
        <div className="pb-32 pt-12 min-h-screen noise-bg max-w-[520px] mx-auto overflow-x-hidden font-sans text-[#1F1F1F]">
            {/* 1. Branded Header */}
            <header className="px-6 mb-12 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <motion.button 
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.back()}
                        className="w-12 h-12 bg-[#4E8F7A] rounded-full flex items-center justify-center shadow-lg shadow-[#4E8F7A]/20"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </motion.button>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4E8F7A]/60 leading-none mb-1.5">Marriott</p>
                        <h1 className="text-base font-serif font-bold tracking-tight leading-none uppercase">
                            Digital Concierge
                        </h1>
                    </div>
                </div>
                <motion.button 
                    whileTap={{ scale: 0.97 }}
                    className="w-11 h-11 rounded-full bg-white shadow-sm border border-slate-100/50 flex items-center justify-center text-slate-400"
                >
                    <Search className="w-5 h-5" strokeWidth={1.5} />
                </motion.button>
            </header>

            {/* 2. Service Headline */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 mb-12"
            >
                <p className="text-sm font-medium text-slate-400 mb-2">Suite Experience</p>
                <h2 className="text-[32px] font-serif leading-[1.1] font-medium tracking-tight">
                    How can we<br />care for you?
                </h2>
                <div className="mt-6 flex items-center space-x-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4E8F7A] animate-pulse"></span>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4E8F7A]">
                        Service: {serviceTitles[type]}
                    </p>
                </div>
            </motion.div>

            {/* 3. Request Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="px-6 mb-16"
            >
                <div className="bg-white p-8 rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-[#F3EDE4]/50 relative overflow-hidden">
                    <div className="flex items-center mb-8">
                        <div className="w-11 h-11 bg-[#1F1F1F] rounded-full mr-5 flex items-center justify-center shadow-lg">
                            <MessageSquare className="w-5 h-5 text-[#4E8F7A]" />
                        </div>
                        <label className="text-lg font-serif font-medium text-slate-900">Special Instructions</label>
                    </div>

                    <textarea
                        className="w-full h-48 p-8 bg-[#F3EDE4]/30 border border-[#F3EDE4] rounded-[24px] mb-10 focus:ring-0 focus:border-[#4E8F7A] text-slate-900 font-medium transition-all placeholder:text-slate-300 resize-none outline-none text-sm leading-relaxed"
                        placeholder="Tell us what you need (e.g., more pillows, foam bath, etc.)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />

                    <RequestButton
                        onClick={handleSubmit}
                        loading={isLoading}
                        className="w-full bg-[#4E8F7A] hover:bg-[#3D705F] text-white py-6 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#4E8F7A]/20 transition-all flex items-center justify-center border-none font-sans"
                    >
                        <Send className="w-4 h-4 mr-3" /> Send Service Request
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
