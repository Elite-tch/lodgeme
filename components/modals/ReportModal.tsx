"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Flag, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { auth, db } from "@/lib/firebase";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ReportModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    homeownerId: string;
    homeownerName: string;
}

const REPORT_REASONS = [
    "Fraudulent behavior / Scam",
    "Inaccurate listing information",
    "Inappropriate profile content",
    "Unresponsive or unprofessional",
    "Requesting payment outside platform",
    "Other issue"
];

export const ReportModal = ({ isOpen, onCloseAction, homeownerId, homeownerName }: ReportModalProps) => {
    const [submitting, setSubmitting] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");
    const [details, setDetails] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser || !selectedReason) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, "reports"), {
                targetUid: homeownerId,
                homeownerName: homeownerName,
                reporterUid: auth.currentUser.uid,
                reporterName: auth.currentUser.displayName || "Anonymous Tenant",
                userName: auth.currentUser.displayName || "Anonymous User",
                reason: selectedReason,
                message: details.trim(),
                status: "pending",
                createdAt: serverTimestamp(),
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onCloseAction();
                setSelectedReason("");
                setDetails("");
            }, 2500);
        } catch (error) {
            console.error("Error submitting report:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCloseAction}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col"
                    >
                        <div className="p-8 border-b border-border/50 shrink-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black">Report Issue</h2>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Flag {homeownerName} for review</p>
                                </div>
                                <button onClick={onCloseAction} className="p-2 hover:bg-accent rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                            {success ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-xl font-black mb-2">Report Submitted</h3>
                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                        Thank you for keeping our community safe. Our team will investigate this report shortly.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select a Reason</h3>
                                        <div className="space-y-2">
                                            {REPORT_REASONS.map((reason) => (
                                                <button
                                                    key={reason}
                                                    type="button"
                                                    onClick={() => setSelectedReason(reason)}
                                                    className={`w-full text-left p-4 rounded-xl text-sm font-bold transition-all border ${selectedReason === reason
                                                        ? 'bg-red-50 border-red-200 text-red-700 shadow-sm'
                                                        : 'bg-accent/30 border-transparent hover:bg-accent/50'}`}
                                                >
                                                    {reason}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Additional Details (Optional)</h3>
                                        <textarea
                                            value={details}
                                            onChange={(e) => setDetails(e.target.value)}
                                            placeholder="Provide more context to help our moderators..."
                                            className="w-full h-32 p-4 rounded-xl bg-accent/30 border border-transparent focus:bg-white focus:border-red-200 outline-none text-sm font-medium transition-all resize-none shadow-inner"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            disabled={submitting || !selectedReason}
                                            className="w-full h-14 rounded-xl font-black bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100 flex gap-2"
                                        >
                                            {submitting ? "Submitting..." : <><Flag size={18} /> Submit Report</>}
                                        </Button>
                                        <p className="text-[10px] text-center text-muted-foreground mt-4 font-bold uppercase tracking-widest leading-relaxed">
                                            Submission is confidential. We will take appropriate action if guidelines are breached.
                                        </p>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
