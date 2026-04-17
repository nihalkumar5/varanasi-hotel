"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { useEffect } from "react";
import { initAudioContext } from "@/utils/audio";
import { GuestAuthWrapper } from "./GuestAuthWrapper";

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    useEffect(() => {
        const unlock = () => {
            console.log("AudioContext unlocking...");
            initAudioContext();
        };
        window.addEventListener("click", unlock, { once: true });
        window.addEventListener("touchstart", unlock, { once: true });
        return () => {
            window.removeEventListener("click", unlock);
            window.removeEventListener("touchstart", unlock);
        };
    }, []);

    return (
        <GuestAuthWrapper>
            <div className="min-h-screen bg-[#DED9D2] flex justify-center">
                <div className="w-full max-w-[480px] min-h-screen flex flex-col overflow-x-hidden bg-[#FDFBF9] pb-24 text-[#1F1F1F] antialiased shadow-[0_0_60px_rgba(0,0,0,0.08)] border-x border-black/[0.03]">
                    <main className="relative flex-1 w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </main>

                    <BottomNav />
                </div>
            </div>
        </GuestAuthWrapper>
    );
}
