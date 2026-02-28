import { Bell, Search, User, LogOut, ShieldAlert, Tent, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { AdminNotificationsDrawer } from "@/components/modals/AdminNotificationsDrawer";

export const AdminHeader = () => {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [counts, setCounts] = useState({
        properties: 0,
        homeowners: 0,
        reports: 0
    });

    useEffect(() => {
        let unsubProps: (() => void) | null = null;
        let unsubOwners: (() => void) | null = null;
        let unsubReports: (() => void) | null = null;

        const stopListeners = () => {
            unsubProps?.();
            unsubOwners?.();
            unsubReports?.();
        };

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                setProfile(null);
                stopListeners();
                return;
            }

            try {
                const snap = await getDoc(doc(db, "users", user.uid));
                if (snap.exists()) {
                    const userData = snap.data();
                    setProfile(userData);

                    // Check for hardcoded super admin from environment variables
                    const superAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
                    const isAdmin = userData.role === "admin" || user.email === superAdminEmail;

                    if (isAdmin) {
                        // Real-time listeners for admin attention - only if admin
                        unsubProps = onSnapshot(query(collection(db, "properties"), where("status", "==", "pending")), (snap) => {
                            setCounts(prev => ({ ...prev, properties: snap.size }));
                        });

                        unsubOwners = onSnapshot(query(collection(db, "users"), where("verificationStatus", "==", "pending")), (snap) => {
                            setCounts(prev => ({ ...prev, homeowners: snap.size }));
                        });

                        unsubReports = onSnapshot(collection(db, "reports"), (snap) => {
                            setCounts(prev => ({ ...prev, reports: snap.size }));
                        });
                    }
                }
            } catch (e) {
                console.error("Admin Header Auth Error:", e);
            }
        });

        return () => {
            unsubscribe();
            stopListeners();
        };
    }, []);

    const totalNotifications = counts.properties + counts.homeowners + counts.reports;

    return (
        <>
            <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-30 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 lg:px-10">
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-accent px-3 py-1 rounded-full">
                            Admin Control Panel
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <button
                        onClick={() => setIsNotifOpen(true)}
                        className="p-2.5 rounded-full bg-accent/30 hover:bg-accent/50 transition-all relative active:scale-95"
                        aria-label="Notifications"
                    >
                        <Bell size={20} className={totalNotifications > 0 ? "animate-wiggle" : ""} />
                        {totalNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                                {totalNotifications}
                            </span>
                        )}
                    </button>

                    <div className="h-6 w-[1px] bg-border mx-2" />

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black leading-none text-black">{profile?.displayName || "Admin User"}</p>
                            <p className="text-[10px] font-bold text-primary italic lowercase">System Administrator</p>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard/admin")}
                            className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary hover:border-primary/80 transition-all active:scale-95 shadow-sm"
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

            <AdminNotificationsDrawer
                isOpen={isNotifOpen}
                onCloseAction={() => setIsNotifOpen(false)}
                counts={counts}
            />
        </>
    );
};
