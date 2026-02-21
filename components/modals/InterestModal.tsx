"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

interface InterestModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
}

export const InterestModal = ({ isOpen, onCloseAction }: InterestModalProps) => {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Please log in to post interest");

            await addDoc(collection(db, "interests"), {
                uid: user.uid,
                userName: user.displayName,
                userEmail: user.email,
                userPhoto: user.photoURL,
                content: content,
                createdAt: serverTimestamp(),
            });

            setSuccess(true);
            setTimeout(() => {
                onCloseAction();
                setSuccess(false);
                setContent("");
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
                        className="relative w-full max-w-lg bg-white rounded overflow-hidden shadow-2xl"
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
                                    <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-200">
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

                                    <div className="space-y-2">
                                        <Label htmlFor="interest" >What are you looking for?</Label>
                                        <textarea
                                            id="interest"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="e.g. I need a 2-bedroom apartment in Lekki with constant water supply. My budget is 1.5m - 2m..."
                                            className="w-full h-40 bg-accent/30 border border-transparent rounded p-4 focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 resize-none font-medium outline-none"
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
