"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useState } from "react";

interface FilterModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onApplyAction: (filters: any) => void;
}

export const FilterModal = ({ isOpen, onCloseAction, onApplyAction }: FilterModalProps) => {
    const [filters, setFilters] = useState({
        minPrice: "",
        maxPrice: "",
        beds: "",
        baths: "",
        type: "",
        waterSource: "",
    });

    const handleReset = () => {
        const resetFilters = {
            minPrice: "",
            maxPrice: "",
            beds: "",
            baths: "",
            type: "",
            waterSource: "",
        };
        setFilters(resetFilters);
        onApplyAction(resetFilters);
    };

    const handleApply = () => {
        onApplyAction(filters);
        onCloseAction();
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
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded">
                                        <SlidersHorizontal size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black">Filters</h2>
                                </div>
                                <button
                                    onClick={onCloseAction}
                                    className="p-2 hover:bg-accent rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-10">
                                {/* Price Range */}
                                <div className="space-y-4">
                                    <h3 className="font-black text-sm uppercase tracking-widest text-primary/60">Price Range (₦)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase">Min Price</Label>
                                            <Input
                                                placeholder="e.g. 500,000"
                                                value={filters.minPrice}
                                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                                className="h-12 rounded bg-accent/30 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase">Max Price</Label>
                                            <Input
                                                placeholder="e.g. 2,000,000"
                                                value={filters.maxPrice}
                                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                                className="h-12 rounded bg-accent/30 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Rooms */}
                                <div className="space-y-4">
                                    <h3 className="font-black text-sm uppercase tracking-widest text-primary/60">Rooms & Space</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase">Bedrooms</Label>
                                            <Input
                                                placeholder="e.g. 2 Bedrooms"
                                                value={filters.beds}
                                                onChange={(e) => setFilters({ ...filters, beds: e.target.value })}
                                                className="h-12 rounded bg-accent/30 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase">Bathrooms</Label>
                                            <Input
                                                placeholder="e.g. 3 Baths"
                                                value={filters.baths}
                                                onChange={(e) => setFilters({ ...filters, baths: e.target.value })}
                                                className="h-12 rounded bg-accent/30 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Property Type */}
                                <div className="space-y-4">
                                    <h3 className="font-black text-sm uppercase tracking-widest text-primary/60">Property Type</h3>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase">What type of home?</Label>
                                        <Input
                                            placeholder="e.g. Duplex, Self-Contain..."
                                            value={filters.type}
                                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                            className="h-12 rounded bg-accent/30 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Water Source/Extras */}
                                <div className="space-y-4">
                                    <h3 className="font-black text-sm uppercase tracking-widest text-primary/60">Utilities</h3>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase">Preferred Water Source</Label>
                                        <Input
                                            placeholder="e.g. Borehole, Water Corp"
                                            value={filters.waterSource}
                                            onChange={(e) => setFilters({ ...filters, waterSource: e.target.value })}
                                            className="h-12 rounded bg-accent/30 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mt-12 pb-10">
                                <Button
                                    onClick={handleApply}
                                    className="h-14 rounded font-black shadow-xl shadow-primary/20 text-lg"
                                >
                                    Apply Search Filters
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    className="h-12 rounded font-bold flex gap-2 border-border/60 text-muted-foreground"
                                >
                                    <Trash2 size={16} />
                                    Reset All
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
