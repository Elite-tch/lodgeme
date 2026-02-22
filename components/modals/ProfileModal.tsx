"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, LogOut, ChevronRight, Bookmark, ShieldCheck, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

interface ProfileModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
}

export const ProfileModal = ({ isOpen, onCloseAction }: ProfileModalProps) => {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [stats, setStats] = useState({ interests: 0, favorites: 0 });

    useEffect(() => {
        const fetchUser = async () => {
            if (auth.currentUser) {
                const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }

                // Fetch stats
                const intQ = query(collection(db, "interests"), where("uid", "==", auth.currentUser.uid));
                const favQ = query(collection(db, "favorites"), where("userId", "==", auth.currentUser.uid));

                const [intSnap, favSnap] = await Promise.all([
                    getDocs(intQ),
                    getDocs(favQ)
                ]);

                setStats({
                    interests: intSnap.size,
                    favorites: favSnap.size
                });
            }
        };
        if (isOpen) fetchUser();
    }, [isOpen]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
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
                        className="relative w-full max-w-sm bg-white h-full shadow-2xl overflow-y-auto no-scrollbar"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-black">My Profile</h2>
                                <button
                                    onClick={onCloseAction}
                                    className="p-2 hover:bg-accent rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* User Identity */}
                            <div className="flex flex-col items-center text-center mb-10">
                                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-accent mb-4 overflow-hidden">
                                    {(userData?.photoURL || auth.currentUser?.photoURL) ? (
                                        <img src={userData?.photoURL || auth.currentUser?.photoURL || ""} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} />
                                    )}
                                </div>
                                <h3 className="text-xl font-black">{userData?.displayName || auth.currentUser?.displayName || "User"}</h3>
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">
                                    {userData?.role || "Tenant"}
                                </p>

                                {userData?.address && (
                                    <div className="flex items-center gap-1 text-muted-foreground font-bold text-xs mt-3">
                                        <MapPin size={12} />
                                        <span>{userData.address}</span>
                                    </div>
                                )}

                                {userData?.isVerified && (
                                    <div className="mt-4 flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        <ShieldCheck size={12} />
                                        Identity Verified
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-accent/50 p-4 rounded text-center border border-border/30">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Interests</p>
                                    <p className="text-xl font-black text-foreground">{stats.interests}</p>
                                </div>
                                <div className="bg-accent/50 p-4 rounded text-center border border-border/30">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Saved</p>
                                    <p className="text-xl font-black text-foreground">{stats.favorites}</p>
                                </div>
                            </div>

                            {/* Menu Links */}
                            <div className="space-y-1 mb-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 px-2">Account Management</p>
                                {[
                                    { name: "Personal Information", icon: User, href: "/dashboard/client/profile" },
                                    { name: "My Interests", icon: Send, href: "/dashboard/client/interests" },
                                    { name: "Saved Properties", icon: Bookmark, href: "/dashboard/client/favorites" },
                                ].map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={onCloseAction}
                                        className="w-full flex items-center justify-between p-4 rounded hover:bg-accent/50 transition-all font-bold group"
                                    >
                                        <div className="flex items-center gap-4 text-foreground/80 group-hover:text-primary transition-colors">
                                            <div className="p-2.5 bg-accent rounded group-hover:bg-white transition-all shadow-sm shadow-transparent group-hover:shadow-primary/5">
                                                <item.icon size={18} />
                                            </div>
                                            <span className="text-sm">{item.name}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </Link>
                                ))}
                            </div>

                            <div className="border-t border-border  pt-10">
                                <Button
                                    onClick={handleSignOut}
                                    variant="outline"
                                    className="w-full h-14 rounded font-black text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200 flex gap-2"
                                >
                                    <LogOut size={20} />
                                    Sign Out
                                </Button>
                            </div>
                        </div>

                        {/* Help & Support Mini */}
                        <div className="absolute  left-8 right-8">
                            <div className="px-4 pb-4 bg-accent/30 rounded text-center">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Need help?</p>
                                <p className="text-sm font-black text-primary">support@lodgeme.com</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
