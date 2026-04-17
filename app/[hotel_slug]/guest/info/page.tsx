"use client";

import React from "react";
import { ArrowLeft, MapPin, Clock, Phone, Info, Globe, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useHotelBranding } from "@/utils/store";

export default function InfoPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);

    return (
        <div className="pb-40 px-6 pt-12 min-h-screen bg-[#FDFBF9] text-[#1F1F1F]">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-12">
                <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white border border-black/[0.03] flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                    <ArrowLeft className="w-5 h-5 text-[#1F1F1F]" />
                </button>
                <div className="text-center">
                    <h1 className="text-sm font-black text-[#1F1F1F] uppercase tracking-[0.2em]">Property Folio</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Overview</p>
                </div>
                <div className="w-12" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16 text-center"
            >
                <div className="flex items-center justify-center space-x-3 mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#CFA46A] animate-pulse" />
                    <span className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.4em]">Property Briefing</span>
                </div>
                <h2 className="text-5xl font-serif font-black tracking-tight leading-none uppercase">
                    Property<br />Information
                </h2>
            </motion.div>

            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-8 rounded-[48px] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-black/[0.02] flex items-start group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-[#FDFBF9] flex items-center justify-center text-[#CFA46A] mr-6 shadow-sm border border-black/[0.01]">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-serif text-2xl font-black text-[#1F1F1F] mb-3">Check-in / Out</h3>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                             Arrival <span className="text-[#1F1F1F]">3:00 PM</span>
                        </p>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            Departure <span className="text-[#1F1F1F]">11:00 AM</span>
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-8 rounded-[48px] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-black/[0.02] flex items-start"
                >
                    <div className="w-14 h-14 rounded-2xl bg-[#FDFBF9] flex items-center justify-center text-[#CFA46A] mr-6 shadow-sm border border-black/[0.01]">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-serif text-2xl font-black text-[#1F1F1F] mb-3">Logistics</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                            {branding?.city || "Our Boutique Property"}
                        </p>
                        <div className="mt-4 flex items-center gap-2 px-4 py-1.5 bg-[#F6F3EE] rounded-full w-fit">
                            <Compass className="w-3 h-3 text-[#CFA46A]" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Shuttle synchronized</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#1F1F1F] p-8 rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-white/5 flex flex-col"
                >
                    <div className="flex items-start mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#CFA46A] mr-6 border border-white/5">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-serif text-2xl font-black text-white mb-2">Priority Signals</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Internal Registry</p>
                        </div>
                    </div>
                    
                    <ul className="space-y-4">
                        {[
                            { label: "Reception", value: "Dial 0" },
                            { label: "Dining Folio", value: "Dial 101" },
                            { label: "Wellness", value: "Dial 204" },
                            { label: "Emergency", value: "Dial 911" }
                        ].map((item, i) => (
                            <li key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                                <span className="font-serif font-black text-white italic">{item.value}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </div>
        </div>
    );
}
