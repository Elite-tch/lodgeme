"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Reveal } from "@/components/ui/Reveal";
import { User, Mail, MapPin, Phone, Briefcase, Camera, CheckCircle2 } from "lucide-react";
import { ProfileModal } from "@/components/modals/ProfileModal";
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { useRouter } from "next/navigation";

export default function ClientProfilePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Modal States
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Form Stats
    const [formData, setFormData] = useState({
        displayName: "",
        phone: "",
        location: "",
        occupation: "",
        bio: ""
    });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUserData(data);
                    setFormData({
                        displayName: data.displayName || data.fullName || "",
                        phone: data.phone || data.phoneNumber || "",
                        location: data.location || data.address || "",
                        occupation: data.occupation || data.work || "",
                        bio: data.bio || ""
                    });
                }
                setLoading(false);
            } else {
                router.push("/auth/login");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        setSaving(true);
        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                displayName: formData.displayName,
                fullName: formData.displayName,
                phone: formData.phone,
                location: formData.location,
                address: formData.location,
                occupation: formData.occupation,
                bio: formData.bio,
                updatedAt: new Date().toISOString()
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <main className="min-h-screen bg-[#fafafa] pb-32">
            <DashboardNavbar
                onProfileClick={() => setIsProfileOpen(true)}
                onNotifClick={() => setIsNotificationsOpen(true)}
            />

            <div className="max-w-6xl mx-auto px-6 py-10">
                <Reveal direction="up">
                    <div className="mb-10">
                        <h1 className="text-3xl font-black text-foreground">Personal <span className="text-primary italic">Information</span></h1>
                        <p className="text-muted-foreground font-medium mt-1">Manage your account details and profile information.</p>
                    </div>
                </Reveal>

                <div className="flex md:flex-row flex-col gap-4 justify-center gap-10">
                    {/* Sidebar */}
                    <div className="md:col-span-1  space-y-6">
                        <Reveal direction="left">
                            <div className="bg-white p-6 w-full rounded shadow-sm border border-border/50 flex flex-col items-center text-center">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full bg-primary/10 border-4 border-accent flex items-center justify-center text-primary overflow-hidden">
                                        {userData?.photoURL ? (
                                            <img src={userData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} />
                                        )}
                                    </div>
                                    <button className="absolute bottom-1 right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-white">
                                        <Camera size={16} />
                                    </button>
                                </div>
                                <h2 className="mt-4 text-xl font-black">{formData.displayName || "User"}</h2>
                                <p className="text-muted-foreground mt-2 text-[10px] font-black uppercase tracking-widest">{userData?.role || "Tenant"}</p>

                                {userData?.isVerified && (
                                    <div className="mt-4 flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        <CheckCircle2 size={12} />
                                        Verified Account
                                    </div>
                                )}
                            </div>
                        </Reveal>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2">
                        <Reveal direction="up" delay={0.1}>
                            <form onSubmit={handleUpdate} className="bg-white p-8 rounded shadow-sm border border-border/50 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                                            <Input
                                                value={formData.displayName}
                                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                                className="pl-10 h-12 bg-accent/30 border-transparent focus:bg-white focus:border-primary/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="pl-10 h-12 bg-accent/30 border-transparent focus:bg-white focus:border-primary/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</Label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                                            <Input
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="pl-10 h-12 bg-accent/30 border-transparent focus:bg-white focus:border-primary/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Occupation</Label>
                                        <div className="relative">
                                            <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                                            <Input
                                                value={formData.occupation}
                                                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                                className="pl-10 h-12 bg-accent/30 border-transparent focus:bg-white focus:border-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">About You</Label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full h-32 bg-accent/30 border border-transparent rounded p-4 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-medium resize-none shadow-inner"
                                        placeholder="Tell homeowners about yourself..."
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={saving || success}
                                        className={`h-14 px-10 rounded font-black text-[13px] shadow-xl transition-all ${success ? "bg-green-600 shadow-green-200" : "shadow-primary/20"}`}
                                    >
                                        {saving ? "Updating..." : success ? (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={18} />
                                                Profile Updated
                                            </div>
                                        ) : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        </Reveal>
                    </div>
                </div>
            </div>

            <BottomNav
                onProfileClick={() => setIsProfileOpen(true)}
                onFilterClick={() => { }}
            />

            <ProfileModal
                isOpen={isProfileOpen}
                onCloseAction={() => setIsProfileOpen(false)}
            />
            <NotificationsModal
                isOpen={isNotificationsOpen}
                onCloseAction={() => setIsNotificationsOpen(false)}
            />
        </main>
    );
}
