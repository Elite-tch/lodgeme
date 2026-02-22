"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Reveal } from "@/components/ui/Reveal";
import { Send, Clock, Trash2, MapPin, Search, BedDouble, Bath, Wallet, PlusCircle } from "lucide-react";
import { ProfileModal } from "@/components/modals/ProfileModal";
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { InterestModal } from "@/components/modals/InterestModal";
import { useRouter } from "next/navigation";

export default function MyInterestsPage() {
    const router = useRouter();
    const [interests, setInterests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isInterestOpen, setIsInterestOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) fetchInterests();
            else setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const fetchInterests = async () => {
        if (auth.currentUser) {
            try {
                const q = query(
                    collection(db, "interests"),
                    where("uid", "==", auth.currentUser.uid)
                );
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Sort in memory to avoid index requirement
                data.sort((a: any, b: any) => {
                    const dateA = a.createdAt?.seconds || 0;
                    const dateB = b.createdAt?.seconds || 0;
                    return dateB - dateA;
                });

                setInterests(data);
            } catch (error) {
                console.error("Error fetching interests:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this interest post?")) return;

        try {
            await deleteDoc(doc(db, "interests", id));
            setInterests(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Error deleting interest:", error);
        }
    };

    const filteredInterests = interests.filter(item =>
        item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return null;

    return (
        <main className="min-h-screen bg-[#fafafa] pb-32">
            <DashboardNavbar
                onProfileClick={() => setIsProfileOpen(true)}
                onNotifClick={() => setIsNotificationsOpen(true)}
                onSearch={(q) => setSearchQuery(q)}
            />

            <div className="max-w-4xl mx-auto px-6 py-10">
                <Reveal direction="up">
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-foreground">My <span className="text-primary italic">Interests</span></h1>
                            <p className="text-muted-foreground font-medium mt-1">Manage your active property requests visible to homeowners.</p>
                        </div>
                        <button
                            onClick={() => setIsInterestOpen(true)}
                            className="bg-primary text-white font-black px-6 py-3 rounded shadow-lg shadow-primary/20 hover:scale-105 transition-all text-xs flex items-center gap-2 w-fit"
                        >
                            <PlusCircle size={18} />
                            Post New Interest
                        </button>
                    </div>
                </Reveal>

                {filteredInterests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInterests.map((interest, idx) => (
                            <Reveal key={interest.id} direction="up" delay={idx * 0.1}>
                                <div className="bg-white p-6 rounded shadow-sm border border-border/50 group relative hover:border-primary/20 transition-all flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Send size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Request</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(interest.id)}
                                            className="text-muted-foreground/30 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-4 mb-6 flex-1">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-accent/50 rounded-lg text-primary">
                                                <MapPin size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Location</p>
                                                <p className="text-sm font-bold text-foreground">{interest.location || "Anywhere"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-accent/50 rounded-lg text-primary">
                                                <Wallet size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Budget</p>
                                                <p className="text-sm font-bold text-foreground">₦{Number(interest.budget).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-accent/30 rounded border border-border/30">
                                                <BedDouble size={14} className="text-primary" />
                                                <span className="text-xs font-bold text-foreground">{interest.beds || 0} Beds</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-accent/30 rounded border border-border/30">
                                                <Bath size={14} className="text-primary" />
                                                <span className="text-xs font-bold text-foreground">{interest.baths || 0} Baths</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-accent/20 p-4 rounded-lg border-l-4 border-primary/20 mb-6">
                                        <p className="text-xs font-medium text-foreground/70 italic line-clamp-3">
                                            "{interest.content}"
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold">
                                            <Clock size={12} />
                                            {interest.createdAt?.toDate ? new Date(interest.createdAt.toDate()).toLocaleDateString() : "Just now"}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded">
                                            Visible
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                ) : (
                    <Reveal direction="up" delay={0.2}>
                        <div className="text-center py-20 bg-white rounded border border-dashed border-border/60">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/30">
                                <Send size={32} />
                            </div>
                            <h3 className="text-xl font-black mb-2">No interest posted yet</h3>
                            <p className="text-muted-foreground font-medium max-w-xs mx-auto mb-8">
                                Tell homeowners what you're looking for and they'll reach out to you directly!
                            </p>
                            <button
                                onClick={() => router.push("/dashboard/client")}
                                className="bg-primary text-white font-black px-8 py-3 rounded shadow-xl shadow-primary/20 hover:scale-105 transition-all text-sm"
                            >
                                Post First Interest
                            </button>
                        </div>
                    </Reveal>
                )}
            </div>

            <BottomNav
                onProfileClick={() => setIsProfileOpen(true)}
            />

            <ProfileModal
                isOpen={isProfileOpen}
                onCloseAction={() => setIsProfileOpen(false)}
            />
            <NotificationsModal
                isOpen={isNotificationsOpen}
                onCloseAction={() => setIsNotificationsOpen(false)}
            />
            <InterestModal
                isOpen={isInterestOpen}
                onCloseAction={() => setIsInterestOpen(false)}
                onSuccess={fetchInterests}
            />
        </main>
    );
}
