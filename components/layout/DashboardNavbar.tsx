"use client";

import { Search, Bell, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export const DashboardNavbar = ({
    onProfileClick,
    onNotifClick,
    onSearch
}: {
    onProfileClick: () => void;
    onNotifClick: () => void;
    onSearch?: (query: string) => void;
}) => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const setupListener = (user: any) => {
            if (!user) return;
            const q = query(
                collection(db, "users", user.uid, "notifications"),
                where("read", "==", false)
            );
            const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));
            return unsub;
        };

        const unsubAuth = auth.onAuthStateChanged((user) => {
            const unsub = setupListener(user);
            return () => unsub?.();
        });

        return () => unsubAuth();
    }, []);

    return (
        <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-border px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="flex-shrink-0">
                    <Image src="/logo.png" alt="LODGEME" width={100} height={28} className="h-8 w-auto" />
                </Link>


                <div className="h-4 w-[1px] bg-border mx-2 hidden sm:block" />

                <Link
                    href="/dashboard/client"
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all hidden sm:block"
                >
                    Dashboard
                </Link>

                {/* Search Bar */}
                <div className="hidden sm:flex flex-1 max-w-xl relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Search size={18} />
                    </div>
                    <Input
                        placeholder="Search by city or location..."
                        className="pl-12 h-11 bg-accent/30 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 rounded"
                        onChange={(e) => onSearch?.(e.target.value)}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={onNotifClick}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-full transition-all relative"
                    >
                        <Bell size={22} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center px-0.5">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block" />

                    <button
                        onClick={onProfileClick}
                        className="flex items-center gap-2 p-1 pl-1 pr-3 hover:bg-accent/50 rounded-full border border-border transition-all"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-primary/20">
                            <User size={20} />
                        </div>
                        <span className="text-sm font-bold text-foreground hidden md:block">Profile</span>
                    </button>
                </div>
            </div>

            {/* Mobile Search */}
            <div className="mt-3 sm:hidden relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Search size={18} />
                </div>
                <Input
                    placeholder="Search location..."
                    className="pl-12 h-11 bg-accent/30 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 rounded"
                    onChange={(e) => onSearch?.(e.target.value)}
                />
            </div>
        </nav>
    );
};
