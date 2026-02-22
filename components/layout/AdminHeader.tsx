"use client";

import { Bell, Search, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export const AdminHeader = () => {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) return;
            try {
                const snap = await getDoc(doc(db, "users", user.uid));
                if (snap.exists()) setProfile(snap.data());
            } catch (e) {
                console.error(e);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await signOut(auth);
        router.push("/");
    };

    return (
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-30 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 lg:px-10">
            <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-accent px-3 py-1 rounded-full">
                        Admin Control Panel
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="hidden md:flex relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Search dashboard..."
                        className="w-full h-10 pl-10 pr-4 bg-accent/30 border-transparent rounded-lg text-sm font-medium focus:bg-white focus:border-primary/20 transition-all outline-none"
                    />
                </div>

                <div className="h-6 w-[1px] bg-border mx-2" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black leading-none">{profile?.displayName || "Admin User"}</p>
                        <p className="text-[10px] font-bold text-primary italic lowercase">System Administrator</p>
                    </div>
                    <button
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-all active:scale-95 shadow-sm"
                        aria-label="Admin Profile"
                    >
                        <img
                            src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`}
                            alt="Admin"
                            className="w-full h-full object-cover"
                        />
                    </button>
                </div>
            </div>
        </header>
    );
};
