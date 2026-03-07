"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Star, ShieldCheck, Globe, Zap, Check } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function LandingPage() {
    const router = useRouter();
    const [hotels, setHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const { data, error } = await supabase.from('hotels').select('*');
                if (data && data.length > 0) {
                    setHotels(data);
                } else {
                    throw new Error("No data");
                }
            } catch (err) {
                // Fallback demo data if DB is empty or not connected
                setHotels([
                    { id: '1', name: 'The Grand Royale', slug: 'grand-royale', logo_image: null },
                    { id: '2', name: 'Azure Bay Resort', slug: 'azure-bay', logo_image: null },
                    { id: '3', name: 'Mountain Lodge', slug: 'mountain-lodge', logo_image: null }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, []);

    const scrollToProperties = () => {
        document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            {/* Navigation */}
            <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Building2 className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black tracking-tight">Antigravity<span className="text-blue-600">SaaS</span></span>
                </div>
                <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
                    <a href="#properties" className="hover:text-blue-600 transition-colors">Platform</a>
                    <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
                    <a href="mailto:support@antigravitysaas.com" className="hover:text-blue-600 transition-colors">Contact</a>
                </div>
                <button
                    onClick={() => router.push('/register')}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200"
                >
                    Add Your Hotel
                </button>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                            <Zap className="w-4 h-4" />
                            <span>v2.0 Scale Release</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                            Experience <br />
                            <span className="text-blue-600">Hospitality</span> <br />
                            at Scale.
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-lg mb-10 leading-relaxed">
                            The world's most advanced multi-tenant hotel management platform.
                            Built for luxury, designed for real-time guest engagement.
                        </p>

                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={() => router.push('/register')}
                                className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center"
                            >
                                Start Your Journey <ArrowRight className="ml-2 w-5 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={scrollToProperties}
                                className="bg-white border-2 border-slate-100 text-slate-900 px-10 py-5 rounded-[2rem] font-black text-lg hover:border-blue-200 transition-all active:scale-95"
                            >
                                View Live Hotels
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        scroll-margin-top="100px"
                        id="properties"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-blue-100/50 rounded-[4rem] blur-3xl -z-10"></div>
                        <div className="bg-white rounded-[3rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.08)] border border-slate-50">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-black tracking-tight">Active Properties</h3>
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-4 border-white bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                                        +12
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-3xl" />
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                    className="grid gap-4"
                                >
                                    {hotels.map((hotel) => (
                                        <motion.button
                                            variants={item}
                                            key={hotel.id}
                                            onClick={() => router.push(`/${hotel.slug}/guest/dashboard`)}
                                            className="group bg-slate-50 hover:bg-blue-600 p-6 rounded-[2rem] transition-all text-left flex items-center justify-between"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center group-hover:bg-blue-500 transition-colors shadow-sm">
                                                    {hotel.logo_image ? (
                                                        <img src={hotel.logo_image} alt={hotel.name} className="w-8 h-8 object-contain" />
                                                    ) : (
                                                        <span className="text-xl font-black text-slate-900 group-hover:text-white">{hotel.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <p className="font-black text-lg text-slate-900 group-hover:text-white transition-colors tracking-tight">{hotel.name}</p>
                                                    <div className="flex items-center mt-0.5">
                                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1 group-hover:text-white group-hover:fill-white" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-100">Luxury Collection</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white group-hover:bg-blue-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                                                <ArrowRight className="text-slate-900 group-hover:text-white w-5 h-5" />
                                            </div>
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Trusted By */}
            <div className="max-w-7xl mx-auto px-6 pb-32">
                <p className="text-center text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-12">Empowering Global Excellence</p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <div className="flex items-center font-black text-2xl tracking-tighter italic">HILTON</div>
                    <div className="flex items-center font-black text-2xl tracking-tighter">MARRIOTT</div>
                    <div className="flex items-center font-black text-2xl tracking-tighter uppercase">Hyatt</div>
                    <div className="flex items-center font-black text-2xl tracking-tighter">Aman</div>
                    <div className="flex items-center font-black text-2xl tracking-tighter">Accor</div>
                </div>
            </div>

            {/* Features Bento */}
            <div className="max-w-7xl mx-auto px-6 pb-32">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative group">
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mb-32"></div>
                        <h2 className="text-4xl font-black tracking-tight mb-6">Real-time signals across <br /> every property.</h2>
                        <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
                            Our instant synchronization engine ensures that guest requests reach your team in under 200ms, regardless of scale.
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-100">
                        <ShieldCheck className="w-12 h-12 text-blue-600 mb-6" />
                        <h3 className="text-2xl font-black mb-4">Enterprise Security</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Role-based access control and high-grade encryption for all guest data.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <section className="py-24 bg-white relative overflow-hidden" id="pricing">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-50/30 rounded-full blur-[120px] -z-10"></div>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Pricing Plans</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Simple, Transparent Pricing</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Starter Plan */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex flex-col"
                        >
                            <div className="mb-8">
                                <h4 className="text-xl font-black text-slate-900 mb-2">Starter Plan</h4>
                                <p className="text-slate-500 font-medium">Perfect for boutique hotels</p>
                            </div>
                            <div className="mb-8">
                                <span className="text-5xl font-black text-slate-900">$49</span>
                                <span className="text-slate-400 font-bold">/month</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                {['Up to 50 Rooms', 'Basic Guest Services', 'Digital Compendium', 'Email Support'].map((feat) => (
                                    <li key={feat} className="flex items-center text-slate-600 font-semibold">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                            <Check className="w-3 h-3 text-blue-600" />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => router.push('/register')}
                                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black hover:bg-slate-100 transition-all shadow-sm"
                            >
                                Get Started
                            </button>
                        </motion.div>

                        {/* Pro Plan */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl">
                                Recommended
                            </div>
                            <div className="mb-8">
                                <h4 className="text-xl font-black text-white mb-2">Pro Plan</h4>
                                <p className="text-slate-400 font-medium">For growing hospitality brands</p>
                            </div>
                            <div className="mb-8 text-white">
                                <span className="text-5xl font-black">$99</span>
                                <span className="text-slate-500 font-bold">/month</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                {['Unlimited Rooms', 'Advanced Analytics', 'Custom Branding & Logo', '24/7 Priority Support', 'Multi-staff Access'].map((feat) => (
                                    <li key={feat} className="flex items-center text-slate-300 font-semibold">
                                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => router.push('/register')}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20"
                            >
                                Start Free Trial
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}
