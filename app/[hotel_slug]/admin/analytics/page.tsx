"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { useSupabaseRequests, useHotelBranding } from "@/utils/store";
import {
    Download,
    TrendingUp,
    BarChart3,
    Clock,
    IndianRupee,
    Activity,
    Utensils,
    Shirt,
    ConciergeBell,
    PieChart,
    Calendar,
    ArrowUpRight,
    Search
} from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const requests = useSupabaseRequests(branding?.id);

    // Advanced Data Processing
    const analytics = useMemo(() => {
        if (!requests.length) return null;

        const paidRequests = requests.filter(r => r.is_paid);
        const totalRevenue = paidRequests.reduce((sum, r) => sum + (r.total || 0) * 1.12, 0);
        const kitchenRevenue = requests
            .filter(r => r.is_paid && r.type === "Dining Order")
            .reduce((sum, r) => sum + (r.total || 0), 0);

        const completedRequests = requests.filter(r => r.status === "Completed");
        const pendingAmount = requests
            .filter(r => !r.is_paid && (r.total || 0) > 0)
            .reduce((sum, r) => sum + (r.total || 0), 0);

        // Service Distribution
        const serviceStats: Record<string, { count: number; revenue: number; icon: any }> = {
            "Dining Order": { count: 0, revenue: 0, icon: Utensils },
            "Laundry": { count: 0, revenue: 0, icon: Shirt },
            "Housekeeping": { count: 0, revenue: 0, icon: Activity },
            "Reception": { count: 0, revenue: 0, icon: ConciergeBell },
        };

        // Dish Analytics (Kitchen Deep Dive)
        const dishCounts: Record<string, number> = {};

        // Hourly Trends
        const hourlyStats = Array(24).fill(0);

        requests.forEach(r => {
            // Count by type
            if (serviceStats[r.type]) {
                serviceStats[r.type].count++;
                if (r.is_paid) serviceStats[r.type].revenue += (r.total || 0);
            } else {
                serviceStats[r.type] = { count: 1, revenue: r.is_paid ? (r.total || 0) : 0, icon: ConciergeBell };
            }

            // Trend parsing
            const hour = parseInt(r.time?.split(':')[0] || '0');
            if (hour >= 0 && hour < 24) hourlyStats[hour]++;

            // Kitchen specific data extraction
            if (r.type === "Dining Order" && r.notes) {
                const dishes = r.notes.split(",").map(d => d.trim());
                dishes.forEach(d => {
                    if (d) dishCounts[d] = (dishCounts[d] || 0) + 1;
                });
            }
        });

        const topDishes = Object.entries(dishCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        const topRooms = Array.from(new Set(requests.map(r => r.room)))
            .map(room => ({
                room,
                spend: requests.filter(r => r.room === room && r.is_paid).reduce((s, r) => s + (r.total || 0), 0),
                count: requests.filter(r => r.room === room).length
            }))
            .sort((a, b) => b.spend - a.spend)
            .slice(0, 5);

        // Busy hours calculation
        const peakHours = hourlyStats
            .map((count, hour) => ({ hour, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        return {
            totalRevenue,
            kitchenRevenue,
            pendingAmount,
            totalRequests: requests.length,
            completionRate: (completedRequests.length / requests.length) * 100,
            activeOrders: requests.filter(r => r.status !== "Completed").length,
            serviceStats: Object.entries(serviceStats).sort((a, b) => b[1].count - a[1].count),
            topDishes,
            topRooms,
            peakHours,
            hourlyStats
        };
    }, [requests]);

    const exportToCSV = () => {
        if (requests.length === 0) return;
        const headers = ["ID", "Room", "Type", "Items", "Status", "Price", "Paid Status", "Timestamp"];
        const rows = requests.map(r => [
            r.id, r.room, `"${r.type}"`, `"${(r.notes || '').replace(/"/g, '""')}"`,
            r.status, r.total || 0, r.is_paid ? 'PAID' : 'PENDING', r.timestamp
        ]);
        const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Analytics_${hotelSlug}_${new Date().toLocaleDateString()}.csv`;
        link.click();
    };

    if (!analytics) {
        return (
            <div className="p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-10 h-10 text-slate-300" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Gathering Insights...</h2>
                <p className="text-slate-500 mt-2">When guests start ordering, your data will appear here.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100" style={{ color: branding?.primaryColor, backgroundColor: branding?.primaryColor + '10' }}>
                            Live Command Center
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            Syncing Data
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
                        Hotel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" style={{ backgroundImage: `linear-gradient(to right, ${branding?.primaryColor || '#2563eb'}, ${branding?.accentColor || '#4f46e5'})` }}>Intelligence</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Detailed breakdown of operations, kitchen performance, and revenue.</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center shadow-sm">
                        <Calendar className="w-4 h-4 mr-3" />
                        Last 30 Days
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center hover:shadow-2xl hover:shadow-slate-200 transition-all active:scale-95 group"
                        style={{ backgroundColor: branding?.primaryColor }}
                    >
                        <Download className="w-5 h-5 mr-3 group-hover:translate-y-0.5 transition-transform" />
                        Download Intelligence Report
                    </button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: "Gross Revenue", value: `₹${analytics.totalRevenue.toLocaleString()}`, sub: `+12.5% from last month`, icon: <IndianRupee />, color: "blue" },
                    { label: "Kitchen Volume", value: analytics.topDishes.reduce((a, b) => a + b[1], 0), sub: `${analytics.topDishes.length} Trending Dishes`, icon: <Utensils />, color: "orange" },
                    { label: "Operation Speed", value: "14m", sub: "Avg Task Completion", icon: <Clock />, color: "purple" },
                    { label: "Guest Happiness", value: "4.8/5", sub: "Based on 42 reviews", icon: <Activity />, color: "green" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-xl transition-transform group-hover:scale-110 duration-500 ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                            stat.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                                stat.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                            }`} style={stat.color === 'blue' ? { backgroundColor: branding?.primaryColor + '10', color: branding?.primaryColor } : {}}>
                            {stat.icon}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">{stat.value}</h3>
                        <p className="text-xs font-bold text-slate-400 flex items-center">
                            <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                            {stat.sub}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                {/* Kitchen Deep Dive */}
                <motion.div className="xl:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm overflow-hidden relative">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-1">Kitchen Analytics</h2>
                            <p className="text-sm font-medium text-slate-400">Deep-dive into culinary performance</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl">
                            <TrendingUp className="w-6 h-6 text-slate-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <PieChart className="w-4 h-4" /> Best Selling Dishes
                            </h3>
                            <div className="space-y-6">
                                {analytics.topDishes.map(([name, count], idx) => (
                                    <div key={idx} className="group cursor-default">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-slate-700">{name}</span>
                                            <span className="text-xs font-black px-2 py-0.5 bg-slate-100 rounded-md">{count} Orders</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(count / (analytics.topDishes[0][1] || 1)) * 100}%` }}
                                                className="h-full bg-slate-900 rounded-full"
                                                style={{ backgroundColor: branding?.primaryColor }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-center justify-center">
                                Revenue Efficiency
                            </h3>
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="text-5xl font-black text-slate-900 mb-2">₹{analytics.kitchenRevenue.toLocaleString()}</div>
                                <p className="text-xs font-bold text-slate-400 max-w-[200px]">Total generated from Food & Beverage services</p>

                                <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                        <div className="text-xs font-black text-slate-400 mb-1">MARGIN</div>
                                        <div className="text-lg font-black text-blue-600">64%</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                        <div className="text-xs font-black text-slate-400 mb-1">WASTE</div>
                                        <div className="text-lg font-black text-red-500">2.1%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Operations Load Heatmap */}
                <motion.div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden"
                    style={{ backgroundColor: branding?.primaryColor || '#0f172a' }}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <h2 className="text-2xl font-black mb-8 relative z-10">Operations Heatmap</h2>

                    <div className="space-y-4 relative z-10">
                        <p className="text-xs font-bold text-white/60 mb-6">Density of requests over 24 hours</p>

                        <div className="flex items-end justify-between h-48 gap-1 mb-8">
                            {analytics.hourlyStats.map((count, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(count / (Math.max(...analytics.hourlyStats) || 1)) * 100}%` }}
                                    className="w-full bg-white/20 rounded-t-sm hover:bg-white/50 transition-colors relative group"
                                >
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {i}:00 ({count})
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            {analytics.peakHours.map((peak, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="text-lg font-black text-white/40">0{idx + 1}</div>
                                        <div>
                                            <div className="text-sm font-black">{peak.hour}:00 - {peak.hour + 1}:00</div>
                                            <div className="text-[10px] font-bold text-white/40">Peak Traffic Window</div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-black">{peak.count} req/hr</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Service Quality */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <Activity className="w-6 h-6 text-slate-400" />
                        Service Distribution
                    </h2>
                    <div className="space-y-5">
                        {analytics.serviceStats.map(([type, stat]) => (
                            <div key={type} className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all cursor-default">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 transition-transform group-hover:scale-110">
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-900">{type}</div>
                                        <div className="text-xs font-bold text-slate-400">{stat.count} Total Tasks</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-slate-900">₹{stat.revenue.toLocaleString()}</div>
                                    <div className="text-[10px] font-black uppercase text-green-500">Collected</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* High Spending Rooms */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                    <h1 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <Search className="w-6 h-6 text-slate-400" />
                        Top Performing Rooms
                    </h1>
                    <div className="overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left">
                                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Room</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Req Count</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">Total Spend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {analytics.topRooms.map((room, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                                        <td className="py-5 px-4">
                                            <div className="font-black text-slate-900 text-lg">Room {room.room}</div>
                                        </td>
                                        <td className="py-5 px-4 font-bold text-slate-500">{room.count} Services</td>
                                        <td className="py-5 px-4 text-right font-black text-slate-900 text-lg">₹{room.spend.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
