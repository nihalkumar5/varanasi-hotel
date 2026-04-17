"use client";

import React, { useState } from "react";
import { ArrowLeft, Receipt, CreditCard, CheckCircle, ChevronRight, Download, History, Printer } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useSupabaseRequests, addSupabaseRequest, useHotelBranding } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { SuccessFolio } from "@/components/SuccessFolio";

export default function BillPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { roomNumber, checkedInAt } = useGuestRoom();
    const { branding } = useHotelBranding(hotelSlug);
    const requests = useSupabaseRequests(branding?.id, roomNumber, checkedInAt);

    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [folioState, setFolioState] = useState<{ open: boolean, title: string, message: string, details?: string, actionLabel?: string }>({
        open: false, title: "", message: ""
    });

    const handlePrint = () => {
        window.print();
    };

    // Filter requests for the current room and session
    const roomRequests = requests.filter(r =>
        r.room === roomNumber &&
        (r.price || 0) > 0 &&
        (!checkedInAt || r.timestamp >= checkedInAt)
    );
    const totalAmount = roomRequests.reduce((sum, r) => sum + (r.total || 0), 0);
    const taxAmount = totalAmount * 0.12; // 12% mock tax
    const grandTotal = totalAmount + taxAmount;

    const handleCheckout = async () => {
        if (!branding?.id) return;
        setIsCheckingOut(true);
        
        // Simulate processing for premium feel
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { error } = await addSupabaseRequest(branding.id, {
            room: roomNumber,
            type: "Checkout Requested",
            notes: `Guest finalized folio: ₹${grandTotal.toFixed(2)}`,
            status: "Pending",
            price: grandTotal,
            total: grandTotal
        });

        setIsCheckingOut(false);
        
        if (error) {
            setFolioState({
                open: true,
                title: "Request Delayed",
                message: "We encountered a small issue syncing your folio. Please try again or contact the front desk.",
            });
        } else {
            setFolioState({
                open: true,
                title: "Checkout Requested",
                message: "We've received your request. Our team is preparing your documents and will notify you shortly.",
                actionLabel: "Done"
            });
        }
    };

    return (
        <div className="pb-32 px-6 pt-12">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-12 no-print">
                <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white border border-black/[0.03] flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                    <ArrowLeft className="w-5 h-5 text-[#1F1F1F]" />
                </button>
                <div className="text-center">
                    <h1 className="text-sm font-black text-[#1F1F1F] uppercase tracking-[0.2em]">Account Ledger</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Room {roomNumber}</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="w-12 h-12 rounded-2xl bg-white border border-black/[0.03] flex items-center justify-center text-slate-400 hover:text-[#1F1F1F] transition-colors"
                >
                    <Download className="w-5 h-5" />
                </button>
            </div>

            <div className="print-area">
                {/* 1. High-Contrast Summary Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#1F1F1F] rounded-[48px] p-10 text-white mb-12 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.2)]"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <Receipt className="w-40 h-40 text-[#CFA46A]" />
                    </div>
                    
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Total Outstanding</p>
                        <h2 className="text-6xl font-serif font-black tracking-tight mb-10 text-[#CFA46A]">
                            ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h2>
                        
                        <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <History className="w-4 h-4 text-slate-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Session</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-[#CFA46A]/10 rounded-full">
                                <span className="text-[8px] font-black text-[#CFA46A] uppercase tracking-widest">Active Ledger</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Detailed Ledger Items */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h3 className="text-sm font-black text-[#1F1F1F] uppercase tracking-[0.3em]">Operational Folio</h3>
                        <span className="text-[10px] text-slate-400 font-bold">{roomRequests.length} Items</span>
                    </div>

                    <div className="space-y-4">
                        {roomRequests.length > 0 ? (
                            roomRequests.map((req, index) => (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white p-6 rounded-[32px] border border-black/[0.02] flex items-center justify-between shadow-sm group hover:border-[#CFA46A]/20 transition-all"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-[#FDFBF9] flex items-center justify-center text-slate-400 group-hover:text-[#CFA46A] transition-colors">
                                            <Receipt className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#1F1F1F] text-xs uppercase tracking-tight">{req.type}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{req.time}</p>
                                        </div>
                                    </div>
                                    <span className="font-serif font-black text-[#1F1F1F]">₹{req.total?.toFixed(2)}</span>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-20 text-center border border-dashed border-black/5 rounded-[40px]">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Pristine Folio</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Financial Breakdown */}
                <div className="bg-[#F6F3EE] rounded-[40px] p-8 border border-[#E8DCCB]/30 space-y-4 mb-12 shadow-sm">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Ledger Subtotal</span>
                        <span className="text-[#1F1F1F]">₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Statutory Tax (12%)</span>
                        <span className="text-[#1F1F1F]">₹{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="pt-6 border-t border-black/5 flex justify-between items-center">
                        <span className="text-sm font-black text-[#1F1F1F] uppercase tracking-[0.2em]">Grand Total</span>
                        <span className="text-3xl font-serif font-black text-[#CFA46A]">
                            ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>

            {/* 4. Action Layer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FDFBF9] via-[#FDFBF9] to-transparent no-print">
                <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || grandTotal === 0}
                    className="w-full bg-[#1F1F1F] text-white py-6 rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 disabled:active:scale-100"
                >
                    {isCheckingOut ? (
                        <div className="flex items-center gap-4">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                <RefreshCw className="w-5 h-5 text-[#CFA46A]" />
                            </motion.div>
                            <span>Synchronizing...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <CreditCard className="w-5 h-5 text-[#CFA46A]" />
                            <span>Request Checkout</span>
                        </div>
                    )}
                </button>
            </div>

            <SuccessFolio 
                isOpen={folioState.open}
                onClose={() => setFolioState({...folioState, open: false})}
                title={folioState.title}
                message={folioState.message}
                details={folioState.details}
            />
        </div>
    );
}

const RefreshCw = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
);
