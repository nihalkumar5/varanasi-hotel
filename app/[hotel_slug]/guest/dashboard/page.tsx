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
        <div className="min-h-screen bg-[#FDFBF9] pb-32 font-sans text-[#1F1F1F]">
            {/* 1. Cinematic Hero Canvas */}
            <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative h-[440px] w-full"
            >
                <div className="absolute inset-0 overflow-hidden">
                    <img src={heroImage} className="w-full h-full object-cover scale-110 blur-[1px]" alt="Background" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF9] via-[#FDFBF9]/40 to-black/30" />
                </div>

                <div className="relative z-10 px-8 pt-20 flex flex-col items-center">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 rounded-[28px] bg-white shadow-2xl flex items-center justify-center mb-8 border border-white/50 backdrop-blur-xl"
                    >
                        {branding?.logoImage ? (
                            <img src={branding.logoImage} className="w-full h-full object-cover rounded-[28px]" />
                        ) : (
                            <span className="text-4xl font-serif font-black text-[#1F1F1F]">{branding?.logo || branding?.name?.charAt(0)}</span>
                        )}
                    </motion.div>
                    
                    <h1 className="text-4xl font-serif font-black text-center text-[#1F1F1F] tracking-tight leading-none mb-4 uppercase">
                        {branding?.name}
                    </h1>
                    <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#CFA46A]">
                        <span>Boutique Residency</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#CFA46A] animate-pulse" />
                        <span>{branding?.city || "Luxury Hub"}</span>
                    </div>
                </div>
            </motion.section>

            {/* 2. Personalized Access Card */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="-mt-32 px-6 relative z-20"
            >
                <div className="bg-[#1F1F1F] rounded-[48px] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.25)] border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                        <Star className="w-40 h-40 text-[#CFA46A]" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <p className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.3em] mb-2">Welcome Back</p>
                                <h2 className="text-3xl font-serif font-black text-white leading-none">Guest of Folio</h2>
                            </div>
                            <div className="px-6 py-3 bg-[#CFA46A] text-[#1F1F1F] rounded-[20px] font-serif font-black text-2xl shadow-lg">
                                {roomNumber || "101"}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Stay Duration</p>
                                <p className="text-sm font-black text-white">{displayCheckoutDate}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Departure</p>
                                <p className="text-sm font-black text-white">{displayCheckoutTime}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-[#CFA46A]" />
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{numGuests || 1} Registered</span>
                            </div>
                            <button 
                                onClick={() => router.push(`/${hotelSlug}/guest/services/late-checkout`)}
                                className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white uppercase tracking-[0.2em] hover:bg-[#CFA46A] hover:text-[#1F1F1F] transition-all"
                            >
                                Extend Stay
                            </button>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* 3. Boutique Service Grid */}
            <section className="mt-16 px-6">
                <div className="mb-10 flex items-center justify-between px-2">
                    <div>
                        <h3 className="text-xl font-serif font-black text-[#1F1F1F]">Curated Folio</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Operational Signals</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center">
                        <ConciergeBell className="w-4 h-4 text-[#CFA46A]" />
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: "Wi-Fi", icon: <Wifi />, path: "wifi" },
                        { label: "Dining", icon: <Utensils />, path: "restaurant" },
                        { label: "Transport", icon: <Car />, path: "services/taxi" },
                        { label: "Laundry", icon: <WashingMachine />, path: "services/laundry" },
                        { label: "Baggage", icon: <Briefcase />, path: "services/luggage" },
                        { label: "Spa", icon: <Waves />, path: "services/spa" },
                        { label: "Cleaning", icon: <Brush />, path: "services/cleaning" },
                        { label: showMoreServices ? "Collapse" : "More", icon: <MoreHorizontal />, action: () => setShowMoreServices(!showMoreServices) }
                    ].map((s, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => s.path ? router.push(`/${hotelSlug}/guest/${s.path}`) : s.action?.()}
                            className="flex flex-col items-center gap-3 p-4 rounded-[28px] bg-white border border-black/[0.02] shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
                        >
                            <div className="text-[#CFA46A]" style={{ color: serviceIconColor }}>
                                {renderIcon(s.icon, "w-8 h-8")}
                            </div>
                            <span className="text-[9px] font-black text-[#1F1F1F] uppercase tracking-tighter text-center leading-none">{s.label}</span>
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

