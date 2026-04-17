"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useHotelBranding, getAllHotelStaff, updateStaffRole, UserProfile } from "@/utils/store";
import { Users, Shield, Utensils, Shirt, Bell, Check, Loader2, Search, ArrowLeft, MoreVertical, Edit2, UserPlus, Sparkles, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SuccessFolio } from "@/components/SuccessFolio";

export default function StaffManagement() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding, loading: brandingLoading } = useHotelBranding(hotelSlug);

    const [staff, setStaff] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const loadStaff = async () => {
        if (!branding?.id) return;
        setLoading(true);
        const { data, error } = await getAllHotelStaff(branding.id);
        if (data) setStaff(data);
        setLoading(false);
    };

    useEffect(() => {
        if (branding?.id) {
            loadStaff();
        }
    }, [branding?.id]);

    const handleRoleUpdate = async (profileId: string, newRole: string) => {
        setUpdatingId(profileId);
        const { error } = await updateStaffRole(profileId, newRole);
        if (!error) {
            await loadStaff();
        }
        setUpdatingId(null);
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="w-4 h-4" />;
            case 'reception': return <Bell className="w-4 h-4" />;
            case 'kitchen': return <Utensils className="w-4 h-4" />;
            case 'housekeeping': return <Shirt className="w-4 h-4" />;
            default: return <Users className="w-4 h-4" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-[#1F1F1F] text-[#CFA46A] border-[#CFA46A]/20';
            case 'reception': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'kitchen': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'housekeeping': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const filteredStaff = staff.filter(s =>
        (s.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.role.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (brandingLoading || loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9]">
            <Loader2 className="w-8 h-8 text-[#CFA46A] animate-spin" />
        </div>
    );

    return (
        <div className="flex-1 min-h-screen bg-[#FDFBF9] font-sans">
            {/* Header section with glassmorphism */}
            <div className="px-12 py-10 border-b border-black/[0.03] bg-white/40 backdrop-blur-3xl sticky top-0 z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-[#CFA46A] animate-pulse" />
                        <span className="text-[10px] font-black text-[#CFA46A] uppercase tracking-[0.4em]">Force Management</span>
                    </div>
                    <h1 className="text-4xl font-serif font-black text-[#1F1F1F] tracking-tight leading-none mb-4">
                        Internal Ledger
                    </h1>
                    <p className="text-sm text-slate-500 max-w-2xl font-medium italic">
                        Assign departmental authority and manage personnel access across the hotel ecosystem.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search personnel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/60 border border-black/[0.03] rounded-[24px] py-4 pl-12 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-[#CFA46A]/20 transition-all w-64 shadow-sm"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                        onClick={() => {
                            const link = `${window.location.origin}/${hotelSlug}/staff/register`;
                            navigator.clipboard.writeText(link);
                            setShowSuccess(true);
                        }}
                        className="px-8 py-4 rounded-[24px] bg-[#1F1F1F] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#CFA46A] hover:text-[#1F1F1F] transition-all flex items-center gap-3 active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        Generate Invite
                    </button>
                </div>
            </div>

            <div className="px-12 py-12 max-w-[1700px] mx-auto">
                <div className="bg-white rounded-[48px] border border-black/[0.03] shadow-[0_20px_60px_rgba(31,31,31,0.03)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black/[0.03]">
                                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Personnel</th>
                                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Department</th>
                                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Access Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.02]">
                                {filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-24 text-center">
                                            <Users className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                            <p className="text-slate-300 font-bold italic text-sm">No personnel identified in the current ledger...</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStaff.map((member) => (
                                        <tr key={member.id} className="hover:bg-[#FDFBF9] transition-colors group">
                                            <td className="p-8">
                                                <div className="flex items-center">
                                                    <div className="w-14 h-14 rounded-[20px] bg-[#FDFBF9] border border-black/[0.03] flex items-center justify-center mr-6 group-hover:bg-[#1F1F1F] transition-colors">
                                                        <Users className="w-6 h-6 text-slate-400 group-hover:text-[#CFA46A] transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="font-serif font-black text-[#1F1F1B] text-lg">
                                                            {member.full_name || "New Recruit"}
                                                        </p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                                            {member.email || "Pending Authentication"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className={`inline-flex items-center px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${getRoleColor(member.role)}`}>
                                                    {getRoleIcon(member.role)}
                                                    <span className="ml-2.5">{member.role}</span>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center justify-end space-x-3">
                                                    {['admin', 'reception', 'kitchen', 'housekeeping'].map((role) => (
                                                        <button
                                                            key={role}
                                                            onClick={() => handleRoleUpdate(member.id, role)}
                                                            disabled={updatingId === member.id || member.role === role}
                                                            className={`w-11 h-11 rounded-[14px] transition-all border flex items-center justify-center ${
                                                                member.role === role 
                                                                    ? 'bg-[#1F1F1F] border-[#1F1F1F] text-[#CFA46A] shadow-lg shadow-black/10' 
                                                                    : 'bg-white border-black/[0.05] text-slate-300 hover:border-[#CFA46A] hover:text-[#CFA46A]'
                                                            } disabled:opacity-50 active:scale-90`}
                                                            title={`Reassign to ${role}`}
                                                        >
                                                            {updatingId === member.id && member.role !== role ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-[#CFA46A]" />
                                                            ) : (
                                                                getRoleIcon(role)
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-12 bg-[#1F1F1F] p-10 rounded-[48px] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <Shield className="w-48 h-48 text-[#CFA46A]" />
                    </div>
                    <div className="relative z-10 flex items-start gap-8">
                        <div className="w-14 h-14 bg-[#FDFBF9] rounded-[20px] flex items-center justify-center shrink-0">
                            <Shield className="w-6 h-6 text-[#1F1F1F]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-serif font-black text-white mb-2 tracking-tight">Access Protocol Directive</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed italic max-w-3xl">
                                Authority levels strictly govern dashboard visibility and regional request signals. Departmental reassignments are reflected in real-time across the administrative network. Personnel with "Admin" clearance retain global oversight of branding and personnel registries.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <SuccessFolio 
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Invite Generated"
                message="The secure registration link has been copied to your clipboard. You can now share it with your new staff member."
                details="MEMBER_INVITE_ACTIVE"
                subDetails="Ready for staff onboarding"
                actionLabel="Done"
            />
        </div>
    );
}
