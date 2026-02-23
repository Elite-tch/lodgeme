"use client";

import { HomeownerSidebar } from "@/components/layout/HomeownerSidebar";
import { HomeownerHeader } from "@/components/layout/HomeownerHeader";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomeownerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            {/* Sidebar - Desktop (Fixed) & Mobile (Drawer) */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <HomeownerSidebar />

                {/* Close button for mobile */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-4 right-4 p-2 lg:hidden text-muted-foreground hover:text-foreground"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0">
                <HomeownerHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 lg:ml-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
