"use client";

import React from "react";
import { CheckCircle2, Clock, Loader2, PlayCircle, XCircle } from "lucide-react";
import type { RequestStatus } from "@/lib/hotel/types";

export type { RequestStatus } from "@/lib/hotel/types";

export function StatusBadge({ status }: { status: RequestStatus }) {
    const statusConfig = {
        Pending: { 
            color: "bg-[#F7F1E5] text-[#B98945] border-[#E8DCCB]/50", 
            icon: <Clock className="w-3.5 h-3.5 mr-2 opacity-70" /> 
        },
        Assigned: { 
            color: "bg-[#F3F4F6] text-[#64748B] border-slate-200/50", 
            icon: <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin opacity-70" /> 
        },
        "In Progress": { 
            color: "bg-[#1F1F1F]/5 text-[#1F1F1F] border-black/10", 
            icon: <PlayCircle className="w-3.5 h-3.5 mr-2 opacity-70" /> 
        },
        Completed: { 
            color: "bg-[#F0FDF4] text-[#166534] border-emerald-200/50", 
            icon: <CheckCircle2 className="w-3.5 h-3.5 mr-2 opacity-70" /> 
        },
        Rejected: { 
            color: "bg-[#FEF2F2] text-[#991B1B] border-red-200/50", 
            icon: <XCircle className="w-3.5 h-3.5 mr-2 opacity-70" /> 
        },
    };

    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm transition-all duration-500 backdrop-blur-md ${config.color}`}>
            {config.icon}
            {status}
        </span>
    );
}
