"use client";

import { DepartmentDashboard } from "@/components/DepartmentDashboard";
import { ConciergeBell } from "lucide-react";

export default function ReceptionPage() {
    return (
        <DepartmentDashboard
            department="reception"
            title="Reception"
            icon={<ConciergeBell className="w-6 h-6" />}
        />
    );
}
