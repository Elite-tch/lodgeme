"use client";

import { HomeownerSidebar } from "@/components/layout/HomeownerSidebar";
import { HomeownerHeader } from "@/components/layout/HomeownerHeader";
import { Reveal } from "@/components/ui/Reveal";
import {
    Send, MapPin, Wallet, BedDouble, Bath, Clock, Search, Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function HomeownerClientInterestsPage() {
    const router = useRouter();
    const [interests, setInterests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged((user) => {
            if (!user) { setLoading(false); return; }

            // Real-time listener on all interests
            const q = query(collection(db, "interests"), orderBy("createdAt", "desc"));
            const unsub = onSnapshot(q, (snap) => {
                setInterests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoading(false);
            });

            return () => unsub();
        });
        return () => unsubAuth();
    }, []);

    const filtered = interests.filter(item =>
        item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleMessageClient = (interest: any) => {
        // Navigate to messages with the client pre-selected
        router.push(`/dashboard/homeowner/messages?startWith=${interest.uid}`);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            <HomeownerSidebar />
            <HomeownerHeader />

            <main className="flex-1 lg:ml-64 p-6 lg:p-10 mb-20 lg:mb-0 pt-16">
                <div className="max-w-6xl mx-auto">
                    {/* Page Header */}
                    <Reveal direction="up">
                        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black">
                                    Client <span className="text-primary italic">Interests</span>
                                </h1>
                                <p className="text-muted-foreground font-medium mt-1">
                                    Browse what clients are actively looking for and reach out to matching prospects.
                                </p>
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search interests..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 bg-white border border-border rounded-lg text-sm font-medium focus:border-primary/40 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    </Reveal>

                    {/* Stats */}
                    <Reveal direction="up" delay={0.1}>
                        <div className="flex items-center gap-3 mb-8 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Active interests</p>
                                <p className="text-2xl font-black text-foreground">{interests.length}</p>
                            </div>
                        </div>
                    </Reveal>

                    {/* Loading */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-64 bg-white border border-border rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((interest, idx) => (
                                <Reveal key={interest.id} direction="up" delay={idx * 0.05}>
                                    <div className="bg-white p-6 rounded w-[300px] h-[380px] shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-md transition-all flex flex-col group overflow-hidden">

                                        {/* Client info */}
                                        <div className="flex items-center gap-3 mb-5">
                                            <img
                                                src={interest.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${interest.uid}`}
                                                alt={interest.userName}
                                                className="w-10 h-10 rounded-full object-cover border border-border"
                                            />
                                            <div>
                                                <p className="text-sm font-black">{interest.userName || "Anonymous"}</p>
                                                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                    Live Request
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-3 mb-5 flex-1">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 bg-accent/60 rounded text-primary">
                                                    <MapPin size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Location</p>
                                                    <p className="text-sm font-bold">{interest.location || "Anywhere"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 bg-accent/60 rounded text-primary">
                                                    <Wallet size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Budget</p>
                                                    <p className="text-sm font-bold">₦{Number(interest.budget || 0).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent/30 rounded border border-border/30 text-xs font-bold">
                                                    <BedDouble size={13} className="text-primary" />
                                                    {interest.beds || 0} Beds
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent/30 rounded border border-border/30 text-xs font-bold">
                                                    <Bath size={13} className="text-primary" />
                                                    {interest.baths || 0} Baths
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {interest.content && (
                                            <div className="bg-accent/20 p-3  mb-5">
                                                <p className="text-xs font-medium text-foreground/70 italic line-clamp-2">
                                                    "{interest.content}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold">
                                                <Clock size={11} />
                                                {interest.createdAt?.toDate
                                                    ? new Date(interest.createdAt.toDate()).toLocaleDateString()
                                                    : "Just now"}
                                            </div>

                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    ) : (
                        <Reveal direction="up" delay={0.2}>
                            <div className="text-center py-24 bg-white rounded-xl border border-dashed border-border/60">
                                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/30">
                                    <Users size={36} />
                                </div>
                                <h3 className="text-xl font-black mb-2">No interests yet</h3>
                                <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                                    {searchQuery
                                        ? "No interests match your search."
                                        : "When clients post property interests, they'll appear here."}
                                </p>
                            </div>
                        </Reveal>
                    )}
                </div>
            </main>
        </div>
    );
}
