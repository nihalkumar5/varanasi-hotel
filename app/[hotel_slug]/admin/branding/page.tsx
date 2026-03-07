"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useHotelBranding, saveHotelBranding, HotelBranding } from "@/utils/store";
import { Palette, Layout, Type, Save, Check, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function BrandingPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding, loading } = useHotelBranding(hotelSlug);

    const [config, setConfig] = useState<Partial<HotelBranding>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (branding) {
            setConfig(branding);
        }
    }, [branding]);

    const handleSave = async () => {
        if (!branding?.id) return;
        setIsSaving(true);
        await saveHotelBranding(branding.id, config);
        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const colors = [
        { name: "Ocean Blue", primary: "#2563eb", accent: "#3b82f6" },
        { name: "Royal Purple", primary: "#7c3aed", accent: "#8b5cf6" },
        { name: "Emerald Forest", primary: "#059669", accent: "#10b981" },
        { name: "Sunset Orange", primary: "#ea580c", accent: "#f97316" },
        { name: "Midnight Black", primary: "#0f172a", accent: "#334155" },
        { name: "Rose Pink", primary: "#db2777", accent: "#ec4899" },
    ];

    if (loading) return <div className="p-20 text-center text-gray-400">Loading identity...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight" style={{ color: config.primaryColor }}>Brand Identity</h1>
                    <p className="text-slate-500 font-medium">Configure your hotel's SaaS presence & visual DNA</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center disabled:opacity-50 active:scale-95"
                    style={{ backgroundColor: config.primaryColor }}
                >
                    {isSaving ? (
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : showSuccess ? (
                        <Check className="w-5 h-5 mr-2" />
                    ) : (
                        <Save className="w-5 h-5 mr-2" />
                    )}
                    {showSuccess ? "Identity Saved" : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Configuration Panel */}
                <div className="space-y-8">
                    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center mb-6">
                            <Type className="w-5 h-5 text-blue-600 mr-3" style={{ color: config.primaryColor }} />
                            <h2 className="text-xl font-black text-slate-900">General Identity</h2>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hotel Name</label>
                                <input
                                    type="text"
                                    value={config.name || ""}
                                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 focus:ring-2 transition-all outline-none"
                                    style={{ focusRingColor: `${config.primaryColor}30` } as any}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Logo Initial</label>
                                    <input
                                        type="text"
                                        maxLength={1}
                                        value={config.logo || ""}
                                        onChange={(e) => setConfig({ ...config, logo: e.target.value.toUpperCase() })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-black text-2xl text-center text-slate-900 focus:ring-2 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Upload Custom Logo</label>
                                    <div className="relative w-full h-[56px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden hover:bg-slate-100 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setConfig({ ...config, logoImage: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <span className="text-xs font-bold text-slate-500">{config.logoImage ? "Change Image" : "Upload File"}</span>
                                    </div>
                                    {config.logoImage && (
                                        <button onClick={() => setConfig({ ...config, logoImage: undefined })} className="text-[10px] text-red-500 font-bold mt-2 uppercase">Remove Logo Image</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center mb-6">
                            <Palette className="w-5 h-5 text-blue-600 mr-3" style={{ color: config.primaryColor }} />
                            <h2 className="text-xl font-black text-slate-900">Color Palette</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {colors.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => setConfig({ ...config, primaryColor: color.primary, accentColor: color.accent })}
                                    className={`p-4 rounded-3xl border-2 transition-all group ${config.primaryColor === color.primary ? 'border-slate-900 bg-slate-50' : 'border-transparent hover:bg-slate-50'}`}
                                >
                                    <div
                                        className="w-full aspect-square rounded-2xl shadow-lg transition-transform group-hover:scale-110"
                                        style={{ backgroundColor: color.primary }}
                                    ></div>
                                    <p className="text-[9px] font-black text-slate-400 mt-3 uppercase tracking-tighter text-center">{color.name}</p>
                                </button>
                            ))}
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary HEX</label>
                                <input
                                    type="color"
                                    value={config.primaryColor || "#3b82f6"}
                                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                                    className="w-full h-12 rounded-xl cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Accent HEX</label>
                                <input
                                    type="color"
                                    value={config.accentColor || "#60a5fa"}
                                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                                    className="w-full h-12 rounded-xl cursor-pointer"
                                />
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
