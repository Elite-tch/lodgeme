"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    // --- INACTIVITY LOGOUT LOGIC ---
    const INACTIVITY_THRESHOLD = 60 * 60 * 1000; // 1 Hour in milliseconds

    useEffect(() => {
        if (isChecking) return;

        const updateActivity = () => {
            localStorage.setItem("last_activity", Date.now().toString());
        };

        const checkInactivity = async () => {
            const lastActivity = localStorage.getItem("last_activity");
            if (lastActivity) {
                const elapsed = Date.now() - parseInt(lastActivity);
                if (elapsed > INACTIVITY_THRESHOLD) {
                    console.log("User inactive. Logging out...");
                    await signOut(auth);
                    localStorage.removeItem("last_activity");
                    router.push("/auth?mode=login&error=timeout");
                }
            } else {
                updateActivity();
            }
        };

        // Event listeners for activity
        const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
        events.forEach(event => window.addEventListener(event, updateActivity));

        // Initial update
        updateActivity();

        // Check every minute
        const interval = setInterval(checkInactivity, 60000);

        return () => {
            events.forEach(event => window.removeEventListener(event, updateActivity));
            clearInterval(interval);
        };
    }, [isChecking, router]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/auth?mode=login");
            } else {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists() && userDoc.data().isBanned) {
                        await signOut(auth);
                        router.push("/auth?mode=login&error=banned");
                        return;
                    }
                    setIsChecking(false);
                } catch (error) {
                    console.error("Layout auth check error:", error);
                    setIsChecking(false);
                }
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (isChecking) {
        return null; // Don't render dashboard content until verified
    }

    return <div className="md:pt-14 ">{children}</div>;
}
