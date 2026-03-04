"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import {
    Search,
    MapPin,
    Bed,
    Bath,
    Droplets,
    Heart,
    SlidersHorizontal,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    X,
    Home
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { cn } from "@/lib/utils";

export default function ExplorePage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [bedsFilter, setBedsFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const q = query(
                    collection(db, "properties"),
                    where("status", "==", "verified"),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const propertyList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProperties(propertyList);
                setFilteredProperties(propertyList);
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();

        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });
        return () => unsub();
    }, []);

    // Apply Filters
    useEffect(() => {
        let result = properties;

        if (searchQuery) {
            result = result.filter(p =>
                (p.address?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.title?.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (typeFilter) {
            result = result.filter(p => p.type?.toLowerCase().includes(typeFilter.toLowerCase()));
        }

        if (locationFilter) {
            result = result.filter(p => p.address?.toLowerCase().includes(locationFilter.toLowerCase()));
        }

        if (priceRange.min) {
            result = result.filter(p => Number(p.price) >= Number(priceRange.min));
        }

        if (priceRange.max) {
            result = result.filter(p => Number(p.price) <= Number(priceRange.max));
        }

        if (bedsFilter) {
            result = result.filter(p => p.beds >= parseInt(bedsFilter));
        }

        setFilteredProperties(result);
        setCurrentPage(1); // Reset to first page when filtering
    }, [searchQuery, typeFilter, priceRange, bedsFilter, locationFilter, properties]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const resetFilters = () => {
        setSearchQuery("");
        setTypeFilter("");
        setPriceRange({ min: "", max: "" });
        setBedsFilter("");
        setLocationFilter("");
    };

    return (
        <main className="min-h-screen bg-[#FAFAFA] overflow-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-20 h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/explore-hero.png')" }}
                >
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                </div>

                <div className="container relative z-10 px-6 text-center text-white">
                    <Reveal direction="down" delay={0.1}>
                        <h1 className="text-5xl md:text-6xl font-black font-heading mb-6 tracking-tight">Explore Properties</h1>
                    </Reveal>
                    <Reveal direction="up" delay={0.2}>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed">
                            Discover verified homes that match your lifestyle and budget.
                        </p>
                    </Reveal>

                    {/* Floating Search Bar */}
                    <Reveal direction="up" delay={0.3} className="mt-12 max-w-3xl mx-auto">
                        <div className="bg-white p-2 rounded-lg shadow-2xl flex flex-col md:flex-row gap-2">
                            <div className="flex-grow flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-border/50">
                                <Search className="text-primary" size={20} />
                                <input
                                    type="text"
                                    placeholder="Quick search by title or address..."
                                    className="w-full py-3 bg-transparent border-none focus:outline-none text-foreground font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button
                                className="h-14 md:px-10 rounded-lg font-bold bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal size={18} />
                                <span className="hidden sm:inline">Advanced Filters</span>
                            </Button>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-6 md:py-10">
                <div className="container mx-auto px-6">

                    {/* Filters Expandable Panel */}
                    {showFilters && (
                        <Reveal direction="down" className="mb-12">
                            <div className="bg-white p-6 md:p-8 rounded-lg border border-border shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black font-heading uppercase tracking-tight">Refine Your Search</h3>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Location</label>
                                        <input
                                            type="text"
                                            placeholder="City or Area"
                                            className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:outline-none font-medium text-sm"
                                            value={locationFilter}
                                            onChange={(e) => setLocationFilter(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Propery Type</label>
                                        <input
                                            type="text"
                                            placeholder="Flat, Duplex, etc"
                                            className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:outline-none font-medium text-sm"
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Min Price</label>
                                        <input
                                            type="number"
                                            placeholder="₦ Min"
                                            className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:outline-none font-medium text-sm"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Max Price</label>
                                        <input
                                            type="number"
                                            placeholder="₦ Max"
                                            className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:outline-none font-medium text-sm"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Bedrooms</label>
                                        <input
                                            type="number"
                                            placeholder="Min Bed"
                                            className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:outline-none font-medium text-sm"
                                            value={bedsFilter}
                                            onChange={(e) => setBedsFilter(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <Button
                                            variant="ghost"
                                            className="h-11 w-full font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                                            onClick={resetFilters}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    )}

                    {/* Results Count */}
                    <div className="flex items-center justify-between mb-10">
                        <p className="text-muted-foreground font-medium">
                            Showing <span className="text-foreground font-black">{filteredProperties.length}</span> properties
                        </p>
                    </div>

                    {/* Property Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-white aspect-[4/3] rounded-[24px] mb-4" />
                                    <div className="h-6 bg-white rounded-lg w-3/4 mb-2" />
                                    <div className="h-4 bg-white rounded-lg w-1/2" />
                                </div>
                            ))
                        ) : currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <Reveal key={item.id} delay={0.05 * index} width="100%" className="h-full">
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
                                                    className="object-cover transition-transform duration-700 pointer-events-none "
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
                                                <h3 className="font-bold text-lg mb-2 truncate group-hover:text-primary transition-colors">
                                                    {item.title || "Modern Apartment"}
                                                </h3>
                                                <div className="flex items-start gap-2 text-muted-foreground mb-4">
                                                    <MapPin size={16} className="text-primary/70 shrink-0 mt-0.5" />
                                                    <span className="text-sm font-medium line-clamp-2">
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

                                                {/* Details Protection Hint */}
                                                {!user && (
                                                    <div className="mt-4 py-2 px-3 bg-accent rounded-lg flex items-center gap-2">
                                                        <SlidersHorizontal size={14} className="text-primary" />
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                            Login to view full details
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </Reveal>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <Reveal direction="up">
                                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                                        <Home size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black font-heading mb-2">No properties found</h3>
                                    <p className="text-muted-foreground mb-8">Try adjusting your filters to find what you're looking for.</p>
                                    <Button variant="outline" onClick={resetFilters}>Clear All Filters</Button>
                                </Reveal>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-20 flex justify-center items-center gap-2">
                            <Button
                                variant="outline"
                                className="w-12 h-12 rounded-lg border-border/60 hover:text-primary transition-all"
                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={20} />
                            </Button>

                            <div className="flex items-center gap-1 capitalize">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => paginate(i + 1)}
                                        className={cn(
                                            "w-12 h-12 rounded-lg text-sm font-bold transition-all",
                                            currentPage === i + 1
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "bg-white border border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                className="w-12 h-12 rounded-lg border-border/60 hover:text-primary transition-all"
                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
