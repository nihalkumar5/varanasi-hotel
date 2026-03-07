"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit, Trash2, Utensils, Palette } from "lucide-react";
import { useHotelBranding } from "@/utils/store";

export default function MenuPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);

    const [menuItems, setMenuItems] = useState([
        { id: "1", category: "Mains", title: "Club Sandwich", description: "Triple decker with chicken, bacon, lettuce, and tomato.", price: 18.0 },
        { id: "2", category: "Starters", title: "Caesar Salad", description: "Crisp romaine, parmesan crusted croutons, creamy dressing.", price: 14.5 },
        { id: "3", category: "Mains", title: "Margherita Pizza", description: "Fresh mozzarella, tomatoes, and basil on thin crust.", price: 22.0 },
        { id: "4", category: "Mains", title: "Beef Burger", description: "Wagyu beef patty, cheddar, caramelized onions, fries.", price: 24.0 },
    ]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight" style={{ color: branding?.primaryColor }}>Menu Management</h1>
                    <p className="text-slate-500 font-medium">Curate the signature dining experience</p>
                </div>
                <button
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:opacity-90 transition-all flex items-center active:scale-95"
                    style={{ backgroundColor: branding?.primaryColor }}
                >
                    <Plus className="w-5 h-5 mr-3" /> Add Creation
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Category</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Detail</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menuItems.map((item) => (
                            <tr key={item.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/30 transition-colors group">
                                <td className="p-6">
                                    <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mr-4 text-slate-400 group-hover:text-blue-500 transition-colors">
                                            <Utensils className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{item.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5 max-w-[300px] truncate italic">"{item.description}"</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <p className="font-black text-slate-900">${item.price.toFixed(2)}</p>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-3 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl shadow-slate-200">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mr-6 text-blue-400">
                        <Palette className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black">Smart Pricing Active</h4>
                        <p className="text-sm text-slate-400 font-medium">Prices are automatically adjusted for in-room delivery vs restaurant floor.</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">
                    Configure Rates
                </button>
            </div>
        </div>
    );
}
