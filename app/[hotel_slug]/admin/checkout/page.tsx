"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useSupabaseRequests, HotelRequest, useHotelBranding, settleRoomRequests, checkOutRoomByNumber, getActiveGuestByRoom } from "@/utils/store";
import { Receipt, CreditCard, CheckCircle, ChevronRight, Search, Printer, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HotelLogo } from "@/components/HotelLogo";

export default function AdminCheckoutPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const requests = useSupabaseRequests(branding?.id);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [isSettling, setIsSettling] = useState(false);

    const handlePrint = () => {
        console.log("Printing Admin Invoice...");
        window.print();
    };

    // Group billing by room
    // Side bar shows rooms that have unpaid items
    const pendingBillRooms = Array.from(new Set(requests.filter(r => (r.price || 0) > 0 && !r.is_paid).map(r => r.room)));

    // For the detail view of a SELECTED room, we want to see EVERYTHING (paid and unpaid)
    // but only if it matches our room. We'll filter this inside the render.
    const allBilledRequests = requests.filter(r => (r.price || 0) > 0);

    const filteredRooms = pendingBillRooms.filter(room => room.includes(searchQuery));

    const getRoomTotal = (room: string) => {
        return allBilledRequests
            .filter(r => r.room === room && !r.is_paid)
            .reduce((sum, r) => sum + (r.total || 0), 0);
    };

    const getRoomRequests = (room: string) => {
        return allBilledRequests.filter(r => r.room === room);
    };

    const finalizeCheckout = async (roomNumber: string) => {
        if (!branding?.id) return;
        setIsSettling(true);

        // 0. Get guest info BEFORE they are cleared from the room
        const { data: guestData } = await getActiveGuestByRoom(branding.id, roomNumber);

        // 1. Mark financial requests as paid
        await settleRoomRequests(branding.id, roomNumber);

        // 2. Clear the room PIN and mark as unoccupied using room number directly
        await checkOutRoomByNumber(branding.id, roomNumber);

        setIsSettling(false);

        // 3. Trigger WhatsApp feedback if configured and guest has a phone
        if (guestData?.phone && (branding.checkoutMessage || branding.googleReviewLink)) {
            const message = `${branding.checkoutMessage || "Thank you for staying with us! Please share your feedback: "}\n\n${branding.googleReviewLink || ""}`.trim();
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${guestData.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        }

        // Removed setSelectedRoom(null) so it doesn't disappear immediately
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight" style={{ color: branding?.primaryColor }}>Financial Terminal</h1>
                    <p className="text-slate-500 font-medium">Processing room checkouts & audits</p>
                </div>

                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search Room..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Room List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Active Room Bills</h3>
                    {filteredRooms.length > 0 ? (
                        filteredRooms.map(room => (
                            <button
                                key={room}
                                onClick={() => setSelectedRoom(room)}
                                className={`w-full p-6 rounded-[2rem] border transition-all text-left flex items-center justify-between group ${selectedRoom === room ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-200' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                style={selectedRoom === room ? { backgroundColor: branding?.primaryColor, borderColor: branding?.primaryColor } : {}}
                            >
                                <div className="flex items-center">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black mr-4 ${selectedRoom === room ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                        {room}
                                    </div>
                                    <div>
                                        <p className={`font-black ${selectedRoom === room ? 'text-white' : 'text-slate-900'}`}>Room {room}</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedRoom === room ? 'text-slate-400/60' : 'text-slate-400'}`}>
                                            {getRoomRequests(room).length} items
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-black ${selectedRoom === room ? 'text-white' : 'text-blue-600'}`} style={selectedRoom !== room ? { color: branding?.primaryColor } : {}}>
                                        ₹{getRoomTotal(room).toFixed(2)}
                                    </p>
                                    <ChevronRight className={`w-4 h-4 ml-auto mt-1 ${selectedRoom === room ? 'text-white/20' : 'text-slate-200 group-hover:text-slate-400'}`} />
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                            <p className="text-slate-400 font-bold italic">No active bills found.</p>
                        </div>
                    )}
                </div>

                {/* Bill Detail View */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {selectedRoom ? (
                            <motion.div
                                key={selectedRoom}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.04)] overflow-hidden h-fit"
                            >
                                <div className="p-10 border-b border-slate-50 flex items-center justify-between relative overflow-hidden" style={{ borderBottomColor: `${branding?.primaryColor}10` }}>
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Star className="w-32 h-32 text-slate-900 rotate-12" style={{ color: branding?.primaryColor }} />
                                    </div>
                                    <div className="flex items-center relative z-10">
                                        <div className="p-4 bg-slate-900 text-white rounded-3xl mr-6 shadow-xl shadow-slate-200" style={{ backgroundColor: branding?.primaryColor }}>
                                            <HotelLogo name="" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Room {selectedRoom}</h2>
                                            <p className="text-slate-400 font-medium lowercase tracking-tighter italic">Signature Experience • #RT-{selectedRoom}-INV</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center px-6 py-3 bg-slate-50 text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-colors border border-slate-100 no-print"
                                    >
                                        <Printer className="w-5 h-5 mr-3" /> Print Invoice
                                    </button>
                                </div>

                                <div className="p-10 print-area relative">
                                    {isSettling && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-10"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", damping: 10 }}
                                                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-100"
                                            >
                                                <CheckCircle className="w-12 h-12 text-white" />
                                            </motion.div>
                                            <h3 className="text-3xl font-black text-slate-900">Transaction Settled</h3>
                                            <p className="text-slate-500 font-medium mt-2">Inventory updated & room cleared.</p>
                                        </motion.div>
                                    )}

                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {getRoomRequests(selectedRoom).map(req => (
                                                <tr key={req.id}>
                                                    <td className="py-6 pr-6">
                                                        <p className="font-bold text-slate-800">{req.type}</p>
                                                        {req.notes && (
                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                {req.notes.split(',').map((note, i) => (
                                                                    <span key={i} className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border border-blue-100">
                                                                        {note.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tighter font-bold">{req.time} • {req.is_paid ? 'PAID' : 'PENDING'}</p>
                                                    </td>
                                                    <td className="py-6 text-right font-black text-slate-900">
                                                        ₹{(req.total || 0).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="mt-10 p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200" style={{ backgroundColor: branding?.primaryColor }}>
                                        <div className="space-y-4 opacity-70 font-bold">
                                            <div className="flex justify-between">
                                                <span>Accomodation Charges</span>
                                                <span>₹{getRoomTotal(selectedRoom).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Estimated GST (12.0%)</span>
                                                <span>₹{(getRoomTotal(selectedRoom) * 0.12).toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Total Settlement</p>
                                                <p className="text-4xl font-black mt-1 tracking-tighter italic">₹{(getRoomTotal(selectedRoom) * 1.12).toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Status</p>
                                                <p className="text-sm font-bold text-green-400 flex items-center justify-end mt-1">
                                                    <CheckCircle className="w-4 h-4 mr-2" /> Verified
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 grid grid-cols-2 gap-4 no-print">
                                        <button className="py-5 rounded-[1.5rem] border border-slate-200 text-slate-600 font-black hover:bg-slate-50 transition-colors active:scale-95">
                                            Void Transaction
                                        </button>
                                        <button
                                            onClick={() => finalizeCheckout(selectedRoom)}
                                            disabled={isSettling}
                                            className="py-5 rounded-[1.5rem] bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center justify-center disabled:opacity-50"
                                            style={{ backgroundColor: branding?.accentColor || branding?.primaryColor }}
                                        >
                                            {isSettling ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                            ) : (
                                                <CreditCard className="w-5 h-5 mr-3" />
                                            )}
                                            {isSettling ? "Settling..." : "Mark as Paid"}
                                        </button>
                                    </div>
                                    <p className="mt-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest no-print">
                                        Generated by Antigravity OS v2.0
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2.5rem] p-20">
                                <Receipt className="w-20 h-20 text-slate-200 mb-6" />
                                <h3 className="text-2xl font-black text-slate-400">Select a room to<br />audit the bill</h3>
                                <p className="text-slate-300 mt-4 max-w-xs">Audit costs, taxes, and service charges before final resolution.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
