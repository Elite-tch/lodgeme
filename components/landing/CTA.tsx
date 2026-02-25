"use client";

import { useState, useEffect } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const CTA = () => {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
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
        return () => unsub();
    }, []);

    const dashboardLink = role === "homeowner" ? "/dashboard/homeowner" : "/dashboard/client";

    return (
        <section className="py-24">
            <div className="container mx-auto px-6">
                <Reveal width="100%" delay={0.1}>
                    <div className="relative rounded-[40px] bg-primary overflow-hidden p-12 md:p-24 text-center">
                        {/* Abstract Background shapes */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                                Ready to Find Your Next Home?
                            </h2>
                            <p className="text-white/80 text-xl mb-12">
                                Join thousands of verified users today and experience rental search that actually works.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                {user ? (
                                    <Link href={dashboardLink}>
                                        <Button variant="secondary" size="lg" className="h-16 text-lg min-w-[280px] w-full shadow-xl">
                                            Go to Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/auth?mode=signup&role=tenant">
                                            <Button variant="secondary" size="lg" className="h-16 text-lg min-w-[240px] w-full">
                                                Sign Up as Client
                                            </Button>
                                        </Link>
                                        <Link href="/auth?mode=signup&role=homeowner">
                                            <Button variant="outline" size="lg" className="h-16 text-lg min-w-[240px] w-full border-white text-white hover:bg-white/10">
                                                Join as Homeowner
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};
