"use client";

import React from "react";
import { Home, Utensils, Layout, Bell } from "lucide-react";
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
        <nav className="fixed bottom-4 left-1/2 z-50 flex h-16 w-[calc(100%-32px)] max-w-[480px] -translate-x-1/2 items-center justify-between rounded-[24px] border border-white/45 bg-white/72 px-4 font-sans shadow-[0_15px_35px_rgba(0,0,0,0.1)] backdrop-blur-xl">
            {items.map((item) => {
                const active = isActive(item.key);
                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        className="relative flex min-w-[62px] flex-col items-center gap-1"
                    >
                        <motion.div
                            whileTap={{ scale: 0.94 }}
                            className={`rounded-full p-2 transition-all duration-300 ${active ? "bg-black shadow-[0_6px_14px_rgba(0,0,0,0.28)]" : "bg-transparent"}`}
                        >
                            <item.icon 
                                className={`h-[22px] w-[22px] transition-all duration-300 ${active ? "text-white fill-white/10" : "text-[#1F1F1F] opacity-35"}`} 
                                strokeWidth={active ? 2.5 : 2} 
                            />
                        </motion.div>
                        <span className={`text-[9px] font-black uppercase tracking-[0.18em] transition-all duration-300 ${active ? "text-black" : "text-slate-500/70"}`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
