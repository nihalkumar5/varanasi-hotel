"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { StaffDashboard } from "@/components/StaffDashboard";
import { ConciergeBell, Users, LayoutGrid, List, Plus, MapPin, User, Phone, CheckCircle2, History, MessageCircle, Utensils, CreditCard, LogOut, Loader2, ArrowRight, Hotel, Printer, Key, X, Check, Sparkles, QrCode } from "lucide-react";
import { useHotelBranding, getHotelGuests, getHotelRooms, deleteGuest, Guest, Room, supabase, checkInRoom, checkOutRoom } from "@/utils/store";
import { motion, AnimatePresence } from "framer-motion";
import GuestEntryForm from "@/components/GuestEntryForm";
import { ConfirmModal } from "@/components/ConfirmModal";
import { QRPreviewModal } from "@/components/QRPreviewModal";
import QRCode from "react-qr-code";
import { buildGuestWelcomeMessage, buildWhatsAppUrl, formatWhatsAppPhone } from "@/lib/hotel/whatsapp";

// Modern Success Modal to replace alerts
const SuccessFolio = ({ isOpen, onClose, title, message, pin, roomNumber }: { isOpen: boolean, onClose: () => void, title: string, message: string, pin?: string, roomNumber?: string }) => (
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
                        <div className="w-20 h-20 bg-[#1F1F1F] rounded-[24px] flex items-center justify-center mb-8 shadow-xl">
                            <Check className="w-10 h-10 text-[#CFA46A]" />
                        </div>
                        
                        <h3 className="text-3xl font-serif font-black text-[#1F1F1F] mb-4">{title}</h3>
                        <p className="text-sm text-slate-500 font-medium italic mb-8 leading-relaxed px-4">{message}</p>
                        
                        {pin && (
                            <div className="w-full bg-white border border-black/[0.03] rounded-[32px] p-8 mb-8 shadow-sm">
                                <span className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.3em] block mb-3">Secure Booking PIN</span>
                                <div className="text-5xl font-serif font-black text-[#1F1F1F] tracking-[0.2em]">{pin}</div>
                                {roomNumber && <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Assigned to Unit {roomNumber}</div>}
                            </div>
                        )}
                        
                        <button
                            onClick={onClose}
                            className="w-full py-5 bg-[#1F1F1F] text-white rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                        >
                            Finalize Document
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export default function ReceptionPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);

    const [view, setView] = useState<'requests' | 'rooms'>('rooms');
    const [isGuestFormOpen, setIsGuestFormOpen] = useState(false);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoomNum, setSelectedRoomNum] = useState<string | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

    // Success Folio State
    const [successFolio, setSuccessFolio] = useState<{ open: boolean, title: string, message: string, pin?: string, roomNumber?: string }>({
        open: false, title: "", message: ""
    });

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState<{ open: boolean, title: string, message: string, onConfirm: () => void }>({
        open: false, title: "", message: "", onConfirm: () => {}
    });

    // QR Preview State
    const [qrPreview, setQrPreview] = useState<{ open: boolean, roomNumber: string, pin?: string | null }>({
        open: false, roomNumber: ""
    });

    const loadData = async () => {
        if (!branding?.id) return;
        setLoading(true);

        try {
            const { data: guestData } = await getHotelGuests(branding.id);
            if (guestData) setGuests(guestData);

            const { data: roomData } = await getHotelRooms(branding.id);
            if (roomData) setRooms(roomData);
        } catch (err) {
            console.error("Load Data Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (branding?.id) {
            loadData();
        }
    }, [branding?.id]);

    const handleCheckout = async (roomData: Room) => {
        if (!branding?.id) return;
        const guest = guests.find(g => g.room_number === roomData.room_number);

        setConfirmModal({
            open: true,
            title: `Finalize Unit ${roomData.room_number}`,
            message: `This will complete the departure for Unit ${roomData.room_number} and release the room for new arrivals.`,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, open: false }));

                if (guest?.phone) {
                    const defaultMsg = `Thank you for staying with us at ${branding.name}, ${guest.name}! 🙏\n\nWe hope your stay was comfortable. It was a pleasure hosting you in Room ${guest.room_number}.\n\nWe'd love to hear your feedback and hope to welcome you back soon!`;
                    let message = branding.checkoutMessage
                        ? branding.checkoutMessage
                            .replace(/{name}/g, guest.name)
                            .replace(/{hotel_name}/g, branding.name)
                            .replace(/{room}/g, guest.room_number)
                        : defaultMsg;
                    if (branding.googleReviewLink) {
                        message += `\n\n⭐ Please leave us a review:\n${branding.googleReviewLink}`;
                    }
                    window.open(`https://wa.me/${formatWhatsAppPhone(guest.phone)}?text=${encodeURIComponent(message)}`, '_blank');
                }

                await checkOutRoom(roomData.id, branding.id);
                loadData();

                setSuccessFolio({
                    open: true,
                    title: "Departure Finalized",
                    message: `Unit ${roomData.room_number} has been released and is now available for new arrivals.`,
                    roomNumber: roomData.room_number
                });
            }
        });
    };

    const handlePrintQR = (roomNumber: string) => {
        const dashboardUrl = `${window.location.origin}/${hotelSlug}/guest/dashboard?room=${roomNumber}`;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print QR - Room ${roomNumber}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=Inter:wght@400;900&display=swap');
                        body { font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #FDFBF9; color: #1F1F1F; }
                        .folio { padding: 60px; border: 1px solid #1F1F1F; border-radius: 60px; background: white; text-align: center; }
                        h1 { font-family: 'Playfair Display', serif; font-size: 72px; margin: 0; }
                        p { font-size: 14px; font-weight: 900; letter-spacing: 0.5em; text-transform: uppercase; margin: 20px 0 40px; }
                        .qr-box { padding: 40px; border: 1px solid #black; border-radius: 40px; display: inline-block; background: white; }
                    </style>
                </head>
                <body>
                    <div class="folio">
                        <h1>${roomNumber}</h1>
                        <p>Digital Concierge</p>
                        <div id="qr-target" class="qr-box"></div>
                    </div>
                    <script type="text/javascript">
                        window.onload = function() {
                            // The QR SVG is rendered here via a temporary canvas or similar
                            // For simplicity in this env, we'll assume the user prints from the UI
                            window.print();
                            window.onafterprint = function() { window.close(); };
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (view === 'requests') {
        return (
            <div className="relative min-h-screen">
                <StaffDashboard
                    hotelSlug={hotelSlug}
                    department="reception"
                    title="Reception Desk"
                    icon={<ConciergeBell className="w-8 h-8" />}
                />
                <button
                    onClick={() => setView('rooms')}
                    className="fixed bottom-8 right-8 bg-[#1F1F1F] text-white px-8 py-6 rounded-[2rem] shadow-2xl flex items-center gap-4 font-black transition-all hover:scale-105 active:scale-95 z-50 group border border-white/10"
                >
                    <LayoutGrid className="w-6 h-6 text-[#CFA46A]" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap uppercase tracking-[0.2em] text-[10px]">Front Desk Board</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#FDFBF9] font-sans pb-32">
            {/* Header section with glassmorphism */}
            <div className="px-12 py-10 border-b border-black/[0.03] bg-white/40 backdrop-blur-3xl sticky top-0 z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-[#3F7C6D] animate-pulse shadow-[0_0_10px_#3F7C6D]" />
                        <span className="text-[10px] font-black text-[#3F7C6D] uppercase tracking-[0.4em]">Live Operations</span>
                    </div>
                    <h1 className="text-4xl font-serif font-black text-[#1F1F1F] tracking-tight leading-none mb-4">
                        Front Desk Folio
                    </h1>
                    <p className="text-sm text-slate-500 max-w-2xl font-medium italic">
                        Live occupancy monitoring, arrival processing, and secure unit management.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={() => setView('requests')}
                        className="px-8 py-4 bg-white/60 border border-black/[0.03] rounded-[24px] shadow-sm backdrop-blur-xl text-[#1F1F1F] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 active:scale-95 transition-all"
                    >
                        <ConciergeBell className="w-5 h-5 text-[#CFA46A]" />
                        Service signals
                    </button>
                    <button
                        onClick={() => {
                            setSelectedRoomNum("");
                            setIsGuestFormOpen(true);
                        }}
                        className="px-8 py-4 rounded-[24px] bg-[#1F1F1F] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#CFA46A] hover:text-[#1F1F1F] transition-all flex items-center gap-3 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Acknowledge Arrival
                    </button>
                </div>
            </div>

            <div className="px-12 py-12 space-y-12 max-w-[1700px] mx-auto">
                {/* 1️⃣ Live Capacity Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Total Units', count: rooms.length, icon: Hotel, color: 'text-slate-400' },
                        { label: 'Occupied', count: rooms.filter(r => r.is_occupied).length, icon: Users, color: 'text-red-500' },
                        { label: 'Available', count: rooms.filter(r => !r.is_occupied).length, icon: CheckCircle2, color: 'text-[#3F7C6D]' },
                        { label: 'Active signals', count: guests.length, icon: MessageCircle, color: 'text-amber-500' }
                    ].map((stat, i) => (
                        <motion.div 
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-[40px] border border-black/[0.02] shadow-[0_15px_40px_rgba(31,31,31,0.03)] flex items-end justify-between"
                        >
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{stat.label}</p>
                                <h2 className="text-4xl font-serif font-black text-[#1F1F1F]">{stat.count}</h2>
                            </div>
                            <div className={`w-12 h-12 rounded-[20px] bg-[#FDFBF9] border border-black/[0.03] flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 2️⃣ Unit Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                    <AnimatePresence mode="popLayout">
                        {rooms.map((room) => {
                            const guest = guests.find(g => g.room_number === room.room_number);
                            return (
                                <motion.div
                                    key={room.id}
                                    layout
                                    className={`relative rounded-[48px] p-8 border border-black/[0.03] transition-all group ${
                                        room.is_occupied 
                                            ? 'bg-white shadow-[0_20px_50px_rgba(31,31,31,0.04)] border-[#CFA46A]/10' 
                                            : 'bg-white/40 border-dashed border-slate-200 hover:border-[#3F7C6D]/20 shadow-sm'
                                    }`}
                                >
                                    <div className="flex flex-col h-full min-h-[200px]">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Unit</span>
                                                <h3 className="text-4xl font-serif font-black text-[#1F1F1F] leading-none">{room.room_number || room.room_number}</h3>
                                            </div>
                                            <div className={`w-3.5 h-3.5 rounded-full ${room.is_occupied ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-[#3F7C6D] shadow-[0_0_15px_rgba(63,124,109,0.4)]'} animate-pulse`} />
                                        </div>

                                        {room.is_occupied ? (
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 italic font-medium">Current Resident</p>
                                                        <p className="text-sm font-black text-[#1F1F1F] truncate group-hover:text-[#CFA46A] transition-colors">{guest?.name || "Anonymous Guest"}</p>
                                                    </div>
                                                    
                                                    <div className="bg-[#FDFBF9] border border-black/[0.03] rounded-[24px] p-5 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                                            <Key className="w-10 h-10 text-[#CFA46A]" />
                                                        </div>
                                                        <p className="text-[9px] font-black text-[#CFA46A] uppercase tracking-[0.3em] mb-1">Access PIN</p>
                                                        <p className="text-2xl font-serif font-black text-[#1F1F1F] tracking-[0.1em]">{room.booking_pin || "----"}</p>
                                                    </div>
                                                </div>

                                                {/* QR Code — click to open preview */}
                                                {(() => {
                                                    const guestUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${hotelSlug}/guest/dashboard`;
                                                    return (
                                                        <button
                                                            onClick={() => setQrPreview({ open: true, roomNumber: room.room_number, pin: room.booking_pin })}
                                                            className="mt-4 w-full bg-[#FDFBF9] border border-black/[0.03] rounded-[24px] p-5 flex items-center gap-4 hover:border-[#CFA46A]/30 hover:bg-[#CFA46A]/5 transition-all group/qr cursor-pointer"
                                                        >
                                                            <div className="bg-white p-2 rounded-2xl shadow-sm border border-black/[0.02]">
                                                                <QRCode
                                                                    value={guestUrl}
                                                                    size={60}
                                                                    fgColor="#1F1F1F"
                                                                    bgColor="white"
                                                                />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-[9px] font-black text-[#CFA46A] uppercase tracking-[0.3em] mb-1">Guest Portal</p>
                                                                <p className="text-[10px] font-black text-[#1F1F1F] leading-tight">Scan to access<br/>digital folio</p>
                                                                <p className="text-[9px] text-slate-300 mt-1 group-hover/qr:text-[#CFA46A] transition-colors">Click to preview & print →</p>
                                                            </div>
                                                        </button>
                                                    );
                                                })()}

                                                <div className="flex gap-4 mt-4">
                                                    <button
                                                        onClick={() => handleCheckout(room)}
                                                        className="flex-1 h-14 bg-[#1F1F1F] text-white rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
                                                        title="Finalize Departure"
                                                    >
                                                        Finalize
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col justify-end">
                                                <div className="flex items-center gap-2 mb-8 ml-1">
                                                    <Check className="w-3.5 h-3.5 text-[#3F7C6D]" />
                                                    <span className="text-[10px] font-black text-[#3F7C6D] uppercase tracking-[0.3em]">Pure Inventory</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRoomNum(room.room_number);
                                                        setIsGuestFormOpen(true);
                                                    }}
                                                    className="w-full py-5 bg-white border border-dashed border-slate-300 rounded-[24px] text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:border-[#3F7C6D]/30 group-hover:text-[#3F7C6D] transition-all hover:bg-[#3F7C6D]/5 flex items-center justify-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Process Arrival
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Success Folio Modal */}
            <SuccessFolio 
                isOpen={successFolio.open} 
                onClose={() => {
                    setSuccessFolio({...successFolio, open: false});
                    loadData();
                }}
                title={successFolio.title}
                message={successFolio.message}
                pin={successFolio.pin}
                roomNumber={successFolio.roomNumber}
            />

            {branding && (
                <GuestEntryForm
                    isOpen={isGuestFormOpen}
                    onClose={() => setIsGuestFormOpen(false)}
                    branding={branding}
                    onSuccess={(data: any) => {
                        loadData();
                        if (data?.pin) {
                            setSuccessFolio({
                                open: true,
                                title: "Arrival Acknowledged",
                                message: `Guest document initialized. Please provide the secure PIN below for unit access.`,
                                pin: data.pin,
                                roomNumber: data.room_number
                            });
                        }
                    }}
                    initialRoomNumber={selectedRoomNum || ""}
                />
            )}

            <ConfirmModal
                isOpen={confirmModal.open}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel="Finalize Departure"
                cancelLabel="Keep Resident"
                variant="danger"
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
            />

            <QRPreviewModal
                isOpen={qrPreview.open}
                onClose={() => setQrPreview(prev => ({ ...prev, open: false }))}
                roomNumber={qrPreview.roomNumber}
                hotelName={branding?.name}
                guestUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/${hotelSlug}/guest/dashboard`}
                pin={qrPreview.pin}
            />
        </div>
    );
}
