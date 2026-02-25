"use client";

import {
    LayoutDashboard,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Flag,
    LogOut,
    Menu,
    X,
    Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export const AdminSidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { name: "Overview", icon: LayoutDashboard, href: "/dashboard/admin" },
        { name: "Verify Properties", icon: ShieldCheck, href: "/dashboard/admin/verification" },
        { name: "Verified Properties", icon: CheckCircle2, href: "/dashboard/admin/verified" },
        { name: "Unapproved Properties", icon: XCircle, href: "/dashboard/admin/rejected" },
        { name: "Verified Owners", icon: Users, href: "/dashboard/admin/homeowners/verified" },
        { name: "Unverified Owners", icon: Users, href: "/dashboard/admin/homeowners/unverified" },
        { name: "Client Reports", icon: Flag, href: "/dashboard/admin/reports" },
    ];

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded shadow-lg border border-border"
            >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar Desktop/Overlay Mobile */}
            <aside className={cn(
                "fixed left-0 top-0 h-full w-64 bg-white border-r border-border z-40 transition-transform duration-300 lg:translate-x-0 flex flex-col",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Section */}
                <div className="p-8 pb-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="LODGEME" width={120} height={32} className="h-8 w-auto" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-white px-2 py-0.5 rounded leading-none mt-1">
                            Admin
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-1">
                    <p className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-4">
                        Management
                    </p>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3.5 rounded font-black transition-all group",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-muted-foreground/80 hover:text-foreground hover:bg-accent/50"
                                )}
                            >
                                <item.icon size={18} className={cn(
                                    "transition-transform group-hover:scale-110",
                                    isActive ? "text-white" : "text-primary/60"
                                )} />
                                <span className="text-xs uppercase tracking-widest">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-border">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-between px-4 py-3 rounded text-red-500 hover:bg-red-50 transition-all font-black group"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={18} />
                            <span className="text-xs uppercase tracking-widest">Sign Out</span>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
};
