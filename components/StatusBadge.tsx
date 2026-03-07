import React from "react";
import { CheckCircle2, Clock, Loader2, PlayCircle } from "lucide-react";

export type RequestStatus = "Pending" | "Assigned" | "In Progress" | "Completed";

export function StatusBadge({ status }: { status: RequestStatus }) {
    const statusConfig = {
        Pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4 mr-1" /> },
        Assigned: { color: "bg-orange-100 text-orange-800", icon: <Loader2 className="w-4 h-4 mr-1 animate-spin" /> },
        "In Progress": { color: "bg-blue-100 text-blue-800", icon: <PlayCircle className="w-4 h-4 mr-1" /> },
        Completed: { color: "bg-green-100 text-green-800", icon: <CheckCircle2 className="w-4 h-4 mr-1" /> },
    };

    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.icon}
            {status}
        </span>
    );
}
