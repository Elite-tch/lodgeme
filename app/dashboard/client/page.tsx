"use client";

import { useEffect, useState } from "react";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { PlusCircle, SlidersHorizontal, MapPin, Home, BedDouble, Bath, Droplets, ChevronRight, Heart, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Modals
import { InterestModal } from "@/components/modals/InterestModal";
import { FilterModal } from "@/components/modals/FilterModal";
import { ProfileModal } from "@/components/modals/ProfileModal";
import { NotificationsModal } from "@/components/modals/NotificationsModal";

export default function ClientDashboard() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [isInterestOpen, setIsInterestOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const q = query(collection(db, "properties"), limit(12));
                const querySnapshot = await getDocs(q);
                const propertyList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProperties(propertyList);
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const handleApplyFilters = (filters: any) => {
        console.log("Applying filters:", filters);
        // Implement filtering logic here later
    };

    const filteredProperties = properties.filter(prop =>
        prop.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24 lg:pb-0">
            <DashboardNavbar
                onProfileClick={() => setIsProfileOpen(true)}
                onNotifClick={() => setIsNotificationsOpen(true)}
                onSearch={(query) => setSearchQuery(query)}
            />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <Reveal direction="up">
                        <h1 className="text-3xl lg:text-4xl font-black text-foreground">
                            Find your next <span className="text-primary italic">home</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium">
                            Explore verified properties tailored to your needs.
                        </p>
                    </Reveal>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setIsInterestOpen(true)}
                            className="font-bold flex gap-2 h-12 px-6 rounded shadow-lg shadow-primary/20"
                        >
                            <PlusCircle size={20} />
                            Post Interest
                        </Button>
                        <Button
                            onClick={() => setIsFilterOpen(true)}
                            variant="outline"
                            className="h-12 w-12 p-0 rounded border-border/60"
                        >
                            <SlidersHorizontal size={20} />
                        </Button>
                    </div>
                </div>


                {/* Property Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-accent/50 aspect-video rounded-xl mb-4" />
                                <div className="h-6 bg-accent/50 rounded-lg w-3/4 mb-2" />
                                <div className="h-4 bg-accent/50 rounded-lg w-1/2" />
                            </div>
                        ))
                    ) : filteredProperties.length > 0 ? (
                        filteredProperties.map((prop, index) => (
                            <Reveal key={prop.id} direction="up" delay={index * 0.05}>
                                <Link href={`/dashboard/client/property/${prop.id}`} className="group block h-full">
                                    <div className="bg-white w-[300px] rounded-lg overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(187,118,85,0.2)] transition-all duration-500 h-full flex flex-col border border-border/50">

                                        {/* Image Section - Flush with top */}
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <Image
                                                src={prop.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"}
                                                alt={prop.title}
                                                fill
                                                className="object-cover transition-transform duration-700 "
                                            />
                                            {/* Top Heart Overlay */}
                                            <div className="absolute top-3 right-3">
                                                <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-red-500 transition-all shadow-sm active:scale-90">
                                                    <Heart size={16} />
                                                </button>
                                            </div>


                                        </div>

                                        {/* Content Section */}
                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/60 mb-1">
                                                {prop.type || "Apartment"}
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

                                            {/* Clean Specs Row */}
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
                        ))
                    ) : (
                        // Empty State
                        <div className="col-span-full py-24 text-center">
                            <div className="bg-accent/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                                <Home size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-black mb-2">
                                {searchQuery ? "No matches found" : "No properties yet"}
                            </h3>
                            <p className="text-muted-foreground font-medium max-w-xs mx-auto mb-8">
                                {searchQuery
                                    ? `We couldn't find anything matching "${searchQuery}". Try a different city or location!`
                                    : "The library is currently empty. Check back once homeowners start listing properties!"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav
                onProfileClick={() => setIsProfileOpen(true)}
                onFilterClick={() => setIsFilterOpen(true)}
            />

            {/* Modals Container */}
            <InterestModal
                isOpen={isInterestOpen}
                onCloseAction={() => setIsInterestOpen(false)}
            />
            <FilterModal
                isOpen={isFilterOpen}
                onCloseAction={() => setIsFilterOpen(false)}
                onApplyAction={handleApplyFilters}
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
