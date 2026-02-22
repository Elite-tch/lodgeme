"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import {
    MapPin,
    Mail,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Home,
    BedDouble,
    Bath,
    Droplets,
    ArrowUpRight,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Globe,
    CheckCircle2,
    Bookmark,
    Briefcase,
    Phone
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProfileModal } from "@/components/modals/ProfileModal";
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { setDoc, deleteDoc } from "firebase/firestore";

export default function HomeownerPublicProfile() {
    const { id } = useParams();
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [properties, setProperties] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    useEffect(() => {
        const fetchHomeownerData = async () => {
            if (!id) return;
            try {
                // Fetch homeowner basic info
                const userRef = doc(db, "users", id as string);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUserData(userSnap.data());

                    // Fetch all active properties from this homeowner
                    const q = query(
                        collection(db, "properties"),
                        where("ownerUid", "==", id),
                        where("status", "==", "active")
                    );
                    const querySnapshot = await getDocs(q);
                    const propertyList = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setProperties(propertyList);
                } else {
                    console.error("Homeowner not found");
                    router.push("/dashboard/client");
                }
            } catch (error) {
                console.error("Error fetching homeowner profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeownerData();

        // Fetch user favorites if logged in
        const fetchFavorites = async () => {
            if (auth.currentUser) {
                const favQ = query(collection(db, "favorites"), where("userId", "==", auth.currentUser.uid));
                const favSnap = await getDocs(favQ);
                setFavorites(favSnap.docs.map(doc => doc.data().propertyId));
            }
        };
        fetchFavorites();
    }, [id, router]);

    const toggleFavorite = async (e: React.MouseEvent, propertyId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!auth.currentUser) {
            router.push("/auth/login");
            return;
        }

        const isFav = favorites.includes(propertyId);
        const favId = `${auth.currentUser.uid}_${propertyId}`;

        try {
            if (isFav) {
                await deleteDoc(doc(db, "favorites", favId));
                setFavorites(prev => prev.filter(id => id !== propertyId));
            } else {
                await setDoc(doc(db, "favorites", favId), {
                    userId: auth.currentUser.uid,
                    propertyId: propertyId,
                    createdAt: new Date().toISOString()
                });
                setFavorites(prev => [...prev, propertyId]);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full mb-4 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (!userData) return null;

    return (
        <main className="min-h-screen bg-[#F0F2F5] pb-32">
            <DashboardNavbar
                onProfileClick={() => setIsProfileOpen(true)}
                onNotifClick={() => setIsNotificationsOpen(true)}
            />


            {/* Profile Header */}
            <div className=" mb-6">
                <div >
                    {/* Cover Photo */}
                    <div className="relative h-[250px] md:h-[250px] w-full bg-gradient-to-r from-primary/20 via-primary/10 to-accent/30  overflow-hidden group">
                        <Image
                            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
                            alt="Cover"
                            fill
                            className="object-cover transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-black/10" />

                        <div className="absolute top-6 left-6 z-10">
                            <button
                                onClick={() => router.back()}
                                className="h-10 w-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                            >
                                <ChevronLeft size={20} className="text-foreground" />
                            </button>
                        </div>
                    </div>
                    <div className="max-w-6xl mx-auto">
                        {/* Profile Summary Section */}
                        <div className="px-4 md:px-8 pb-4">
                            <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-20 md:-mt-12 mb-6">
                                <div className="relative w-40 h-40 md:w-44 md:h-44">
                                    <div className="absolute inset-0 bg-white rounded-full p-1.5 shadow-xl">
                                        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white">
                                            <Image
                                                src={userData.photoURL || userData.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                                alt={userData.displayName || userData.fullName || "Homeowner"}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 mt-4 md:mb-4">
                                    <h1 className="text-3xl font-black text-black mb-1 flex items-center gap-2">
                                        {userData.displayName || userData.fullName || userData.name || "Premium Homeowner"}
                                        <CheckCircle2 size={24} className="text-primary" />
                                    </h1>
                                    {(userData.occupation || userData.work) && (
                                        <p className="text-sm font-bold text-primary/80 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <Briefcase size={14} />
                                            {userData.occupation || userData.work}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground font-bold text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={16} className="text-primary" />
                                            <span>{userData.address || userData.location || "Lagos, Nigeria"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Home size={16} className="text-primary" />
                                            <span>{properties.length} Listings</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:mb-4">
                                    <Button
                                        onClick={() => router.push(`/dashboard/client/messages?ownerId=${id}`)}
                                        className="h-11 px-6 rounded-lg font-black shadow-lg shadow-primary/20 flex items-center gap-2"
                                    >
                                        <MessageCircle size={18} />
                                        Message
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex md:flex-row flex-col gap-6">

                        {/* Left Sidebar: About */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="text-xl font-black mb-6">Intro</h3>

                                <div className="space-y-6">
                                    <div className="bg-accent/10 p-5 rounded-2xl border border-accent/20">
                                        <p className="text-xs font-black uppercase tracking-widest text-primary/60 mb-3">About</p>
                                        <p className="text-sm font-medium leading-relaxed italic text-black">
                                            {userData?.bio ? `"${userData.bio}"` : "No bio added yet. Tell tenants about yourself!"}
                                        </p>
                                    </div>

                                    <div className="space-y-5 pt-2">
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-11 h-11 rounded-xl bg-accent/30 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary/10">
                                                <Mail size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">Email Address</span>
                                                <span className="font-bold text-sm">{userData.email || "Private"}</span>
                                            </div>
                                        </div>

                                        {(userData.phone || userData.phoneNumber) && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-11 h-11 rounded-xl bg-accent/30 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary/10">
                                                    <Phone size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">Phone Contact</span>
                                                    <span className="font-bold text-sm">{userData.phone || userData.phoneNumber}</span>
                                                </div>
                                            </div>
                                        )}

                                        {userData.whatsapp && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-11 h-11 rounded-xl bg-accent/30 flex items-center justify-center text-green-600 shrink-0 transition-colors group-hover:bg-green-50">
                                                    <MessageCircle size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">WhatsApp</span>
                                                    <span className="font-bold text-sm text-green-700">{userData.whatsapp}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 group">
                                            <div className="w-11 h-11 rounded-xl bg-accent/30 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary/10">
                                                <Globe size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">Primary Location</span>
                                                <span className="font-bold text-sm">{userData.address || userData.location || "Nigeria"}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 group">
                                            <div className="w-11 h-11 rounded-xl bg-accent/30 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-primary/10">
                                                <Calendar size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">Member Since</span>
                                                <span className="font-bold text-sm">October 2024</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Properties */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className=" ">
                                <h3 className="text-lg font-bold md:text-2xl font-black text-foreground">Other property from {userData.displayName || userData.fullName || "Owner"}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {properties.slice(0, 2).map((prop, idx) => (
                                    <Reveal key={prop.id} direction="up" delay={idx * 0.05}>
                                        <Link href={`/dashboard/client/property/${prop.id}`} className="group block w-[350px] h-full">
                                            <div className="bg-white rounded overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(187,118,85,0.2)] transition-all duration-500 h-full flex flex-col border border-border/50">
                                                {/* Image Section */}
                                                <div className="relative aspect-[4/3] overflow-hidden">
                                                    <Image
                                                        src={prop.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"}
                                                        alt={prop.title || "Property"}
                                                        fill
                                                        className="object-cover transition-transform duration-700 "
                                                    />
                                                </div>

                                                {/* Content Section */}
                                                <div className="p-4 flex flex-col flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/60">
                                                            {prop.type || "Apartment"}
                                                        </div>
                                                        <button
                                                            onClick={(e) => toggleFavorite(e, prop.id)}
                                                            className={`w-7 h-7 rounded-full transition-all flex items-center justify-center active:scale-90 ${favorites.includes(prop.id) ? 'bg-primary text-white' : 'bg-accent/50 text-primary hover:bg-primary hover:text-white'}`}
                                                        >
                                                            <Bookmark size={14} fill={favorites.includes(prop.id) ? "currentColor" : "none"} />
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

                                {properties.length === 0 && (
                                    <div className="bg-white rounded-xl p-20 text-center shadow-sm">
                                        <Home size={32} className="mx-auto text-muted-foreground/30 mb-4" />
                                        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No listings found</p>
                                    </div>
                                )}
                            </div>

                            {properties.length > 2 && (
                                <Reveal direction="up" delay={0.2}>
                                    <div className="flex justify-center mt-12 pb-10">
                                        <Link href="/dashboard/client">
                                            <Button variant="outline" className="h-12 px-10 rounded font-black gap-3 hover:bg-primary hover:text-white transition-all duration-500  border-2 border-primary/10">
                                                View All Listings
                                                <ChevronRight size={20} />
                                            </Button>
                                        </Link>
                                    </div>
                                </Reveal>
                            )}
                        </div>
                    </div>
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

            </div>
        </main>
    );
}
