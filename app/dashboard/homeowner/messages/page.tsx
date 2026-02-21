"use client";

import { HomeownerSidebar } from "@/components/layout/HomeownerSidebar";
import { Reveal } from "@/components/ui/Reveal";
import { MessageSquare, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function HomeownerMessagesPage() {
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) setUserData(userDoc.data());
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            <HomeownerSidebar />

            <main className="flex-1 lg:ml-64 p-6 lg:p-12 mb-20 lg:mb-0">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl lg:text-4xl font-black mb-12">Messages</h1>

                    <Reveal width="100%" direction="up" delay={0.1}>
                        <div className="bg-white border border-border rounded overflow-hidden shadow-sm h-[600px] flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                                <MessageSquare size={32} />
                            </div>
                            <h3 className="text-2xl font-black mb-2">No active conversations</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mb-8 font-medium">
                                When tenants inquire about your properties, the messages will appear here.
                            </p>
                            <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase tracking-[0.2em] border-t border-border pt-8 mt-8">
                                <Clock size={14} />
                                <span>Realtime messenger launching soon</span>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </main>
        </div>
    );
}
