"use client";

import { Reveal } from "@/components/ui/Reveal";
import {
    CheckCircle2,
    MapPin,
    Calendar,
    Search,
    Building2,
    Check
} from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function VerifiedProperties() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const q = query(collection(db, "properties"), where("status", "==", "verified"));
        const unsubscribe = onSnapshot(q, (snap) => {
            setProperties(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filtered = properties.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10">
            <Reveal direction="up">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black font-outfit uppercase tracking-tight">Verified <span className="text-primary italic">Properties</span></h1>
                        <p className="text-muted-foreground font-medium mt-1">Directory of all currently live and approved listings.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder="Filter by title or address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-white border border-border rounded-lg text-sm font-medium focus:border-primary/40 outline-none transition-all"
                        />
                    </div>
                </div>
            </Reveal>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-white border border-border rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-border rounded-2xl">
                    <div className="w-16 h-16 bg-accent/50 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/60">
                        <Building2 size={32} />
                    </div>
                    <p className="text-muted-foreground font-medium">No verified properties found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((prop, idx) => (
                        <Reveal key={prop.id} direction="up" delay={idx * 0.05}>
                            <div className="bg-white border border-border rounded-xl overflow-hidden group hover:border-primary transition-all shadow-sm">
                                <div className="aspect-video relative overflow-hidden bg-accent">
                                    <img src={prop.images?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                            <Check size={16} strokeWidth={4} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-md text-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/50">
                                            ₦{Number(prop.price).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                                            {prop.type}
                                        </span>
                                        <div className="h-1 w-1 bg-border rounded-full" />
                                        <span className="text-[10px] font-medium text-muted-foreground italic">
                                            Added {prop.createdAt?.toDate ? new Date(prop.createdAt.toDate()).toLocaleDateString() : "Just now"}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">{prop.title}</h3>
                                    <p className="text-[10px] text-muted-foreground font-medium italic flex items-center gap-1 group-hover:text-foreground transition-colors">
                                        <MapPin size={10} /> {prop.address}
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            )}
        </div>
    );
}
