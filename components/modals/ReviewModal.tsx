"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, User, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { auth, db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import Image from "next/image";

interface ReviewModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    homeownerId: string;
    homeownerName: string;
}

export const ReviewModal = ({ isOpen, onCloseAction, homeownerId, homeownerName }: ReviewModalProps) => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [success, setSuccess] = useState(false);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "reviews"),
                where("targetUid", "==", homeownerId),
                orderBy("createdAt", "desc")
            );
            const snap = await getDocs(q);
            const reviewList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Enrich with reviewer data
            const enrichedReviews = await Promise.all(reviewList.map(async (review: any) => {
                if (review.reviewerUid) {
                    const userSnap = await getDoc(doc(db, "users", review.reviewerUid));
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        return {
                            ...review,
                            reviewerName: userData.displayName || userData.fullName || "Anonymous User",
                            reviewerPhoto: userData.photoURL || null
                        };
                    }
                }
                return review;
            }));

            setReviews(enrichedReviews);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && homeownerId) {
            fetchReviews();
        }
    }, [isOpen, homeownerId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser || !comment.trim()) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, "reviews"), {
                targetUid: homeownerId,
                reviewerUid: auth.currentUser.uid,
                rating,
                comment: comment.trim(),
                createdAt: serverTimestamp(),
            });

            setComment("");
            setRating(5);
            setSuccess(true);
            fetchReviews();
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error submitting review:", error);
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
                        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
                    >
                        <div className="p-8 border-b border-border/50 shrink-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black">Reviews</h2>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Feedback for {homeownerName}</p>
                                </div>
                                <button onClick={onCloseAction} className="p-2 hover:bg-accent rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
                            {/* Review Form */}
                            <div className="bg-accent/30 rounded-2xl p-6 border border-accent/50">
                                <h3 className="text-sm font-black uppercase tracking-widest mb-4">Leave a Review</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setRating(s)}
                                                className={`transition-all ${s <= rating ? 'text-primary' : 'text-muted-foreground/30'}`}
                                            >
                                                <Star size={24} fill={s <= rating ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your experience with this homeowner..."
                                        className="w-full h-24 p-4 rounded-xl bg-white border-transparent focus:border-primary/20 outline-none text-sm font-medium transition-all resize-none shadow-sm"
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        disabled={submitting || success}
                                        className="w-full rounded-xl font-black h-12 shadow-lg shadow-primary/10"
                                    >
                                        {submitting ? "Submitting..." : success ? <div className="flex items-center gap-2"><CheckCircle2 size={18} /> Review Sent</div> : "Submit Review"}
                                    </Button>
                                </form>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">All Reviews</h3>
                                {loading ? (
                                    <div className="space-y-6">
                                        {[1, 2].map(i => (
                                            <div key={i} className="animate-pulse flex gap-4">
                                                <div className="w-10 h-10 bg-accent rounded-full shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-accent rounded w-1/3" />
                                                    <div className="h-3 bg-accent rounded w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MessageCircle size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                                        <p className="text-sm font-medium text-muted-foreground italic">No reviews yet. Be the first to leave one!</p>
                                    </div>
                                ) : (
                                    reviews.map((rev) => (
                                        <div key={rev.id} className="relative pl-14 group">
                                            <div className="absolute left-0 top-0 w-10 h-10 rounded-full overflow-hidden bg-accent shrink-0">
                                                {rev.reviewerPhoto ? (
                                                    <Image src={rev.reviewerPhoto} alt="" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        <User size={18} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="text-sm font-black">{rev.reviewerName}</h4>
                                                    <div className="flex text-primary">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} size={10} fill={i < rev.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">"{rev.comment}"</p>
                                                <p className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/40 mt-2">
                                                    {rev.createdAt?.seconds ? new Date(rev.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
