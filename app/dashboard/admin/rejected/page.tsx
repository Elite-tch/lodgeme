"use client";

import { Reveal } from "@/components/ui/Reveal";
import {
    XCircle,
    MapPin,
    Search,
    Building2,
    Trash2,
    RotateCcw
} from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";

export default function RejectedProperties() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const q = query(collection(db, "properties"), where("status", "==", "rejected"));
        const unsubscribe = onSnapshot(q, (snap) => {
            setProperties(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const moveToPending = async (propertyId: string) => {
        try {
            await updateDoc(doc(db, "properties", propertyId), {
                status: "pending",
                verified: false,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error(error);
        }
    };

    const filtered = properties.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10">
            <Reveal direction="up">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black font-outfit uppercase tracking-tight">Unapproved <span className="text-red-500 italic">Listings</span></h1>
                        <p className="text-muted-foreground font-medium mt-1">Properties that failed verification requirements.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder="Search rejected listings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-white border border-border rounded-lg text-sm font-medium focus:border-red-400 outline-none transition-all"
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
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-200">
                        <XCircle size={32} />
                    </div>
                    <p className="text-muted-foreground font-medium">No rejected properties found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((prop, idx) => (
                        <Reveal key={prop.id} direction="up" delay={idx * 0.05}>
                            <div className="bg-white border border-border rounded-xl overflow-hidden group hover:border-red-400 transition-all shadow-sm">
                                <div className="aspect-video relative overflow-hidden bg-accent">
                                    <img src={prop.images?.[0]} alt="" className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 transition-all duration-500" />
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-red-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
                                            <XCircle size={16} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-black text-sm mb-1 line-clamp-1">{prop.title}</h3>
                                    <p className="text-[10px] text-muted-foreground font-medium italic flex items-center gap-1 mb-6">
                                        <MapPin size={10} /> {prop.address}
                                    </p>

                                    <div className="pt-4 border-t border-border flex gap-3">
                                        <Button
                                            onClick={() => moveToPending(prop.id)}
                                            variant="outline"
                                            className="flex-1 h-9 rounded text-[10px] font-black uppercase tracking-widest gap-2"
                                        >
                                            <RotateCcw size={12} />
                                            Re-evaluate
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            )}
        </div>
    );
}
