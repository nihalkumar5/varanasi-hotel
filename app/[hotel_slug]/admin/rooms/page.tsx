"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "react-qr-code";
import { Printer, Key, DoorClosed, Plus, Trash2, Loader2, Hotel } from "lucide-react";
import { useHotelBranding, useRooms, addRoom, checkInRoom, checkOutRoom, deleteRoom } from "@/utils/store";

export default function RoomsPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { rooms: initialRooms, loading } = useRooms(branding?.id);
    const [roomsList, setRoomsList] = React.useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newRoomNumber, setNewRoomNumber] = useState("");

    React.useEffect(() => {
        if (initialRooms) {
            setRoomsList(initialRooms);
        }
    }, [initialRooms]);

    const appUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    const handleAddRoom = async () => {
        if (!branding?.id || !newRoomNumber.trim()) return;

        // Client-side validation: Check if room already exists
        if (roomsList.some(r => r.room_number === newRoomNumber.trim())) {
            alert("This room number already exists.");
            return;
        }

        const { error } = await addRoom(branding.id, newRoomNumber.trim());

        if (error) {
            alert(error.message || "Failed to add room.");
            return;
        }

        setNewRoomNumber("");
        setIsAdding(false);
    };

    const [checkInDetails, setCheckInDetails] = useState<{ roomId: string, date: string, time: string, numGuests: number } | null>(null);

    const handleCheckIn = async (roomId: string) => {
        if (!branding?.id || !checkInDetails) return;
        const { pin, error } = await checkInRoom(roomId, branding.id, checkInDetails.date, checkInDetails.time, checkInDetails.numGuests);

        if (error) {
            console.error("Check-in Error:", error);
            alert(`Failed to check in: ${error.message || "Unknown error"}. Check if database schema is updated.`);
            return;
        }

        // The hook (useRooms) will handle real-time updates from Supabase or Custom Event
        setCheckInDetails(null);
        alert(`Room Checked In! Guests must use the generated PIN: ${pin} to access the menu.`);
    };

    const handleCheckOut = async (roomId: string) => {
        if (!branding?.id) return;
        if (confirm("Check out this room? The guest will immediately lose access to the digital menu.")) {
            await checkOutRoom(roomId, branding.id);

            // The hook (useRooms) will handle real-time updates
        }
    };

    const handleDeleteRoom = async (roomId: string) => {
        if (!branding?.id) return;
        if (confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
            await deleteRoom(roomId, branding.id);
            // Remove manual filter; useRooms hook handles it
        }
    };

    const handlePrintQR = (roomNumber: string, qrUrl: string) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print QR - Room ${roomNumber}</title>
                    <style>
                        body { 
                            font-family: 'Inter', sans-serif; 
                            display: flex; 
                            flex-direction: column; 
                            align-items: center; 
                            justify-content: center; 
                            height: 100vh; 
                            margin: 0;
                            text-align: center;
                        }
                        .qr-container { padding: 40px; border: 2px solid #eee; border-radius: 40px; }
                        h1 { font-size: 48px; margin-bottom: 10px; font-weight: 900; color: #1e293b; }
                        p { font-size: 18px; color: #64748b; margin-bottom: 30px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 900; }
                    </style>
                </head>
                <body>
                    <h1>Room ${roomNumber}</h1>
                    <p>Scan for Digital Concierge</p>
                    <div id="qr" class="qr-container"></div>
                    <script type="text/javascript">
                        window.onload = function() {
                            // Inject QR code using SVG from parent context for simplicity
                            const qrSvg = window.opener.document.querySelector('.qr-container-target-${roomNumber} svg').outerHTML;
                            document.getElementById('qr').innerHTML = qrSvg;
                            window.print();
                            window.onafterprint = function() { window.close(); };
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="flex-1 min-h-screen bg-[#FDFBF9] font-sans">
            <div className="px-12 py-10 border-b border-black/[0.03] bg-white/40 backdrop-blur-3xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                    <span className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.4em] mb-3 block">System Configuration</span>
                    <h1 className="text-4xl font-serif font-black text-[#1F1F1F] tracking-tight leading-none mb-4">
                        Unit Registry
                    </h1>
                    <p className="text-sm text-slate-500 font-medium italic">
                        Register or decommission physical units for the MangoH digital network.
                    </p>
                </div>

                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-8 py-4 rounded-[24px] bg-[#1F1F1F] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#CFA46A] hover:text-[#1F1F1F] transition-all flex items-center gap-3 group active:scale-95"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Register New Unit
                    </button>
                ) : (
                    <div className="flex items-center gap-3 bg-white p-2 rounded-[28px] border border-black/[0.05] shadow-xl">
                        <input
                            type="text"
                            value={newRoomNumber}
                            onChange={(e) => setNewRoomNumber(e.target.value)}
                            placeholder="Unit ID (e.g. 101)"
                            className="px-6 py-3 bg-transparent outline-none font-bold text-sm w-40"
                            autoFocus
                        />
                        <button onClick={handleAddRoom} className="bg-[#1F1F1F] text-white px-6 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-[#3F7C6D] transition-colors">Commit</button>
                        <button onClick={() => setIsAdding(false)} className="text-slate-400 font-bold text-[10px] uppercase tracking-widest px-4">Void</button>
                    </div>
                )}
            </div>

            <div className="px-12 py-12 max-w-[1400px] mx-auto">
                <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-8 mb-12 flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <DoorClosed className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-serif font-black text-amber-950 mb-1">Architectural Advisory</h3>
                        <p className="text-sm text-amber-900/70 font-medium leading-relaxed italic">
                            This registry is for physical unit configuration only. For daily operational tasks like guest arrival (Check-in) or departure (Check-out), please use the <strong className="text-amber-950">Front Desk Folio</strong>.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-3 text-[#CFA46A]" />
                        Syncing registry...
                    </div>
                ) : roomsList.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[48px] border border-dashed border-slate-200">
                        <Hotel className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <h3 className="text-2xl font-serif font-black text-[#1F1F1B]">No Units Registered</h3>
                        <p className="text-slate-400 mt-2 text-sm italic">Begin by registering your first physical asset above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {roomsList.map((room) => (
                            <div key={room.id} className="bg-white p-8 rounded-[40px] border border-black/[0.03] shadow-[0_15px_40px_rgba(31,31,31,0.02)] group hover:border-[#CFA46A]/20 transition-all flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Registry ID</span>
                                    <h2 className="text-3xl font-serif font-black text-[#1F1F1B]">{room.room_number}</h2>
                                </div>
                                <button
                                    onClick={() => handleDeleteRoom(room.id)}
                                    className="w-12 h-12 rounded-2xl bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white flex items-center justify-center"
                                    title="Decommission Unit"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
