"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useHotelBranding, saveHotelBranding, HotelBranding, useSpecialOffers, saveSpecialOffer, deleteSpecialOffer, SpecialOffer } from "@/utils/store";
import { Palette, Layout, Type, Save, Check, RefreshCw, Phone, Plus, Trash2, Image as ImageIcon, Tag, Utensils, Clock, MessageSquare, Sparkles, Car, Loader2, Globe, Wifi, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SuccessFolio } from "@/components/SuccessFolio";

export default function BrandingPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding, loading } = useHotelBranding(hotelSlug);

    const [config, setConfig] = useState<Partial<HotelBranding>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [folioState, setFolioState] = useState<{ open: boolean, title: string, message: string, details?: string, actionLabel?: string }>({
        open: false, title: "", message: ""
    });

    // Special Offers State
    const { offers, loading: loadingOffers } = useSpecialOffers(branding?.id);
    const [newOffer, setNewOffer] = useState<Partial<SpecialOffer>>({ title: "", description: "", image_url: "", is_active: true });
    const [isAddingOffer, setIsAddingOffer] = useState(false);
    const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);

    useEffect(() => {
        if (branding) {
            setConfig(branding);
        }
    }, [branding]);

    const handleSave = async () => {
        if (!branding?.id) return;

        setIsSaving(true);
        const { data, error } = await saveHotelBranding(branding.id, config);
        setIsSaving(false);

        if (error) {
            setFolioState({
                open: true,
                title: "Update Interrupted",
                message: `The system encountered an issue while saving your preferences: ${error.message || "Unknown error"}.`,
            });
            return;
        }

        if (data) {
            setConfig(data);
        }

        setFolioState({
            open: true,
            title: "Settings Updated",
            message: "Your hotel's branding and operational preferences have been successfully updated across all guest touchpoints.",
            actionLabel: "Return to Console"
        });
    };

    const handleDeleteOffer = async (offerId: string) => {
        if (!branding?.id || deletingOfferId) return;

        setDeletingOfferId(offerId);
        const { error } = await deleteSpecialOffer(offerId, branding.id);
        setDeletingOfferId(null);

        if (error) {
            setFolioState({
                open: true,
                title: "Extraction Failed",
                message: `The promotional asset could not be decommissioned: ${error.message || "Unknown error"}.`,
            });
        } else {
            setFolioState({
                open: true,
                title: "Asset Decommissioned",
                message: "The selected promotional offering has been removed from the live guest catalogue.",
            });
        }
    };

    const colors = [
        { name: "Charcoal & Gold", primary: "#1F1F1F", accent: "#CFA46A" },
        { name: "Oceanic Depth", primary: "#1E293B", accent: "#38BDF8" },
        { name: "Imperial Jade", primary: "#064E3B", accent: "#10B981" },
        { name: "Regal Velvet", primary: "#4C1D95", accent: "#A78BFA" },
        { name: "Midnight Rose", primary: "#1F1111", accent: "#F43F5E" },
        { name: "Boutique Stone", primary: "#44403C", accent: "#D6D3D1" },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9]">
            <Loader2 className="w-8 h-8 text-[#CFA46A] animate-spin" />
        </div>
    );

    return (
        <div className="flex-1 min-h-screen bg-[#FDFBF9] font-sans pb-32">
            {/* Header section with glassmorphism */}
            <div className="px-12 py-10 border-b border-black/[0.03] bg-white/40 backdrop-blur-3xl sticky top-0 z-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-serif font-black text-[#1F1F1F] uppercase tracking-tighter mb-2">System Config</h1>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Branding & Operational Registry</p>
                </div>
                
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center px-10 py-5 bg-[#1F1F1F] text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-black transition-all disabled:opacity-50 min-w-[200px]"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-3" />
                    ) : (
                        <Save className="w-4 h-4 mr-3" />
                    )}
                    {isSaving ? "Synchronizing..." : "Save Configuration"}
                </motion.button>
            </div>

            <div className="px-12 py-12 grid grid-cols-1 xl:grid-cols-2 gap-12">
                <div className="space-y-12">
                    <section className="bg-white p-10 rounded-[48px] border border-black/[0.02] shadow-[0_30px_80px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center mb-8">
                            <Phone className="w-5 h-5 text-[#CFA46A] mr-3" />
                            <h2 className="text-xl font-serif font-black text-[#1F1F1F]">Communication Registry</h2>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reception Line</label>
                                <div className="flex items-center bg-[#FDFBF9] border border-black/[0.03] rounded-2xl px-5 py-4 focus-within:ring-1 ring-[#CFA46A]/30 transition-all">
                                    <Phone className="w-4 h-4 text-[#CFA46A]/50 mr-4" />
                                    <input
                                        type="text"
                                        placeholder="e.g. +91 98765 43210"
                                        value={config.receptionPhone || ""}
                                        onChange={(e) => setConfig({ ...config, receptionPhone: e.target.value })}
                                        className="bg-transparent w-full font-bold text-[#1F1F1F] outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Concierge Signal (WhatsApp)</label>
                                <div className="flex items-center bg-[#FDFBF9] border border-black/[0.03] rounded-2xl px-5 py-4 focus-within:ring-1 ring-[#CFA46A]/30 transition-all">
                                    <Phone className="w-4 h-4 text-[#CFA46A]/50 mr-4" />
                                    <input
                                        type="text"
                                        placeholder="e.g. +91 98765 43210"
                                        value={config.conciergeWhatsapp || ""}
                                        onChange={(e) => setConfig({ ...config, conciergeWhatsapp: e.target.value })}
                                        className="bg-transparent w-full font-bold text-[#1F1F1F] outline-none"
                                    />
                                </div>
                                <p className="mt-3 text-[10px] text-slate-400 font-medium italic">Synchronized with guest 'Protocol Selection' chat.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">SSID Registry</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Guest_WiFi"
                                        value={config.wifiName || ""}
                                        onChange={(e) => setConfig({ ...config, wifiName: e.target.value })}
                                        className="w-full bg-[#FDFBF9] border border-black/[0.03] rounded-2xl py-4 px-5 font-bold text-[#1F1F1F] focus:ring-1 ring-[#CFA46A]/30 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Access Credential</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. welcome123"
                                        value={config.wifiPassword || ""}
                                        onChange={(e) => setConfig({ ...config, wifiPassword: e.target.value })}
                                        className="w-full bg-[#FDFBF9] border border-black/[0.03] rounded-2xl py-4 px-5 font-bold text-[#1F1F1F] focus:ring-1 ring-[#CFA46A]/30 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-10 rounded-[48px] border border-black/[0.02] shadow-[0_30px_80px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center mb-8">
                            <ImageIcon className="w-5 h-5 text-[#CFA46A] mr-3" />
                            <h2 className="text-xl font-serif font-black text-[#1F1F1F]">Property Hero Visual</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="relative h-48 rounded-[32px] overflow-hidden border border-black/[0.05] group">
                                <img 
                                    src={config.heroImage || "/images/hotel_hero.png"} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    alt="Hero Preview" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70 italic">Live Dashboard Preview</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Hero Image URL</label>
                                <div className="flex items-center bg-[#FDFBF9] border border-black/[0.03] rounded-2xl px-5 py-4 focus-within:ring-1 ring-[#CFA46A]/30 transition-all">
                                    <Globe className="w-4 h-4 text-[#CFA46A]/50 mr-4" />
                                    <input
                                        type="text"
                                        placeholder="/images/hotel_hero.png"
                                        value={config.heroImage || ""}
                                        onChange={(e) => setConfig({ ...config, heroImage: e.target.value })}
                                        className="bg-transparent w-full font-bold text-[#1F1F1F] outline-none text-xs"
                                    />
                                </div>
                                <p className="mt-3 text-[10px] text-slate-400 font-medium italic">High-impact 16:9 visual for the main guest entrance.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-10 rounded-[48px] border border-black/[0.02] shadow-[0_30px_80px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center mb-8">
                            <Palette className="w-5 h-5 text-[#CFA46A] mr-3" />
                            <h2 className="text-xl font-serif font-black text-[#1F1F1F]">Brand DNA Palette</h2>
                        </div>
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Primary Identity</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={config.primaryColor || "#1F1F1F"}
                                            onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                                            className="w-16 h-16 rounded-2xl cursor-pointer border-none p-0 overflow-hidden shadow-lg bg-transparent"
                                        />
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={config.primaryColor || "#1F1F1F"}
                                                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                                                className="w-full bg-[#FDFBF9] border border-black/[0.03] rounded-xl px-4 py-3 font-bold text-[#1F1F1F] text-sm uppercase outline-none focus:ring-1 ring-[#CFA46A]/30 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Accent Signature</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={config.accentColor || "#CFA46A"}
                                            onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                                            className="w-16 h-16 rounded-2xl cursor-pointer border-none p-0 overflow-hidden shadow-lg bg-transparent"
                                        />
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={config.accentColor || "#CFA46A"}
                                                onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                                                className="w-full bg-[#FDFBF9] border border-black/[0.03] rounded-xl px-4 py-3 font-bold text-[#1F1F1F] text-sm uppercase outline-none focus:ring-1 ring-[#000000]/10 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-black/[0.03]">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Module Icons</label>
                                <div className="flex items-center gap-4 max-w-sm">
                                    <input
                                        type="color"
                                        value={config.serviceIconColor || "#CFA46A"}
                                        onChange={(e) => setConfig({ ...config, serviceIconColor: e.target.value })}
                                        className="h-16 w-16 rounded-2xl cursor-pointer border-none p-0 overflow-hidden shadow-lg bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={config.serviceIconColor || "#CFA46A"}
                                        onChange={(e) => setConfig({ ...config, serviceIconColor: e.target.value })}
                                        className="flex-1 bg-[#FDFBF9] border border-black/[0.03] rounded-xl py-3 px-4 font-bold text-[#1F1F1F] text-sm uppercase outline-none focus:ring-1 ring-[#000000]/10 transition-all"
                                        placeholder="#CFA46A"
                                    />
                                </div>
                                <p className="mt-4 text-[10px] text-slate-400 font-medium italic">Synchronized across guest portal grid and quick-action nodes.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center mb-6">
                            <Clock className="w-5 h-5 text-blue-600 mr-3" style={{ color: config.primaryColor }} />
                            <h2 className="text-xl font-black text-slate-900">Late Checkout Settings</h2>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mb-6">Manage Late Checkout pricing and contact details for guests.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Late Checkout Contact (WhatsApp/Call)</label>
                                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus-within:ring-2 transition-all">
                                    <Phone className="w-4 h-4 text-slate-400 mr-3" />
                                    <input
                                        type="text"
                                        placeholder="e.g. +91 98765 43210"
                                        value={config.lateCheckoutPhone || ""}
                                        onChange={(e) => setConfig({ ...config, lateCheckoutPhone: e.target.value })}
                                        className="bg-transparent w-full font-bold text-slate-900 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Slot 1 (Till 2 PM)</label>
                                    <input
                                        type="text"
                                        value={config.lateCheckoutCharge1 || ""}
                                        onChange={(e) => setConfig({ ...config, lateCheckoutCharge1: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 outline-none focus:ring-2 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Slot 2 (2 PM - 6 PM)</label>
                                    <input
                                        type="text"
                                        value={config.lateCheckoutCharge2 || ""}
                                        onChange={(e) => setConfig({ ...config, lateCheckoutCharge2: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 outline-none focus:ring-2 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Slot 3 (After 6 PM)</label>
                                    <input
                                        type="text"
                                        value={config.lateCheckoutCharge3 || ""}
                                        onChange={(e) => setConfig({ ...config, lateCheckoutCharge3: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 outline-none focus:ring-2 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center mb-6">
                            <Car className="w-5 h-5 text-blue-600 mr-3" style={{ color: config.primaryColor }} />
                            <h2 className="text-xl font-black text-slate-900">Airport Transfer Pricing</h2>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mb-6">These prices appear on the guest Airport Transfer page. Leave all empty to show "Coming Soon".</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sedan (One Way)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. ₹1,200"
                                    value={config.airportTransferCharge1 || ""}
                                    onChange={(e) => setConfig({ ...config, airportTransferCharge1: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 outline-none focus:ring-2 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SUV (One Way)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. ₹2,000"
                                    value={config.airportTransferCharge2 || ""}
                                    onChange={(e) => setConfig({ ...config, airportTransferCharge2: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 outline-none focus:ring-2 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Luxury (One Way)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. ₹3,500"
                                    value={config.airportTransferCharge3 || ""}
                                    onChange={(e) => setConfig({ ...config, airportTransferCharge3: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 outline-none focus:ring-2 transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center mb-6">
                            <Utensils className="w-5 h-5 text-blue-600 mr-3" style={{ color: config.primaryColor }} />
                            <h2 className="text-xl font-black text-slate-900">Dining Service Hours</h2>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mb-6">Set the operating hours for your restaurant services. Outside these hours, items will be greyed out for guests.</p>

                        <div className="space-y-6">
                            {/* Breakfast */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                                    Breakfast Service
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Start Time</p>
                                        <input
                                            type="time"
                                            value={config.breakfastStart || "07:00"}
                                            onChange={(e) => setConfig({ ...config, breakfastStart: e.target.value })}
                                            className="w-full bg-white border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">End Time</p>
                                        <input
                                            type="time"
                                            value={config.breakfastEnd || "10:30"}
                                            onChange={(e) => setConfig({ ...config, breakfastEnd: e.target.value })}
                                            className="w-full bg-white border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Lunch */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                                    Lunch Service
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Start Time</p>
                                        <input
                                            type="time"
                                            value={config.lunchStart || "12:30"}
                                            onChange={(e) => setConfig({ ...config, lunchStart: e.target.value })}
                                            className="w-full bg-white border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">End Time</p>
                                        <input
                                            type="time"
                                            value={config.lunchEnd || "15:30"}
                                            onChange={(e) => setConfig({ ...config, lunchEnd: e.target.value })}
                                            className="w-full bg-white border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dinner */}
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                                    Dinner Service
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Start Time</p>
                                        <input
                                            type="time"
                                            value={config.dinnerStart || "19:00"}
                                            onChange={(e) => setConfig({ ...config, dinnerStart: e.target.value })}
                                            className="w-full bg-white border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">End Time</p>
                                        <input
                                            type="time"
                                            value={config.dinnerEnd || "22:30"}
                                            onChange={(e) => setConfig({ ...config, dinnerEnd: e.target.value })}
                                            className="w-full bg-white border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center mb-6">
                            <Sparkles className="w-5 h-5 text-blue-600 mr-3" style={{ color: config.primaryColor }} />
                            <h2 className="text-xl font-black text-slate-900">Welcome Message</h2>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mb-6">This message will be sent to guests via WhatsApp immediately after they are assigned a room.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Custom Welcome Line</label>
                                <textarea
                                    placeholder="e.g. Breakfast is served from 7 AM to 10:30 AM."
                                    value={config.welcomeMessage || ""}
                                    onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 outline-none focus:ring-2 transition-all min-h-[100px] resize-none text-sm"
                                />
                                <p className="text-[10px] text-[#2563eb] mt-2 font-black italic">We automatically send a short welcome with guest name, hotel name, and room number. Keep this line short and emoji-free for the cleanest WhatsApp message.</p>


                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center mb-6">
                            <MessageSquare className="w-5 h-5 text-blue-600 mr-3" style={{ color: config.primaryColor }} />
                            <h2 className="text-xl font-black text-slate-900">Checkout Feedback</h2>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mb-6">Automate review requests. This message with your Google link will open on WhatsApp when a guest is checked out.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">WhatsApp Feedback Message</label>
                                <textarea
                                    placeholder="e.g. Thank you for staying with us! We hope you had a great time. We'd love to hear your feedback."
                                    value={config.checkoutMessage || ""}
                                    onChange={(e) => setConfig({ ...config, checkoutMessage: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 outline-none focus:ring-2 transition-all min-h-[100px] resize-none text-sm"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Note: The Google Review Link will be appended to the end of this message automatically.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Google Review / Profile Link</label>
                                <input
                                    type="text"
                                    placeholder="https://g.page/r/your-profile-id/review"
                                    value={config.googleReviewLink || ""}
                                    onChange={(e) => setConfig({ ...config, googleReviewLink: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 outline-none focus:ring-2 transition-all text-sm"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center mb-6">
                            <Tag className="w-5 h-5 text-blue-600 mr-3" style={{ color: config.primaryColor }} />
                            <h2 className="text-xl font-black text-slate-900">Special Offers Slider</h2>
                        </div>

                        {/* Current Offers List */}
                        <div className="space-y-4 mb-8">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Offers ({offers.length})</label>
                            {offers.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No offers active. Add one below.</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {offers.map((offer) => (
                                        <div key={offer.id} className="flex items-center bg-slate-50 p-3 rounded-2xl border border-slate-100 group">
                                            <div className="w-12 h-12 bg-slate-200 rounded-xl overflow-hidden mr-3">
                                                {offer.image_url && <img src={offer.image_url} className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xs font-black text-slate-900">{offer.title}</h4>
                                                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{offer.description}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteOffer(offer.id)}
                                                disabled={deletingOfferId === offer.id}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add New Offer Form */}
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <h3 className="text-xs font-black text-slate-900 mb-4 flex items-center">
                                <Plus className="w-3 h-3 mr-2" /> Add Promotional Offer
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Offer Title (e.g. 20% Off Spa)"
                                        value={newOffer.title}
                                        onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                                        className="w-full bg-white border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:ring-1"
                                    />
                                </div>
                                <div>
                                    <textarea
                                        placeholder="Description"
                                        value={newOffer.description}
                                        onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                                        className="w-full bg-white border border-slate-100 rounded-xl py-2 px-3 text-xs font-medium outline-none focus:ring-1 h-20 resize-none"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            placeholder="Image URL"
                                            value={newOffer.image_url}
                                            onChange={(e) => setNewOffer({ ...newOffer, image_url: e.target.value })}
                                            className="w-full bg-white border border-slate-100 rounded-xl py-2 pl-8 pr-3 text-[10px] font-bold outline-none focus:ring-1"
                                        />
                                        <ImageIcon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!branding?.id || !newOffer.title) return;
                                            setIsAddingOffer(true);
                                            await saveSpecialOffer(branding.id, newOffer);
                                            setNewOffer({ title: "", description: "", image_url: "", is_active: true });
                                            setIsAddingOffer(false);
                                        }}
                                        disabled={isAddingOffer || !newOffer.title}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-slate-800 disabled:opacity-50 transition-all"
                                    >
                                        {isAddingOffer ? "ADDING..." : "ADD OFFER"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Preview Panel */}
                <div className="space-y-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Live Canvas Preview</h3>
                    <div className="bg-slate-100 rounded-[3rem] p-10 flex flex-col items-center justify-center min-h-[500px] border border-slate-200 border-dashed relative overflow-hidden">
                        {/* Mock Mobile View */}
                        <motion.div
                            layout
                            className="w-[280px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-slate-900"
                        >
                            <div className="p-6">
                                <div className="flex flex-col items-center py-8">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-500 shadow-xl"
                                        style={{ backgroundColor: config.primaryColor }}
                                    >
                                        {config.logoImage ? (
                                            <img src={config.logoImage} className="w-full h-full object-cover rounded-2xl" alt="Logo" />
                                        ) : (
                                            <span className="text-3xl font-serif text-white">{config.logo || config.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-black text-center text-slate-900">{config.name}</h2>
                                </div>
                                <div className="space-y-3 mt-4">
                                    <div className="w-full h-10 bg-slate-50 rounded-xl"></div>
                                    <div className="w-full h-10 bg-slate-50 rounded-xl"></div>
                                    <button
                                        className="w-full py-4 rounded-2xl text-white font-black text-xs transition-colors duration-500"
                                        style={{ backgroundColor: config.primaryColor }}
                                    >
                                        PRIMARY BUTTON
                                    </button>
                                </div>
                            </div>
                            <div className="h-16 border-t border-slate-50 flex items-center justify-center space-x-6">
                                <div className="w-6 h-6 rounded-full opacity-20" style={{ backgroundColor: config.primaryColor }}></div>
                                <div className="w-6 h-6 rounded-full opacity-20" style={{ backgroundColor: config.primaryColor }}></div>
                                <div className="w-6 h-6 rounded-full opacity-20" style={{ backgroundColor: config.primaryColor }}></div>
                            </div>
                        </motion.div>
                        <p className="mt-8 text-slate-400 text-xs font-bold italic">Changes sync instantly across all guest devices</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
