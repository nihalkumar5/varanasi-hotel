"use client";

import { useParams } from "next/navigation";
import { StaffDashboard } from "@/components/StaffDashboard";
import { ConciergeBell } from "lucide-react";

export default function ReceptionPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;

    return (
        <StaffDashboard
            hotelSlug={hotelSlug}
            department="reception"
            title="Reception Board"
            allowedTypes={["Checkout", "Information", "Taxi", "Wakeup", "General"]}
            icon={<ConciergeBell className="w-8 h-8 text-blue-500" />}
        />
    );
}
