"use client";

import { DepartmentDashboard } from "@/components/DepartmentDashboard";
import { Shirt } from "lucide-react";

export default function LaundryPage() {
    return (
        <DepartmentDashboard
            department="laundry"
            title="Laundry"
            icon={<Shirt className="w-6 h-6" />}
        />
    );
}
