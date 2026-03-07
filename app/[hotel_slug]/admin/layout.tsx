"use client";

import Link from "next/link";
import { LayoutDashboard, Inbox, Hotel, Utensils, Settings, Users, BarChart, Receipt, Shirt, ConciergeBell } from "lucide-react";
import React from "react";
import { useParams } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;

    // Check if we are on the login page
    const isLoginPage = typeof window !== 'undefined' && window.location.pathname.endsWith('/login');

    const navItems = [
        { name: "Main Dashboard", href: `/${hotelSlug}/admin/dashboard`, icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: "Kitchen", href: `/${hotelSlug}/admin/kitchen`, icon: <Utensils className="w-5 h-5" /> },
        { name: "Laundry", href: `/${hotelSlug}/admin/laundry`, icon: <Shirt className="w-5 h-5" /> },
        { name: "Reception", href: `/${hotelSlug}/admin/reception`, icon: <ConciergeBell className="w-5 h-5" /> },
        { name: "All Requests", href: `/${hotelSlug}/admin/requests`, icon: <Inbox className="w-5 h-5" /> },
        { name: "Billing & Checkout", href: `/${hotelSlug}/admin/checkout`, icon: <Receipt className="w-5 h-5" /> },
        { name: "Rooms & QR", href: `/${hotelSlug}/admin/rooms`, icon: <Hotel className="w-5 h-5" /> },
        { name: "Menu Items", href: `/${hotelSlug}/admin/menu`, icon: <Utensils className="w-5 h-5" /> },
        { name: "Hotel Branding", href: `/${hotelSlug}/admin/branding`, icon: <Settings className="w-5 h-5" /> },
        { name: "Staff Management", href: `/${hotelSlug}/admin/staff`, icon: <Users className="w-5 h-5" /> },
    ];

    if (isLoginPage) {
        return <main className="min-h-screen bg-slate-50">{children}</main>;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            <aside className="w-64 bg-white border-r hidden md:flex flex-col h-screen sticky top-0">
                <div className="p-4 font-bold border-b text-xl text-primary">Admin Console</div>
                <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors mb-1"
                        >
                            {React.cloneElement(item.icon, { className: "w-5 h-5 mr-3" })}
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 overflow-x-hidden w-full">
                {children}
            </main>
        </div>
    );
}
