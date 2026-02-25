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
    Shield,
    Ban,
    Trash2,
    CheckCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/Button";

export default function ClientReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snap) => {
            setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleBanUser = async (report: any) => {
        if (!report.targetUid) return;
        if (!confirm(`Are you sure you want to ban ${report.homeownerName || 'this user'}?`)) return;

        setActionLoading(report.id);
        try {
            const userRef = doc(db, "users", report.targetUid);
            await updateDoc(userRef, {
                status: "suspension",
                isBanned: true,
                bannedAt: new Date().toISOString()
            });

            // Update report status as well
            const reportRef = doc(db, "reports", report.id);
            await updateDoc(reportRef, {
                status: "resolved",
                adminAction: "user_banned"
            });

            alert("User has been banned successfully.");
        } catch (error) {
            console.error("Error banning user:", error);
            alert("Failed to ban user.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDismissReport = async (reportId: string) => {
        if (!confirm("Are you sure you want to dismiss this report?")) return;

        setActionLoading(reportId);
        try {
            const reportRef = doc(db, "reports", reportId);
            await updateDoc(reportRef, {
                status: "dismissed"
            });
            // Option to delete instead: await deleteDoc(reportRef);
        } catch (error) {
            console.error("Error dismissing report:", error);
        } finally {
            setActionLoading(null);
        }
    };

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
                        <span className="text-xs font-black uppercase tracking-widest">{reports.filter(r => r.status !== 'resolved' && r.status !== 'dismissed').length} Open Reports</span>
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
                            <div className={`bg-white border rounded-xl p-6 flex flex-col lg:flex-row lg:items-center gap-6 group transition-all shadow-sm ${report.status === 'resolved' ? 'opacity-60 border-green-100 bg-green-50/10' : report.status === 'dismissed' ? 'opacity-60 grayscale' : 'hover:border-primary border-border'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-border/50 group-hover:bg-primary group-hover:text-white transition-colors ${report.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-accent text-muted-foreground'}`}>
                                    {report.status === 'resolved' ? <CheckCircle size={20} /> : <Flag size={20} />}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${report.status === 'resolved' ? 'text-green-600' : report.status === 'dismissed' ? 'text-muted-foreground' : 'text-red-500'}`}>
                                            {report.reason || "General Issue"}
                                        </span>
                                        <div className="w-1 h-1 bg-border rounded-full" />
                                        <span className="text-[10px] text-muted-foreground font-medium italic">
                                            {report.createdAt?.toDate ? new Date(report.createdAt.toDate()).toLocaleDateString() : "Recently"}
                                        </span>
                                        {report.status && (
                                            <span className={`ml-auto lg:ml-0 text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${report.status === 'resolved' ? 'bg-green-100 text-green-700' : report.status === 'dismissed' ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-700'}`}>
                                                {report.status}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-black text-foreground">
                                        {report.homeownerName ? (
                                            <>Reported Homeowner: <span className="text-primary">{report.homeownerName}</span></>
                                        ) : report.propertyId ? (
                                            <>Issue with Property: <span className="text-primary">#{report.propertyId?.slice(-5)}</span></>
                                        ) : (
                                            "General Report"
                                        )}
                                    </h4>
                                    <p className="text-sm text-muted-foreground font-medium italic">
                                        "{report.message || "No specific message provided."}"
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:pl-6 lg:border-l border-border mt-4 lg:mt-0">
                                    <div className="text-left lg:text-right min-w-[120px]">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Reporter</p>
                                        <p className="text-xs font-black italic">{report.reporterName || report.userName || "Anonymous"}</p>
                                    </div>

                                    {report.status !== 'resolved' && report.status !== 'dismissed' && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleBanUser(report)}
                                                disabled={actionLoading === report.id}
                                                className="h-9 px-3 text-[10px] font-black uppercase tracking-widest border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 gap-1.5"
                                            >
                                                <Ban size={14} />
                                                Ban
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDismissReport(report.id)}
                                                disabled={actionLoading === report.id}
                                                className="h-9 px-3 text-[10px] font-black uppercase tracking-widest border-border hover:bg-accent gap-1.5"
                                            >
                                                <Trash2 size={14} />
                                                Dismiss
                                            </Button>
                                        </div>
                                    )}

                                    <button className="hidden lg:block p-2 hover:bg-accent rounded-full text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1">
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
