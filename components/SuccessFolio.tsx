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
                    className="absolute inset-0 bg-[#1F1F1F]/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-[#FDFBF9] rounded-[48px] p-10 max-w-md w-full shadow-2xl border border-white/20 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sparkles className="w-24 h-24 text-[#CFA46A]" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-[#1F1F1F] rounded-[32px] flex items-center justify-center mb-8 shadow-xl">
                            <Check className="w-10 h-10 text-[#CFA46A]" />
                        </div>
                        
                        <h3 className="text-3xl font-serif font-bold text-[#1F1F1F] mb-4 tracking-tight">{title}</h3>
                        <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed px-4">{message}</p>
                        
                        {details && (
                            <div className="w-full bg-[#FDFBF9] border border-black/[0.05] rounded-[32px] p-8 mb-8 shadow-sm">
                                <span className="text-[10px] font-black text-[#CFA46A]/60 uppercase tracking-[0.3em] block mb-3">Registry Detail</span>
                                <div className="text-3xl font-serif font-bold text-[#1F1F1F] tracking-[0.05em]">{details}</div>
                                {subDetails && <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">{subDetails}</div>}
                            </div>
                        )}
                        
                        <button
                            onClick={onClose}
                            className="w-full py-5 bg-[#1F1F1F] text-[#CFA46A] rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all hover:bg-[#CFA46A] hover:text-[#1F1F1F]"
                        >
                            {actionLabel}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);
