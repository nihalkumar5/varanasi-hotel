"use client";

import React, { useState, useMemo } from "react";
import { MenuCard } from "@/components/MenuCard";
import { ShoppingCart, CheckCircle, ArrowLeft, Trash2, Plus, RefreshCw, Utensils, Search, Star, Home, Layout, User, MapPin } from "lucide-react";
import { addSupabaseRequest, useHotelBranding, useSupabaseMenuItems } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";

export default function RestaurantPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { roomNumber } = useGuestRoom();
    const { menuItems, loading } = useSupabaseMenuItems(branding?.id);

    const [cart, setCart] = useState<{ id: string; title: string; price: number }[]>([]);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [showCart, setShowCart] = useState(false);

    const [activeCategory, setActiveCategory] = useState<string>("All Day Snacks");

    const categories = ["Breakfast", "Lunch", "Dinner", "All Day Snacks"];

    const menuCategories = useMemo(() => {
        return categories.map(cat => ({
            name: cat,
            items: menuItems.filter(item => item.category === cat && item.is_available)
        }));
    }, [menuItems]);

    const isCategoryActive = (category: string) => {
        if (category === "All Day Snacks") return { active: true };
        if (!branding) return { active: true };

        const toMinutes = (value: string) => {
            const [hoursText, minutesText] = value.split(":");
            const hours = Number(hoursText);
            const minutes = Number(minutesText);

            if (
                Number.isNaN(hours) ||
                Number.isNaN(minutes) ||
                hours < 0 ||
                hours > 23 ||
                minutes < 0 ||
                minutes > 59
            ) {
                return 0;
            }

            return hours * 60 + minutes;
        };

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let start = "00:00", end = "23:59";
        if (category === "Breakfast") {
            start = branding.breakfastStart || "07:00";
            end = branding.breakfastEnd || "10:30";
        } else if (category === "Lunch") {
            start = branding.lunchStart || "12:30";
            end = branding.lunchEnd || "15:30";
        } else if (category === "Dinner") {
            start = branding.dinnerStart || "19:00";
            end = branding.dinnerEnd || "22:30";
        }

        const startMinutes = toMinutes(start);
        const endMinutes = toMinutes(end);

        // Supports both normal windows (07:00 -> 10:30) and overnight windows (19:00 -> 01:00).
        const isActive =
            startMinutes <= endMinutes
                ? currentMinutes >= startMinutes && currentMinutes <= endMinutes
                : currentMinutes >= startMinutes || currentMinutes <= endMinutes;

        return { active: isActive, start, end };
    };

    // Set default category based on current time
    React.useEffect(() => {
        const checkCategories = ["Breakfast", "Lunch", "Dinner"];
        for (const cat of checkCategories) {
            if (isCategoryActive(cat).active) {
                setActiveCategory(cat);
                return;
            }
        }
        setActiveCategory("All Day Snacks");
    }, [branding]);

    const addToCart = (item: any) => {
        setCart([...cart, item]);
    };

    const handleOrder = async () => {
        if (!branding?.id) return;
        setIsOrdering(true);
        // Artificial delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { error } = await addSupabaseRequest(branding.id, {
            room: roomNumber,
            type: `Dining Order (${cart.length} items)`,
            notes: cart.map(item => item.title).join(", "),
            status: "Pending",
            price: cartTotal,
            total: cartTotal
        });

        setIsOrdering(false);

        if (error) {
            alert(`Order Failed: ${error.message || 'Please try again or contact the front desk.'}`);
        } else {
            setOrderComplete(true);
            setCart([]);
            setShowCart(false); // Close cart after successful order
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

    if (orderComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
            >
                <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-amber-500/10">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-foreground mb-2">Order Received!</h2>
                <p className="text-foreground/60 font-medium mb-8">Chef is starting your meal right now.</p>
                <button onClick={() => router.push(`/${hotelSlug}/guest/status`)} className="w-full bg-white text-black py-4 rounded-2xl font-bold active:scale-95 transition-transform shadow-xl shadow-black/20">
                    View Progress
                </button>
            </motion.div>
        );
    }

    const currentCategoryData = menuCategories.find(c => c.name === activeCategory);
    const { active, start } = isCategoryActive(activeCategory);

    return (
        <div className="pb-32 pt-12 min-h-screen noise-bg max-w-[520px] mx-auto overflow-x-hidden font-sans text-[#1F1F1F]">
            {/* 1. Branded Header - Consistent with Dashboard */}
            <header className="px-6 mb-12 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <motion.button 
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.back()}
                        className="w-12 h-12 bg-[#4E8F7A] rounded-full flex items-center justify-center shadow-lg shadow-[#4E8F7A]/20"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </motion.button>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4E8F7A]/60 leading-none mb-1.5">In-Room Dining</p>
                        <h1 className="text-base font-serif font-bold tracking-tight leading-none uppercase">
                            {branding?.name || "Culinary Collection"}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <motion.button 
                        whileTap={{ scale: 0.97 }}
                        className="w-11 h-11 rounded-full bg-white shadow-sm border border-slate-100/50 flex items-center justify-center text-slate-400"
                    >
                        <Search className="w-5 h-5" strokeWidth={1.5} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowCart(!showCart)}
                        className="relative w-11 h-11 rounded-full bg-white shadow-sm border border-slate-100/50 flex items-center justify-center text-[#4E8F7A]"
                    >
                        <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                        {cart.length > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-[#4E8F7A] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center"
                            >
                                {cart.length}
                            </motion.span>
                        )}
                    </motion.button>
                </div>
            </header>

            {/* 2. Restaurant Headline */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 mb-12"
            >
                <p className="text-sm font-medium text-slate-400 mb-2">In-Room Dining</p>
                <h2 className="text-[32px] font-serif leading-[1.1] font-medium tracking-tight">
                    Fine Dining
                </h2>
            </motion.div>

            {/* 3. Sophisticated Promo Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 mb-16"
            >
                <div className="relative h-[280px] rounded-[32px] overflow-hidden group shadow-2xl">
                    <img 
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" 
                        alt="Chef's Special"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F]/90 via-[#1F1F1F]/20 to-transparent flex flex-col justify-end p-10 text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-70">Chef's Signature</p>
                        <h3 className="text-3xl font-serif font-bold mb-2 italic">Culinary Mastery</h3>
                        <p className="text-xs font-medium opacity-80 mb-8 max-w-[200px]">Experience seasonal flavors delivered directly to your suite.</p>
                        <div className="flex items-center space-x-2">
                             <div className="h-0.5 w-12 bg-[#4E8F7A]"></div>
                             <span className="text-[9px] font-black uppercase tracking-widest text-[#4E8F7A]">Explore Secrets</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 4. Horizontal Category Selection */}
            <div className="mb-12 px-6 overflow-x-auto no-scrollbar flex items-center space-x-4">
                {menuCategories.map((category) => {
                    const isActive = activeCategory === category.name;
                    const { active: isServeActive } = isCategoryActive(category.name);

                    return (
                        <motion.button
                            key={category.name}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory(category.name)}
                            className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center ${isActive
                                ? 'bg-[#4E8F7A] text-white shadow-lg shadow-[#4E8F7A]/20'
                                : 'bg-white text-slate-400 border border-slate-100 shadow-sm'
                                } ${!isServeActive ? 'opacity-40 grayscale' : ''}`}
                        >
                            {category.name}
                            {!isServeActive && isActive && (
                                <span className="ml-2 opacity-70">(Closed)</span>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* 5. Menu Items Grid */}
            <div className="px-6 space-y-12">
                <section className={!active ? "opacity-40 grayscale pointer-events-none" : ""}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-serif font-medium text-slate-900">{activeCategory}</h2>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">Selection</p>
                        </div>
                        {!active && (
                            <div className="flex items-center text-[9px] font-black bg-[#4E8F7A]/5 text-[#4E8F7A] px-4 py-2 rounded-full uppercase tracking-widest border border-[#4E8F7A]/10">
                                <RefreshCw className="w-3 h-3 mr-2 animate-spin-slow" />
                                Opens at {start}
                            </div>
                        )}
                    </div>
                    
                    {loading ? (
                        <div className="py-20 text-center">
                            <RefreshCw className="w-10 h-10 animate-spin text-[#4E8F7A] mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Consulting Chef...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 pb-32">
                            {currentCategoryData?.items.length === 0 ? (
                                <div className="py-20 text-center bg-white rounded-[24px] border border-dashed border-slate-200">
                                    <Utensils className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                                    <p className="text-slate-300 font-bold text-sm">No items available.</p>
                                </div>
                            ) : (
                                currentCategoryData?.items.map((item) => (
                                    <MenuCard
                                        key={item.id}
                                        id={item.id}
                                        title={item.title}
                                        description={item.description || ""}
                                        price={item.price}
                                        image={item.image_url}
                                        onAdd={() => addToCart(item)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* 6. Premium Glassmorphic Cart Bar */}
            <AnimatePresence>
                {cart.length > 0 && !showCart && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[472px] z-40"
                    >
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCart(true)}
                            className="w-full bg-[#1F1F1F] text-white p-5 rounded-[24px] flex items-center justify-between shadow-2xl active:scale-95 transition-transform border border-white/5"
                        >
                            <div className="flex items-center">
                                <div className="bg-[#4E8F7A] px-3 py-1.5 rounded-full mr-4 text-[9px] font-black uppercase tracking-widest">
                                    {cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'}
                                </div>
                                <span className="font-bold text-xs uppercase tracking-[0.2em] opacity-70">View Selection</span>
                            </div>
                            <span className="font-serif text-2xl font-bold italic tracking-tight">₹{cartTotal.toLocaleString()}</span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 7. Cart Panel Redesign */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCart(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[520px] bg-[#F7F7F7] rounded-t-[40px] p-10 pb-12 z-[70] shadow-2xl overflow-y-auto max-h-[85vh] noise-bg"
                        >
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-10 opacity-50"></div>
                            
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#4E8F7A] mb-1">Your Culinary</p>
                                    <h2 className="text-4xl font-serif font-medium text-slate-900 leading-none">Selection</h2>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowCart(false)}
                                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm border border-slate-100"
                                >
                                    <Plus className="w-6 h-6 rotate-45" />
                                </motion.button>
                            </div>

                            <div className="space-y-4 mb-12">
                                {cart.map((item, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={idx} 
                                        className="flex items-center justify-between p-6 bg-white rounded-[24px] shadow-sm border border-[#F3EDE4] group"
                                    >
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900 text-sm uppercase tracking-tight">{item.title}</p>
                                            <p className="font-serif text-lg font-bold text-[#4E8F7A] italic">₹{item.price.toLocaleString()}</p>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                                            className="w-10 h-10 bg-red-50 text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="bg-[#1F1F1F] rounded-[32px] p-8 shadow-2xl mb-12 text-white">
                                <div className="flex justify-between items-center mb-5 pb-5 border-b border-white/5">
                                    <span className="text-white/40 font-black uppercase text-[9px] tracking-[0.2em]">Subtotal</span>
                                    <span className="font-bold text-sm">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mb-10">
                                    <span className="text-white/40 font-black uppercase text-[9px] tracking-[0.2em]">Tray Service</span>
                                    <span className="font-black text-[#4E8F7A] uppercase text-[9px] tracking-widest">Complimentary</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-white/40 font-black uppercase text-[9px] tracking-[0.2em] mb-1">Total Amount</p>
                                        <p className="text-4xl font-serif font-bold italic tracking-tighter">₹{cartTotal.toLocaleString()}</p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        onClick={handleOrder}
                                        disabled={isOrdering}
                                        className="h-14 px-8 bg-[#4E8F7A] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#4E8F7A]/20 disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isOrdering ? (
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Confirm Order"
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
}
