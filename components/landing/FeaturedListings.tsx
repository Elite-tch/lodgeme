"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Bed, Bath, MapPin, Heart, Droplets } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const FeaturedListings = () => {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchNewestProperties = async () => {
            try {
                // Fetch newest verified properties
                const q = query(
                    collection(db, "properties"),
                    where("status", "==", "verified"),
                    orderBy("createdAt", "desc"),
                    limit(4)
                );
                const querySnapshot = await getDocs(q);
                const propertyList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProperties(propertyList);
            } catch (error) {
                console.error("Error fetching featured properties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNewestProperties();

        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });
        return () => unsub();
    }, []);

    return (
        <section className="py-14 bg-white" id="listings">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <Reveal direction="right" delay={0.1}>
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black mb-4">Latest <span className="text-primary italic">Properties</span></h2>
                            <p className="text-muted-foreground text-lg font-medium">Hand-picked homes from verified sources.</p>
                        </div>
                    </Reveal>
                    <Reveal direction="left" delay={0.2}>
                        <Link href="/explore">
                            <Button variant="outline" className="hidden md:flex h-12 px-8 border-border/60 hover:bg-primary hover:text-white transition-all">
                                Explore All Properties
                            </Button>
                        </Link>
                    </Reveal>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-accent/50 aspect-[4/3] rounded-xl mb-4" />
                                <div className="h-6 bg-accent/50 rounded-lg w-3/4 mb-2" />
                                <div className="h-4 bg-accent/50 rounded-lg w-1/2" />
                            </div>
                        ))
                    ) : properties.length > 0 ? (
                        properties.map((item, index) => (
                            <Reveal key={item.id} delay={0.1 * index} width="100%" className="h-full">
                                <Link
                                    href={user ? `/dashboard/client/property/${item.id}` : "/auth?mode=signup"}
                                    className="group block h-full"
                                >
                                    <div className="bg-white hover:bg-primary/[0.01] rounded-[24px] overflow-hidden border border-border/60 hover:border-primary/30 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_20px_40px_-15px_rgba(187,118,85,0.2)] transition-all duration-500 cursor-pointer h-full flex flex-col">
                                        <div className="relative aspect-[4/3] overflow-hidden shrink-0">
                                            <Image
                                                src={item.images?.[0] || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"}
                                                alt={item.title || item.address}
                                                fill
                                                className="object-cover transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 right-4 z-10">
                                                <button className="w-10 h-10 glass rounded-full flex items-center justify-center text-foreground hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm border border-white/50">
                                                    <Heart size={20} />
                                                </button>
                                            </div>
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">
                                                    {item.type || "Apartment"}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-4 left-4">
                                                <span className="px-4 py-1.5 glass rounded-xl text-sm font-black bg-white/90 shadow-sm border border-white/50 text-primary">
                                                    ₦{Number(item.price).toLocaleString()}/yr
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                                <MapPin size={16} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors duration-500" />
                                                <span className="text-sm font-bold text-foreground/80 truncate group-hover:text-foreground transition-colors duration-500">
                                                    {item.address}
                                                </span>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between border-t pt-4 border-dashed border-border/50">
                                                <div className="flex items-center gap-1.5">
                                                    <Bed size={16} className="text-primary/60" />
                                                    <span className="text-xs font-bold">{item.beds || 0} Bds</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Bath size={16} className="text-primary/60" />
                                                    <span className="text-xs font-bold">{item.baths || 0} Bths</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Droplets size={16} className="text-primary/60" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                                                        {item.waterSource || "Well"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Reveal>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-muted-foreground font-medium">
                            No properties available at the moment.
                        </div>
                    )}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/explore">
                        <Button variant="outline" className="w-full md:w-auto md:hidden h-14 px-10 border-border/60 hover:bg-primary hover:text-white transition-all">
                            Explore All Properties
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
