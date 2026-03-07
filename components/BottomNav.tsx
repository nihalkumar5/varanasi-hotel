"use client";

import React from "react";
import { Home, Grip, Bell, Info } from "lucide-react";
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
        { href: `/${hotelSlug}/guest/services`, icon: Grip, label: "Services", key: "services" },
        { href: `/${hotelSlug}/guest/status`, icon: Bell, label: "Status", key: "status" },
        { href: `/${hotelSlug}/guest/info`, icon: Info, label: "Info", key: "info" },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md z-40">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="flex justify-around items-center">
                    {items.map((item) => {
                        const active = isActive(item.key);
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className="relative flex flex-col items-center flex-1 py-3 outline-none"
                            >
                                {active && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute inset-0 bg-blue-600 rounded-2xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <item.icon className={`w-5 h-5 mb-1 relative z-10 transition-colors duration-300 ${active ? "text-white" : "text-slate-400"}`} />
                                <span className={`text-[10px] font-bold relative z-10 transition-colors duration-300 ${active ? "text-white" : "text-slate-400"}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
