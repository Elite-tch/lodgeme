"use client";

import { Reveal } from "@/components/ui/Reveal";
import {
    Users,
    ShieldCheck,
    Search,
    MoreVertical,
    Mail,
    Calendar,
    CheckCircle2
} from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";

interface Homeowner {
    id: string;
    displayName?: string;
    email?: string;
    verificationStatus?: 'none' | 'pending' | 'verified';
    createdAt?: any;
    role?: string;
}

export default function VerifiedHomeowners() {
    const [homeowners, setHomeowners] = useState<Homeowner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchHomeowners = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "users"),
                where("role", "==", "homeowner"),
                where("verificationStatus", "==", "verified")
            );
            const snap = await getDocs(q);
            const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Homeowner));
            setHomeowners(items);
        } catch (error) {
            console.error("Error fetching verified homeowners:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHomeowners();
    }, []);

    const filteredHomeowners = homeowners.filter(h =>
        h.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10">
            <Reveal direction="up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black font-outfit uppercase tracking-tight">Verified <span className="text-primary">Homeowners</span></h1>
                        <p className="text-muted-foreground font-medium mt-1">Manage all trusted and verified property owners.</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-border pl-12 pr-6 py-3 rounded-full text-sm font-medium w-full md:w-[350px] focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                    </div>
                </div>
            </Reveal>

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-accent/30 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Homeowner</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Member Since</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-4 bg-accent rounded w-1/2" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredHomeowners.length > 0 ? (
                                filteredHomeowners.map((homeowner) => (
                                    <tr key={homeowner.id} className="hover:bg-accent/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
                                                    {homeowner.displayName?.charAt(0) || "H"}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black flex items-center gap-1.5">
                                                        {homeowner.displayName}
                                                        <CheckCircle2 size={14} className="text-blue-500" />
                                                    </h4>
                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">ID: {homeowner.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                                                Verified
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-muted-foreground">
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-2"><Mail size={12} className="text-primary" /> {homeowner.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-muted-foreground italic">
                                            <span className="flex items-center gap-2">
                                                <Calendar size={12} />
                                                {homeowner.createdAt?.toDate().toLocaleDateString() || "Unknown"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-accent/30 rounded-full text-muted-foreground">
                                                <Users size={32} />
                                            </div>
                                            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No verified homeowners found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
