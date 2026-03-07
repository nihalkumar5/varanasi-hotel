"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, User, Shield } from "lucide-react";
import { useHotelBranding } from "@/utils/store";

export default function StaffPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);

    const [staff, setStaff] = useState([
        { id: "1", name: "Alice Johnson", role: "Manager", email: "alice@hotel.com" },
        { id: "2", name: "Bob Smith", role: "Concierge", email: "bob@hotel.com" },
        { id: "3", name: "Carol Davis", role: "Housekeeping", email: "carol@hotel.com" },
    ]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight" style={{ color: branding?.primaryColor }}>Staff Directory</h1>
                    <p className="text-slate-500 font-medium">Coordinate your on-ground presence</p>
                </div>
                <button
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:opacity-90 transition-all flex items-center active:scale-95"
                    style={{ backgroundColor: branding?.primaryColor }}
                >
                    <Plus className="w-5 h-5 mr-3" /> Add Member
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Detail</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority Level</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Communication</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((s) => (
                            <tr key={s.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/30 transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mr-4 text-slate-400 group-hover:text-blue-500 transition-colors border-2 border-transparent group-hover:border-blue-50">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <span className="font-bold text-slate-900">{s.name}</span>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex inline-flex items-center ${s.role === 'Manager' ? 'bg-purple-100 text-purple-700 shadow-sm shadow-purple-100' : 'bg-blue-100 text-blue-700 shadow-sm shadow-blue-100'}`}>
                                        {s.role === 'Manager' && <Shield className="w-3 h-3 mr-2" />}
                                        {s.role}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <p className="text-sm font-medium text-slate-500">{s.email}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-start">
                <div className="bg-amber-100 p-3 rounded-2xl mr-4">
                    <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                    <h4 className="font-black text-amber-900 lowercase">Security Protocol</h4>
                    <p className="text-sm text-amber-700 mt-1">Only Managers can access the <strong>Branding</strong> and <strong>Staff</strong> directories. Restricted views are enforced by Supabase Row Level Security.</p>
                </div>
            </div>
        </div>
    );
}
