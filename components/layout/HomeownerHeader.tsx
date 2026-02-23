"use client";

import { Bell, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { NotificationsModal } from "@/components/modals/NotificationsModal";

interface HomeownerHeaderProps {
    onMenuClick?: () => void;
}

export const HomeownerHeader = ({ onMenuClick }: HomeownerHeaderProps) => {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch homeowner profile
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) return;
            try {
                const snap = await getDoc(doc(db, "users", user.uid));
                if (snap.exists()) setProfile(snap.data());
                else setProfile({ photoURL: user.photoURL, displayName: user.displayName });
            } catch (e) {
                console.error(e);
            }
        });
        return () => unsubscribe();
    }, []);

    // Real-time unread notification count
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, "users", user.uid, "notifications"),
            where("read", "==", false)
        );

        const unsub = onSnapshot(q, (snap) => {
            setUnreadCount(snap.size);
        });

        return () => unsub();
    }, []);

    // Re-check after auth changes (e.g. page refresh)
    useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged((user) => {
            if (!user) return;
            const q = query(
                collection(db, "users", user.uid, "notifications"),
                where("read", "==", false)
            );
            const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));
            return unsub;
        });
        return () => unsubAuth();
    }, []);

    const avatarSrc =
        profile?.photo ||
        profile?.photoURL ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid || "homeowner"}`;

    return (
        <>
            <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-40 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 gap-3">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 lg:hidden text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* Notification Bell */}
                    <button
                        onClick={() => setIsNotifOpen(true)}
                        className="relative p-2.5 hover:bg-accent rounded-full text-muted-foreground transition-all active:scale-95"
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center px-0.5">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* User Avatar → Profile */}
                    <button
                        onClick={() => router.push("/dashboard/homeowner/profile")}
                        className="w-9 h-9 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-all active:scale-95 shadow-sm"
                        aria-label="Go to profile"
                    >
                        <img
                            src={avatarSrc}
                            alt="My profile"
                            className="w-full h-full object-cover"
                        />
                    </button>
                </div>
            </header>

            <NotificationsModal
                isOpen={isNotifOpen}
                onCloseAction={() => setIsNotifOpen(false)}
                role="homeowner"
            />
        </>
    );
};
