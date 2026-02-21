"use client";

import { Home, Search, Heart, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const BottomNav = ({
    onProfileClick,
    onFilterClick
}: {
    onProfileClick?: () => void;
    onFilterClick?: () => void;
}) => {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", icon: Home, href: "/dashboard/client" },
        { name: "Filter", icon: Search, onClick: onFilterClick },
        { name: "Favorites", icon: Heart, href: "/dashboard/client/favorites" },
        { name: "Messages", icon: MessageSquare, href: "/dashboard/client/messages" },
        { name: "Profile", icon: User, onClick: onProfileClick },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-border px-4 py-3 pb-safe-offset-2">
            <div className="flex items-center justify-around max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = "href" in item && pathname === item.href;
                    const Content = (
                        <>
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest transition-all",
                                isActive ? "opacity-100" : "opacity-0 invisible h-0"
                            )}>
                                {item.name}
                            </span>
                        </>
                    );

                    const baseClass = cn(
                        "flex flex-col items-center gap-1 transition-all",
                        isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                    );

                    if ("onClick" in item && item.onClick) {
                        return (
                            <button key={item.name} onClick={item.onClick} className={baseClass}>
                                {Content}
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={"href" in item ? item.href : item.name}
                            href={("href" in item ? item.href : "#") as string}
                            className={baseClass}
                        >
                            {Content}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
