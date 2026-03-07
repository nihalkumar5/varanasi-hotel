import React from "react";
import Image from "next/image";
import { Plus } from "lucide-react";

interface MenuCardProps {
    title: string;
    description: string;
    price: number;
    image?: string;
    onAdd?: () => void;
}

export function MenuCard({ title, description, price, image, onAdd }: MenuCardProps) {
    return (
        <div className="group bg-white rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden flex items-center p-4 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
            {image && (
                <div className="relative w-28 h-28 rounded-3xl overflow-hidden mr-5 shrink-0 shadow-lg">
                    <img
                        src={image}
                        alt={title}
                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                    />
                </div>
            )}
            <div className="flex-1 py-1 pr-2">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-lg text-slate-900 leading-tight">{title}</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-medium line-clamp-2 mb-4 leading-relaxed tracking-wide">{description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-xl font-serif text-slate-900 tracking-tighter">${price.toFixed(2)}</span>
                    <button
                        onClick={onAdd}
                        className="bg-slate-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 hover:bg-black shadow-lg shadow-slate-200"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
