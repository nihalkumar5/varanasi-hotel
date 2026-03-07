import React from "react";
import Image from "next/image";

interface MenuCardProps {
    title: string;
    description: string;
    price: number;
    image?: string;
    onAdd?: () => void;
}

export function MenuCard({ title, description, price, image, onAdd }: MenuCardProps) {
    return (
        <div className="group bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden flex items-center p-3 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
            {image && (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden mr-4 shrink-0">
                    <img
                        src={image}
                        alt={title}
                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
            )}
            <div className="flex-1 py-1">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 leading-tight">{title}</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-medium line-clamp-2 mb-3 leading-relaxed pr-2">{description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-slate-900 tracking-tighter">${price.toFixed(2)}</span>
                    <button
                        onClick={onAdd}
                        className="bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-900 px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-90"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
