"use client";

import {
    LayoutDashboard,
    Home,
    PlusCircle,
    TrendingUp,
    MessageSquare,
    UserCircle,
    LogOut
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useState } from "react";

interface HomeownerSidebarProps {
}

export const HomeownerSidebar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push("/auth");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard/homeowner" },
        { name: "My Listings", icon: Home, href: "/dashboard/homeowner/listings" },
        { name: "Add Property", icon: PlusCircle, href: "/dashboard/homeowner/add" },
        { name: "Market Insight", icon: TrendingUp, href: "/dashboard/homeowner/insight" },
        { name: "Messages", icon: MessageSquare, href: "/dashboard/homeowner/messages" },
        { name: "Profile", icon: UserCircle, href: "/dashboard/homeowner/profile" },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-border hidden lg:flex flex-col z-50">
            {/* Logo */}
            <div className="p-8">
                <Link href="/dashboard/homeowner">
                    <Image src="/logo.png" alt="LODGEME" width={140} height={40} className="h-10 w-auto" />
                </Link>
            </div>

            {/* Verification Card 
            <div className="px-6 mb-8">
                <div className={cn(
                    "p-4 rounded border flex flex-col gap-3 relative overflow-hidden",
                    isVerified
                        ? "bg-green-50/50 border-green-100"
                        : "bg-amber-50/50 border-amber-100"
                )}>
                    <div className="flex items-center gap-2">
                        {isVerified ? (
                            <ShieldCheck className="text-green-600" size={18} />
                        ) : (
                            <ShieldAlert className="text-amber-600" size={18} />
                        )}
                        <span className={cn(
                            "text-xs font-black uppercase tracking-widest",
                            isVerified ? "text-green-700" : "text-amber-700"
                        )}>
                            {isVerified ? "Verified Owner" : "Not Verified"}
                        </span>
                    </div>

                    {!isVerified && (
                        <button
                            onClick={() => setIsVerifyModalOpen(true)}
                            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black rounded transition-colors uppercase tracking-widest"
                        >
                            Start Verification
                        </button>
                    )}
                </div>
            </div>

            <VerificationModal
                isOpen={isVerifyModalOpen}
                onCloseAction={() => setIsVerifyModalOpen(false)}
            />
*/}
            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded font-bold transition-all",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                        >
                            <item.icon size={20} />
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-6 border-t border-border">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 w-full text-red-500 font-bold hover:bg-red-50 rounded transition-all group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};
