"use client";

import { Reveal } from "@/components/ui/Reveal";
import { TrendingUp, BarChart3, Users, Clock, Home, Info, Send, MapPin, Wallet, BedDouble, Bath } from "lucide-react";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore";
import {
    ComposedChart,
    AreaChart,
    Area,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export default function MarketInsightPage() {
    const [userData, setUserData] = useState<any>(null);
    const [stats, setStats] = useState({
        totalListings: 0,
        totalInterests: 0,
        todayInterests: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [distributionData, setDistributionData] = useState<any[]>([]);
    const [recentInterests, setRecentInterests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInsights = async (uid: string) => {
        try {
            // 1. Fetch Homeowner's Properties
            const qProp = query(collection(db, "properties"), where("ownerUid", "==", uid));
            const snapProp = await getDocs(qProp);
            const totalProp = snapProp.size;

            // 2. Fetch All Interests for Market Demand
            const qInt = query(collection(db, "interests"), orderBy("createdAt", "desc"));
            const snapInt = await getDocs(qInt);
            const totalInt = snapInt.size;

            // 3. Process Stats & Chart Data
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            let todayCount = 0;
            const dailyCounts: { [key: string]: number } = {};

            // Initialize last 7 days with 0
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
                dailyCounts[dateStr] = 0;
            }

            snapInt.docs.forEach(doc => {
                const data = doc.data();
                const createdAt = data.createdAt?.toDate();
                if (!createdAt) return;

                if (createdAt >= startOfToday) {
                    todayCount++;
                }

                const dateStr = createdAt.toLocaleDateString('en-US', { weekday: 'short' });
                if (dailyCounts[dateStr] !== undefined) {
                    dailyCounts[dateStr]++;
                }
            });

            const formattedChartData = Object.keys(dailyCounts).map(day => ({
                name: day,
                requests: dailyCounts[day]
            }));

            // 4. Calculate Distribution Data
            const typeCounts: { [key: string]: number } = {};
            snapProp.docs.forEach(doc => {
                const type = doc.data().type || "Uncategorized";
                typeCounts[type] = (typeCounts[type] || 0) + 1;
            });

            const formattedDistribution = Object.keys(typeCounts).map(type => ({
                name: type,
                value: typeCounts[type]
            }));

            setStats({
                totalListings: totalProp,
                totalInterests: totalInt,
                todayInterests: todayCount
            });
            setChartData(formattedChartData);
            setDistributionData(formattedDistribution);
            setRecentInterests(snapInt.docs.slice(0, 5).map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error("Error fetching insights:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Get user data for verification status
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) setUserData(userDoc.data());

                fetchInsights(user.uid);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-border shadow-xl rounded-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                    <p className="text-sm font-black text-primary">{payload[0].value} Interests Posted</p>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <main className="p-6 lg:p-12 pt-24 min-w-0">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-12">
                        <h1 className="text-3xl lg:text-4xl font-black">Market Insights</h1>
                        <p className="text-muted-foreground font-medium mt-1">Real-time data on lodging demand and your performance.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {[
                            { label: "Your Listings", value: stats.totalListings, icon: Home, color: "text-primary", bg: "bg-primary/10" },
                            { label: "Market Demand", value: stats.totalInterests, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "New Leads (Today)", value: stats.todayInterests, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                        ].map((stat, i) => (
                            <Reveal width="100%" key={stat.label} direction="up" delay={0.1 * i}>
                                <div className="bg-white border border-border p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-5`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <div className="text-3xl font-black mb-1">
                                        {loading ? <div className="w-16 h-8 bg-accent animate-pulse rounded" /> : stat.value}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Chart Section */}
                        <div className="lg:col-span-2">
                            <Reveal width="100%" direction="up" delay={0.4}>
                                <div className="bg-white border border-border rounded-2xl p-8 shadow-sm h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-xl font-black">Market Demand Activity</h3>
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Tenant Interest Volume (Last 7 Days)</p>
                                        </div>
                                        <div className="p-2 bg-accent/50 rounded-lg">
                                            <BarChart3 size={20} className="text-muted-foreground" />
                                        </div>
                                    </div>

                                    <div className="h-[300px] w-full mt-4">
                                        {loading ? (
                                            <div className="w-full h-full bg-accent/30 animate-pulse rounded-xl" />
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart data={chartData}>
                                                    <defs>
                                                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#bb7655" stopOpacity={0.2} />
                                                            <stop offset="95%" stopColor="#bb7655" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                    <XAxis
                                                        dataKey="name"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 10, fontWeight: 800, fill: '#888' }}
                                                        dy={10}
                                                    />
                                                    <YAxis hide />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar
                                                        dataKey="requests"
                                                        fill="#bb7655"
                                                        radius={[4, 4, 0, 0]}
                                                        barSize={20}
                                                        opacity={0.3}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="requests"
                                                        stroke="#bb7655"
                                                        strokeWidth={3}
                                                        fillOpacity={1}
                                                        fill="url(#colorRequests)"
                                                        animationDuration={1500}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </Reveal>
                        </div>

                        {/* Tip Section */}
                        <div className="lg:col-span-1">
                            <Reveal width="100%" direction="up" delay={0.5}>
                                <div className="space-y-6">
                                    <div className="bg-primary text-white rounded-2xl p-8 shadow-lg shadow-primary/20 relative overflow-hidden group">
                                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <TrendingUp size={120} />
                                        </div>
                                        <h3 className="text-xl font-black mb-4 relative z-10">Pro Tip</h3>
                                        <p className="text-sm font-medium leading-relaxed opacity-90 relative z-10">
                                            Properties with at least 5 photos receive 40% more interest from potential tenants. Update your listings today!
                                        </p>
                                    </div>

                                    <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                                <Info size={18} />
                                            </div>
                                            <h3 className="text-lg font-black tracking-tight">Market Status</h3>
                                        </div>
                                        <div className="space-y-5">
                                            {[
                                                { label: "High Demand Area", value: "Lekki, Lagos", trend: "+12%" },
                                                { label: "Top Property Type", value: "Self-contain", trend: "+8%" },
                                                { label: "Avg. Response Time", value: "< 2 Hours", trend: "Fast" }
                                            ].map((item) => (
                                                <div key={item.label} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{item.label}</p>
                                                        <p className="text-sm font-bold">{item.value}</p>
                                                    </div>
                                                    <span className="text-[10px] font-black bg-green-50 text-green-600 px-2.5 py-1 rounded-full">{item.trend}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>

                    {/* New Distribution Section */}
                    {distributionData.length > 0 && (
                        <Reveal width="100%" direction="up" delay={0.6}>
                            <div className="mt-8 bg-white border border-border rounded-2xl p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded">
                                        <TrendingUp size={20} />
                                    </div>
                                    <h3 className="text-xl font-black">Property Inventory Breakdown</h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={distributionData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {distributionData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={['#bb7655', '#4f46e5', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-4">
                                        {distributionData.map((item, i) => (
                                            <div key={item.name} className="flex items-center justify-between p-4 bg-accent/20 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#bb7655', '#4f46e5', '#10b981', '#f59e0b', '#ef4444'][i % 5] }} />
                                                    <span className="font-bold text-sm uppercase tracking-wider">{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xl font-black">{item.value}</span>
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50">Units</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    )}
                    {/* Recent Tenant Interests Feed */}
                    <Reveal width="100%" direction="up" delay={0.7}>
                        <div className="mt-8 bg-white border border-border rounded-2xl p-8 shadow-sm mb-12">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 text-green-600 rounded">
                                        <Send size={20} />
                                    </div>
                                    <h3 className="text-xl font-black">Tenant Interest Feed</h3>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-accent px-3 py-1 rounded-full">Live Demand</span>
                            </div>

                            <div className="space-y-6">
                                {recentInterests.length > 0 ? (
                                    recentInterests.map((interest, i) => (
                                        <div key={interest.id} className="group p-6 bg-accent/20 rounded-xl hover:bg-white hover:shadow-md hover:border-primary/20 border border-transparent transition-all">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-primary/20">
                                                        {interest.userPhoto ? (
                                                            <img src={interest.userPhoto} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Users size={20} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-base">{interest.userName || "Tenant"}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={10} className="text-primary" />
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{interest.location || "Anywhere"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold mb-1">
                                                        <Clock size={12} />
                                                        {interest.createdAt?.toDate ? new Date(interest.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                                                    </div>
                                                    <div className="text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded">
                                                        Budget: ₦{Number(interest.budget).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 bg-white/50 p-3 rounded-lg border border-border/30">
                                                <div className="flex items-center gap-2">
                                                    <BedDouble size={14} className="text-primary/60" />
                                                    <span className="text-xs font-bold">{interest.beds || 0} Beds</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Bath size={14} className="text-primary/60" />
                                                    <span className="text-xs font-bold">{interest.baths || 0} Baths</span>
                                                </div>
                                                <div className="flex items-center gap-2 col-span-2">
                                                    <Wallet size={14} className="text-primary/60" />
                                                    <span className="text-xs font-bold">₦{Number(interest.budget).toLocaleString()} / yr</span>
                                                </div>
                                            </div>

                                            <p className="text-sm font-medium text-foreground/80 italic bg-white/40 p-4 rounded-lg border-l-4 border-primary/20 mb-4">
                                                "{interest.content}"
                                            </p>
                                            <div className="flex items-center justify-end">
                                                <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                                                    Contact Tenant <TrendingUp size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground italic">
                                        No recent interests found in the market.
                                    </div>
                                )}
                            </div>
                        </div>
                    </Reveal>
                </div>
            </main>
        </>
    );
}
