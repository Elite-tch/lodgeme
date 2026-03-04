"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                const userDoc = await getDoc(doc(db, "users", u.uid));
                if (userDoc.exists()) {
                    setRole(userDoc.data().role);
                }
            } else {
                setRole(null);
            }
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            unsub();
        };
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
    };

    const dashboardLink = role === "homeowner" ? "/dashboard/homeowner" : "/dashboard/client";

    const navLinks = [
        { name: "How it works", href: "/#how-it-works" },
        { name: "Why Lodgeme", href: "/#why-lodgeme" },
        { name: "Explore", href: "/explore" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
                isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-border py-4" : "bg-[#FAFAFA] py-6"
            )}
        >
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="LODGEME" width={140} height={40} className="h-10 w-auto" />
                </Link>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-bold text-foreground hover:text-primary transition-colors uppercase tracking-widest"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* Auth Buttons */}
                <div className="hidden lg:flex items-center gap-4">
                    {user ? (
                        <>
                            <Link href={dashboardLink}>
                                <Button variant="ghost" className="font-bold bg-white uppercase tracking-widest text-xs flex gap-2">
                                    <LayoutDashboard size={14} />
                                    Dashboard
                                </Button>
                            </Link>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="px-6 font-bold uppercase tracking-widest text-xs border-primary/20 text-black hover:bg-primary/5 flex gap-2"
                            >
                                <LogOut size={14} />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth?mode=login">
                                <Button variant="ghost" className="font-bold uppercase text-black bg-white tracking-widest text-xs">
                                    Log In
                                </Button>
                            </Link>
                            <Link href="/auth?mode=signup">
                                <Button className="px-6 font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden text-foreground"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-white border-b border-border p-6 flex flex-col gap-6 lg:hidden shadow-xl"
                    >
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-lg font-bold text-foreground hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="flex flex-col gap-4 pt-4 border-t border-border">
                            {user ? (
                                <>
                                    <Link href={dashboardLink} onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full font-bold">Go to Dashboard</Button>
                                    </Link>
                                    <Button
                                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                        variant="outline"
                                        className="w-full font-bold"
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth?mode=login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                                        <Button variant="outline" className="w-full font-bold">Log In</Button>
                                    </Link>
                                    <Link href="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                                        <Button className="w-full font-bold">Sign Up</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
