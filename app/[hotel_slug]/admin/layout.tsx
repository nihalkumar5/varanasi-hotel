"use client";

import Link from "next/link";
import { LayoutDashboard, Inbox, Hotel, Utensils, Settings, Users, BarChart, Receipt, Shirt, ConciergeBell } from "lucide-react";
import React from "react";
import { useParams, usePathname } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const pathname = usePathname();
    const hotelSlug = (params?.hotel_slug as string) || '';

    // Check if we are on the login page
    const isLoginPage = pathname?.endsWith('/login');

    const navItems = [
        { name: "Main Dashboard", href: `/${hotelSlug}/admin/dashboard`, icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: "Kitchen", href: `/${hotelSlug}/admin/kitchen`, icon: <Utensils className="w-5 h-5" /> },
        { name: "Laundry", href: `/${hotelSlug}/admin/laundry`, icon: <Shirt className="w-5 h-5" /> },
        { name: "Reception", href: `/${hotelSlug}/admin/reception`, icon: <ConciergeBell className="w-5 h-5" /> },
        { name: "All Requests", href: `/${hotelSlug}/admin/requests`, icon: <Inbox className="w-5 h-5" /> },
        { name: "Billing & Checkout", href: `/${hotelSlug}/admin/checkout`, icon: <Receipt className="w-5 h-5" /> },
        { name: "Rooms & QR", href: `/${hotelSlug}/admin/rooms`, icon: <Hotel className="w-5 h-5" /> },
        { name: "Menu Items", href: `/${hotelSlug}/admin/menu`, icon: <Utensils className="w-5 h-5" /> },
        { name: "Data Analytics", href: `/${hotelSlug}/admin/analytics`, icon: <BarChart className="w-5 h-5" /> },
        { name: "Hotel Branding", href: `/${hotelSlug}/admin/branding`, icon: <Settings className="w-5 h-5" /> },
    ];

    if (isLoginPage) {
        return <main className="min-h-screen bg-slate-50">{children}</main>;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            <aside className="w-72 bg-white border-r hidden md:flex flex-col h-screen sticky top-0 shadow-sm transition-all duration-300">
                <div className="p-8 border-b">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
                        Admin <span className="text-red-600">Console</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Management Suite v2.0</p>
                </div>

                <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group ${isActive
                                    ? 'bg-red-50 text-red-600 shadow-sm shadow-red-100'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className={`mr-3.5 transition-colors duration-200 ${isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-900'}`}>
                                    {isActive ? React.cloneElement(item.icon, { className: "w-5 h-5" }) : item.icon}
                                </div>
                                {item.name}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t bg-slate-50/50">
                    <button
                        onClick={() => window.location.href = `/${hotelSlug}/guest/dashboard`}
                        className="w-full flex items-center justify-center px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
                    >
                        Switch to Guest View
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-x-hidden w-full bg-slate-50/30">
                {children}
            </main>
        </div>
    );
}
