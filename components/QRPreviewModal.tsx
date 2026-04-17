"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, Share2 } from "lucide-react";
import QRCode from "react-qr-code";

interface QRPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomNumber: string;
    hotelName?: string;
    guestUrl: string;
    pin?: string | null;
}

export function QRPreviewModal({ isOpen, onClose, roomNumber, hotelName, guestUrl, pin }: QRPreviewModalProps) {
    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const svgEl = document.getElementById("qr-preview-svg");
        const svgContent = svgEl ? svgEl.outerHTML : "";

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR – Room ${roomNumber}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Georgia', serif;
                        background: #fff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        padding: 40px;
                    }
                    .card {
                        border: 2px solid #1F1F1F;
                        border-radius: 24px;
                        padding: 48px;
                        display: inline-flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 24px;
                        max-width: 380px;
                        width: 100%;
                    }
                    .hotel { font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #888; font-family: sans-serif; }
                    .room-label { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #CFA46A; font-family: sans-serif; margin-top: 4px; }
                    .room-num { font-size: 48px; font-weight: 900; color: #1F1F1F; line-height: 1; }
                    .qr-wrap { background: #fff; padding: 12px; border-radius: 16px; border: 1px solid #eee; }
                    .instruction { font-size: 11px; color: #888; font-family: sans-serif; text-align: center; letter-spacing: 0.05em; }
                    ${pin ? `.pin-box { border: 1px solid #eee; border-radius: 12px; padding: 12px 24px; text-align: center; }
                    .pin-label { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: #CFA46A; font-family: sans-serif; }
                    .pin-val { font-size: 28px; font-weight: 900; letter-spacing: 0.15em; color: #1F1F1F; font-family: 'Georgia', serif; }` : ""}
                    .divider { width: 40px; height: 1px; background: #eee; }
                    @media print { body { -webkit-print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div class="card">
                    <div>
                        <p class="hotel">${hotelName || "MangoH"}</p>
                        <p class="room-label">Unit Registry</p>
                        <p class="room-num">${roomNumber}</p>
                    </div>
                    <div class="qr-wrap">${svgContent}</div>
                    <p class="instruction">Scan to access your digital guest folio</p>
                    ${pin ? `<div class="divider"></div>
                    <div class="pin-box">
                        <p class="pin-label">Access PIN</p>
                        <p class="pin-val">${pin}</p>
                    </div>` : ""}
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 300);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#1F1F1F]/70 backdrop-blur-2xl"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 30 }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        className="relative w-full max-w-sm bg-[#FDFBF9] rounded-[48px] shadow-[0_80px_160px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20"
                    >
                        {/* Gold accent */}
                        <div className="h-1 w-full bg-[#CFA46A]" />

                        <div className="p-10 flex flex-col items-center">
                            {/* Header */}
                            <p className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.4em] mb-2">Guest Portal</p>
                            <h3 className="text-4xl font-serif font-black text-[#1F1F1F] leading-none mb-1">
                                Room {roomNumber}
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                                {hotelName || "Digital Folio Access"}
                            </p>

                            {/* QR */}
                            <div className="bg-white p-5 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-black/[0.03] mb-8">
                                <QRCode
                                    id="qr-preview-svg"
                                    value={guestUrl}
                                    size={200}
                                    fgColor="#1F1F1F"
                                    bgColor="white"
                                />
                            </div>

                            <p className="text-[11px] font-medium text-slate-400 text-center mb-8 leading-relaxed">
                                Scan to access the digital<br />guest folio & request services
                            </p>

                            {/* PIN if available */}
                            {pin && (
                                <div className="w-full bg-[#1F1F1F] rounded-[24px] p-5 text-center mb-8">
                                    <p className="text-[9px] font-black text-[#CFA46A] uppercase tracking-[0.3em] mb-1">Access PIN</p>
                                    <p className="text-3xl font-serif font-black text-white tracking-[0.15em]">{pin}</p>
                                </div>
                            )}

                            {/* Print button */}
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={handlePrint}
                                className="w-full py-4 bg-[#1F1F1F] text-white rounded-[20px] flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-[0.25em] shadow-xl hover:brightness-110 transition-all"
                            >
                                <Printer className="w-4 h-4" />
                                Print QR Folio
                            </motion.button>
                        </div>

                        {/* Close */}
                        <button
                            onClick={onClose}
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
