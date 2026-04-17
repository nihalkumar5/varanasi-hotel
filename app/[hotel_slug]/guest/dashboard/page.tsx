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
                    <div className="px-6 pt-6 pb-4">
                        <h1 className="text-2xl font-serif font-black text-[#1F1F1F] uppercase tracking-tight mb-1">
                            {branding?.name || "Hotel"}
                        </h1>
                        <div className="flex items-center gap-0.5 mb-3">
                            {[...Array(branding?.stars || 5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-[#1F1F1F] text-[#1F1F1F]" />
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 pt-3 border-t border-slate-100">
                            <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span className="text-xs font-medium">{branding?.city || "Varanasi India"}</span>
                        </div>
                    </div>

                    {/* Checkout row */}
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1.5">Checkout</p>
                            <p className="text-base font-bold text-[#C0392B]">
                                {displayCheckoutDate}
                                {(checkoutDate && displayCheckoutTime) && (
                                    <span className="font-black"> · {displayCheckoutTime}</span>
                                )}
                            </p>
                        </div>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[9px] font-black uppercase tracking-widest">
                            <Check className="w-3 h-3" />
                            Verified Guest
                        </span>
                    </div>
                </div>

                {/* Room + Guests + Late Checkout — separate card below */}
                <div className="mt-3 flex items-stretch gap-0">
                    <div className="flex-1 flex items-center gap-2.5 px-4 py-3 bg-white rounded-l-2xl border border-black/[0.04] border-r-0">
                        <Bed className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Room</p>
                            <p className="text-sm font-black text-[#1F1F1F]">{roomNumber || "101"}</p>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2.5 px-4 py-3 bg-white border border-black/[0.04] border-x-0">
                        <Users className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Staying</p>
                            <p className="text-sm font-black text-[#1F1F1F]">{numGuests || 1} Guest{(numGuests || 1) > 1 ? "s" : ""}</p>
                        </div>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => router.push(`/${hotelSlug}/guest/services/late-checkout`)}
                        className="px-5 py-3 bg-[#C0392B] text-white rounded-r-2xl text-[9px] font-black uppercase tracking-[0.15em] leading-tight text-center shadow-md shadow-red-500/20 min-w-[90px]"
                    >
                        Late<br/>Checkout
                    </motion.button>
                </div>
            </motion.section>

            {/* 3. Service Icon Grid — compact, no header */}
            <section className="mt-6 px-4">
                <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                    {/* Row 1 — always visible */}
                    {[
                        { label: "Wi-Fi Info", icon: <Wifi />, path: "wifi" },
                        { label: "Room Service", icon: <Utensils />, path: "restaurant" },
                        { label: "Taxi", icon: <Car />, path: "services/taxi" },
                        { label: "Maintenance", icon: <Wrench />, path: "services/maintenance" },
                    ].map((s, i) => (
                        <motion.button
                            key={`r1-${i}`}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => router.push(`/${hotelSlug}/guest/${s.path}`)}
                            className="flex flex-col items-center gap-2 py-2"
                        >
                            <div style={{ color: serviceIconColor }}>
                                {renderIcon(s.icon, "w-6 h-6")}
                            </div>
                            <span className="text-[9px] font-semibold text-[#1F1F1F] text-center leading-tight">{s.label}</span>
                        </motion.button>
                    ))}

                    {/* Row 2 — always visible */}
                    {[
                        { label: "Laundry", icon: <WashingMachine />, path: "services/laundry" },
                        { label: "Luggage", icon: <Briefcase />, path: "services/luggage" },
                        { label: "Cleaning", icon: <Brush />, path: "services/cleaning" },
                    ].map((s, i) => (
                        <motion.button
                            key={`r2-${i}`}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => router.push(`/${hotelSlug}/guest/${s.path}`)}
                            className="flex flex-col items-center gap-2 py-2"
                        >
                            <div style={{ color: serviceIconColor }}>
                                {renderIcon(s.icon, "w-6 h-6")}
                            </div>
                            <span className="text-[9px] font-semibold text-[#1F1F1F] text-center leading-tight">{s.label}</span>
                        </motion.button>
                    ))}
                    <motion.button
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setShowMoreServices(!showMoreServices)}
                        className="flex flex-col items-center gap-2 py-2"
                    >
                        <div style={{ color: serviceIconColor }}>
                            <MoreHorizontal className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-semibold text-[#1F1F1F] text-center leading-tight">{showMoreServices ? "Less" : "More"}</span>
                    </motion.button>

                    {/* Row 3 — expanded */}
                    {showMoreServices && [
                        { label: "Wake Call", icon: <Clock />, path: "services/wake-call" },
                        { label: "Mini Bar", icon: <Wine />, path: "services/minibar" },
                        { label: "Airport", icon: <Compass />, path: "services/airport" },
                        { label: "Spa", icon: <Waves />, path: "services/spa" },
                    ].map((s, i) => (
                        <motion.button
                            key={`r3-${i}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => router.push(`/${hotelSlug}/guest/${s.path}`)}
                            className="flex flex-col items-center gap-2 py-2"
                        >
                            <div style={{ color: serviceIconColor }}>
                                {renderIcon(s.icon, "w-6 h-6")}
                            </div>
                            <span className="text-[9px] font-semibold text-[#1F1F1F] text-center leading-tight">{s.label}</span>
                        </motion.button>
                    ))}
                </div>
            </section>


            {/* 4. Special Offers */}
            {activeOffers.length > 0 && (
                <section className="mt-6 px-4">
                    <div className="bg-white rounded-[20px] border border-black/[0.04] shadow-sm overflow-hidden p-5">
                        <p className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.25em] mb-1">Special Offers</p>
                        <h3 className="text-lg font-serif font-black text-[#1F1F1F] mb-4">Curated for your stay</h3>
                        <div className="rounded-2xl overflow-hidden relative h-32 bg-gradient-to-br from-[#CFA46A]/30 to-[#CFA46A]/10">
                            {activeOffers[0].image_url && <img src={activeOffers[0].image_url} className="w-full h-full object-cover" />}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/70 mb-0.5">Exclusive</p>
                                <h4 className="text-base font-serif font-black leading-tight">{activeOffers[0].title}</h4>
                            </div>
                            <div className="absolute top-4 right-4">
                                <Star className="w-8 h-8 text-white/30" strokeWidth={1} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-xs text-slate-400">{activeOffers[0].description || "Ask our team for details on this experience."}</p>
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                className="px-4 py-2 bg-[#CFA46A] text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap"
                            >
                                Explore <ArrowRight className="w-3 h-3" />
                            </motion.button>
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Quick Services (dark card) */}
            <section className="mt-6 px-4">
                <div className="bg-[#2D2A26] rounded-[20px] p-5 shadow-lg">
                    <h3 className="text-base font-serif font-black text-white mb-0.5">Quick Services</h3>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Personalized for your stay</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Reception", icon: <Phone />, internalName: "Reception" },
                            { label: "Tea/Coffee", icon: <Coffee />, internalName: "Tea/Coffee" },
                            { label: "Mineral Water", icon: <Droplets />, internalName: "Mineral Water" },
                            { label: "Fresh Towels", icon: <Sparkles />, internalName: "Fresh Towels" },
                        ].map((s, i) => (
                            <motion.button
                                key={i}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleTileClick(s)}
                                className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
                            >
                                <div className="text-[#CFA46A]">
                                    {renderIcon(s.icon, "w-5 h-5")}
                                </div>
                                <span className="text-[9px] font-semibold text-white/80 text-center">{s.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Active Requests */}
            <section className="mt-6 px-4">
                <div className="bg-white rounded-[20px] border border-black/[0.04] shadow-sm p-5">
                    <h3 className="text-base font-serif font-black text-[#1F1F1F] mb-4">Active Requests</h3>
                    {activeRequests.length > 0 ? (
                        <div className="space-y-3">
                            {activeRequests.map((req, i) => (
                                <div key={i} className="bg-[#F7F5F2] p-4 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#CFA46A]">
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-[#1F1F1F] uppercase tracking-tight">{req.type}</h4>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{req.status}</p>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-[#CFA46A] animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[#F7F5F2] rounded-2xl py-6 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Our team is standing by</p>
                        </div>
                    )}
                </div>
            </section>

            {/* 7. Concierge CTA */}
            <section className="mt-6 px-4 mb-6">
                <div className="bg-[#F6F3EE] rounded-[20px] px-5 py-4 flex items-center justify-between border border-[#E8DCCB]/30">
                    <div>
                        <p className="text-[9px] font-black text-[#CFA46A] uppercase tracking-[0.2em] mb-0.5">Need Anything?</p>
                        <h3 className="text-sm font-serif font-black text-[#1F1F1F]">Talk to Concierge</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Available 24/7 for you</p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                            if (branding?.conciergeWhatsapp) {
                                window.open(`https://wa.me/${branding.conciergeWhatsapp}`, '_blank');
                            }
                        }}
                        className="px-5 py-2.5 bg-[#CFA46A] text-white rounded-full text-[9px] font-black uppercase tracking-widest"
                    >
                        Start Chat
                    </motion.button>
                </div>
            </section>

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

