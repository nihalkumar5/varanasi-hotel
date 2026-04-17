"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "gold";
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const isGold = variant === "gold";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-[#1F1F1F]/60 backdrop-blur-xl"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="relative w-full max-w-sm bg-[#FDFBF9] rounded-[48px] shadow-[0_60px_120px_rgba(0,0,0,0.4)] overflow-hidden border border-white/40"
                    >
                        {/* Top accent bar */}
                        <div className={`h-1 w-full ${isGold ? "bg-[#CFA46A]" : "bg-red-400"}`} />

                        <div className="p-10">
                            {/* Icon */}
                            <div className="flex justify-center mb-8">
                                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-lg ${
                                    isGold
                                        ? "bg-[#CFA46A]/10 border border-[#CFA46A]/20"
                                        : "bg-red-50 border border-red-100"
                                }`}>
                                    <AlertTriangle className={`w-8 h-8 ${isGold ? "text-[#CFA46A]" : "text-red-400"}`} />
                                </div>
                            </div>

                            {/* Text */}
                            <div className="text-center mb-10">
                                <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 ${isGold ? "text-[#CFA46A]" : "text-red-400"}`}>
                                    Confirmation Required
                                </p>
                                <h3 className="text-2xl font-serif font-black text-[#1F1F1F] leading-tight mb-3">
                                    {title}
                                </h3>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={onConfirm}
                                    className={`w-full py-4 rounded-[20px] text-[11px] font-black uppercase tracking-[0.25em] text-white transition-all shadow-lg ${
                                        isGold
                                            ? "bg-[#CFA46A] shadow-[#CFA46A]/30 hover:brightness-110"
                                            : "bg-[#1F1F1F] shadow-black/20 hover:bg-red-500"
                                    }`}
                                >
                                    {confirmLabel}
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={onCancel}
                                    className="w-full py-4 rounded-[20px] text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 bg-white border border-black/[0.04] hover:text-[#1F1F1F] transition-colors"
                                >
                                    {cancelLabel}
                                </motion.button>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onCancel}
                            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-black/[0.04] flex items-center justify-center hover:bg-white transition-colors"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
