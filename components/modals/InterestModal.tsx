"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Info, MapPin, Wallet, BedDouble, Bath } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { createNotification } from "@/lib/notifications";

interface InterestModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onSuccess?: () => void;
}

export const InterestModal = ({ isOpen, onCloseAction, onSuccess }: InterestModalProps) => {
    const { width, height } = useWindowSize();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        location: "",
        beds: "",
        baths: "",
        budget: "",
        content: ""
    });
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.content.trim() || !formData.location.trim()) return;

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Please log in to post interest");

            await addDoc(collection(db, "interests"), {
                uid: user.uid,
                userName: user.displayName,
                userEmail: user.email,
                userPhoto: user.photoURL,
                location: formData.location,
                beds: formData.beds,
                baths: formData.baths,
                budget: formData.budget,
                content: formData.content,
                createdAt: serverTimestamp(),
            });

            setSuccess(true);
            onSuccess?.();

            // Notify all homeowners about the new interest
            try {
                const homeownersSnap = await getDocs(
                    query(collection(db, "users"), where("role", "==", "homeowner"))
                );
                const senderName = user.displayName || "A client";
                const senderPhoto = user.photoURL || "";
                const notifBody = `${formData.location ? formData.location + " · " : ""}Budget ₦${Number(formData.budget).toLocaleString()}${formData.content ? " — " + formData.content.slice(0, 60) : ""}`;
                await Promise.all(
                    homeownersSnap.docs
                        .filter(d => d.id !== user.uid)
                        .map(d =>
                            createNotification(d.id, {
                                type: "new_interest",
                                title: `${senderName} posted a new interest`,
                                body: notifBody,
                                senderName,
                                senderPhoto,
                            })
                        )
                );
            } catch (notifErr) {
                console.error("Could not send interest notifications:", notifErr);
            }

            setTimeout(() => {
                onCloseAction();
                setSuccess(false);
                setFormData({
                    location: "",
                    beds: "",
                    baths: "",
                    budget: "",
                    content: ""
                });
            }, 2000);
        } catch (error) {
            console.error("Error posting interest:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {success && (
                        <Confetti
                            width={width}
                            height={height}
                            numberOfPieces={200}
                            recycle={false}
                            colors={["#bb7655", "#f0d38f", "#1c1c1c"]}
                            style={{ zIndex: 110 }}
                        />
                    )}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCloseAction}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded overflow-y-auto max-h-[90vh] shadow-2xl no-scrollbar"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black">Post Your Interest</h2>
                                <button
                                    onClick={onCloseAction}
                                    className="p-2 hover:bg-accent rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {success ? (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/20 scale-110">
                                        <Send size={32} />
                                    </div>
                                    <h3 className="text-xl font-black">Posted Successfully!</h3>
                                    <p className="text-muted-foreground font-medium">
                                        Homeowners will see your request in their insight feed.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="bg-primary/5 border border-primary/10 p-4 rounded flex gap-3">
                                        <Info className="text-primary flex-shrink-0" size={20} />
                                        <p className="text-sm text-primary/80 font-medium">
                                            Be detailed! Mention your budget, preferred location, and any specific requirements.
                                            This will be visible only to you and verified homeowners.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="location">Preferred Location</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                                                <Input
                                                    id="location"
                                                    placeholder="e.g. Lekki Phase 1"
                                                    value={formData.location}
                                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                    className="pl-10 h-12 bg-accent/30 border-transparent focus:bg-white focus:border-primary/20"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="budget">Budget (₦ / year)</Label>
                                            <div className="relative">
                                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                                                <Input
                                                    id="budget"
                                                    placeholder="e.g. 2,000,000"
                                                    value={formData.budget}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                                        setFormData({ ...formData, budget: val });
                                                    }}
                                                    className="pl-10 h-12 bg-accent/30 border-transparent focus:bg-white focus:border-primary/20"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="beds">Bedrooms</Label>
                                            <div className="relative">
                                                <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                                                <Input
                                                    id="beds"
                                                    placeholder="e.g. 2"
                                                    value={formData.beds}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                                        setFormData({ ...formData, beds: val });
                                                    }}
                                                    className="pl-10 h-12 bg-accent/30 border-transparent focus:bg-white focus:border-primary/20"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="baths">Bathrooms</Label>
                                            <div className="relative">
                                                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                                                <Input
                                                    id="baths"
                                                    placeholder="e.g. 3"
                                                    value={formData.baths}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                                        setFormData({ ...formData, baths: val });
                                                    }}
                                                    className="pl-10 h-12 bg-accent/30 border-transparent focus:bg-white focus:border-primary/20"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="interest">Additional Description</Label>
                                        <textarea
                                            id="interest"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="Tell homeowners more about what you need..."
                                            className="w-full h-32 bg-accent/30 border border-transparent rounded p-4 focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 resize-none font-medium outline-none text-sm"
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 text-lg font-black rounded shadow-xl shadow-primary/20"
                                    >
                                        {loading ? "Posting..." : "Post Interest"}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
