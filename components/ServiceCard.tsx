"use client";

import React from "react";
import { motion } from "framer-motion";

interface ServiceCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
    delay?: number;
}

export function ServiceCard({ icon, title, description, onClick, delay = 0 }: ServiceCardProps) {
    return (
        <motion.button
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: delay,
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1]
            }}
            onClick={onClick}
            className="group flex flex-col items-center justify-center p-6 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 border border-slate-100 text-center w-full aspect-square relative overflow-hidden"
        >
            {/* Subtle Gradient Background on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="text-blue-600 mb-4 text-4xl transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                {icon}
            </div>

            <h3 className="font-bold text-slate-800 text-sm tracking-tight relative z-10">{title}</h3>

            {description && (
                <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-widest relative z-10">
                    {description}
                </p>
            )}
        </motion.button>
    );
}
