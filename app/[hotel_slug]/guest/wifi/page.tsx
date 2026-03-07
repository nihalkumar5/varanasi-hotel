"use client";

import React, { useState } from "react";
import { ArrowLeft, Copy, CheckCircle2, Wifi } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useHotelBranding } from "@/utils/store";
import { motion } from "framer-motion";

export default function WifiPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);

    const [copied, setCopied] = useState(false);

    const wifiNetwork = branding?.wifiName || (branding?.name ? `${branding.name.replace(/\s+/g, '')}_Guest` : "Hotel_Guest");
    const wifiPassword = branding?.wifiPassword || "RelaxAndUnwind";

    const handleCopy = () => {
        if (!wifiPassword) return;
        navigator.clipboard.writeText(wifiPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="pb-40 section-padding pt-10">
            <button onClick={() => router.back()} className="mb-10 flex items-center text-slate-400 hover:text-slate-900 font-bold transition-all group">
                <div className="w-10 h-10 rounded-full glass flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-shadow">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                Return to Dashboard
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h1 className="text-4xl font-serif text-slate-900 leading-tight">Digital<br />Connectivity</h1>
                <p className="text-slate-400 mt-4 font-black uppercase tracking-[0.25em] text-[10px]">High-speed internet throughout</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 mb-10"
            >
                <div className="flex items-center mb-10">
                    <div className="p-4 glass rounded-2xl mr-5">
                        <Wifi className="w-6 h-6 text-slate-900" style={{ color: branding?.primaryColor }} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Network Access</p>
                        <p className="text-xl font-serif text-slate-900">{wifiNetwork}</p>
                    </div>
                </div>

                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Security Key</p>
                    <div className="flex items-center justify-between glass p-5 rounded-2xl border border-white">
                        <span className="font-mono text-xl tracking-[0.2em] text-slate-900 overflow-hidden text-ellipsis mr-4">{wifiPassword}</span>
                        <button
                            onClick={handleCopy}
                            className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center transition-all active:scale-90 hover:bg-black shadow-lg"
                        >
                            {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass p-6 rounded-3xl text-[11px] leading-relaxed text-slate-500 font-medium border border-white"
            >
                <p className="mb-2 italic opacity-70">Concierge Note:</p>
                Connect to the network and when prompted, click "Accept Terms" via the portal. If you experience issues, please contact Reception by dialing 0.
            </motion.div>
        </div>
    );
}
