"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ServiceCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
    delay?: number;
    featured?: boolean;
    image?: string;
}

export function ServiceCard({ icon, title, description, onClick, delay = 0, featured = false, image }: ServiceCardProps) {
    if (featured) {
        return (
            <motion.button
                whileHover={{ y: -12, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    delay: delay,
                    duration: 0.8,
                    ease: [0.23, 1, 0.32, 1]
                }}
                onClick={onClick}
                className="group relative w-full h-64 rounded-[48px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-black/[0.03] text-left"
            >
                {/* Cinematic Background */}
                <div className="absolute inset-0 bg-white overflow-hidden">
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out opacity-90"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-[#FDFBF9] group-hover:scale-105 transition-transform duration-1000"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F]/80 via-[#1F1F1F]/20 to-transparent"></div>
                </div>

                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
                            {icon}
                        </div>
                        <span className="bg-[#CFA46A] px-4 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-[0.2em] shadow-lg">Boutique Pick</span>
                    </div>
                    <h3 className="text-3xl font-serif font-black text-white mb-2 leading-none">{title}</h3>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{description}</p>
                </div>
            </motion.button>
        );
    }

    return (
        <motion.button
            whileHover={{ y: -8, scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: delay,
                duration: 0.6,
                ease: [0.23, 1, 0.32, 1]
            }}
            onClick={onClick}
            className="group flex flex-col items-center justify-center p-8 bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-700 border border-black/[0.01] text-center w-full aspect-square relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-[#CFA46A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-5 group-hover:scale-150 transition-all duration-1000 text-[#CFA46A]">
                <Sparkles className="w-20 h-20" />
            </div>

            <div className="text-[#1F1F1F] mb-6 text-4xl transform group-hover:scale-110 group-hover:text-[#CFA46A] transition-all duration-700 relative z-10 opacity-70 group-hover:opacity-100">
                {icon}
            </div>

            <h3 className="font-serif font-black text-[#1F1F1F] text-sm tracking-tight relative z-10 uppercase">{title}</h3>

            {description && (
                <p className="text-[8px] text-slate-300 mt-3 font-black uppercase tracking-[0.2em] relative z-10 group-hover:text-[#CFA46A]/60 transition-colors">
                    {description}
                </p>
            )}
            
            <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-2 group-hover:translate-y-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CFA46A] animate-pulse" />
            </div>
        </motion.button>
    );
}
