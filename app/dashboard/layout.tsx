"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                // Not logged in? Go to login
                router.push("/auth?mode=login");
            } else {
                // Logged in? Allow access
                setIsChecking(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (isChecking) {
        return null; // Don't render dashboard content until verified
    }

    return <>{children}</>;
}
