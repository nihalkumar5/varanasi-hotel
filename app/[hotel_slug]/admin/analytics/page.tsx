"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import {
    AlertTriangle,
    BarChart3,
    BedDouble,
    Calendar,
    CheckCircle2,
    ClipboardList,
    ConciergeBell,
    Download,
    IndianRupee,
    Loader2,
    Shirt,
    Sparkles,
    Users,
    Utensils,
    Wrench,
    Car,
    type LucideIcon,
} from "lucide-react";

import {
    type HotelRequest,
    type RequestStatus,
    useActiveGuests,
    useHotelBranding,
    useRooms,
    useSupabaseRequests,
} from "@/utils/store";

type DepartmentKey =
    | "Dining"
    | "Laundry"
    | "Housekeeping"
    | "Reception"
    | "Maintenance"
    | "Transport"
    | "Other";

type DepartmentStat = {
    key: DepartmentKey;
    label: string;
    icon: LucideIcon;
    count: number;
    liveCount: number;
    revenue: number;
    outstanding: number;
};

type FocusItem = {
    title: string;
    detail: string;
    tone: "amber" | "rose" | "blue" | "emerald";
};

const ACTIVE_STATUSES = new Set<RequestStatus>(["Pending", "Assigned", "In Progress"]);

const DEPARTMENT_META: Record<
    DepartmentKey,
    {
        label: string;
        icon: LucideIcon;
    }
> = {
    Dining: { label: "Dining", icon: Utensils },
    Laundry: { label: "Laundry", icon: Shirt },
    Housekeeping: { label: "Housekeeping", icon: Sparkles },
    Reception: { label: "Reception", icon: ConciergeBell },
    Maintenance: { label: "Maintenance", icon: Wrench },
    Transport: { label: "Transport", icon: Car },
    Other: { label: "Other", icon: BarChart3 },
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value || 0);

const formatPercent = (value: number) => `${Math.round(value)}%`;

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
    `${count} ${count === 1 ? singular : plural}`;

const getRequestAmount = (request: HotelRequest) => {
    const rawAmount = request.total ?? request.price ?? 0;
    return Number.isFinite(rawAmount) ? Number(rawAmount) : 0;
};

const mapRequestDepartment = (requestType?: string): DepartmentKey => {
    const normalized = (requestType || "").toLowerCase();

    if (
        normalized.includes("dining") ||
        normalized.includes("room service") ||
        normalized.includes("tea") ||
        normalized.includes("coffee") ||
        normalized.includes("water") ||
        normalized.includes("mini bar") ||
        normalized.includes("breakfast")
    ) {
        return "Dining";
    }

    if (normalized.includes("laundry")) {
        return "Laundry";
    }

    if (
        normalized.includes("clean") ||
        normalized.includes("housekeeping") ||
        normalized.includes("luggage")
    ) {
        return "Housekeeping";
    }

    if (
        normalized.includes("reception") ||
        normalized.includes("late checkout") ||
        normalized.includes("wake call") ||
        normalized.includes("concierge")
    ) {
        return "Reception";
    }

    if (
        normalized.includes("maintenance") ||
        normalized.includes("repair") ||
        normalized.includes("tap") ||
        normalized.includes("toilet") ||
        normalized.includes("shower") ||
        normalized.includes("fan") ||
        normalized.includes("ac") ||
        normalized.includes("tv")
    ) {
        return "Maintenance";
    }

    if (
        normalized.includes("taxi") ||
        normalized.includes("airport") ||
        normalized.includes("transfer")
    ) {
        return "Transport";
    }

    return "Other";
};

const formatRequestTime = (request: HotelRequest) => {
    if (typeof request.timestamp === "number" && Number.isFinite(request.timestamp)) {
        return new Intl.DateTimeFormat("en-IN", {
            hour: "numeric",
            minute: "2-digit",
        }).format(new Date(request.timestamp));
    }

    return request.time || "--";
};

const isTodayDate = (value?: string) => {
    if (!value) {
        return false;
    }

    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    if (value.slice(0, 10) === todayKey) {
        return true;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return false;
    }

    return parsed.toISOString().slice(0, 10) === todayKey;
};

const focusToneStyles: Record<FocusItem["tone"], string> = {
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950",
    blue: "border-blue-200 bg-blue-50 text-blue-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
};

export default function AnalyticsPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding, loading: brandingLoading } = useHotelBranding(hotelSlug);
    const requests = useSupabaseRequests(branding?.id);
    const { rooms, loading: roomsLoading } = useRooms(branding?.id);
    const { guests, loading: guestsLoading } = useActiveGuests(branding?.id);

    const analytics = useMemo(() => {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const hasThirtyDayData = requests.some((request) => request.timestamp >= thirtyDaysAgo);
        const scopedRequests = hasThirtyDayData
            ? requests.filter((request) => request.timestamp >= thirtyDaysAgo)
            : requests;

        const activeRequests = scopedRequests.filter((request) => ACTIVE_STATUSES.has(request.status));
        const completedRequests = scopedRequests.filter((request) => request.status === "Completed");
        const billableRequests = scopedRequests.filter((request) => getRequestAmount(request) > 0);
        const paidRequests = billableRequests.filter((request) => request.is_paid);
        const outstandingRequests = billableRequests.filter((request) => !request.is_paid);

        const collectedRevenue = paidRequests.reduce((sum, request) => sum + getRequestAmount(request), 0);
        const outstandingRevenue = outstandingRequests.reduce((sum, request) => sum + getRequestAmount(request), 0);

        const occupiedRooms = rooms.filter((room) => room.is_occupied);
        const totalRooms = rooms.length;
        const occupiedRoomCount = occupiedRooms.length;
        const occupancyRate = totalRooms ? (occupiedRoomCount / totalRooms) * 100 : 0;
        const guestHeadcountFromRooms = occupiedRooms.reduce(
            (sum, room) => sum + (room.num_guests && room.num_guests > 0 ? room.num_guests : 1),
            0,
        );
        const activeGuestCount = Math.max(guests.length, guestHeadcountFromRooms, occupiedRoomCount);
        const checkoutTodayRooms = rooms.filter((room) => isTodayDate(room.checkout_date));

        const departmentAccumulator = Object.keys(DEPARTMENT_META).reduce<Record<DepartmentKey, DepartmentStat>>(
            (accumulator, key) => {
                const typedKey = key as DepartmentKey;
                accumulator[typedKey] = {
                    key: typedKey,
                    label: DEPARTMENT_META[typedKey].label,
                    icon: DEPARTMENT_META[typedKey].icon,
                    count: 0,
                    liveCount: 0,
                    revenue: 0,
                    outstanding: 0,
                };
                return accumulator;
            },
            {} as Record<DepartmentKey, DepartmentStat>,
        );

        const roomStats = new Map<
            string,
            { room: string; requestCount: number; liveCount: number; collected: number; outstanding: number }
        >();

        scopedRequests.forEach((request) => {
            const department = mapRequestDepartment(request.type);
            const amount = getRequestAmount(request);
            const departmentStat = departmentAccumulator[department];

            departmentStat.count += 1;
            departmentStat.liveCount += ACTIVE_STATUSES.has(request.status) ? 1 : 0;
            departmentStat.revenue += request.is_paid ? amount : 0;
            departmentStat.outstanding += request.is_paid ? 0 : amount;

            const roomKey = request.room || "Unknown";
            const existingRoom = roomStats.get(roomKey) || {
                room: roomKey,
                requestCount: 0,
                liveCount: 0,
                collected: 0,
                outstanding: 0,
            };

            existingRoom.requestCount += 1;
            existingRoom.liveCount += ACTIVE_STATUSES.has(request.status) ? 1 : 0;
            existingRoom.collected += request.is_paid ? amount : 0;
            existingRoom.outstanding += request.is_paid ? 0 : amount;
            roomStats.set(roomKey, existingRoom);
        });

        const departmentStats = Object.values(departmentAccumulator)
            .filter((stat) => stat.count > 0)
            .sort((left, right) => right.count - left.count)
            .slice(0, 5);

        const followUpRooms = Array.from(roomStats.values())
            .sort((left, right) => {
                if (right.outstanding !== left.outstanding) {
                    return right.outstanding - left.outstanding;
                }

                if (right.liveCount !== left.liveCount) {
                    return right.liveCount - left.liveCount;
                }

                return right.requestCount - left.requestCount;
            })
            .slice(0, 5);

        const focusItems: FocusItem[] = [];

        if (outstandingRevenue > 0) {
            focusItems.push({
                tone: "rose",
                title: `Collect ${formatCurrency(outstandingRevenue)}`,
                detail: `${pluralize(followUpRooms.filter((room) => room.outstanding > 0).length, "room")} still have unpaid service bills.`,
            });
        }

        if (activeRequests.length > 0) {
            focusItems.push({
                tone: "amber",
                title: `Close ${pluralize(activeRequests.length, "open request")}`,
                detail: "These guest requests are still waiting for the team to finish action.",
            });
        }

        if (checkoutTodayRooms.length > 0) {
            focusItems.push({
                tone: "blue",
                title: `Prepare ${pluralize(checkoutTodayRooms.length, "checkout")}`,
                detail: "Front desk and housekeeping should coordinate these rooms today.",
            });
        }

        if (focusItems.length === 0) {
            focusItems.push({
                tone: "emerald",
                title: "Everything looks under control",
                detail: "No open backlog or unpaid service amount is currently showing in this reporting window.",
            });
        }

        return {
            scopedRequests,
            hasThirtyDayData,
            collectedRevenue,
            outstandingRevenue,
            occupiedRoomCount,
            totalRooms,
            occupancyRate,
            activeGuestCount,
            activeRequestCount: activeRequests.length,
            completedRequestCount: completedRequests.length,
            completionRate: scopedRequests.length ? (completedRequests.length / scopedRequests.length) * 100 : 0,
            checkoutTodayCount: checkoutTodayRooms.length,
            departmentStats,
            followUpRooms,
            focusItems,
            recentRequests: scopedRequests.slice(0, 6),
        };
    }, [guests, requests, rooms]);

    const exportToCSV = () => {
        if (!analytics.scopedRequests.length) {
            return;
        }

        const headers = ["Request ID", "Room", "Type", "Department", "Status", "Notes", "Amount", "Paid", "Time"];
        const rows = analytics.scopedRequests.map((request) => [
            request.id,
            request.room,
            `"${request.type}"`,
            mapRequestDepartment(request.type),
            request.status,
            `"${(request.notes || "").replace(/"/g, '""')}"`,
            getRequestAmount(request),
            request.is_paid ? "PAID" : "PENDING",
            request.time,
        ]);

        const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${hotelSlug}_simple_owner_snapshot_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (brandingLoading && !branding) {
        return (
            <div className="p-12 flex items-center justify-center text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-3" />
                Loading owner snapshot...
            </div>
        );
    }

    const metricCards = [
        {
            label: "Revenue Collected",
            value: formatCurrency(analytics.collectedRevenue),
            note: "Paid service amount",
            icon: IndianRupee,
            color: "text-[#CFA46A] bg-[#CFA46A]/5"
        },
        {
            label: "Revenue Pending",
            value: formatCurrency(analytics.outstandingRevenue),
            note: "Still to collect",
            icon: AlertTriangle,
            color: "text-red-500 bg-red-500/5"
        },
        {
            label: "Units Occupied",
            value: analytics.totalRooms
                ? `${analytics.occupiedRoomCount}/${analytics.totalRooms}`
                : analytics.occupiedRoomCount.toString(),
            note: analytics.totalRooms ? `${formatPercent(analytics.occupancyRate)} occupancy rate` : "Configuration pending",
            icon: BedDouble,
            color: "text-[#3F7C6D] bg-[#3F7C6D]/5"
        },
        {
            label: "Active Requests",
            value: analytics.activeRequestCount.toString(),
            note: `${analytics.completedRequestCount} finalized recently`,
            icon: ClipboardList,
            color: "text-slate-500 bg-slate-500/5"
        },
    ];

    return (
        <div className="flex-1 min-h-screen bg-[#FDFBF9] font-sans">
            {/* Header section with glassmorphism */}
            <div className="px-12 py-10 border-b border-black/[0.03] bg-white/40 backdrop-blur-3xl sticky top-0 z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-[#CFA46A] animate-pulse shadow-[0_0_10px_#CFA46A]" />
                        <span className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.4em]">Strategic Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-serif font-black text-[#1F1F1F] tracking-tight leading-none mb-4">
                        Owner's Folio: {branding?.name?.split(' ')[0] || "Portfolio"}
                    </h1>
                    <p className="text-sm text-slate-500 max-w-2xl font-medium italic">
                        Real-time operational health and financial performance briefing for the current period.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="px-6 py-4 bg-white/60 border border-black/[0.03] rounded-[24px] shadow-sm backdrop-blur-xl">
                        <div className="flex items-center space-x-4">
                            <Calendar className="w-5 h-5 text-[#CFA46A]" />
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Observation Window</p>
                                <p className="text-sm font-black text-[#1F1F1F] leading-none">
                                    {analytics.hasThirtyDayData ? "Last 30 Cycles" : "Initial Foundation"}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <button
                        onClick={exportToCSV}
                        className="px-8 py-4 rounded-[24px] bg-[#1F1F1F] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#CFA46A] hover:text-[#1F1F1F] transition-all flex items-center gap-3 group active:scale-95"
                    >
                        <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                        Extract CSV
                    </button>
                </div>
            </div>

            <div className="px-12 py-12 space-y-12 max-w-[1600px] mx-auto">
                {/* 1️⃣ Core Metrics (Luxury Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                    {metricCards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-[40px] border border-black/[0.03] p-8 shadow-[0_20px_50px_rgba(31,31,31,0.04)] group hover:border-[#CFA46A]/20 transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Icon className="w-16 h-16" />
                                </div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{card.label}</span>
                                </div>
                                <div className="text-4xl font-serif font-black text-[#1F1F1F] tracking-tight mb-3">
                                    {card.value}
                                </div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{card.note}</div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* 2️⃣ Strategic Focus (Briefing Panel) */}
                <div className="bg-[#1F1F1F] rounded-[48px] p-10 shadow-2xl relative noise overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-15">
                        <Sparkles className="w-32 h-32 text-[#CFA46A]" />
                    </div>
                    
                    <div className="relative z-10 mb-10">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#CFA46A]" />
                            <span className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.3em]">Critical Insights</span>
                        </div>
                        <h2 className="text-3xl font-serif font-black text-white">What Needs Your Attention</h2>
                        <p className="text-slate-400 mt-2 text-sm font-medium italic">Operational priorities identified from current guest and service data.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                        {analytics.focusItems.map((item, i) => (
                            <div
                                key={i}
                                className={`rounded-[32px] border p-8 backdrop-blur-xl transition-all hover:scale-[1.02] ${
                                    item.tone === 'rose' ? 'bg-red-500/10 border-red-500/20 text-red-100' :
                                    item.tone === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-100' :
                                    'bg-white/5 border-white/5 text-slate-100'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 bg-black/40 rounded-full ${
                                        item.tone === 'rose' ? 'text-red-400' : 
                                        item.tone === 'amber' ? 'text-amber-400' : 
                                        'text-[#CFA46A]'
                                    }`}>
                                        Priority {i + 1}
                                    </span>
                                </div>
                                <div className="text-xl font-serif font-black mb-3">{item.title}</div>
                                <div className="text-sm leading-relaxed opacity-70 italic font-medium">{item.detail}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3️⃣ Secondary Intelligence Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {/* Team Analysis */}
                    <div className="bg-white rounded-[40px] border border-black/[0.03] p-10 shadow-[0_20px_50px_rgba(31,31,31,0.03)] focus-within:ring-2 ring-[#CFA46A]/10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <span className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.3em] mb-2 block">Resource Allocation</span>
                                <h2 className="text-2xl font-serif font-black text-[#1F1F1F]">Team Optimization</h2>
                            </div>
                            <BarChart3 className="w-8 h-8 text-slate-200" />
                        </div>

                        {analytics.departmentStats.length ? (
                            <div className="space-y-4">
                                {analytics.departmentStats.map((stat) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div
                                            key={stat.key}
                                            className="rounded-[24px] border border-black/[0.02] bg-[#FDFBF9] px-6 py-6 flex items-center justify-between group hover:border-[#CFA46A]/20 transition-all"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-[18px] bg-white border border-black/[0.03] flex items-center justify-center text-[#1F1F1F] shadow-sm group-hover:text-[#CFA46A]">
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-[#1F1F1F] uppercase tracking-widest">{stat.label}</div>
                                                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                                        {stat.count} Total Folios
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-[#CFA46A]">{stat.liveCount} Open</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                    {formatCurrency(stat.revenue)} Yield
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-[32px] border border-dashed border-slate-200 p-12 text-center">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No pulse detected from teams</p>
                            </div>
                        )}
                    </div>

                    {/* Unit Intelligence */}
                    <div className="bg-white rounded-[40px] border border-black/[0.03] p-10 shadow-[0_20px_50px_rgba(31,31,31,0.03)]">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <span className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.3em] mb-2 block">Unit Management</span>
                                <h2 className="text-2xl font-serif font-black text-[#1F1F1F]">High Intensity Units</h2>
                            </div>
                            <MapPin className="w-8 h-8 text-slate-200" />
                        </div>

                        {analytics.followUpRooms.length ? (
                            <div className="space-y-4">
                                {analytics.followUpRooms.map((room) => (
                                    <div
                                        key={room.room}
                                        className="rounded-[24px] border border-black/[0.02] bg-[#FDFBF9] px-6 py-6 flex items-center justify-between group hover:border-[#CFA46A]/20 transition-all"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-[18px] bg-[#1F1F1F] flex items-center justify-center text-white shadow-lg">
                                                <span className="text-xs font-black">{room.room}</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-red-500 uppercase tracking-widest italic truncate max-w-[120px]">Attention Required</div>
                                                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                                    {room.liveCount} Active Signals
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-serif font-black text-[#1F1F1F]">
                                                {room.outstanding ? formatCurrency(room.outstanding) : "Balanced"}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                Outstanding Folio
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[32px] border border-dashed border-slate-200 p-12 text-center">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">All units currently balanced</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4️⃣ Health Snapshot Summary */}
                <div className="bg-white rounded-[48px] border border-black/[0.03] p-12 shadow-[0_30px_60px_rgba(31,31,31,0.02)]">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        <div>
                            <span className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.3em] mb-2 block">Synthesis Report</span>
                            <h2 className="text-3xl font-serif font-black text-[#1F1F1F]">Holistic Portfolio Health</h2>
                            <p className="text-sm text-slate-400 mt-2 font-medium italic">Key synthesized datapoints for institutional-grade reporting.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            {[
                                { label: "Pulse Rate", value: formatPercent(analytics.completionRate), icon: CheckCircle2 },
                                { label: "Checkouts", value: analytics.checkoutTodayCount, icon: Calendar },
                                { label: "Guests", value: analytics.activeGuestCount, icon: Users }
                            ].map((item, i) => (
                                <div key={i} className="text-right">
                                    <div className="flex items-center justify-end space-x-2 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                                        <span>{item.label}</span>
                                        <item.icon className="w-3 h-3" />
                                    </div>
                                    <div className="text-2xl font-serif font-black text-[#1F1F1F]">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Recent Signal Stream</div>
                        {analytics.recentRequests.length ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {analytics.recentRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="rounded-[24px] border border-black/[0.02] bg-[#FDFBF9] px-6 py-5 flex items-center justify-between group hover:bg-white hover:border-[#CFA46A]/20 transition-all"
                                    >
                                        <div>
                                            <div className="flex items-center space-x-3 mb-1">
                                                <span className="w-8 h-8 rounded-lg bg-[#1F1F1F] text-white flex items-center justify-center font-black text-[10px]">{request.room}</span>
                                                <span className="text-sm font-black text-[#1F1F1F] tracking-tight truncate max-w-[150px]">{request.type}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-11">
                                                {formatRequestTime(request)}
                                                {request.notes ? ` · "${request.notes}"` : ""}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div
                                                className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${
                                                    ACTIVE_STATUSES.has(request.status)
                                                        ? "text-amber-500"
                                                        : request.status === "Completed"
                                                            ? "text-[#3F7C6D]"
                                                            : "text-slate-400"
                                                }`}
                                            >
                                                {request.status}
                                            </div>
                                            <div className="text-[10px] text-[#CFA46A] font-black uppercase tracking-widest">
                                                {getRequestAmount(request) ? formatCurrency(getRequestAmount(request)) : "Comp"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[40px] border border-dashed border-slate-200 p-12 text-center text-slate-400 italic text-sm">
                                Signal stream currently dormant
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
