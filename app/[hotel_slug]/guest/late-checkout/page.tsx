"use client";

import { useState } from "react";
import {
    Clock,
    ArrowLeft,
    MessageCircle,
    Phone,
    Info,
    CheckCircle2,
    Calendar,
    Star,
    Sparkles
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useHotelBranding } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";

export default function LateCheckoutPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { roomNumber } = useGuestRoom();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    const charges = [
        {
            time: "Until 2:00 PM",
            price: branding?.lateCheckoutCharge1 || "Complimentary",
            note: "Synchronized with next arrival"
        },
        {
            time: "2:00 PM - 6:00 PM",
            price: branding?.lateCheckoutCharge2 || "₹1,500",
            note: "Standard afternoon extension"
        },
        {
            time: "After 6:00 PM",
            price: branding?.lateCheckoutCharge3 || "Full Day Rate",
            note: "Extended residency charge"
        },
    ];

    const handleWhatsApp = () => {
        const phone = branding?.lateCheckoutPhone || branding?.receptionPhone || "";
        if (!phone) return;
        const messageText = `Hi Concierge, I am in Room ${roomNumber || '[Room]'} at ${branding?.name}. I would like to request a stay extension.`;
        const message = encodeURIComponent(messageText);
        window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    };

    const handleCall = () => {
        const phone = branding?.lateCheckoutPhone || branding?.receptionPhone;
        if (phone) {
            window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF9] pb-32 font-sans text-[#1F1F1F]">
            {/* Cinematic Header */}
            <header className="px-6 py-12 flex flex-col items-center">
                <button
                    onClick={() => router.back()}
                    className="w-12 h-12 rounded-2xl bg-white border border-black/[0.03] flex items-center justify-center shadow-sm mb-10 active:scale-95 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#CFA46A] animate-pulse" />
                    <span className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.4em]">Extended Residency</span>
                </div>
                <h1 className="text-4xl font-serif font-black text-center tracking-tight leading-none uppercase">
                    Late Checkout
                </h1>
            </header>

            <motion.main
                variants={container}
                initial="hidden"
                animate="show"
                className="px-6 max-w-lg mx-auto"
            >
                {/* Hero Briefing */}
                <motion.div variants={item} className="mb-16 text-center">
                    <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-black/[0.02] relative">
                        <Clock className="w-10 h-10 text-[#CFA46A]" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#1F1F1F] text-white flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                        Experience our amenities for a few more hours. Transitions are handled with the utmost discretion and care.
                    </p>
                </motion.div>

                {/* Boutique Pricing Tiers */}
                <motion.div variants={item} className="bg-white rounded-[48px] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-black/[0.02] mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 text-[#CFA46A]">
                        <Star className="w-40 h-40" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <Info className="w-5 h-5 text-[#CFA46A]" />
                            <h3 className="text-xl font-serif font-black">Pricing Folio</h3>
                        </div>

                        <div className="space-y-10">
                            {charges.map((charge, idx) => (
                                <div key={idx} className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-[#1F1F1F] uppercase tracking-tight">{charge.time}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{charge.note}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-serif font-black text-[#CFA46A]">{charge.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-black/[0.03] flex items-center gap-4 text-[10px] text-slate-400 font-medium italic">
                            <CheckCircle2 className="w-4 h-4 text-[#CFA46A] shrink-0" />
                            <span>Availability is prioritized for our registered guests.</span>
                        </div>
                    </div>
                </motion.div>

                {/* Communication Layer */}
                <motion.div variants={item} className="space-y-5">
                    <button
                        onClick={handleWhatsApp}
                        className="w-full bg-[#1F1F1F] text-white rounded-[32px] py-6 px-10 flex items-center justify-center gap-4 font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] transition-all"
                    >
                        <MessageCircle className="w-5 h-5 text-[#CFA46A]" />
                        Concierge Chat
                    </button>

                    <button
                        onClick={handleCall}
                        className="w-full bg-white border border-black/[0.05] text-[#1F1F1F] rounded-[32px] py-6 px-10 flex items-center justify-center gap-4 font-black text-[11px] uppercase tracking-[0.3em] active:scale-[0.98] transition-all shadow-sm"
                    >
                        <Phone className="w-5 h-5 text-[#CFA46A]" />
                        Direct Line
                    </button>

                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-10 px-8 leading-relaxed opacity-60">
                        Standard departure is 11:00 AM. Extensions are subject to the operational pulse of the residency.
                    </p>
                </motion.div>
            </motion.main>
        </div>
    );
}
