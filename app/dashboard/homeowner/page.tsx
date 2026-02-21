"use client";

import { useEffect, useState } from "react";
import { HomeownerSidebar } from "@/components/layout/HomeownerSidebar";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import {
    Building2,
    MessageSquare,
    Eye,
    PlusCircle,
    // ShieldAlert, // verification removed
    // ShieldCheck, // verification removed
    ArrowRight,
    UserCircle
} from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
// import { VerificationModal } from "@/components/modals/VerificationModal"; // verification removed

export default function HomeownerDashboard() {
    const [userData, setUserData] = useState<any>(null);
    const [stats, setStats] = useState({ listings: 0, messages: 0, views: 0 });
    const [loading, setLoading] = useState(true);
    // const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false); // verification removed

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Fetch Profile
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }

                    // Fetch Stats (Real counts from Firestore)
                    const listingsQuery = query(collection(db, "properties"), where("ownerUid", "==", user.uid));
                    const listingsSnap = await getDocs(listingsQuery);

                    let totalViews = 0;
                    listingsSnap.docs.forEach(doc => {
                        totalViews += (doc.data().views || 0);
                    });

                    setStats({
                        listings: listingsSnap.size,
                        messages: 12, // Placeholder
                        views: totalViews || 450 // Fallback
                    });

                } catch (error) {
                    console.error("Error fetching dashboard data:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            <HomeownerSidebar />

            {/* <VerificationModal
                isOpen={isVerifyModalOpen}
                onCloseAction={() => setIsVerifyModalOpen(false)}
            /> */}

            <main className="flex-1 lg:ml-64 p-6 lg:p-12 mb-20 lg:mb-0">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <Reveal direction="up">
                            <h1 className="text-3xl lg:text-4xl font-black text-foreground">
                                Hello, {userData?.displayName?.split(' ')[0] || "Owner"}
                            </h1>
                            <p className="text-muted-foreground mt-2 font-medium">
                                Here's what's happening with your properties today.
                            </p>
                        </Reveal>

                        <Link href="/dashboard/homeowner/add">
                            <Button className="font-bold flex gap-2 h-12 px-6 rounded shadow-lg shadow-primary/20">
                                <PlusCircle size={20} />
                                List New Property
                            </Button>
                        </Link>
                    </div>

                    {/* Verification Banner — commented out
                    {!loading && !userData?.isVerified && (
                        <Reveal direction="up" delay={0.1}>
                            <div className="bg-white border border-amber-200 rounded p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6 mb-12 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                                <div className="w-16 h-16 bg-amber-50 rounded flex items-center justify-center text-amber-600 flex-shrink-0">
                                    <ShieldAlert size={32} />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-black text-amber-900 mb-1 font-outfit uppercase tracking-tight">Account Verification Required</h3>
                                    <p className="text-muted-foreground font-medium">
                                        To list your properties and connect with tenants, you need to verify your identity with a Gov ID and face scan.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsVerifyModalOpen(true)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-black px-8 h-12 rounded shadow-lg shadow-amber-200"
                                >
                                    Verify Now
                                </Button>
                            </div>
                        </Reveal>
                    )}
                    */}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                        {[
                            { label: "Active Listings", value: stats.listings, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "Direct Inquiries", value: stats.messages, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
                            { label: "Property Views", value: stats.views, icon: Eye, color: "text-green-600", bg: "bg-green-50" },
                        ].map((stat, i) => (
                            <Reveal key={stat.label} direction="up" delay={0.2 + (i * 0.1)}>
                                <div className="bg-white border w-full border-border/50 py-6 px-8 rounded shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
                                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <div className="text-3xl font-black mb-1">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <div className="">
                        

                        {/* Side Tips / Info */}
                        <div className="space-y-6 flex gap-4 md:flex-row flexcol ">
                            <Reveal direction="up" delay={0.6}>
                                <div className="bg-primary/5 border border-primary/10 rounded p-6">
                                    <h4 className="font-black text-xs uppercase tracking-widest text-primary mb-4">Host Tips</h4>
                                    <ul className="space-y-4">
                                        {[
                                            "Edit your profile to attract more customers",
                                            "High-quality photos increase views by 70%",
                                            "Clear descriptions reduce unnecessary inquiries",
                                            "Fast response times boost your visibility",
                                        ].map((tip, i) => (
                                            <li key={i} className="flex gap-3 text-sm font-medium text-foreground/80">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Reveal>

                            <Reveal direction="up" delay={0.7}>
                                <div className="bg-white border border-border/50 rounded p-6 shadow-sm">
                                    <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-4">Market Insight</h4>
                                    <p className="text-sm text-muted-foreground font-medium mb-4">
                                        The demand for <span className="text-primary">Self-Contain</span> units in your area is up by 15% this month.
                                    </p>
                                    <Link href="/dashboard/homeowner/insight" className="text-xs font-black text-primary hover:underline uppercase tracking-wider">
                                        View Full Report
                                    </Link>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Nav for Homeowner */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-border px-8 py-4 flex justify-between items-center shadow-2xl pb-safe">
                <Link href="/dashboard/homeowner" className="text-primary flex flex-col items-center gap-1">
                    <Building2 size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
                </Link>
                <Link href="/dashboard/homeowner/add" className="bg-primary text-white p-4 rounded-full -mt-12 shadow-xl shadow-primary/40 border-8 border-[#fafafa]">
                    <PlusCircle size={28} />
                </Link>
                <Link href="/dashboard/homeowner/profile" className="text-muted-foreground flex flex-col items-center gap-1">
                    <UserCircle size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
                </Link>
            </nav>
        </div>
    );
}
