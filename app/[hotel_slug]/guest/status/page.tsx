"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Phone,
    Sparkle,
    Sparkles,
    Clock,
    User,
    MapPin,
    ConciergeBell
} from "lucide-react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
    useHotelBranding,
    useSupabaseRequests,
} from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { playGuestNotification, playSuccessNotification } from "@/utils/audio";
import type { HotelRequest, RequestStatus } from "@/lib/hotel/types";

type TimelineStep = {
    key: string;
    label: string;
    active: boolean;
};

type StaffFallback = {
    team: string;
    role: string;
    eta: string;
};

const LIVE_STATUSES: RequestStatus[] = ["Pending", "Assigned", "In Progress"];

const getStaffFallback = (type: string): StaffFallback => {
    const normalized = type.toLowerCase();
    if (normalized.includes("reception") || normalized.includes("support")) {
        return { team: "Front Desk Team", role: "Front Desk Manager", eta: "2 min" };
    }
    if (normalized.includes("clean")) {
        return { team: "Housekeeping Team", role: "Floor Attendant", eta: "5 min" };
    }
    if (normalized.includes("laundry")) {
        return { team: "Laundry Desk", role: "Laundry Associate", eta: "8 min" };
    }
    if (normalized.includes("dining") || normalized.includes("room service")) {
        return { team: "Kitchen Team", role: "Room Service Captain", eta: "12 min" };
    }
    return { team: "Hotel Staff", role: "Service Associate", eta: "5 min" };
};

const getTimelineSteps = (status: RequestStatus): TimelineStep[] => {
    const statusRank = { Pending: 1, Assigned: 2, "In Progress": 3, Completed: 4, Rejected: 0 } satisfies Record<RequestStatus, number>;
    if (status === "Rejected") {
        return [
            { key: "received", label: "Request Received", active: true },
            { key: "assigned", label: "Staff Assigned", active: false },
            { key: "cancelled", label: "Request Cancelled", active: true },
            { key: "completed", label: "Completed", active: false },
        ];
    }
    return [
        { key: "received", label: "Request Received", active: statusRank[status] >= 1 },
        { key: "assigned", label: "Staff Assigned", active: statusRank[status] >= 2 },
        { key: "ontheway", label: "Staff On The Way", active: statusRank[status] >= 3 },
        { key: "completed", label: "Delivered", active: statusRank[status] >= 4 },
    ];
};

const getTrackerProgress = (status: RequestStatus) => {
    switch (status) {
        case "Pending": return "18%";
        case "Assigned": return "42%";
        case "In Progress": return "72%";
        case "Completed": return "100%";
        default: return "18%";
    }
};

const getStatusTone = (status: RequestStatus) => {
    switch (status) {
        case "Pending": return "bg-[#F7F1E5] text-[#B98945]";
        case "Assigned": return "bg-[#EEF4FF] text-[#5676B8]";
        case "In Progress": return "bg-[#FDECEC] text-[#E5484D]";
        case "Completed": return "bg-[#ECF9F1] text-[#1C8B57]";
        case "Rejected": return "bg-[#F7F1F1] text-[#A04444]";
    }
};

const getCompletionMessage = (hotelName?: string) => {
    const name = hotelName?.trim() || "your hotel";
    return {
        heading: "All Set",
        body: "Your room requests have been completed.",
        closing: "Enjoy your stay at",
        hotel: name,
    };
};

export default function StatusPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { roomNumber, checkedInAt } = useGuestRoom();
    const { branding } = useHotelBranding(hotelSlug);
    const requests = useSupabaseRequests(branding?.id, roomNumber, checkedInAt);
    const prevRequestsRef = useRef(requests);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

    useEffect(() => {
        if (!prevRequestsRef.current || prevRequestsRef.current.length === 0) {
            prevRequestsRef.current = requests;
            return;
        }
        const prev = prevRequestsRef.current;
        let shouldPlayRoutine = false;
        let shouldPlaySuccess = false;

        requests.forEach((currentReq) => {
            const prevReq = prev.find((request) => request.id === currentReq.id);
            if (prevReq && prevReq.status !== currentReq.status) {
                if (currentReq.status === "Completed") shouldPlaySuccess = true;
                else shouldPlayRoutine = true;
            }
        });
        if (shouldPlaySuccess) playSuccessNotification();
        else if (shouldPlayRoutine) playGuestNotification();
        prevRequestsRef.current = requests;
    }, [requests]);

    const sortedActiveRequests = requests
        .filter((request) => LIVE_STATUSES.includes(request.status))
        .sort((left, right) => right.timestamp - left.timestamp);

    const completedRequests = requests
        .filter((request) => request.status === "Completed")
        .sort((left, right) => right.timestamp - left.timestamp);

    const latestActiveRequest = sortedActiveRequests[0] ?? null;

    useEffect(() => {
        if (!latestActiveRequest) {
            setSelectedRequestId(null);
            return;
        }
        if (!selectedRequestId || !sortedActiveRequests.some((request) => request.id === selectedRequestId)) {
            setSelectedRequestId(latestActiveRequest.id);
        }
    }, [latestActiveRequest, selectedRequestId, sortedActiveRequests]);

    const primaryRequest =
        sortedActiveRequests.find((request) => request.id === selectedRequestId) ??
        latestActiveRequest;

    const secondaryRequests = sortedActiveRequests.filter((request) => request.id !== primaryRequest?.id);
    const supportPhone = branding?.receptionPhone?.trim();
    const completionMessage = getCompletionMessage(branding?.name);

    const renderTimeline = (request: HotelRequest) => {
        const steps = getTimelineSteps(request.status);
        return (
            <div className="space-y-6">
                {steps.map((step, index) => {
                    const isLast = index === steps.length - 1;
                    return (
                        <div key={step.key} className="flex items-start gap-5">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`h-4 w-4 rounded-full border-2 ${
                                        step.active
                                            ? "border-[#CFA46A] bg-[#CFA46A]"
                                            : "border-black/[0.05] bg-white"
                                    }`}
                                />
                                {!isLast && (
                                    <div
                                        className={`mt-2 h-10 w-px ${
                                            step.active && steps[index + 1]?.active
                                                ? "bg-[#CFA46A]"
                                                : "bg-black/[0.05]"
                                        }`}
                                    />
                                )}
                            </div>
                            <div>
                                <p className={`text-[11px] font-black uppercase tracking-widest ${step.active ? 'text-[#1F1F1F]' : 'text-slate-300'}`}>
                                    {step.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderTrackingHero = (request: HotelRequest) => {
        const staff = getStaffFallback(request.type);
        const isLive = LIVE_STATUSES.includes(request.status);
        const trackerProgress = getTrackerProgress(request.status);

        return (
            <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[48px] p-10 shadow-[0_30px_80px_rgba(0,0,0,0.05)] border border-black/[0.02] relative overflow-hidden group mb-10"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-[#CFA46A] scale-150">
                    <Sparkles className="w-40 h-40" />
                </div>

                <div className="flex items-start justify-between gap-4 relative z-10">
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#CFA46A] animate-pulse" />
                            <span className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.4em]">Propagating Signals</span>
                        </div>
                        <h2 className="font-serif text-4xl font-black leading-none text-[#1F1F1F] uppercase">
                            {request.type}
                        </h2>
                    </div>
                    {isLive && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#1F1F1F] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#CFA46A] animate-pulse" />
                            Live Signal
                        </span>
                    )}
                </div>

                <div className="mt-10 flex gap-12 p-8 bg-[#FDFBF9] rounded-[32px] border border-black/[0.01]">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Entry Time</p>
                        <p className="text-lg font-serif font-black text-[#1F1F1F] italic">{request.time}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Residency</p>
                        <p className="text-lg font-serif font-black text-[#1F1F1F] italic">Room {request.room}</p>
                    </div>
                </div>

                {request.notes && (
                    <div className="mt-6 p-6 bg-[#FDFBF9] rounded-[24px] border border-black/[0.01]">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Request Fragment</p>
                        <p className="text-[13px] leading-relaxed text-slate-500 font-medium italic">"{request.notes}"</p>
                    </div>
                )}

                <div className="mt-8 p-8 bg-[#1F1F1F] rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#CFA46A]/20 to-transparent opacity-30" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Service Associate</p>
                                <p className="text-xl font-serif font-black text-white">{staff.team}</p>
                                <p className="text-[11px] text-[#CFA46A] font-bold uppercase tracking-widest mt-1">{staff.role}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">ETA</p>
                                <p className="text-sm font-black text-[#CFA46A]">{staff.eta}</p>
                            </div>
                        </div>

                        <div className="mt-12 relative px-2">
                            {/* High Fidelity SVG Tracker */}
                            <svg className="w-full h-8 overflow-visible">
                                {/* Track Path */}
                                <line 
                                    x1="0%" y1="50%" x2="100%" y2="50%" 
                                    className="stroke-white/10 stroke-[2px] stroke-linecap-round"
                                />
                                {/* Progress Gradient Path */}
                                <motion.line 
                                    x1="0%" y1="50%" x2={trackerProgress} y2="50%" 
                                    className="stroke-[#CFA46A] stroke-[2px] stroke-linecap-round shadow-[0_0_15px_rgba(207,164,106,0.5)]"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                                
                                {/* Orbital Node Glow */}
                                <motion.g
                                    animate={{ x: trackerProgress }}
                                    style={{ x: trackerProgress }}
                                    className="relative"
                                >
                                    <circle r="12" cy="50%" className="fill-[#CFA46A]/20 animate-service-pulse" />
                                    <circle r="6" cy="50%" className="fill-[#CFA46A] shadow-[0_0_20px_#CFA46A]" />
                                    
                                    {/* Orbital Ring */}
                                    <circle r="16" cy="50%" className="fill-none stroke-[#CFA46A]/10 stroke-[1px] animate-orbital-glow" />
                                </motion.g>
                            </svg>

                            <div className="flex justify-between mt-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 font-sans">
                                <span className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-[#CFA46A] rounded-full" />
                                    Deployment
                                </span>
                                <span className="flex items-center gap-2">
                                    Arrival
                                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <div className="flex items-center gap-3 mb-8">
                        <Clock className="w-4 h-4 text-[#CFA46A]" />
                        <h3 className="text-sm font-black text-[#1F1F1F] uppercase tracking-[0.2em]">Service Timeline</h3>
                    </div>
                    <div className="px-2">{renderTimeline(request)}</div>
                </div>

                <div className="mt-12 pt-10 border-t border-black/[0.03]">
                    {supportPhone && (
                        <a
                            href={`tel:${supportPhone}`}
                            className="flex items-center justify-center gap-4 bg-white border border-black/[0.05] rounded-[24px] py-5 px-8 text-[11px] font-black uppercase tracking-[0.3em] text-[#1F1F1F] active:scale-95 transition-transform"
                        >
                            <Phone className="h-4 w-4 text-[#CFA46A]" />
                            Concierge Line
                        </a>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-[#FDFBF9] px-6 pb-40 pt-12 text-[#1F1F1F]">
            {/* Header Folio */}
            <div className="flex items-center justify-between mb-12">
                <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white border border-black/[0.03] flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                    <ArrowLeft className="w-5 h-5 text-[#1F1F1F]" />
                </button>
                <div className="text-center">
                    <h1 className="text-sm font-black text-[#1F1F1F] uppercase tracking-[0.2em]">Service Stream</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live Telemetry</p>
                </div>
                <div className="w-12" />
            </div>

            {primaryRequest ? (
                <div className="max-w-xl mx-auto">
                    {renderTrackingHero(primaryRequest)}

                    {secondaryRequests.length > 0 && (
                        <div className="mt-16">
                            <div className="flex items-center gap-3 mb-8">
                                <ConciergeBell className="w-4 h-4 text-[#CFA46A]" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Concurrent Requests</h3>
                            </div>
                            <div className="space-y-4">
                                {secondaryRequests.map((request) => (
                                    <button
                                        key={request.id}
                                        onClick={() => setSelectedRequestId(request.id)}
                                        className="flex w-full items-center justify-between bg-white rounded-[32px] p-8 border border-black/[0.01] shadow-sm text-left hover:border-[#CFA46A]/20 transition-all"
                                    >
                                        <div>
                                            <p className="font-serif font-black text-xl text-[#1F1F1F] italic">{request.type}</p>
                                            <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                {request.room} · {request.time}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#CFA46A]">
                                                {request.status}
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-slate-300" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-xl mx-auto text-center py-20">
                    <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-black/[0.02] relative">
                        <Sparkle className="w-8 h-8 text-[#CFA46A]" />
                        <div className="absolute inset-0 rounded-[32px] border border-[#CFA46A]/20 animate-ping" />
                    </div>
                    <h2 className="text-4xl font-serif font-black text-[#1F1F1F] uppercase mb-4">{completionMessage.heading}</h2>
                    <p className="text-sm text-slate-500 font-medium italic mb-10">{completionMessage.body}</p>
                    
                    <div className="pt-10 border-t border-black/[0.03]">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{completionMessage.closing}</p>
                        <p className="text-3xl font-serif font-black text-[#1F1F1F] uppercase">{completionMessage.hotel}</p>
                    </div>

                    <button
                        onClick={() => router.push(`/${hotelSlug}/guest/services`)}
                        className="mt-16 inline-flex items-center gap-4 bg-[#1F1F1F] text-white rounded-[32px] py-6 px-12 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-transform"
                    >
                        New Request
                    </button>
                </div>
            )}

            {completedRequests.length > 0 && (
                <div className="max-w-xl mx-auto mt-24">
                    <div className="flex items-center gap-3 mb-8">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registry History</h3>
                    </div>
                    <div className="space-y-4">
                        {completedRequests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-white rounded-[32px] p-6 border border-black/[0.01] shadow-sm flex items-center justify-between"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-black text-[#1F1F1F] uppercase tracking-tight">{request.type}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Delivered at {request.time}</p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Archived</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
