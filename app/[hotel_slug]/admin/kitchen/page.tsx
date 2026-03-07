"use client";

import { DepartmentDashboard } from "@/components/DepartmentDashboard";
import { Utensils } from "lucide-react";

export default function KitchenPage() {
    return (
        <DepartmentDashboard
            department="kitchen"
            title="Kitchen"
            icon={<Utensils className="w-6 h-6" />}
        />
    );
}
