"use client";

import React, { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import {
    Wifi, Utensils, Phone, Layers,
    Zap, Droplets, Wind, Sparkles, Coffee, Layout, ChefHat, Home, User, Users, Sun, Compass, AlertCircle, Check, Wine, Library,
    ChevronLeft, ChevronRight, ArrowRight, ExternalLink, Clock, MapPin, Music, Star, Shirt, WashingMachine,
    Wrench, Search, Bed, Bath, AirVent, Tv, MoreHorizontal, Waves, Car, Bell, Lamp, Sofa, Briefcase, RefreshCw,
    ConciergeBell, Brush
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, useSupabaseRequests, addSupabaseRequest, useSpecialOffers } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { SuccessFolio } from "@/components/SuccessFolio";

// Helper to safely render icons with className
const renderIcon = (icon: React.ReactNode, className: string) => {
    return React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement<any>, { className })
        : icon;
};

const formatCheckoutDate = (value?: string) => {
    if (!value) return "TBD";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
};

const formatCheckoutTime = (value?: string) => {
    if (!value) return "11:00 AM";
    return value;
};

export default function GuestDashboard() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;

    const { roomNumber, checkoutDate, checkoutTime, numGuests, checkedInAt } = useGuestRoom();
    const { branding, loading } = useHotelBranding(hotelSlug);
    const { offers, loading: loadingOffers } = useSpecialOffers(branding?.id);
    const requests = useSupabaseRequests(branding?.id, roomNumber, checkedInAt);

    const [activeServiceForQty, setActiveServiceForQty] = useState<{
        label: string;
        icon: React.ReactNode;
        internalName: string;
        hasOptions?: boolean;
        selectedOption?: string | null;
        step?: 'type' | 'quantity';
    } | null>(null);

    const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [showMoreServices, setShowMoreServices] = useState(false);
    const [submittingType, setSubmittingType] = React.useState<string | null>(null);
    const [folioState, setFolioState] = useState<{ open: boolean, title: string, message: string, details?: string }>({
        open: false, title: "", message: ""
    });

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const activeRequests = requests.filter(r => r.status === "Pending" || r.status === "In Progress");
    const displayCheckoutDate = formatCheckoutDate(checkoutDate);
    const displayCheckoutTime = formatCheckoutTime(checkoutTime);
    const serviceIconColor = branding?.serviceIconColor || "#CFA46A";
    const heroImage = branding?.heroImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80";
    const activeOffers = offers.filter((offer) => offer.is_active);

    const handleQuickRequest = async (type: string, notes: string) => {
        if (!branding?.id || submittingType) return;

        setSubmittingType(type);
        const { error } = await addSupabaseRequest(branding.id, {
            room: roomNumber,
            type: type,
            notes: notes,
            status: "Pending",
            price: 0,
            total: 0
        });

        setSubmittingType(null);

        if (error) {
            setFolioState({
                open: true,
                title: "Service Interrupted",
                message: `The system encountered a resistance: ${error.message}`,
            });
        } else {
            setFolioState({
                open: true,
                title: "Request Dispatched",
                message: `Your request for ${type.toLowerCase()} has been prioritized by our team.`,
                details: "TRACKING_ACTIVE"
            });
        }
    };

    const handleTileClick = (service: any) => {
        if (service.internalName === "Reception") {
            if (branding?.receptionPhone) {
                window.location.href = `tel:${branding.receptionPhone}`;
            } else {
                setFolioState({
                    open: true,
                    title: "Access Restricted",
                    message: "The direct line to Reception is currently being synchronized. Please use the Concierge chat.",
                });
            }
            return;
        }

        setActiveServiceForQty({
            label: service.label,
            icon: service.icon,
            internalName: service.internalName,
            hasOptions: service.hasOptions,
            selectedOption: null,
            step: service.hasOptions ? 'type' : 'quantity'
        });
    };

    const confirmQuantity = (qty: number) => {
        if (!activeServiceForQty) return;
        const finalLabel = activeServiceForQty.selectedOption || activeServiceForQty.label;
        handleQuickRequest(activeServiceForQty.internalName, `${finalLabel} x ${qty}`);
        setActiveServiceForQty(null);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9]">
            <RefreshCw className="w-8 h-8 text-[#CFA46A] animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F7F5F2] pb-32 font-sans text-[#1F1F1F]">
            {/* 1. Hero with GUEST PORTAL pill */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative h-[300px] w-full"
            >
                <img src={heroImage} className="w-full h-full object-cover" alt="Hotel" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/10" />
                <div className="absolute top-0 inset-x-0 flex justify-center pt-8 z-10">
                    <div className="px-6 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white">Guest Portal</span>
                    </div>
                </div>
            </motion.section>

            {/* 2. Hotel Info Card (white, overlapping hero) */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="-mt-16 px-4 relative z-20"
            >
                <div className="bg-white rounded-[28px] shadow-xl border border-black/[0.04] overflow-hidden">
                    {/* Hotel name + stars + location */}
                    <div className="px-6 pt-6 pb-5 border-b border-slate-100">
                        <h1 className="text-2xl font-serif font-black text-[#1F1F1F] uppercase tracking-tight mb-2">
                            {branding?.name || "Hotel"}
                        </h1>
                        <div className="flex items-center gap-1 mb-2">
                            {[...Array(branding?.stars || 4)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-[#CFA46A] text-[#CFA46A]" />
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span className="text-xs font-medium">{branding?.city || "India"}</span>
                        </div>
                    </div>

                    {/* Checkout row */}
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1.5">Checkout</p>
                            <p className="text-lg font-bold text-[#1F1F1F]">
                                {displayCheckoutDate}
                                {(checkoutDate && displayCheckoutTime) && (
                                    <span className="text-[#CFA46A] font-black"> · {displayCheckoutTime}</span>
                                )}
                            </p>
                        </div>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                            <Check className="w-3 h-3" />
                            Verified Guest
                        </span>
                    </div>

                    {/* Room + Guests + Late Checkout */}
                    <div className="px-6 py-4 flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-2">
                            <Bed className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Room</p>
                                <p className="text-sm font-black text-[#1F1F1F]">{roomNumber || "101"}</p>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Staying</p>
                                <p className="text-sm font-black text-[#1F1F1F]">{numGuests || 1} Guest{(numGuests || 1) > 1 ? "s" : ""}</p>
                            </div>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => router.push(`/${hotelSlug}/guest/services/late-checkout`)}
                            className="px-5 py-3 bg-red-500 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] leading-tight text-center shadow-md shadow-red-500/25"
                        >
                            Late<br/>Checkout
                        </motion.button>
                    </div>
                </div>
            </motion.section>

            {/* 3. Service Icon Grid */}
            <section className="mt-8 px-4">
                <div className="mb-6 flex items-center justify-between px-1">
                    <div>
                        <h3 className="text-lg font-serif font-black text-[#1F1F1F]">Curated Folio</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Operational Signals</p>
                    </div>
                    <ConciergeBell className="w-5 h-5 text-[#CFA46A]" />
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "Wi-Fi Info", icon: <Wifi />, path: "wifi" },
                        { label: "Room Service", icon: <Utensils />, path: "restaurant" },
                        { label: "Taxi", icon: <Car />, path: "services/taxi" },
                        { label: "Maintenance", icon: <Wrench />, path: "services/maintenance" },
                        { label: "Laundry", icon: <WashingMachine />, path: "services/laundry" },
                        { label: "Baggage", icon: <Briefcase />, path: "services/luggage" },
                        { label: "Spa", icon: <Waves />, path: "services/spa" },
                        { label: showMoreServices ? "Collapse" : "More", icon: <MoreHorizontal />, action: () => setShowMoreServices(!showMoreServices) }
                    ].map((s, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => s.path ? router.push(`/${hotelSlug}/guest/${s.path}`) : s.action?.()}
                            className="flex flex-col items-center gap-2 py-4 px-2 rounded-[20px] bg-white border border-black/[0.04] shadow-sm"
                        >
                            <div style={{ color: serviceIconColor }}>
                                {renderIcon(s.icon, "w-7 h-7")}
                            </div>
                            <span className="text-[8px] font-black text-[#1F1F1F] uppercase tracking-tighter text-center leading-tight">{s.label}</span>
                        </motion.button>
                    ))}
                </div>
            </section>


            {/* 4. Promotional Highlights */}
            {activeOffers.length > 0 && (
                <section className="mt-20 px-6">
                    <div className="bg-[#F6F3EE] rounded-[48px] p-10 border border-[#E8DCCB]/30 relative overflow-hidden group">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <p className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.3em] mb-2">Exclusives</p>
                                <h3 className="text-3xl font-serif font-black text-[#1F1F1F]">Boutique Treats</h3>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center bg-white"><ChevronLeft className="w-4 h-4" /></button>
                                <button className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center bg-white"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl relative">
                            <div className="h-64 relative bg-slate-100">
                                {activeOffers[0].image_url && <img src={activeOffers[0].image_url} className="w-full h-full object-cover" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h4 className="text-2xl font-serif font-black leading-tight mb-1">{activeOffers[0].title}</h4>
                                    <p className="text-xs font-medium text-white/70 italic">{activeOffers[0].description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Active Signal Stream */}
            <AnimatePresence>
                {activeRequests.length > 0 && (
                    <motion.section 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-20 px-6"
                    >
                        <div className="flex items-center justify-between mb-8 px-2">
                            <h3 className="text-xl font-serif font-black text-[#1F1F1F]">Signal Stream</h3>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-[#CFA46A]/10 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#CFA46A] animate-pulse" />
                                <span className="text-[9px] font-black text-[#CFA46A] uppercase tracking-widest">{activeRequests.length} Active</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {activeRequests.map((req, i) => (
                                <div key={i} className="bg-white p-6 rounded-[32px] border border-black/[0.03] shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-[#FDFBF9] flex items-center justify-center text-[#CFA46A]">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-[#1F1F1F] uppercase tracking-tight">{req.type}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{req.status}</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.2em] italic">Propagating...</div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Selection Overlay */}
            <AnimatePresence>
                {activeServiceForQty && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#1F1F1F]/40 backdrop-blur-3xl flex items-center justify-center p-8"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#FDFBF9] rounded-[48px] p-10 w-full max-w-sm shadow-[0_40px_120px_rgba(0,0,0,0.3)] border border-white"
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-[32px] bg-white flex items-center justify-center text-[#CFA46A] shadow-xl mb-8 border border-black/[0.02]">
                                    {renderIcon(activeServiceForQty.icon, "w-8 h-8")}
                                </div>
                                <h3 className="text-2xl font-serif font-black text-[#1F1F1F] mb-1">{activeServiceForQty.label}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 text-center">Protocol Selection</p>
                                
                                <div className="flex gap-4 w-full">
                                    {[1, 2, 3].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => confirmQuantity(num)}
                                            className="flex-1 h-20 rounded-[24px] bg-white border border-black/[0.03] text-2xl font-serif font-black text-[#1F1F1F] hover:bg-[#CFA46A] hover:text-[#1F1F1F] transition-all shadow-sm"
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => setActiveServiceForQty(null)}
                                    className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-[#1F1F1F] transition-colors"
                                >
                                    Dismiss Request
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SuccessFolio 
                isOpen={folioState.open}
                onClose={() => setFolioState({...folioState, open: false})}
                title={folioState.title}
                message={folioState.message}
                details={folioState.details}
            />
        </div>
    );
}

