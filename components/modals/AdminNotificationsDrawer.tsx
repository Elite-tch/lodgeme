"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Tent, ShieldAlert, Flag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdminNotificationsDrawerProps {
    isOpen: boolean;
    onCloseAction: () => void;
    counts: {
        properties: number;
        homeowners: number;
        reports: number;
    };
}

export const AdminNotificationsDrawer = ({ isOpen, onCloseAction, counts }: AdminNotificationsDrawerProps) => {
    const router = useRouter();

    const totalNotifications = counts.properties + counts.homeowners + counts.reports;

    const items = [
        {
            id: "properties",
            title: "Pending Properties",
            description: "New listings awaiting technical review and approval.",
            count: counts.properties,
            icon: Tent,
            color: "amber",
            href: "/dashboard/admin/verification"
        },
        {
            id: "homeowners",
            title: "Identity Verifications",
            description: "Homeowners submitted IDs for identity verification.",
            count: counts.homeowners,
            icon: ShieldAlert,
            color: "blue",
            href: "/dashboard/admin/homeowners/unverified"
        },
        {
            id: "reports",
            title: "Active Reports",
            description: "User reports regarding property issues or violations.",
            count: counts.reports,
            icon: Flag,
            color: "red",
            href: "/dashboard/admin/reports"
        }
    ];

    const handleClick = (href: string) => {
        router.push(href);
        onCloseAction();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCloseAction}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                    <Bell size={20} />
                                </div>
                                <h2 className="text-xl font-black">Admin Alerts</h2>
                            </div>
                            <button
                                onClick={onCloseAction}
                                className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-0">
                            <div className="p-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 px-1">Attention Required</h3>

                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleClick(item.href)}
                                            className={cn(
                                                "w-full text-left p-4 rounded-3xl border border-border/50 transition-all group relative overflow-hidden",
                                                item.count > 0 ? "bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5" : "opacity-40 grayscale pointer-events-none"
                                            )}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                                    item.color === "amber" ? "bg-amber-50 text-amber-600" :
                                                        item.color === "blue" ? "bg-blue-50 text-blue-600" :
                                                            "bg-red-50 text-red-600"
                                                )}>
                                                    <item.icon size={24} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-black text-sm text-black">{item.title}</h4>
                                                        {item.count > 0 && (
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-full text-[10px] font-black",
                                                                item.color === "amber" ? "bg-amber-100 text-amber-700" :
                                                                    item.color === "blue" ? "bg-blue-100 text-blue-700" :
                                                                        "bg-red-100 text-red-700"
                                                            )}>
                                                                {item.count}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {item.count > 0 && (
                                                <div className="mt-4 pt-4 border-t border-dashed border-border flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                                                    Manage Now
                                                    <ArrowRight size={14} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {totalNotifications === 0 && (
                                    <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                                        <div className="w-20 h-20 bg-accent/50 rounded-full flex items-center justify-center mb-6 text-muted-foreground/30">
                                            <Bell size={40} />
                                        </div>
                                        <h4 className="font-black text-lg mb-2">Zero Pending Tasks</h4>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            The platform is fully moderate and up to date. Excellent work!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border bg-[#fafafa]">
                            <p className="text-[10px] text-center font-bold text-muted-foreground/60 uppercase tracking-widest italic">
                                Real-time Moderation Sync Active
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
