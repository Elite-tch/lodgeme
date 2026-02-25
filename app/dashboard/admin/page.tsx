"use client";

import { Reveal } from "@/components/ui/Reveal";
import {
    Users,
    Home,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Building2,
    ShieldCheck
} from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function AdminOverview() {
    const [stats, setStats] = useState({
        tenants: 0,
        homeowners: 0,
        totalProperties: 0,
        pendingProperties: 0,
        verifiedProperties: 0,
        recentActivity: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Users (Tenants & Homeowners)
                const usersSnap = await getDocs(collection(db, "users"));
                let tCount = 0;
                let hCount = 0;
                usersSnap.forEach(doc => {
                    if (doc.data().role === "homeowner") hCount++;
                    else tCount++;
                });

                // Fetch Properties
                const propsSnap = await getDocs(collection(db, "properties"));
                let pCount = 0;
                let vCount = 0;
                propsSnap.forEach(doc => {
                    if (doc.data().status === "pending") pCount++;
                    if (doc.data().status === "verified") vCount++;
                });

                // Recent Activities (latest properties)
                const recentQ = query(collection(db, "properties"), orderBy("createdAt", "desc"), limit(5));
                const recentSnap = await getDocs(recentQ);
                const recentItems = recentSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setStats({
                    tenants: tCount,
                    homeowners: hCount,
                    totalProperties: propsSnap.size,
                    pendingProperties: pCount,
                    verifiedProperties: vCount,
                    recentActivity: recentItems
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { name: "Tenants", value: stats.tenants, icon: Users, color: "bg-primary/20 text-primary", trend: "+12%", up: true },
        { name: "Homeowners", value: stats.homeowners, icon: Building2, color: "bg-primary/40 text-primary", trend: "+5%", up: true },
        { name: "Total Listings", value: stats.totalProperties, icon: Home, color: "bg-primary/60 text-primary", trend: "+8%", up: true },
        { name: "Needs Verification", value: stats.pendingProperties, icon: Clock, color: "bg-primary text-white", trend: "urgent", up: false },
    ];

    return (
        <div className="p-6 lg:p-10">
            <Reveal direction="up">
                <div className="mb-10">
                    <h1 className="text-3xl font-black font-outfit uppercase tracking-tight">Dashboard <span className="text-primary italic">Overview</span></h1>
                    <p className="text-muted-foreground font-medium mt-1">Monitor system performance and marketplace activity.</p>
                </div>
            </Reveal>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {cards.map((card, idx) => (
                    <Reveal key={card.name} direction="up" delay={idx * 0.1}>
                        <div className="bg-white p-6 rounded-xl border border-border shadow-sm group hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2.5 rounded-lg text-white shadow-lg", card.color)}>
                                    <card.icon size={20} />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full",
                                    card.up ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                )}>
                                    {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {card.trend}
                                </div>
                            </div>
                            <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">{card.name}</h3>
                            <p className="text-3xl font-black">{loading ? "..." : card.value.toLocaleString()}</p>
                        </div>
                    </Reveal>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Items */}
                <Reveal direction="up" delay={0.4} className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden h-full">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Listings</h2>
                            <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:italic transition-all">View All</button>
                        </div>
                        <div className="divide-y divide-border">
                            {loading ? (
                                <div className="p-20 text-center text-xs font-bold text-muted-foreground">Fetching activity...</div>
                            ) : stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((item) => (
                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-accent/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded overflow-hidden bg-accent shrink-0 border border-border/50">
                                                <img
                                                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop'}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black line-clamp-1">{item.title}</h4>
                                                <p className="text-[10px] text-muted-foreground font-medium italic">{item.address}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black">₦{Number(item.price).toLocaleString()}</p>
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                                item.status === "verified" ? "bg-green-100 text-green-600" :
                                                    item.status === "pending" ? "bg-amber-100 text-amber-600" :
                                                        "bg-red-100 text-red-600"
                                            )}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center text-xs font-bold text-muted-foreground">No recent properties.</div>
                            )}
                        </div>
                    </div>
                </Reveal>

                {/* Quick Actions / System Health */}
                <Reveal direction="up" delay={0.5}>
                    <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">System Health</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <span className="text-xs font-bold">API Status</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Operational</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded">
                                        <TrendingUp size={16} />
                                    </div>
                                    <span className="text-xs font-bold">Server Load</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Low (2%)</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Verification Progress</h3>
                            <div className="h-2 bg-accent/50 rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000"
                                    style={{ width: `${(stats.verifiedProperties / (stats.totalProperties || 1)) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground">
                                <span>{stats.verifiedProperties} Verified</span>
                                <span>{Math.round((stats.verifiedProperties / (stats.totalProperties || 1)) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </div>
    );
}

