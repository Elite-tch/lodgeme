"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import {
    Building2,
    MessageSquare,
    Eye,
    PlusCircle,
    ShieldAlert,
    ShieldCheck,
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
import { VerificationModal } from "@/components/modals/VerificationModal";

export default function HomeownerDashboard() {
    const [userData, setUserData] = useState<any>(null);
    const [stats, setStats] = useState({ listings: 0, messages: 0, views: 0 });
    const [loading, setLoading] = useState(true);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

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

                    // Fetch Inquiries (Chats)
                    const chatsQuery = query(collection(db, "chats"), where("homeownerId", "==", user.uid));
                    const chatsSnap = await getDocs(chatsQuery);

                    setStats({
                        listings: listingsSnap.size,
                        messages: chatsSnap.size,
                        views: totalViews
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
        <main className="p-6 lg:p-12 pt-24 min-w-0">
            <VerificationModal
                isOpen={isVerifyModalOpen}
                onCloseAction={() => setIsVerifyModalOpen(false)}
            />
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

                    <Link
                        href="/dashboard/homeowner/add"
                        onClick={(e) => {
                            if (userData?.verificationStatus !== "verified") {
                                e.preventDefault();
                                setIsVerifyModalOpen(true);
                            }
                        }}
                    >
                        <Button className="font-bold flex gap-2 h-12 px-6 rounded shadow-lg shadow-primary/20 text-white cursor-pointer active:scale-95 transition-all">
                            <PlusCircle size={20} />
                            List New Property
                        </Button>
                    </Link>
                </div>

                {/* Verification Banner */}
                {!loading && userData?.verificationStatus !== "verified" && (
                    <Reveal direction="up" delay={0.1}>
                        <div className="bg-white border rounded p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6 mb-12 shadow-sm relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${userData?.verificationStatus === 'pending' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                            <div className={`w-16 h-16 rounded flex items-center justify-center flex-shrink-0 ${userData?.verificationStatus === 'pending' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                {userData?.verificationStatus === 'pending' ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className={`text-xl font-black mb-1 font-outfit uppercase tracking-tight ${userData?.verificationStatus === 'pending' ? 'text-blue-900' : 'text-amber-900'}`}>
                                    {userData?.verificationStatus === 'pending' ? 'Verification In Progress' : 'Account Verification Required'}
                                </h3>
                                <p className="text-muted-foreground font-medium">
                                    {userData?.verificationStatus === 'pending'
                                        ? 'Your documents are being reviewed. This usually takes less than 24 hours.'
                                        : 'To list your properties and connect with tenants, you need to verify your identity with a Gov ID and face scan.'}
                                </p>
                            </div>
                            {userData?.verificationStatus !== 'pending' && (
                                <Button
                                    onClick={() => setIsVerifyModalOpen(true)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-black px-8 h-12 rounded shadow-lg shadow-amber-200"
                                >
                                    Verify Now
                                </Button>
                            )}
                        </div>
                    </Reveal>
                )}

                {/* Stats Grid */}
                <div className="flex md:flex-row flex-col justify-center items-center gap-6 mb-12">
                    {[
                        { label: "Active Listings", value: stats.listings, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Direct Inquiries", value: stats.messages, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
                        { label: "Property Views", value: stats.views, icon: Eye, color: "text-green-600", bg: "bg-green-50" },
                    ].map((stat, i) => (
                        <Reveal key={stat.label} direction="up" delay={0.2 + (i * 0.1)} className="">
                            <div className="bg-white border w-[320px] md:w-[300px] border-border/50 py-6 px-8 rounded shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
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
                    <div className="space-y-6 flex gap-4 md:flex-row flex-col ">
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
    );
}
