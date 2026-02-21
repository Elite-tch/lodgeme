"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Bed, Bath, MapPin, Heart } from "lucide-react";
import Image from "next/image";

const listings = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
        price: "₦150,000/yr",
        address: "Victory Island, Lagos",
        beds: 2,
        baths: 2,
        feature: "24/7 Power",
        type: "Apartment",
        isVerified: true,
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
        price: "₦250,000/yr",
        address: "Asokoro, Abuja",
        beds: 3,
        baths: 3,
        feature: "Serviced",
        type: "Detached",
        isVerified: true,
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2034&auto=format&fit=crop",
        price: "₦80,000/yr",
        address: "Iwo Road, Ibadan",
        beds: 1,
        baths: 1,
        feature: "En-suite",
        type: "Studio",
        isVerified: false,
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=2074&auto=format&fit=crop",
        price: "₦300,000/yr",
        address: "GRA, Port Harcourt",
        beds: 4,
        baths: 4,
        feature: "Newly Built",
        type: "Duplex",
        isVerified: true,
    },
];

export const FeaturedListings = () => {
    return (
        <section className="py-14 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                    <Reveal direction="right" delay={0.1}>
                        <div>
                            <h2 className="text-4xl font-bold mb-4">Featured Listings</h2>
                            <p className="text-muted-foreground text-lg">Hand-picked homes from verified sources.</p>
                        </div>
                    </Reveal>
                    <Reveal direction="left" delay={0.2}>
                        <Button variant="outline" className="hidden md:flex">Explore All Properties</Button>
                    </Reveal>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {listings.map((item, index) => (
                        <Reveal key={item.id} delay={0.1 * index} width="100%" className="h-full">
                            <div className="group bg-white hover:bg-primary/[0.01] rounded overflow-hidden border border-border/60 hover:border-primary/30 transition-all duration-500 cursor-pointer h-full flex flex-col">
                                <div className="relative h-64 overflow-hidden shrink-0">
                                    <Image
                                        src={item.image}
                                        alt={item.address}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-4 right-4 z-10">
                                        <button className="w-10 h-10 glass rounded-full flex items-center justify-center text-foreground hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm border border-white/50">
                                            <Heart size={20} />
                                        </button>
                                    </div>
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-md shadow-sm">
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="px-4 py-1.5 glass rounded-xl text-sm font-bold bg-white/90 shadow-sm border border-white/50 text-primary">
                                            {item.price}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-6">
                                        <MapPin size={18} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors duration-500" />
                                        <span className="text-base font-semibold text-foreground/80 truncate group-hover:text-foreground transition-colors duration-500">{item.address}</span>
                                        {item.isVerified && (
                                            <div className="w-4 h-4 bg-[#f0d38f] rounded-full flex items-center justify-center shrink-0" title="Verified Homeowner">
                                                <svg className="w-3 h-3 text-[#bb7655]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto flex items-center justify-between border-t pt-6 border-dashed border-border">
                                        <div className="flex items-center gap-1.5 group/icon">
                                            <Bed size={16} className="text-primary/70 group-hover:text-primary transition-colors duration-500" />
                                            <span className="text-xs font-bold group-hover:text-primary transition-colors duration-500">{item.beds} Bds</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 group/icon">
                                            <Bath size={16} className="text-primary/70 group-hover:text-primary transition-colors duration-500" />
                                            <span className="text-xs font-bold group-hover:text-primary transition-colors duration-500">{item.baths} Bths</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 group/icon">
                                            <div className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                            </div>
                                            <span className="text-xs font-bold group-hover:text-primary transition-colors duration-500">{item.feature}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Button variant="outline" className="w-full">Explore All Properties</Button>
                </div>
            </div>
        </section>
    );
};
