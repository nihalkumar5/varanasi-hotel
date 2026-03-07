import React from "react";
import { CheckCircle2, Clock, Loader2, PlayCircle } from "lucide-react";

export type RequestStatus = "Pending" | "Assigned" | "In Progress" | "Completed";

export function StatusBadge({ status }: { status: RequestStatus }) {
    const statusConfig = {
        Pending: { color: "bg-amber-50 text-amber-700 border-amber-100", icon: <Clock className="w-3.5 h-3.5 mr-1.5" /> },
        Assigned: { color: "bg-slate-50 text-slate-700 border-slate-100", icon: <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> },
        "In Progress": { color: "bg-blue-50 text-blue-700 border-blue-100", icon: <PlayCircle className="w-3.5 h-3.5 mr-1.5" /> },
        Completed: { color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> },
    };

    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border ${config.color} shadow-sm transition-all duration-300`}>
            {config.icon}
            {status}
        </span>
    );
}
