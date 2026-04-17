"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";

interface SuccessFolioProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    details?: string;
    subDetails?: string;
    actionLabel?: string;
}

export const SuccessFolio = ({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    details, 
    subDetails,
    actionLabel = "Finalize Document"
}: SuccessFolioProps) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#1F1F1F]/40 backdrop-blur-md"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    className="relative bg-[#FDFBF9] rounded-[48px] p-12 max-w-md w-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-white/40 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Sparkles className="w-32 h-32 text-[#CFA46A]" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                            className="w-24 h-24 bg-[#1F1F1F] rounded-[32px] flex items-center justify-center mb-10 shadow-2xl relative"
                        >
                            <div className="absolute inset-0 rounded-[32px] bg-[#CFA46A]/20 blur-xl animate-pulse" />
                            <Check className="w-10 h-10 text-[#CFA46A] relative z-10" />
                        </motion.div>
                        
                        <h3 className="text-4xl font-serif font-bold text-[#1F1F1F] mb-4 tracking-tight leading-none">{title}</h3>
                        <p className="text-[15px] text-slate-500 font-medium mb-10 leading-relaxed px-2">{message}</p>
                        
                        {details && (
                            <div className="w-full bg-white/40 border border-black/[0.03] rounded-[36px] p-10 mb-10 shadow-sm relative group overflow-hidden">
                                <span className="text-[10px] font-bold text-[#CFA46A] uppercase tracking-[0.4em] block mb-4 opacity-70">Registry Detail</span>
                                <div className="text-2xl font-serif font-bold text-[#1F1F1F] tracking-wide relative z-10 uppercase">{details}</div>
                                {subDetails && (
                                    <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
                                        <div className="w-1 h-1 rounded-full bg-[#CFA46A]" />
                                        <div className="text-[9px] text-[#1F1F1F] font-bold uppercase tracking-[0.2em]">{subDetails}</div>
                                        <div className="w-1 h-1 rounded-full bg-[#CFA46A]" />
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <button
                            onClick={onClose}
                            className="w-full py-6 bg-[#1F1F1F] text-[#CFA46A] rounded-[28px] font-bold text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-[#CFA46A] hover:text-[#1F1F1F] transition-all duration-500 active:scale-[0.98]"
                        >
                            {actionLabel}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);
