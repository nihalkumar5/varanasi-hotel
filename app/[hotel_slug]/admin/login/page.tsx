"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { signIn, useHotelBranding, getUserProfile, resetPasswordForEmail } from "@/utils/store";
import { Lock, Mail, Loader2, Hotel, ShieldCheck, CheckCircle, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function LoginContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showReset, setShowReset] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    useEffect(() => {
        const errorType = searchParams.get('error');
        if (errorType === 'unauthorized') {
            setError("Access denied. Your account is not authorized for this property.");
        }
    }, [searchParams]);

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!email || !password) {
            setError("Credentials required.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            if (process.env.NEXT_PUBLIC_FORCE_DEMO === 'true') {
                await new Promise(resolve => setTimeout(resolve, 1500));
                let mockRole: 'admin' | 'kitchen' | 'housekeeping' = 'admin';
                if (email.includes('kitchen')) mockRole = 'kitchen';
                else if (email.includes('housekeeping')) mockRole = 'housekeeping';

                let redirectPath = `/${hotelSlug}/admin/dashboard`;
                if (mockRole === 'kitchen') redirectPath = `/${hotelSlug}/admin/kitchen`;
                else if (mockRole === 'housekeeping') redirectPath = `/${hotelSlug}/admin/housekeeping`;

                window.location.href = redirectPath;
                return;
            }

            const { data, error: authError } = await signIn(email, password);
            if (authError) throw authError;

            if (data.user) {
                const { data: profile } = await getUserProfile(data.user.id);
                let redirectPath = `/${hotelSlug}/admin/dashboard`;
                if (profile?.role === 'kitchen') redirectPath = `/${hotelSlug}/admin/kitchen`;
                else if (profile?.role === 'housekeeping') redirectPath = `/${hotelSlug}/admin/housekeeping`;
                window.location.href = redirectPath;
            }
        } catch (err: any) {
            setError(err.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden font-[family-name:var(--font-inter)] selection:bg-[#C6A25A]/30">
            {/* 1️⃣/2️⃣ Background Layer & Dark Overlay */}
            <div 
                className="absolute inset-0 z-0 scale-105"
                style={{ 
                    backgroundImage: "url('/hotel-lobby.jpg')", 
                    backgroundSize: "cover", 
                    backgroundPosition: "center",
                    filter: "brightness(0.8) contrast(1.1)"
                }}
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/70 via-black/55 to-black/75 backdrop-grayscale-[0.2]" />

            <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[380px]"
                >
                    {/* 3️⃣ Glass Card Design */}
                    <div className="bg-white/[0.08] backdrop-blur-[20px] rounded-[28px] border border-white/15 shadow-[0_30px_60px_rgba(0,0,0,0.35)] p-10 overflow-hidden relative">
                        {/* Subtle inner glow */}
                        <div className="absolute -top-[100px] -right-[100px] w-64 h-64 bg-[#C6A25A]/10 blur-[80px] rounded-full pointer-events-none" />

                        <div className="flex flex-col items-center mb-8 relative z-10">
                            {/* 4️⃣ Top Icon (Luxury Style) */}
                            <motion.div
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="w-[70px] h-[70px] bg-gradient-to-b from-[#0a1930] to-[#020617] rounded-full flex items-center justify-center mb-6 shadow-[0_10px_25px_rgba(0,0,0,0.4)] border border-white/10"
                            >
                                <Hotel className="w-8 h-8 text-[#E8D3A8]" />
                            </motion.div>

                            {/* 5️⃣ Typography */}
                            <h1 className="font-[family-name:var(--font-playfair)] text-[32px] leading-tight text-white mb-2 text-center tracking-tight">
                                {branding?.name || "The Grand Royale"}
                            </h1>
                            <p className="font-[family-name:var(--font-inter)] text-[12px] font-black text-white/60 uppercase tracking-[3px] text-center">
                                Management Portal
                            </p>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-2xl text-[11px] font-bold mb-6 text-center"
                            >
                                {error}
                                {error === "Access denied. Your account is not authorized for this property." && (
                                    <div className="mt-2 pt-2 border-t border-red-500/20">
                                        <button 
                                            onClick={() => router.push('/register')}
                                            className="text-white underline hover:text-[#E8D3A8]"
                                        >
                                            Register this hotel property?
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                            {/* 6️⃣ Glass Input Fields */}
                            <div className="space-y-1.5">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-[#C6A25A] transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email Address"
                                        className="w-full bg-white/[0.08] backdrop-blur-[10px] border border-white/15 rounded-[14px] h-[52px] pl-12 pr-4 font-[family-name:var(--font-inter)] font-medium text-white placeholder:text-white/30 outline-none focus:border-[#C6A25A] focus:ring-4 focus:ring-[#C6A25A]/20 transition-all text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-[#C6A25A] transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Secure Password"
                                        className="w-full bg-white/[0.08] backdrop-blur-[10px] border border-white/15 rounded-[14px] h-[52px] pl-12 pr-4 font-[family-name:var(--font-inter)] font-medium text-white placeholder:text-white/30 outline-none focus:border-[#C6A25A] focus:ring-4 focus:ring-[#C6A25A]/20 transition-all text-sm"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end pr-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowReset(true)}
                                        className="text-[10px] font-[family-name:var(--font-inter)] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Forgot?
                                    </button>
                                </div>
                            </div>

                            {/* 7️⃣ Premium Button */}
                            <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-br from-[#C6A25A] to-[#9B7A3A] text-white font-[family-name:var(--font-inter)] font-bold text-[13px] uppercase tracking-[2px] h-[52px] rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate"}
                            </motion.button>
                        </form>

                        {/* 8️⃣ Footer Trust Text */}
                        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center space-y-2 opacity-60">
                            <div className="flex items-center space-x-2 text-white">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-black uppercase tracking-[2px]">Verified Identity</span>
                            </div>
                            <span className="text-[9px] font-bold text-white uppercase tracking-[1px] text-center">Secure Staff Access</span>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showReset && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mt-6 flex flex-col items-center"
                            >
                                <button
                                    onClick={() => setShowReset(false)}
                                    className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all underline underline-offset-4"
                                >
                                    Cancel & Return
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white w-10 h-10" /></div>}>
            <LoginContent />
        </Suspense>
    );
}
