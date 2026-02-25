"use client";

import { Reveal } from "@/components/ui/Reveal";
import {
    Users,
    ShieldAlert,
    Search,
    MoreVertical,
    Mail,
    Calendar,
    Clock,
    Check,
    X as XIcon,
    ArrowRight,
    Image as ImageIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { AdminVerificationModal } from "@/components/modals/AdminVerificationModal";

interface Homeowner {
    id: string;
    displayName?: string;
    email?: string;
    verificationStatus?: 'none' | 'pending' | 'verified';
    createdAt?: any;
    role?: string;
}

export default function UnverifiedHomeowners() {
    const [homeowners, setHomeowners] = useState<Homeowner[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const fetchHomeowners = async () => {
        setLoading(true);
        try {
            // Fetch homeowners that are NOT verified
            const q = query(
                collection(db, "users"),
                where("role", "==", "homeowner")
            );
            const snap = await getDocs(q);
            const items = snap.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Homeowner))
                .filter(user => user.verificationStatus !== "verified");

            // Sort: pending first
            items.sort((a, b) => {
                if (a.verificationStatus === 'pending' && b.verificationStatus !== 'pending') return -1;
                if (a.verificationStatus !== 'pending' && b.verificationStatus === 'pending') return 1;
                return 0;
            });

            setHomeowners(items);
        } catch (error) {
            console.error("Error fetching unverified homeowners:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHomeowners();
    }, []);

    const handleApprove = async (userId: string) => {
        setActionLoading(userId);
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                verificationStatus: "verified",
                updatedAt: serverTimestamp()
            });

            // Delete the verification request record too if it exists
            try {
                await deleteDoc(doc(db, "verifications", userId));
            } catch (e) {
                // Ignore if not exists
            }

            fetchHomeowners();
        } catch (error) {
            console.error("Approval error:", error);
            alert("Failed to approve user.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (userId: string) => {
        setActionLoading(userId);
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                verificationStatus: "none",
                updatedAt: serverTimestamp()
            });

            // Delete the verification request record too
            try {
                await deleteDoc(doc(db, "verifications", userId));
            } catch (e) {
                // Ignore
            }

            fetchHomeowners();
        } catch (error) {
            console.error("Rejection error:", error);
            alert("Failed to reject user.");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredHomeowners = homeowners.filter(h =>
        h.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleReviewDocuments = (userId: string) => {
        setSelectedUserId(userId);
        setIsReviewOpen(true);
    };

    return (
        <div className="p-6 lg:p-10">
            <AdminVerificationModal
                isOpen={isReviewOpen}
                onCloseAction={() => setIsReviewOpen(false)}
                userId={selectedUserId}
                onApproveAction={(id) => {
                    handleApprove(id);
                    setIsReviewOpen(false);
                }}
                onRejectAction={(id) => {
                    handleReject(id);
                    setIsReviewOpen(false);
                }}
                actionLoading={!!actionLoading}
            />
            <Reveal direction="up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black font-outfit uppercase tracking-tight">Unverified <span className="text-primary italic">Homeowners</span></h1>
                        <p className="text-muted-foreground font-medium mt-1">Review pending applications and manage unverified owners.</p>
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

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden text-black ">
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
                                                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-muted-foreground font-black uppercase">
                                                    {homeowner.displayName?.charAt(0) || "H"}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black">{homeowner.displayName}</h4>
                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">ID: {homeowner.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {homeowner.verificationStatus === 'pending' ? (
                                                <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded flex items-center gap-1.5 w-fit animate-pulse">
                                                    <Clock size={10} /> Pending Review
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded flex items-center gap-1.5 w-fit">
                                                    <ShieldAlert size={10} /> Unverified
                                                </span>
                                            )}
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
                                            <div className="flex items-center justify-end gap-2">
                                                {homeowner.verificationStatus === 'pending' ? (
                                                    <>
                                                        <Button
                                                            onClick={() => handleReviewDocuments(homeowner.id)}
                                                            disabled={actionLoading === homeowner.id}
                                                            variant="outline"
                                                            className="border-primary/20 text-primary hover:bg-primary/5 h-8 px-3 text-[10px] font-black uppercase tracking-widest flex gap-1.5"
                                                        >
                                                            <ImageIcon size={14} /> Review Documents
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleApprove(homeowner.id)}
                                                            disabled={actionLoading === homeowner.id}
                                                            className="bg-green-600 hover:bg-green-700 h-8 px-3 text-[10px] font-black uppercase tracking-widest flex gap-1.5"
                                                        >
                                                            <Check size={14} /> Approve
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleReject(homeowner.id)}
                                                            disabled={actionLoading === homeowner.id}
                                                            className="border-red-200 text-red-600 hover:bg-red-50 h-8 px-3 text-[10px] font-black uppercase tracking-widest flex gap-1.5"
                                                        >
                                                            <XIcon size={14} /> Reject
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <button className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                )}
                                            </div>
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
                                            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No unverified homeowners found</p>
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
