"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
    message: string;
    type?: "success" | "error";
    isVisible: boolean;
    onClose: () => void;
}

export function Toast({ message, type = "success", isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-48px)] max-w-sm"
                >
                    <div className={`glass-dark rounded-[24px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between border ${
                        type === "success" ? "border-[#CFA46A]/30" : "border-rose-500/30"
                    }`}>
                        <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                type === "success" ? "bg-[#CFA46A]/10" : "bg-rose-500/10"
                            }`}>
                                {type === "success" ? (
                                    <CheckCircle className="w-5 h-5 text-[#CFA46A]" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-rose-500" />
                                )
                            }
                            </div>
                            <p className="text-[11px] font-bold text-white uppercase tracking-[0.1em]">{message}</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors shrink-0 ml-4"
                        >
                            <X className="w-4 h-4 text-white/20" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
