"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Reveal } from "@/components/ui/Reveal";
import { Bookmark, MapPin, BedDouble, Bath, Droplets, Home, ChevronLeft, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfileModal } from "@/components/modals/ProfileModal";
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { Button } from "@/components/ui/Button";

export default function FavoritesPage() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!auth.currentUser) {
                setLoading(false);
                return;
            }

            try {
                // Get all favorite IDs for this user
                const favQ = query(collection(db, "favorites"), where("userId", "==", auth.currentUser.uid));
                const favSnap = await getDocs(favQ);
                const propertyIds = favSnap.docs.map(doc => doc.data().propertyId);

                if (propertyIds.length === 0) {
                    setFavorites([]);
                    setLoading(false);
                    return;
                }

                // Fetch property details for each ID
                const propertyPromises = propertyIds.map(async (id) => {
                    const docSnap = await getDoc(doc(db, "properties", id));
                    if (docSnap.exists()) {
                        return { id: docSnap.id, ...docSnap.data() };
                    }
                    return null;
                });

                const properties = await Promise.all(propertyPromises);
                setFavorites(properties.filter(p => p !== null));
            } catch (error) {
                console.error("Error fetching favorites:", error);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchFavorites();
            } else {
                router.push("/auth/login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    const removeFavorite = async (e: React.MouseEvent, propertyId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!auth.currentUser) return;

        const favId = `${auth.currentUser.uid}_${propertyId}`;
        try {
            await deleteDoc(doc(db, "favorites", favId));
            setFavorites(prev => prev.filter(p => p.id !== propertyId));
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full mb-4 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Your favorites are coming...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#fafafa] pb-32">
            <DashboardNavbar
                onProfileClick={() => setIsProfileOpen(true)}
                onNotifClick={() => setIsNotificationsOpen(true)}
                onSearch={(query) => setSearchQuery(query)}
            />

            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col gap-4 mb-10">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-accent transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black text-foreground">
                            Saved <span className="text-primary italic">Properties</span>
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1">
                            Your personal collection of dream homes.
                        </p>
                    </div>
                </div>

                {favorites.filter(prop =>
                    !searchQuery ||
                    prop.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    prop.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    prop.type?.toLowerCase().includes(searchQuery.toLowerCase())
                ).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {favorites.filter(prop =>
                            !searchQuery ||
                            prop.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            prop.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            prop.type?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((prop, index) => (
                            <Reveal key={prop.id} direction="up" delay={index * 0.05}>
                                <Link href={`/dashboard/client/property/${prop.id}`} className="group block w-[300px] h-full">
                                    <div className="bg-white rounded-lg overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(187,118,85,0.2)] transition-all duration-500 h-full flex flex-col border border-border/50">
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <Image
                                                src={prop.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"}
                                                alt={prop.title}
                                                fill
                                                className="object-cover transition-transform duration-700 "
                                            />
                                        </div>

                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/60">
                                                    {prop.type || "Apartment"}
                                                </div>
                                                <button
                                                    onClick={(e) => removeFavorite(e, prop.id)}
                                                    className="w-7 h-7 rounded-full bg-accent/50 flex items-center justify-center text-primary transition-all hover:bg-primary hover:text-white shrink-0 active:scale-90"
                                                >
                                                    <Bookmark size={14} fill="currentColor" />
                                                </button>
                                            </div>
                                            <h3 className="font-bold text-base text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                                                {prop.title}
                                            </h3>

                                            <p className="text-muted-foreground font-medium text-xs flex items-center gap-1 mb-4">
                                                <MapPin size={13} className="text-primary/70 shrink-0" />
                                                <span className="line-clamp-1">{prop.address}</span>
                                            </p>

                                            <div className="flex-1">
                                                <div className="flex justify-end pb-3 gap-1.5 pointer-events-none">
                                                    <span className="text-lg font-bold text-foreground">₦{Number(prop.price).toLocaleString()}</span>
                                                    <span className="text-[10px] font-medium opacity-60 lowercase mt-2">/ year</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-muted-foreground">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <BedDouble size={18} className="text-primary/60" />
                                                        <span className="text-xs font-bold">{prop.beds || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Bath size={18} className="text-primary/60" />
                                                        <span className="text-xs font-bold">{prop.baths || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Droplets size={18} className="text-primary/60" />
                                                        <span className="text-[10px] font-black uppercase tracking-tighter">{prop.waterSource || "Well"}</span>
                                                    </div>
                                                </div>

                                                <div className="text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                                                    <ArrowUpRight size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-white shadow-xl rounded-3xl flex items-center justify-center mb-8 text-primary/40 rotate-12 group">
                            <Bookmark size={40} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <h2 className="text-2xl font-black mb-3">No saved properties yet</h2>
                        <p className="text-muted-foreground font-medium max-w-sm mb-10 leading-relaxed">
                            Start exploring properties and tap the heart icon to save the ones you love!
                        </p>
                        <Link href="/dashboard/client">
                            <Button className="h-14 px-10 rounded font-black text-[13px] shadow-xl shadow-primary/20">
                                Start Exploring
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <BottomNav
                onProfileClick={() => setIsProfileOpen(true)}
                onFilterClick={() => { }}
            />

            <ProfileModal
                isOpen={isProfileOpen}
                onCloseAction={() => setIsProfileOpen(false)}
            />
            <NotificationsModal
                isOpen={isNotificationsOpen}
                onCloseAction={() => setIsNotificationsOpen(false)}
            />
        </main>
    );
}
