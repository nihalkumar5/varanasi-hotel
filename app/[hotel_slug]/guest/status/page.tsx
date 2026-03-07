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
        <div className="pb-32">
            <div className="flex items-center justify-between mb-10">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                </button>
                <h1 className="text-xl font-black text-slate-900">Live Status</h1>
                <div className="w-10"></div>
            </div>

            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Monitoring</h2>
                    {activeRequests.length > 0 && (
                        <span className="flex items-center text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider" style={{ color: branding?.primaryColor, backgroundColor: `${branding?.primaryColor}10` }}>
                            <RefreshCcw className="w-3 h-3 mr-1 animate-spin" /> Live Updates
                        </span>
                    )}
                </div>

                {activeRequests.length > 0 ? (
                    <div className="space-y-4">
                        {activeRequests.map((req) => (
                            <motion.div
                                key={req.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-6 rounded-[2rem] shadow-[0_15px_35px_rgba(0,0,0,0.03)] border border-slate-50 relative overflow-hidden group"
                            >
                                {/* Animated Progress Pulse */}
                                {req.status === "Pending" && <div className="absolute top-0 left-0 w-full h-1 bg-amber-400/20"><motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1/3 h-full bg-amber-400"></motion.div></div>}
                                {req.status === "In Progress" && <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/20" style={{ backgroundColor: `${branding?.primaryColor}20` }}><motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1/2 h-full bg-blue-400" style={{ backgroundColor: branding?.primaryColor }}></motion.div></div>}

                                <div className="flex items-center justify-between">
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center mb-1">
                                            <h3 className="font-bold text-slate-900 leading-tight">{req.type}</h3>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{req.time} • Room {req.room}</p>
                                    </div>
                                    <StatusBadge status={req.status} />
                                </div>
                                {req.notes && (
                                    <div className="mt-4 pt-4 border-t border-slate-50">
                                        <p className="text-xs text-slate-500 font-medium italic line-clamp-2">"{req.notes}"</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2.5rem] py-20 text-center"
                    >
                        <Sparkles className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">Nothing active right now.</p>
                    </motion.div>
                )}
            </div>

            <div>
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Completed Tasks</h2>
                <div className="space-y-3">
                    {pastRequests.map((req) => (
                        <div key={req.id} className="bg-white/60 p-5 rounded-2xl border border-slate-100 flex items-center justify-between opacity-80 group hover:opacity-100 transition-opacity">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mr-4">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">{req.type}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{req.time}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase">Archived</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
