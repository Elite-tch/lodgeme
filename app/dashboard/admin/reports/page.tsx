"use client";

import { Reveal } from "@/components/ui/Reveal";
import {
    Flag,
    AlertTriangle,
    User,
    Calendar,
    Search,
    ChevronRight,
    MessageSquare,
    Shield
} from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function ClientReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snap) => {
            setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="p-6 lg:p-10">
            <Reveal direction="up">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black font-outfit uppercase tracking-tight">Client <span className="text-primary italic">Reports</span></h1>
                        <p className="text-muted-foreground font-medium mt-1">Review issues reported by tenants regarding properties or homeowners.</p>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
                        <AlertTriangle size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">{reports.length} Open Reports</span>
                    </div>
                </div>
            </Reveal>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white border border-border rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-border rounded-2xl">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-300">
                        <Shield size={32} />
                    </div>
                    <p className="text-muted-foreground font-medium">No reports filed yet. The marketplace is safe!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.map((report, idx) => (
                        <Reveal key={report.id} direction="up" delay={idx * 0.05}>
                            <div className="bg-white border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-primary transition-all shadow-sm">
                                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-muted-foreground shrink-0 border border-border/50 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Flag size={20} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-black uppercase tracking-widest text-red-500">
                                            {report.reason || "General Issue"}
                                        </span>
                                        <div className="w-1 h-1 bg-border rounded-full" />
                                        <span className="text-[10px] text-muted-foreground font-medium italic">
                                            Reported {report.createdAt?.toDate ? new Date(report.createdAt.toDate()).toLocaleDateString() : "Recently"}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black text-foreground">
                                        Issue with Property <span className="text-primary">#{report.propertyId?.slice(-5)}</span>
                                    </h4>
                                    <p className="text-sm text-muted-foreground font-medium italic">
                                        "{report.message || "No specific message provided."}"
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Reporter</p>
                                        <p className="text-xs font-black italic">{report.userName || "Anonymous"}</p>
                                    </div>
                                    <button className="p-2 hover:bg-accent rounded-full text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            )}
        </div>
    );
}
