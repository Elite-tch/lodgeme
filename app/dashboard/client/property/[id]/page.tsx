"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { setDoc, deleteDoc, doc, where, collection, query, getDocs, getDoc } from "firebase/firestore";
import Link from "next/link";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import {
    MapPin,
    BedDouble,
    Bath,
    Droplets,
    ChevronLeft,
    Bookmark,
    Share2,
    ShieldCheck,
    Clock,
    CheckCircle2,
    MessageSquare,
    PhoneCall,
    Home,
    User,
    ArrowUpRight
} from "lucide-react";
import Image from "next/image";
import { InterestModal } from "@/components/modals/InterestModal";
import { ProfileModal } from "@/components/modals/ProfileModal";
import { NotificationsModal } from "@/components/modals/NotificationsModal";

export default function PropertyDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<any>(null);
    const [homeowner, setHomeowner] = useState<any>(null);
    const [homeownerPropertiesCount, setHomeownerPropertiesCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isFavorited, setIsFavorited] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    // Modal States
    const [isInterestOpen, setIsInterestOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    useEffect(() => {
        const fetchPropertyData = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "properties", id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() } as any;
                    setProperty(data);

                    // Fetch homeowner details
                    if (data.ownerUid) {
                        const userRef = doc(db, "users", data.ownerUid);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            setHomeowner(userSnap.data());
                        }

                        // Fetch homeowner's total properties count
                        const q = query(
                            collection(db, "properties"),
                            where("ownerUid", "==", data.ownerUid),
                            where("status", "==", "active")
                        );
                        const querySnapshot = await getDocs(q);
                        setHomeownerPropertiesCount(querySnapshot.size);
                    }
                } else {
                    console.error("No such property!");
                    router.push("/dashboard/client");
                }
            } catch (error) {
                console.error("Error fetching property data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyData();

        // Check if favorited
        const checkFavorite = async () => {
            if (auth.currentUser && id) {
                const favId = `${auth.currentUser.uid}_${id}`;
                const favSnap = await getDoc(doc(db, "favorites", favId));
                setIsFavorited(favSnap.exists());
            }
        };
        checkFavorite();
    }, [id, router]);

    const toggleFavorite = async () => {
        if (!auth.currentUser) {
            router.push("/auth/login");
            return;
        }

        const favId = `${auth.currentUser.uid}_${id}`;

        try {
            if (isFavorited) {
                await deleteDoc(doc(db, "favorites", favId));
                setIsFavorited(false);
            } else {
                await setDoc(doc(db, "favorites", favId), {
                    userId: auth.currentUser.uid,
                    propertyId: id,
                    createdAt: new Date().toISOString()
                });
                setIsFavorited(true);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full mb-4 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Loading Sanctuary...</p>
                </div>
            </div>
        );
    }

    if (!property) return null;

    const images = property.images && property.images.length > 0
        ? property.images
        : ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"];

    const timeAgo = (date: any) => {
        if (!date) return "Just now";
        try {
            const now = new Date();
            const past = date.toDate ? date.toDate() : new Date(date);
            const diffInMs = now.getTime() - past.getTime();
            const diffInSecs = Math.floor(diffInMs / 1000);
            const diffInMins = Math.floor(diffInSecs / 60);
            const diffInHrs = Math.floor(diffInMins / 60);
            const diffInDays = Math.floor(diffInHrs / 24);

            if (diffInDays > 0) return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
            if (diffInHrs > 0) return diffInHrs === 1 ? "1 hour ago" : `${diffInHrs} hours ago`;
            if (diffInMins > 0) return diffInMins === 1 ? "1 min ago" : `${diffInMins} mins ago`;
            return "Just now";
        } catch (e) {
            return "Just now";
        }
    };

    const handleMessageOwner = () => {
        if (!auth.currentUser) {
            router.push("/auth/login");
            return;
        }
        // Redirect to messages with owner context
        router.push(`/dashboard/client/messages?ownerId=${property.ownerUid}&propertyId=${property.id}`);
    };

    return (
        <main className="min-h-screen bg-[#fafafa] pb-32 lg:pb-12">
            <DashboardNavbar
                onProfileClick={() => setIsProfileOpen(true)}
                onNotifClick={() => setIsNotificationsOpen(true)}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group"
                >
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        <ChevronLeft size={18} />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Results</span>
                </button>

                <div className="">
                    {/* Left Column: Media & Description */}
                    <div className=" flex justify-between md:flex-row flex-col gap-6">
                        <div>


                            {/* Image Gallery */}
                            <Reveal direction="up">
                                <div className="space-y-4 md:w-[500px]">
                                    <div className="relative aspect-[4/3] rounded overflow-hidden  ">
                                        <Image
                                            src={images[activeImage]}
                                            alt={property.title}
                                            fill
                                            className="object-cover transition-transform duration-1000"
                                        />
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button
                                                onClick={toggleFavorite}
                                                className={`w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-90 ${isFavorited ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                                                <Bookmark size={20} fill={isFavorited ? "currentColor" : "none"} />
                                            </button>
                                            <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-lg active:scale-90">
                                                <Share2 size={20} />
                                            </button>
                                        </div>

                                    </div>

                                    {images.length > 1 && (
                                        <div className="flex gap-4 justify-center overflow-x-auto pb-2 no-scrollbar">
                                            {images.map((img: string, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveImage(idx)}
                                                    className={`relative w-24 h-20 rounded overflow-hidden shrink-0 transition-all ${activeImage === idx ? 'ring-2 ring-primary ring-offset-2 scale-95' : 'opacity hover:opacity-100'}`}
                                                >
                                                    <Image src={img} alt="" fill className="object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Reveal>

                            {/* Homeowner Section */}
                            <Reveal direction="up" delay={0.2}>
                                <div className=" rounded p-6 shadow-sm border border-border/50 mt-8 ">

                                    <div className="pb-5 flex items-center justify-end gap-6">
                                        <div className="flex items-center gap-1.5 grayscale opacity-60">
                                            <CheckCircle2 size={14} className="text-blue-500" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Account Active</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-lg">
                                                <Image
                                                    src={homeowner?.photoURL || homeowner?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                                    alt={homeowner?.fullName || "Homeowner"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-foreground leading-tight">{homeowner?.fullName || property.ownerName || "Premium Homeowner"}</h4>
                                                <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">
                                                    <MapPin size={12} className="text-primary" />
                                                    <span>{homeowner?.location || "Lagos, Nigeria"}</span>
                                                </div>
                                                <div className="mt-2 py-2 flex items-center gap-2 rounded text-center ">
                                                    <div className="text-lg font-black text-primary leading-none">{homeownerPropertiesCount}</div>
                                                    <div className="text-[8px] font-black uppercase tracking-widest text-primary/60 mt-1">Properties</div>
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                    <Link href={`/dashboard/client/homeowner/${property.ownerUid}`} className="flex justify-center">
                                        <Button variant="outline" className="w-fit h-12 rounded font-black border border-border/50 hover:bg-accent hover:border-primary/20 transition-all flex gap-2 group">
                                            <User size={18} className="text-primary" />
                                            View Public Profile
                                            <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                                        </Button>
                                    </Link>


                                </div>
                            </Reveal>
                        </div>
                        <div>
                            {/* Title & Stats */}
                            <Reveal direction="up" delay={0.1}>
                                <div className=" px-8 ">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                        <div>
                                            <h1 className="text-3xl lg:text-4xl font-black text-foreground mb-2 leading-tight">
                                                {property.title}
                                            </h1>
                                            <div className="flex items-center gap-2 text-muted-foreground font-bold">
                                                <MapPin size={18} className="text-primary" />
                                                <span>{property.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-border/50">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Bedrooms</span>
                                            <div className="flex items-center gap-2">
                                                <BedDouble size={20} className="text-primary" />
                                                <span className="text-md font-bold">{property.beds || 0} Rooms</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Bathrooms</span>
                                            <div className="flex items-center gap-2">
                                                <Bath size={20} className="text-primary" />
                                                <span className="text-md font-bold">{property.baths || 0} Baths</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Water Source</span>
                                            <div className="flex items-center gap-2">
                                                <Droplets size={20} className="text-blue-500" />
                                                <span className="text-sm font-bold uppercase">{property.waterSource || "Well"}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Posted On</span>
                                            <div className="flex items-center gap-2">
                                                <Clock size={20} className="text-orange-500" />
                                                <span className="text-md font-bold">{timeAgo(property.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="text-lg font-black mb-2 uppercase tracking-tight">About this Apartment</h3>
                                        <p className="text-muted-foreground leading-relaxed font-medium">
                                            {property.description || "No description provided for this luxury property."}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                            {/* Right Column: Pricing & Action Card */}
                            <div className=" space-y-3">
                                <Reveal direction="up" delay={0.3}>
                                    <div className="sticky top-2 space-y-6">
                                        {/* Pricing Card */}
                                        <div className="  p-8  overflow-hidden relative group">
                                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                                                <Home size={120} className="text-primary" />
                                            </div>

                                            <div className="relative z-10">
                                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Investment Required</p>
                                                <div className="flex items-baseline gap-2 mb-8">
                                                    <span className="text-lg font-black text-foreground">₦{Number(property.price).toLocaleString()}</span>
                                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">/Year</span>
                                                </div>

                                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                                                    <Button
                                                        onClick={handleMessageOwner}
                                                        className="flex-1 h-12 rounded text-[13px] font-black shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap px-4"
                                                    >
                                                        <MessageSquare size={16} />
                                                        Message Homeowner
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 h-12 rounded text-[13px] font-black border-2 border-border/50 hover:bg-accent flex items-center justify-center gap-2 transition-all whitespace-nowrap px-4"
                                                    >
                                                        <PhoneCall size={16} />
                                                        Book Inspection
                                                    </Button>
                                                </div>

                                              
                                            </div>
                                        </div>

                                        {/* Location Insight */}
                                        <div className="bg-white rounded p-8 shadow-sm border border-border/50">
                                            <h4 className="font-black text-sm uppercase tracking-widest mb-4">Location Insight</h4>
                                            <div className="aspect-video bg-accent/20 rounded-2xl relative overflow-hidden flex items-center justify-center border border-border/50 group">
                                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2070&auto=format&fit=crop')] opacity-20 grayscale group-hover:grayscale-0 transition-all duration-700 blur-[2px]" />
                                                <div className="relative z-10 flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                        <MapPin size={24} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm">View on Map</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Reveal>
                            </div>
                        </div>




                    </div>
                </div>
            </div>

            <BottomNav
                onProfileClick={() => setIsProfileOpen(true)}
                onFilterClick={() => { }}
            />

            {/* Modals Container */}
            <InterestModal
                isOpen={isInterestOpen}
                onCloseAction={() => setIsInterestOpen(false)}
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
