"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, User, Mail, Calendar, ExternalLink, Check, X as XIcon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AdminVerificationModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    userId: string | null;
    onApproveAction: (id: string) => void;
    onRejectAction: (id: string) => void;
    actionLoading: boolean;
}

export const AdminVerificationModal = ({
    isOpen,
    onCloseAction,
    userId,
    onApproveAction,
    onRejectAction,
    actionLoading
}: AdminVerificationModalProps) => {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            fetchVerificationDetails();
        } else {
            setDetails(null);
        }
    }, [isOpen, userId]);

    const fetchVerificationDetails = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const vRef = doc(db, "verifications", userId);
            const vSnap = await getDoc(vRef);
            if (vSnap.exists()) {
                setDetails(vSnap.data());
            } else {
                setDetails(null);
            }
        } catch (error) {
            console.error("Error fetching verification details:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCloseAction}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-border/50 flex justify-between items-center bg-[#fafafa] shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 text-primary rounded">
                                    <ShieldCheck size={20} />
                                </div>
                                <h2 className="text-xl font-black italic">Review <span className="text-primary">Verification</span> Documents</h2>
                            </div>
                            <button
                                onClick={onCloseAction}
                                className="p-2 hover:bg-accent rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 lg:p-10 text-black">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs font-black uppercase tracking-[0.3em]">Retrieving Secure Documents...</p>
                                </div>
                            ) : details ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    {/* Left Side: User Info & Status */}
                                    <div className="space-y-8">
                                        <div className="bg-accent/30 p-8 rounded-3xl border border-border/30">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">User Application</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                        <User size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</p>
                                                        <p className="text-lg font-black">{details.displayName || "Homeowner"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                        <Mail size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</p>
                                                        <p className="text-sm font-bold">{details.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                        <Calendar size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Submitted At</p>
                                                        <p className="text-sm font-bold">
                                                            {details.submittedAt?.toDate ? details.submittedAt.toDate().toLocaleString() : new Date(details.details?.submittedAt || Date.now()).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
                                            <h4 className="font-black text-sm text-blue-900 mb-2 uppercase tracking-tight italic">Admin Guidelines</h4>
                                            <ul className="space-y-2 text-xs font-bold text-blue-800 leading-relaxed">
                                                <li className="flex gap-2"><span>•</span> Ensure the photo on the ID matches the selfie provided.</li>
                                                <li className="flex gap-2"><span>•</span> Verify that the ID is valid and not expired.</li>
                                                <li className="flex gap-2"><span>•</span> Check for any signs of digital manipulation or glare.</li>
                                            </ul>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button
                                                onClick={() => onApproveAction(userId!)}
                                                disabled={actionLoading}
                                                className="flex-1 h-16 bg-green-600 hover:bg-green-700 text-lg font-black shadow-xl shadow-green-200"
                                            >
                                                <Check size={20} className="mr-2" /> Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => onRejectAction(userId!)}
                                                disabled={actionLoading}
                                                className="flex-1 h-16 border-red-200 text-red-600 hover:bg-red-50 text-lg font-black"
                                            >
                                                <XIcon size={20} className="mr-2" /> Reject
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Right Side: Document Previews */}
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <ImageIcon size={14} /> ID Document
                                                </h3>
                                                {details.details?.idUrl && (
                                                    <a href={details.details.idUrl} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                                                        View Full <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="aspect-[4/3] rounded-3xl bg-accent/20 border-2 border-dashed border-border flex items-center justify-center overflow-hidden group">
                                                {details.details?.idUrl ? (
                                                    <img src={details.details.idUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="ID Document" />
                                                ) : (
                                                    <div className="text-center p-8 opacity-40">
                                                        <ImageIcon size={48} className="mx-auto mb-4" />
                                                        <p className="text-xs font-black uppercase tracking-widest italic text-black">No ID document found</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <User size={14} /> Selfie Photo
                                                </h3>
                                                {details.details?.selfieUrl && (
                                                    <a href={details.details.selfieUrl} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                                                        View Full <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="aspect-[4/3] rounded-3xl bg-accent/20 border-2 border-dashed border-border flex items-center justify-center overflow-hidden group">
                                                {details.details?.selfieUrl ? (
                                                    <img src={details.details.selfieUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Selfie" />
                                                ) : (
                                                    <div className="text-center p-8 opacity-40">
                                                        <User size={48} className="mx-auto mb-4" />
                                                        <p className="text-xs font-black uppercase tracking-widest italic text-black">No selfie found</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 text-center text-muted-foreground">
                                    <ShieldCheck size={64} className="mx-auto mb-6 opacity-10" />
                                    <h3 className="text-xl font-black mb-2 uppercase italic">No Record Found</h3>
                                    <p className="text-sm font-medium">This user hasn't submitted their documents yet.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
