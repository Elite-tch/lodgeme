"use client";

import { Reveal } from "@/components/ui/Reveal";
import {
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    MapPin,
    User,
    BedDouble,
    Bath,
    Droplets,
    Calendar,
    ChevronRight,
    X,
    Check
} from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function PropertyVerification() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProp, setSelectedProp] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "properties"), where("status", "==", "pending"));
        const unsubscribe = onSnapshot(q, (snap) => {
            setProperties(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAction = async (status: "verified" | "rejected") => {
        if (!selectedProp) return;
        setActionLoading(status);
        try {
            await updateDoc(doc(db, "properties", selectedProp.id), {
                status,
                verified: status === "verified",
                updatedAt: serverTimestamp(),
                verifiedAt: status === "verified" ? serverTimestamp() : null
            });
            setSelectedProp(null);
        } catch (error) {
            console.error("Error updating property status:", error);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-6 lg:p-10">
            <Reveal direction="up">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black font-outfit uppercase tracking-tight">Pending <span className="text-primary italic">Verification</span></h1>
                        <p className="text-muted-foreground font-medium mt-1">Review and approve new property listings from homeowners.</p>
                    </div>
                </div>
            </Reveal>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-white border border-border rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : properties.length === 0 ? (

                
                   <div className="text-center py-20 bg-white border border-dashed border-border rounded-2xl">
                    <div className="w-16 h-16 bg-accent/50 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/60">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-xl font-black uppercase">All Caught Up!</h3>
                        <p className="text-muted-foreground font-medium">No properties waiting for verification.</p>
                    </div>
              
              

            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((prop, idx) => (
                        <Reveal key={prop.id} direction="up" delay={idx * 0.05}>
                            <div
                                className="bg-white border border-border rounded-xl overflow-hidden group hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5"
                                onClick={() => setSelectedProp(prop)}
                            >
                                <div className="aspect-video relative overflow-hidden bg-accent">
                                    <img src={prop.images?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                                            Pending
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-black text-sm mb-1 line-clamp-1">{prop.title}</h3>
                                    <p className="text-[10px] text-muted-foreground font-medium italic mb-4 flex items-center gap-1">
                                        <MapPin size={10} /> {prop.address}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Price</p>
                                            <p className="text-sm font-black">₦{Number(prop.price).toLocaleString()}</p>
                                        </div>
                                        <div className="p-2 bg-accent/50 rounded text-primary">
                                            <Eye size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            )}

            {/* Property Detail Modal */}
            <AnimatePresence>
                {selectedProp && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProp(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-[#fafafa] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-6 bg-white border-b border-border flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black">Verification Required</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID: {selectedProp.id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedProp(null)} className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2">
                                    {/* Image Preview */}
                                    <div className="p-8 bg-white border-r border-border">
                                        <div className="aspect-square rounded-xl overflow-hidden mb-4 border border-border/50">
                                            <img src={selectedProp.images?.[0]} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {selectedProp.images?.slice(1, 5).map((img: string, i: number) => (
                                                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border/50">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="p-8 space-y-8">
                                        <div>
                                            <h3 className="text-2xl font-black mb-2">{selectedProp.title}</h3>
                                            <p className="text-muted-foreground font-medium italic flex items-center gap-1">
                                                <MapPin size={16} className="shrink-0" /> {selectedProp.address}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white rounded-xl border border-border">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Annual Price</p>
                                                <p className="text-xl font-black">₦{Number(selectedProp.price).toLocaleString()}</p>
                                            </div>
                                            <div className="p-4 bg-white rounded-xl border border-border">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Property Type</p>
                                                <p className="text-xl font-black uppercase tracking-tight">{selectedProp.type}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Specifications</h4>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="p-3 bg-white border border-border rounded-lg flex flex-col items-center">
                                                    <BedDouble size={20} className="text-primary mb-1" />
                                                    <span className="text-xs font-black">{selectedProp.beds} Beds</span>
                                                </div>
                                                <div className="p-3 bg-white border border-border rounded-lg flex flex-col items-center">
                                                    <Bath size={20} className="text-primary mb-1" />
                                                    <span className="text-xs font-black">{selectedProp.baths} Baths</span>
                                                </div>
                                                <div className="p-3 bg-white border border-border rounded-lg flex flex-col items-center">
                                                    <Droplets size={20} className="text-primary mb-1" />
                                                    <span className="text-xs font-black uppercase tracking-tighter">{selectedProp.waterSource}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Description</h4>
                                            <div className="bg-white border border-border p-4 rounded-xl text-sm font-medium leading-relaxed italic text-foreground/80">
                                                "{selectedProp.description}"
                                            </div>
                                        </div>

                                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Homeowner</p>
                                                <p className="text-sm font-black italic">{selectedProp.ownerName || "Property Owner"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer (Actions) */}
                            <div className="p-6 bg-white border-t border-border flex items-center gap-4 shrink-0 shadow-2xl">
                                <Button
                                    onClick={() => handleAction("rejected")}
                                    disabled={!!actionLoading}
                                    variant="outline"
                                    className="flex-1 h-14 border-red-200 text-red-500 hover:bg-red-50 font-black rounded uppercase text-xs tracking-widest gap-2"
                                >
                                    {actionLoading === "rejected" ? "Rejecting..." : (
                                        <>
                                            <XCircle size={18} />
                                            Disapprove Property
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => handleAction("verified")}
                                    disabled={!!actionLoading}
                                    className="flex-1 h-14 font-black rounded uppercase text-xs tracking-widest gap-2 shadow-xl shadow-primary/20"
                                >
                                    {actionLoading === "verified" ? "Approving..." : (
                                        <>
                                            <CheckCircle2 size={18} />
                                            Verify & Approve
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
