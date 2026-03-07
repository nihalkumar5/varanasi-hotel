"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { useSupabaseRequests, useHotelBranding } from "@/utils/store";
import { Download, TrendingUp, BarChart3, Clock, DollarSign, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const requests = useSupabaseRequests(branding?.id);

    // Data Processing
    const stats = useMemo(() => {
        const totalRevenue = requests.filter(r => r.is_paid).reduce((sum, r) => sum + (r.total || 0) * 1.12, 0); // Include 12% tax
        const completedRequests = requests.filter(r => r.status === "Completed");
        const activeRequests = requests.filter(r => r.status !== "Completed");

        // Service Breakdown
        const serviceCounts: Record<string, number> = {};
        const serviceRevenue: Record<string, number> = {};

        requests.forEach(r => {
            const type = r.type;
            serviceCounts[type] = (serviceCounts[type] || 0) + 1;
            if (r.is_paid && r.total) {
                serviceRevenue[type] = (serviceRevenue[type] || 0) + r.total;
            }
        });

        // Top Services by Count
        const topServices = Object.entries(serviceCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Top Revenue Makers
        const topEarners = Object.entries(serviceRevenue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            totalRevenue,
            totalRequests: requests.length,
            completedRatio: requests.length > 0 ? (completedRequests.length / requests.length) * 100 : 0,
            activeCount: activeRequests.length,
            topServices,
            topEarners
        };
    }, [requests]);

    const exportToCSV = () => {
        if (requests.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = ["ID", "Room", "Type", "Details", "Status", "Price", "Total", "Is_Paid", "Timestamp"];
        const rows = requests.map(r => [
            r.id,
            r.room,
            `"${r.type}"`,
            `"${(r.notes || '').replace(/"/g, '""')}"`,
            r.status,
            r.price || 0,
            r.total || 0,
            r.is_paid ? 'Yes' : 'No',
            r.timestamp
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${hotelSlug}_analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto pb-24">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight" style={{ color: branding?.primaryColor }}>Performance Analytics</h1>
                    <p className="text-slate-500 font-medium">Track operational efficiency and revenue streams</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-slate-800 transition-colors active:scale-95 shadow-xl shadow-slate-200"
                    style={{ backgroundColor: branding?.primaryColor }}
                >
                    <Download className="w-5 h-5 mr-2" />
                    Export CSV Data
                </button>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 justify-center rounded-2xl flex items-center mb-4" style={{ backgroundColor: `${branding?.primaryColor}10`, color: branding?.primaryColor }}>
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Settled Revenue</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">${stats.totalRevenue.toFixed(2)}</h3>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 justify-center rounded-2xl flex items-center mb-4" style={{ backgroundColor: `${branding?.accentColor}10`, color: branding?.accentColor }}>
                        <Activity className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Requests</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.totalRequests}</h3>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
                    <div className="w-12 h-12 bg-green-50 text-green-600 justify-center rounded-2xl flex items-center mb-4" style={{ backgroundColor: `#10b98110`, color: '#10b981' }}>
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Completion Rate</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.completedRatio.toFixed(1)}%</h3>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 justify-center rounded-2xl flex items-center mb-4" style={{ backgroundColor: `#f59e0b10`, color: '#f59e0b' }}>
                        <Clock className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Operations</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.activeCount}</h3>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Demanded Services */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center mb-8">
                        <BarChart3 className="w-6 h-6 text-slate-400 mr-3" />
                        <h2 className="text-xl font-black text-slate-900">Highest Demand Services</h2>
                    </div>
                    <div className="space-y-6">
                        {stats.topServices.map(([service, count], index) => (
                            <div key={service} className="relative">
                                <div className="flex justify-between text-sm font-bold mb-2 relative z-10">
                                    <span className="text-slate-800">{service}</span>
                                    <span className="text-slate-500">{count} orders</span>
                                </div>
                                <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(count / stats.topServices[0][1]) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: branding?.primaryColor }}
                                    ></motion.div>
                                </div>
                            </div>
                        ))}
                        {stats.topServices.length === 0 && <p className="text-slate-400 text-sm italic">Not enough data to chart.</p>}
                    </div>
                </motion.div>

                {/* Top Revenue Generators */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center mb-8">
                        <TrendingUp className="w-6 h-6 text-slate-400 mr-3" />
                        <h2 className="text-xl font-black text-slate-900">Top Revenue Generators</h2>
                    </div>
                    <div className="space-y-6">
                        {stats.topEarners.map(([service, revenue], index) => (
                            <div key={service} className="relative">
                                <div className="flex justify-between text-sm font-bold mb-2 relative z-10">
                                    <span className="text-slate-800">{service}</span>
                                    <span className="text-green-600">${revenue.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(revenue / stats.topEarners[0][1]) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                                        className="bg-green-500 h-full rounded-full"
                                    ></motion.div>
                                </div>
                            </div>
                        ))}
                        {stats.topEarners.length === 0 && <p className="text-slate-400 text-sm italic">Not enough revenue data to chart.</p>}
                    </div>
                </motion.div>
            </div>

            <div className="mt-8 bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start" style={{ backgroundColor: `${branding?.primaryColor}05`, borderColor: `${branding?.primaryColor}10` }}>
                <div className="bg-blue-100 p-3 rounded-2xl mr-4" style={{ backgroundColor: `${branding?.primaryColor}10` }}>
                    <Activity className="w-5 h-5" style={{ color: branding?.primaryColor }} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900">Data & Growth Tips</h4>
                    <p className="text-sm text-slate-600 mt-1">Use the <strong>Export CSV</strong> function regularly to import data into Excel or your CRM. Identifying peak request times and top sellers enables you to adjust staffing and upsell high-margin items.</p>
                </div>
            </div>
        </div>
    );
}
