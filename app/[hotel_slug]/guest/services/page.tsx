"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Send, MessageSquare, Search } from "lucide-react";
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
            <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#d6d7db_0%,_#b9bcc3_55%,_#aeb1b8_100%)] px-8 py-20 text-center font-sans text-[#1F1F1F]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.05)_45%,rgba(255,145,58,0.08)_100%)]" />
                <div className="relative mx-auto flex min-h-[75vh] max-w-[520px] flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] border border-[#ffb26b]/50 bg-[linear-gradient(145deg,rgba(255,180,110,0.35),rgba(255,132,41,0.2))] text-[#8f4e12] shadow-[0_18px_35px_rgba(98,66,38,0.22)] backdrop-blur-[14px]"
                >
                    <CheckCircle className="w-12 h-12" />
                </motion.div>
                <h2 className="mb-4 font-serif text-3xl font-medium text-[#1f1f1f]">Request Received</h2>
                <p className="mb-12 max-w-[300px] text-sm font-medium leading-relaxed text-slate-700">Our dedicated concierge team has been notified and is attending to your request.</p>
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push(`/${hotelSlug}/guest/status`)}
                    className="w-full max-w-[320px] rounded-full border border-[#ffbe87]/50 bg-[linear-gradient(145deg,rgba(255,170,96,0.9),rgba(245,133,40,0.88))] py-5 font-sans text-[10px] font-black uppercase tracking-widest text-white shadow-[0_16px_30px_rgba(109,66,20,0.3)] transition-all"
                >
                    Track Progress
                </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#d6d7db_0%,_#b9bcc3_55%,_#aeb1b8_100%)] pb-32 pt-12 font-sans text-[#1F1F1F]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.05)_45%,rgba(255,145,58,0.08)_100%)]" />
            <div className="relative">
            {/* 1. Branded Header */}
            <header className="px-6 mb-12 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <motion.button 
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.back()}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ffbe87]/50 bg-[linear-gradient(150deg,rgba(255,180,110,0.45),rgba(255,138,50,0.34))] shadow-[0_12px_25px_rgba(96,64,30,0.25)] backdrop-blur-[10px]"
                    >
                        <ArrowLeft className="h-6 w-6 text-[#543115]" />
                    </motion.button>
                    <div>
                        <p className="mb-1.5 text-[10px] font-black uppercase leading-none tracking-[0.3em] text-[#4d4f56]/70">{branding?.name || "Hotel"}</p>
                        <h1 className="text-base font-serif font-bold uppercase leading-none tracking-tight text-[#1f1f1f]">
                            Digital Concierge
                        </h1>
                    </div>
                </div>
                <motion.button 
                    whileTap={{ scale: 0.97 }}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/45 bg-white/35 text-[#5a5d65] shadow-[0_8px_22px_rgba(84,87,94,0.2)] backdrop-blur-[10px]"
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
                <p className="mb-2 text-sm font-medium text-[#4f535b]">Suite Experience</p>
                <h2 className="text-[32px] font-serif font-medium leading-[1.1] tracking-tight text-[#16181d]">
                    How can we<br />care for you?
                </h2>
                <div className="mt-6 flex items-center space-x-3">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f18f33]"></span>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8f4e12]">
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
                <div className="relative overflow-hidden rounded-[32px] border border-[#ffc896]/45 bg-[linear-gradient(145deg,rgba(255,200,146,0.35),rgba(255,156,71,0.21))] p-8 shadow-[0_20px_45px_rgba(76,59,45,0.18)] backdrop-blur-[18px]">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/18 blur-2xl" />
                    <div className="flex items-center mb-8">
                        <div className="mr-5 flex h-11 w-11 items-center justify-center rounded-full border border-[#ffbe87]/50 bg-white/45 shadow-[0_10px_20px_rgba(106,73,40,0.2)] backdrop-blur-[10px]">
                            <MessageSquare className="h-5 w-5 text-[#8f4e12]" />
                        </div>
                        <label className="text-lg font-serif font-medium text-[#1f1f1f]">Special Instructions</label>
                    </div>

                    <textarea
                        className="mb-10 h-48 w-full resize-none rounded-[24px] border border-[#ffd4ae]/70 bg-white/45 p-8 text-sm font-medium leading-relaxed text-slate-900 outline-none transition-all placeholder:text-slate-500/60 focus:border-[#f18f33] focus:ring-0"
                        placeholder="Tell us what you need (e.g., more pillows, foam bath, etc.)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />

                    <RequestButton
                        onClick={handleSubmit}
                        loading={isLoading}
                        className="flex w-full items-center justify-center rounded-full border-none bg-[linear-gradient(145deg,rgba(255,168,93,0.92),rgba(244,130,39,0.9))] py-6 font-sans text-[10px] font-black uppercase tracking-widest text-white shadow-[0_16px_30px_rgba(109,66,20,0.28)] transition-all hover:brightness-105"
                    >
                        <Send className="w-4 h-4 mr-3" /> Send Service Request
                    </RequestButton>
                </div>
            </motion.div>
            </div>
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
