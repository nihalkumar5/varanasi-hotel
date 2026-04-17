"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Copy, CheckCircle2, Wifi, Compass, Sparkles, QrCode, RefreshCw } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useHotelBranding } from "@/utils/store";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import { SuccessFolio } from "@/components/SuccessFolio";

export default function WifiPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);

    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [folioState, setFolioState] = useState<{ open: boolean, title: string, message: string, actionLabel?: string }>({
        open: false, title: "", message: ""
    });

    const wifiNetwork = branding?.wifiName || (branding?.name ? `${branding.name.replace(/\s+/g, '')}_Guest` : "Hotel_Guest");
    const wifiPassword = branding?.wifiPassword || "RelaxAndUnwind";

    useEffect(() => {
        const generateWifiQR = async () => {
            if (!wifiNetwork) return;
            try {
                const wifiString = `WIFI:S:${wifiNetwork};T:WPA;P:${wifiPassword};;`;
                const url = await QRCode.toDataURL(wifiString, {
                    width: 400,
                    margin: 1,
                    color: {
                        dark: "#1F1F1F",
                        light: "#FFFFFF",
                    },
                });
                setQrDataUrl(url);
            } catch (err) {
                console.error("Failed to generate WiFi QR:", err);
            }
        };
        generateWifiQR();
    }, [wifiNetwork, wifiPassword]);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setFolioState({
            open: true,
            title: "Details Copied",
            message: `The ${label} has been copied to your clipboard successfully.`
        });
    };

    return (
        <div className="pb-40 px-6 pt-12 min-h-screen bg-[#FDFBF9] text-[#1F1F1F]">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-12">
                <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white border border-black/[0.03] flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                    <ArrowLeft className="w-5 h-5 text-[#1F1F1F]" />
                </button>
                <div className="text-center">
                    <h1 className="text-sm font-black text-[#1F1F1F] uppercase tracking-[0.2em]">Access Folio</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Signals</p>
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
                    <span className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.4em]">Digital Connectivity</span>
                </div>
                <h2 className="text-5xl font-serif font-black tracking-tight leading-none uppercase">
                    Connectivity<br />Protocol
                </h2>
            </motion.div>

            {/* Cinematic QR Registry */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[48px] p-10 shadow-[0_30px_80px_rgba(0,0,0,0.04)] border border-black/[0.02] mb-12 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-[#CFA46A]">
                    <Sparkles className="w-40 h-40" />
                </div>

                <div className="text-center mb-12 relative z-10">
                    <div className="inline-flex items-center px-6 py-2 bg-[#FDFBF9] border border-[#E8DCCB]/30 rounded-full mb-10">
                        <QrCode className="w-3.5 h-3.5 text-[#CFA46A] mr-3" />
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#CFA46A]">Touchless Synchronization</span>
                    </div>

                    <div className="flex justify-center mb-10">
                        <div className="p-8 bg-white rounded-[40px] shadow-2xl border border-black/[0.03] ring-1 ring-black/[0.01]">
                            {qrDataUrl ? (
                                <motion.img
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    src={qrDataUrl}
                                    alt="WiFi QR Code"
                                    className="w-56 h-56 rounded-2xl grayscale hover:grayscale-0 transition-all duration-700"
                                />
                            ) : (
                                <div className="w-56 h-56 bg-[#FDFBF9] animate-pulse rounded-2xl flex items-center justify-center">
                                    <Wifi className="w-8 h-8 text-slate-200" />
                                </div>
                            )}
                        </div>
                    </div>

                    <h3 className="text-2xl font-serif font-black text-[#1F1F1F] mb-3">Instant Join</h3>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest px-8 leading-relaxed">
                        Hover your device over the registry below to propagate credentials.
                    </p>
                </div>

                <div className="space-y-6 pt-10 border-t border-black/[0.03]">
                    {/* Network Name */}
                    <div className="flex items-center justify-between p-6 bg-[#FDFBF9] rounded-[32px] border border-black/[0.01] group hover:border-[#CFA46A]/20 transition-all">
                        <div className="flex-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Network Identity</p>
                            <span className="font-serif font-black text-[#1F1F1F] text-lg">
                                {wifiNetwork}
                            </span>
                        </div>
                        <button
                            onClick={() => handleCopy(wifiNetwork, "Network Name")}
                            className="w-14 h-14 rounded-2xl bg-[#1F1F1F] text-white flex items-center justify-center hover:bg-[#CFA46A] transition-colors shadow-lg active:scale-95"
                        >
                            <Copy className="w-5 h-5 text-[#CFA46A]" />
                        </button>
                    </div>

                    {/* Password */}
                    <div className="flex items-center justify-between p-6 bg-[#FDFBF9] rounded-[32px] border border-black/[0.01] group hover:border-[#CFA46A]/20 transition-all">
                        <div className="flex-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Security Key</p>
                            <span className="font-serif font-black italic text-[#1F1F1F] text-lg tracking-tighter">
                                {wifiPassword}
                            </span>
                        </div>
                        <button
                            onClick={() => handleCopy(wifiPassword, "Security Key")}
                            className="w-14 h-14 rounded-2xl bg-[#1F1F1F] text-white flex items-center justify-center hover:bg-[#CFA46A] transition-colors shadow-lg active:scale-95"
                        >
                            <Copy className="w-5 h-5 text-[#CFA46A]" />
                        </button>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-[#F6F3EE] p-8 rounded-[40px] border border-[#E8DCCB]/30 relative overflow-hidden"
            >
                <div className="relative z-10">
                    <div className="flex items-center mb-4">
                        <Compass className="w-4 h-4 text-[#CFA46A] mr-3" />
                        <p className="font-black uppercase tracking-[0.2em] text-[#CFA46A] text-[10px]">Registry Protocol</p>
                    </div>
                    <p className="text-[12px] leading-relaxed text-slate-500 font-medium italic">
                        Credentials are distributed via the <span className="text-[#1F1F1F] font-black">WIFI:S</span> protocol for encrypted, touchless connection. 
                    </p>
                </div>
            </motion.div>

            <SuccessFolio 
                isOpen={folioState.open}
                onClose={() => setFolioState({...folioState, open: false})}
                title={folioState.title}
                message={folioState.message}
            />
        </div>
    );
}
