"use client";

import React from "react";
import { Home, Utensils, Layout, Bell, User, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { motion } from "framer-motion";

export function BottomNav() {
    const pathname = usePathname();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;

    const isActive = (path: string) => pathname?.includes(path);

    const items = [
        { href: `/${hotelSlug}/guest/dashboard`, icon: Home, label: "Home", key: "dashboard" },
        { href: `/${hotelSlug}/guest/restaurant`, icon: Utensils, label: "Dining", key: "restaurant" },
        { href: `/${hotelSlug}/guest/services`, icon: Layout, label: "Order", key: "services" },
        { href: `/${hotelSlug}/guest/status`, icon: Bell, label: "Progress", key: "status" },
    ];

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[480px] bg-white/60 backdrop-blur-xl border border-white/40 px-8 py-5 flex items-center justify-between z-50 rounded-[28px] shadow-[0_15px_35px_rgba(0,0,0,0.1)] font-sans">
            {items.map((item) => {
                const active = isActive(item.key);
                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        className="relative flex flex-col items-center group"
                    >
                        <motion.div whileTap={{ scale: 0.94 }}>
                            <item.icon 
                                className={`w-6 h-6 transition-all duration-300 ${active ? "text-[#CFA46A] fill-[#CFA46A]/20" : "text-[#1F1F1F] opacity-30"}`} 
                                strokeWidth={active ? 2.5 : 2} 
                            />
                        </motion.div>
                        {active && (
                            <motion.div
                                layoutId="nav-dot"
                                className="absolute -bottom-2 w-1.5 h-1.5 bg-[#CFA46A] rounded-full shadow-[0_2px_4px_rgba(207,164,106,0.4)]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
