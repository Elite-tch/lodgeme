"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.push("/auth/login");
                return;
            }

            try {
                // Check for hardcoded super admin from environment variables
                const superAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
                if (user.email === superAdminEmail) {
                    setIsAuthorized(true);
                    setLoading(false);
                    return;
                }

                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists() && userDoc.data().role === "admin") {
                    setIsAuthorized(true);
                } else {
                    // Redirect non-admins to their respective dashboards
                    const role = userDoc.data()?.role;
                    if (role === "homeowner") router.push("/dashboard/homeowner");
                    else router.push("/dashboard/client");
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                router.push("/auth/login");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
                        Authenticating Admin...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <AdminSidebar />
            <AdminHeader />
            <div className="lg:ml-64 pt-16 min-h-screen">
                {children}
            </div>
        </div>
    );
}
