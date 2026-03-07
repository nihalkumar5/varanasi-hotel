"use client";

import React, { useEffect, useRef } from "react";
import { ArrowLeft, Clock, CheckCircle2, Loader2, Sparkles, RefreshCcw } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge, RequestStatus } from "@/components/StatusBadge";
import { useSupabaseRequests, useHotelBranding } from "@/utils/store";
import { playGuestNotification, playSuccessNotification, initAudioContext } from "@/utils/audio";
import { motion, AnimatePresence } from "framer-motion";

export default function StatusPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const requests = useSupabaseRequests(branding?.id);
    const prevRequestsRef = useRef(requests);

    useEffect(() => {
        if (!prevRequestsRef.current || prevRequestsRef.current.length === 0) {
            prevRequestsRef.current = requests;
            return;
        }

        const prev = prevRequestsRef.current;
        let shouldPlayRoutine = false;
        let shouldPlaySuccess = false;

        requests.forEach(currentReq => {
            const prevReq = prev.find(r => r.id === currentReq.id);
            if (prevReq && prevReq.status !== currentReq.status) {
                console.log(`Status change detected for ${currentReq.id}: ${prevReq.status} -> ${currentReq.status}`);
                if (currentReq.status === "Completed") {
                    shouldPlaySuccess = true;
                } else {
                    shouldPlayRoutine = true;
                }
            }
        });

        if (shouldPlaySuccess) {
            console.log("Triggering success notification sound");
            playSuccessNotification();
        } else if (shouldPlayRoutine) {
            console.log("Triggering routine notification sound");
            playGuestNotification();
        }

        prevRequestsRef.current = requests;
    }, [requests]);

    const activeRequests = requests.filter((r) => r.status !== "Completed");
    const pastRequests = requests.filter((r) => r.status === "Completed");

    return (
        <div className="pb-40 section-padding pt-10">
            <div className="flex items-center justify-between mb-10">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full glass flex items-center justify-center shadow-sm active:scale-90 transition-transform">
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                </button>
                <h1 className="text-2xl font-serif text-slate-900">Live Status</h1>
                <div className="w-10"></div>
            </div>

            <div className="mb-14">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Active Requests</h2>
                    {activeRequests.length > 0 && (
                        <span className="flex items-center text-[9px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-xl uppercase tracking-wider border border-amber-100">
                            <RefreshCcw className="w-3 h-3 mr-1.5 animate-spin" /> Concierge Monitoring
                        </span>
                    )}
                </div>

                {activeRequests.length > 0 ? (
                    <div className="space-y-6">
                        {activeRequests.map((req) => (
                            <motion.div
                                key={req.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 relative overflow-hidden group"
                            >
                                {/* Luxury Progress Indicator */}
                                {req.status === "Pending" && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-50">
                                        <motion.div
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                            className="w-1/3 h-full bg-amber-400"
                                        />
                                    </div>
                                )}
                                {req.status === "In Progress" && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-50">
                                        <motion.div
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                            className="w-1/2 h-full bg-blue-500"
                                        />
                                    </div>
                                )}

                                <div className="flex items-start justify-between">
                                    <div className="flex-1 pr-6">
                                        <h3 className="font-serif text-xl text-slate-900 mb-2">{req.type}</h3>
                                        <div className="flex items-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                                            <Clock className="w-3 h-3 mr-1.5" />
                                            {req.time} <span className="mx-2 opacity-20">•</span> Room {req.room}
                                        </div>
                                    </div>
                                    <StatusBadge status={req.status as any} />
                                </div>
                                {req.notes && (
                                    <div className="mt-6 pt-6 border-t border-slate-50">
                                        <p className="text-sm text-slate-500 font-medium italic opacity-70 leading-relaxed">
                                            "{req.notes}"
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass border-2 border-dashed border-slate-100 rounded-[3rem] py-24 text-center"
                    >
                        <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-6 opacity-50" />
                        <p className="text-slate-400 font-serif text-lg">No active signals at the moment.</p>
                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mt-2">All requests fulfilled</p>
                    </motion.div>
                )}
            </div>

            <div>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-8">Arrival & Fulfilment</h2>
                <div className="space-y-4">
                    {pastRequests.map((req) => (
                        <div key={req.id} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between opacity-60 group hover:opacity-100 transition-all duration-500">
                            <div className="flex items-center">
                                <div className="w-12 h-12 rounded-2xl glass text-emerald-600 flex items-center justify-center mr-5 shadow-sm">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg text-slate-900">{req.type}</h3>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] mt-1">{req.time}</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Completed</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
