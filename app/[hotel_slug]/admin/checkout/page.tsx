"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useSupabaseRequests, HotelRequest, useHotelBranding, settleRoomRequests, checkOutRoomByNumber } from "@/utils/store";
import { Receipt, CreditCard, CheckCircle, ChevronRight, Search, Printer, IndianRupee, Sparkles, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCheckoutPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const requests = useSupabaseRequests(branding?.id);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [isSettling, setIsSettling] = useState(false);

    const pendingBillRooms = Array.from(new Set(requests.filter(r => (r.price || 0) > 0 && !r.is_paid).map(r => r.room)));
    const allBilledRequests = requests.filter(r => (r.price || 0) > 0);
    const filteredRooms = pendingBillRooms.filter(room => room.includes(searchQuery));

    const getRoomTotal = (room: string) =>
        allBilledRequests.filter(r => r.room === room && !r.is_paid).reduce((sum, r) => sum + (r.total || 0), 0);

    const getRoomRequests = (room: string) => allBilledRequests.filter(r => r.room === room);

    const subtotal = selectedRoom ? getRoomTotal(selectedRoom) : 0;
    const gst = subtotal * 0.12;
    const grandTotal = subtotal + gst;

    const handlePrint = () => {
        if (!selectedRoom || !branding) return;
        const roomRequests = getRoomRequests(selectedRoom);
        const now = new Date();
        const invoiceDate = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
        const invoiceNo = `INV-${selectedRoom}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

        const itemRows = roomRequests.map(req => `
            <tr>
                <td style="padding:14px 0; border-bottom:1px solid #F0EDE8; vertical-align:top;">
                    <p style="font-weight:700; color:#1F1F1F; margin:0 0 4px;">${req.type}</p>
                    ${req.notes ? `<p style="font-size:11px; color:#999; margin:0;">${req.notes}</p>` : ""}
                    <p style="font-size:10px; color:#CFA46A; margin:4px 0 0; text-transform:uppercase; letter-spacing:0.05em;">${req.time} • ${req.is_paid ? "Paid" : "Pending"}</p>
                </td>
                <td style="padding:14px 0; border-bottom:1px solid #F0EDE8; text-align:right; font-weight:800; color:#1F1F1F; vertical-align:top;">₹${(req.total || 0).toFixed(2)}</td>
            </tr>
        `).join("");

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Invoice – Room ${selectedRoom} | ${branding.name}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800&display=swap');
                    * { margin:0; padding:0; box-sizing:border-box; }
                    body { font-family:'Inter', sans-serif; background:#FDFBF9; color:#1F1F1F; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
                    .page { max-width:680px; margin:0 auto; padding:60px 48px; }
                    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:48px; padding-bottom:32px; border-bottom:2px solid #1F1F1F; }
                    .hotel-name { font-family:'Playfair Display', serif; font-size:28px; font-weight:900; color:#1F1F1F; }
                    .hotel-tagline { font-size:11px; color:#CFA46A; text-transform:uppercase; letter-spacing:0.25em; margin-top:4px; }
                    .invoice-label { text-align:right; }
                    .invoice-label h2 { font-family:'Playfair Display', serif; font-size:20px; font-weight:900; color:#1F1F1F; }
                    .invoice-label p { font-size:11px; color:#999; margin-top:4px; }
                    .meta { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:40px; }
                    .meta-block p.label { font-size:10px; font-weight:800; color:#CFA46A; text-transform:uppercase; letter-spacing:0.2em; margin-bottom:6px; }
                    .meta-block p.value { font-size:15px; font-weight:700; color:#1F1F1F; }
                    .meta-block p.sub { font-size:12px; color:#999; margin-top:2px; }
                    .items-table { width:100%; border-collapse:collapse; margin-bottom:32px; }
                    .items-table thead tr th { font-size:10px; font-weight:800; color:#999; text-transform:uppercase; letter-spacing:0.15em; padding:0 0 14px; border-bottom:2px solid #1F1F1F; }
                    .items-table thead tr th:last-child { text-align:right; }
                    .totals { background:#1F1F1F; border-radius:24px; padding:32px; color:white; margin-top:8px; }
                    .totals-row { display:flex; justify-content:space-between; font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); margin-bottom:12px; }
                    .totals-divider { height:1px; background:rgba(255,255,255,0.1); margin:16px 0; }
                    .totals-grand { display:flex; justify-content:space-between; align-items:baseline; }
                    .totals-grand .label { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.2em; color:rgba(255,255,255,0.5); }
                    .totals-grand .amount { font-family:'Playfair Display', serif; font-size:36px; font-weight:900; color:white; }
                    .footer { margin-top:48px; padding-top:24px; border-top:1px solid #EDEAE5; display:flex; justify-content:space-between; align-items:center; }
                    .footer p { font-size:10px; color:#CCC; text-transform:uppercase; letter-spacing:0.15em; }
                    .gold-dot { width:8px; height:8px; background:#CFA46A; border-radius:50%; display:inline-block; margin-right:6px; }
                    @media print {
                        body { background:white; }
                        .page { padding:40px; }
                        @page { margin:0; size:A4; }
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="header">
                        <div>
                            <p class="hotel-name">${branding.name}</p>
                            <p class="hotel-tagline">${branding.city || "Boutique Property"}</p>
                        </div>
                        <div class="invoice-label">
                            <h2>Tax Invoice</h2>
                            <p>${invoiceNo}</p>
                            <p style="margin-top:4px;">${invoiceDate}</p>
                        </div>
                    </div>

                    <div class="meta">
                        <div class="meta-block">
                            <p class="label">Billed To</p>
                            <p class="value">Room ${selectedRoom}</p>
                            <p class="sub">Guest Stay • ${branding.name}</p>
                        </div>
                        <div class="meta-block" style="text-align:right;">
                            <p class="label">Payment Status</p>
                            <p class="value" style="color:#CFA46A;">Due on Checkout</p>
                            <p class="sub">Settle at front desk</p>
                        </div>
                    </div>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th style="text-align:left;">Description</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>${itemRows}</tbody>
                    </table>

                    <div class="totals">
                        <div class="totals-row"><span>Service Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
                        <div class="totals-row"><span>GST (12%)</span><span>₹${gst.toFixed(2)}</span></div>
                        <div class="totals-divider"></div>
                        <div class="totals-grand">
                            <div>
                                <p class="label">Total Payable</p>
                            </div>
                            <p class="amount">₹${grandTotal.toFixed(2)}</p>
                        </div>
                    </div>

                    <div class="footer">
                        <p><span class="gold-dot"></span>${branding.name} • ${branding.receptionPhone || "Reception: Dial 0"}</p>
                        <p>Thank you for your stay</p>
                    </div>
                </div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const finalizeCheckout = async (roomNumber: string) => {
        if (!branding?.id) return;
        setIsSettling(true);
        await settleRoomRequests(branding.id, roomNumber);
        await checkOutRoomByNumber(branding.id, roomNumber);
        setIsSettling(false);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <p className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.3em] mb-2">Billing & Invoices</p>
                    <h1 className="text-4xl font-serif font-black text-[#1F1F1F]">Financial Folio</h1>
                    <p className="text-slate-400 font-medium mt-1">Room charges, GST computation & invoice settlement</p>
                </div>
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search room..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-black/[0.04] rounded-2xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-1 ring-[#CFA46A]/30 transition-all outline-none shadow-sm"
                    />
                    <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Room List */}
                <div className="lg:col-span-1 space-y-3">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1 mb-4">Pending Bills</p>
                    {filteredRooms.length > 0 ? filteredRooms.map(room => (
                        <motion.button
                            key={room}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedRoom(room)}
                            className={`w-full p-6 rounded-[28px] border transition-all text-left flex items-center justify-between group ${
                                selectedRoom === room
                                    ? "bg-[#1F1F1F] border-[#1F1F1F] shadow-xl"
                                    : "bg-white border-black/[0.03] hover:border-[#CFA46A]/30 shadow-sm"
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-black text-lg ${
                                    selectedRoom === room ? "bg-white/10 text-[#CFA46A]" : "bg-[#FDFBF9] text-[#1F1F1F]"
                                }`}>
                                    {room}
                                </div>
                                <div>
                                    <p className={`font-black text-sm ${selectedRoom === room ? "text-white" : "text-[#1F1F1F]"}`}>Room {room}</p>
                                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${selectedRoom === room ? "text-white/30" : "text-slate-300"}`}>
                                        {getRoomRequests(room).length} items
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-base font-black font-serif ${selectedRoom === room ? "text-[#CFA46A]" : "text-[#1F1F1F]"}`}>
                                    ₹{getRoomTotal(room).toFixed(0)}
                                </p>
                                <ChevronRight className={`w-4 h-4 ml-auto mt-1 transition-colors ${selectedRoom === room ? "text-white/20" : "text-slate-200 group-hover:text-[#CFA46A]"}`} />
                            </div>
                        </motion.button>
                    )) : (
                        <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-[28px]">
                            <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">No pending bills</p>
                        </div>
                    )}
                </div>

                {/* Invoice Detail */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {selectedRoom ? (
                            <motion.div
                                key={selectedRoom}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                className="bg-white rounded-[40px] border border-black/[0.03] shadow-[0_30px_80px_rgba(0,0,0,0.04)] overflow-hidden"
                            >
                                {/* Invoice Header */}
                                <div className="p-8 border-b border-black/[0.03] flex items-start justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.3em] mb-2">Tax Invoice</p>
                                        <h2 className="text-3xl font-serif font-black text-[#1F1F1F]">{branding?.name || "Hotel"}</h2>
                                        <p className="text-sm text-slate-400 font-medium mt-1">{branding?.city || "Boutique Property"}</p>
                                    </div>
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center gap-2 px-5 py-3 bg-[#FDFBF9] border border-black/[0.04] text-[#1F1F1F] font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-[#1F1F1F] hover:text-white transition-all shadow-sm"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print Invoice
                                    </button>
                                </div>

                                {/* Room + Date Meta */}
                                <div className="px-8 py-6 grid grid-cols-3 gap-6 border-b border-black/[0.03] bg-[#FDFBF9]/50">
                                    {[
                                        { label: "Room", value: selectedRoom, sub: "Unit Number" },
                                        { label: "Invoice Date", value: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), sub: "Generated Today" },
                                        { label: "Status", value: "Due", sub: "Settle at desk", gold: true },
                                    ].map((m) => (
                                        <div key={m.label}>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">{m.label}</p>
                                            <p className={`font-black text-base font-serif ${m.gold ? "text-[#CFA46A]" : "text-[#1F1F1F]"}`}>{m.value}</p>
                                            <p className="text-[10px] text-slate-300 mt-0.5">{m.sub}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-8 relative">
                                    {isSettling && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-b-[40px]"
                                        >
                                            <div className="w-20 h-20 bg-[#1F1F1F] rounded-[24px] flex items-center justify-center mb-6 shadow-2xl">
                                                <CheckCircle className="w-10 h-10 text-[#CFA46A]" />
                                            </div>
                                            <h3 className="text-2xl font-serif font-black text-[#1F1F1F]">Bill Settled</h3>
                                            <p className="text-slate-400 font-medium mt-2 text-sm">Room cleared & inventory updated</p>
                                        </motion.div>
                                    )}

                                    {/* Line Items */}
                                    <table className="w-full text-left mb-8">
                                        <thead>
                                            <tr className="border-b-2 border-[#1F1F1F]">
                                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getRoomRequests(selectedRoom).map(req => (
                                                <tr key={req.id} className="border-b border-[#F0EDE8]">
                                                    <td className="py-5 pr-6">
                                                        <p className="font-black text-[#1F1F1F] text-sm">{req.type}</p>
                                                        {req.notes && (
                                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                                {req.notes.split(',').map((note, i) => (
                                                                    <span key={i} className="text-[9px] bg-[#FDFBF9] text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border border-black/[0.04]">
                                                                        {note.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <p className="text-[10px] text-slate-300 mt-2 font-bold uppercase tracking-wider">
                                                            {req.time} • <span className={req.is_paid ? "text-emerald-400" : "text-[#CFA46A]"}>{req.is_paid ? "Paid" : "Pending"}</span>
                                                        </p>
                                                    </td>
                                                    <td className="py-5 text-right font-serif font-black text-[#1F1F1F]">
                                                        ₹{(req.total || 0).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Totals */}
                                    <div className="bg-[#1F1F1F] rounded-[28px] p-7 text-white">
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-sm font-semibold text-white/50">
                                                <span>Service Subtotal</span>
                                                <span>₹{subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-semibold text-white/50">
                                                <span>GST (12%)</span>
                                                <span>₹{gst.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="border-t border-white/10 pt-6 flex justify-between items-end">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Total Payable</p>
                                                <p className="text-4xl font-serif font-black text-white">₹{grandTotal.toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Tax Ref</p>
                                                <p className="text-xs font-black text-[#CFA46A]">
                                                    INV-{selectedRoom}-{new Date().getFullYear()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 flex gap-4">
                                        <button
                                            onClick={handlePrint}
                                            className="flex-1 py-4 rounded-[20px] border border-black/[0.05] bg-[#FDFBF9] text-[#1F1F1F] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#F0EDE8] transition-all flex items-center justify-center gap-2"
                                        >
                                            <Printer className="w-4 h-4" />
                                            Print Invoice
                                        </button>
                                        <button
                                            onClick={() => finalizeCheckout(selectedRoom)}
                                            disabled={isSettling}
                                            className="flex-2 flex-grow py-4 rounded-[20px] bg-[#1F1F1F] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSettling ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <CreditCard className="w-4 h-4" />
                                            )}
                                            {isSettling ? "Settling..." : "Mark as Paid"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-100 rounded-[40px] p-20">
                                <Receipt className="w-16 h-16 text-slate-200 mb-6" />
                                <h3 className="text-2xl font-serif font-black text-slate-300">Select a room<br />to view invoice</h3>
                                <p className="text-slate-300 mt-3 text-sm font-medium max-w-xs">All charges, GST, and service items appear here before settlement.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
