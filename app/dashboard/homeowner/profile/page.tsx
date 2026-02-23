"use client";

import { Reveal } from "@/components/ui/Reveal";
import { User, ShieldCheck, Mail, MapPin, Phone, Camera, X, CheckCircle2, Save, Upload, Info, Briefcase, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// ─── Slide Panel Shell ────────────────────────────────────────────────────────
const SlidePanel = ({ isOpen, onClose, title, children }: {
    isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex justify-end">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div
                    initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 26, stiffness: 220 }}
                    className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col"
                >
                    <div className="flex justify-between items-center px-8 py-6 border-b border-border shrink-0">
                        <h2 className="text-xl font-black">{title}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {children}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export default function HomeownerProfilePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [form, setForm] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [savedOk, setSavedOk] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchUserData = async (uid: string) => {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setForm({
                displayName: data.displayName || "",
                phone: data.phone || "",
                address: data.address || "",
                photoURL: data.photoURL || "",
                bio: data.bio || "",
                whatsapp: data.whatsapp || "",
                occupation: data.occupation || ""
            });
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                fetchUserData(user.uid);
            } else {
                router.push("/auth");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((p: any) => ({ ...p, [e.target.name]: e.target.value }));

    const uploadToCloudinary = async (file: File): Promise<string> => {
        const cn = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const up = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", up!);
        fd.append("folder", "lodgeme/profiles");
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cn}/image/upload`, { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || "Upload failed");
        return data.secure_url;
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImg(true);
        try {
            const url = await uploadToCloudinary(file);
            setForm((p: any) => ({ ...p, photoURL: url }));
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setUploadingImg(false);
        }
    };

    const handleSave = async () => {
        if (!auth.currentUser) return;
        setSaving(true);
        try {
            // Update Auth
            await updateProfile(auth.currentUser, {
                displayName: form.displayName,
                photoURL: form.photoURL
            });

            // Update Firestore
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                ...form,
                updatedAt: new Date().toISOString()
            });

            setUserData({ ...userData, ...form });
            setSavedOk(true);
            setTimeout(() => { setSavedOk(false); setIsEditOpen(false); }, 1200);
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <main className="p-6 lg:p-12 pt-24 min-w-0">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl lg:text-4xl font-black mb-12">My Account</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <Reveal width="100%" direction="up" delay={0.1}>
                                <div className="bg-white border border-border p-8 rounded shadow-sm text-center">
                                    <div className="relative w-24 h-24 mx-auto mb-6">
                                        {userData?.photoURL ? (
                                            <Image src={userData.photoURL} alt={userData.displayName || ""} fill className="rounded-full object-cover border-4 border-primary/10" />
                                        ) : (
                                            <div className="w-full h-full bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                                <User size={48} />
                                            </div>
                                        )}
                                        {userData?.isVerified && (
                                            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white">
                                                <ShieldCheck size={14} />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-black">{userData?.displayName || "Homeowner"}</h3>
                                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">LODGE OWNER</p>

                                    <Button
                                        onClick={() => setIsEditOpen(true)}
                                        variant="outline"
                                        className="mt-6 w-full h-11 font-black text-xs uppercase tracking-widest border-border/60"
                                    >
                                        Edit Profile
                                    </Button>
                                </div>
                            </Reveal>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <Reveal width="100%" direction="up" delay={0.2}>
                                <div className="bg-white border border-border rounded overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-border bg-[#fafafa]">
                                        <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">General Information</h4>
                                    </div>
                                    <div className="p-8 space-y-8">
                                        <div className="flex items-start gap-5">
                                            <div className="w-12 h-12 bg-accent/50 rounded-xl flex items-center justify-center text-muted-foreground shrink-0">
                                                <Info size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Biography</p>
                                                <p className="font-medium text-foreground text-sm leading-relaxed italic">
                                                    {userData?.bio ? `"${userData.bio}"` : "No bio added yet. Tell tenants about yourself!"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-accent/50 rounded-xl flex items-center justify-center text-muted-foreground">
                                                <Mail size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Email Address</p>
                                                <p className="font-bold text-foreground">{userData?.email || "loading..."}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-accent/50 rounded-xl flex items-center justify-center text-muted-foreground">
                                                <Phone size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Phone & WhatsApp</p>
                                                <p className="font-bold text-foreground">{userData?.phone || "Not set"} {userData?.whatsapp && ` / ${userData.whatsapp}`}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-accent/50 rounded-xl flex items-center justify-center text-muted-foreground">
                                                <Briefcase size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Occupation</p>
                                                <p className="font-bold text-foreground">{userData?.occupation || "Not specified"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-accent/50 rounded-xl flex items-center justify-center text-muted-foreground">
                                                <MapPin size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Service Location</p>
                                                <p className="font-bold text-foreground">{userData?.address || "Nigeria"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Profile Slide Panel */}
            <SlidePanel isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit My Profile">
                <div className="p-8 space-y-8">
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-accent relative border-4 border-accent/50 shadow-inner">
                                {form.photoURL ? (
                                    <Image src={form.photoURL} alt="" fill className={`object-cover ${uploadingImg ? 'opacity-40' : 'opacity-100'} transition-opacity`} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                        <User size={64} />
                                    </div>
                                )}
                                {uploadingImg && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all outline-none"
                            >
                                <Camera size={18} />
                            </button>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-4">Profile Photo</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                            <Input name="displayName" value={form.displayName} onChange={handleChange} placeholder="e.g. John Doe"
                                className="h-12 rounded bg-accent/30 border-transparent focus:bg-white focus:border-primary/20 font-bold" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                                <Input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. +234..."
                                    className="h-12 rounded bg-accent/30 border-transparent focus:bg-white focus:border-primary/20 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">WhatsApp (Optional)</Label>
                                <Input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="e.g. +234..."
                                    className="h-12 rounded bg-accent/30 border-transparent focus:bg-white focus:border-primary/20 font-bold" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Occupation</Label>
                            <Input name="occupation" value={form.occupation} onChange={handleChange} placeholder="e.g. Real Estate Investor"
                                className="h-12 rounded bg-accent/30 border-transparent focus:bg-white focus:border-primary/20 font-bold" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</Label>
                            <Input name="address" value={form.address} onChange={handleChange} placeholder="e.g. Lekki, Lagos"
                                className="h-12 rounded bg-accent/30 border-transparent focus:bg-white focus:border-primary/20 font-bold" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Professional Biography</Label>
                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={(e: any) => setForm((p: any) => ({ ...p, bio: e.target.value }))}
                                placeholder="Tell tenants about your hospitality style or professional background..."
                                className="w-full min-h-[120px] p-4 rounded bg-accent/30 border-transparent focus:bg-white focus:border-primary/20 font-bold text-sm transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    <Button onClick={handleSave} disabled={saving || savedOk} className="w-full h-14 font-black rounded shadow-lg shadow-primary/20">
                        {savedOk ? (
                            <><CheckCircle2 size={18} className="mr-2" /> Saved!</>
                        ) : saving ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Saving...</>
                        ) : (
                            <><Save size={18} className="mr-2" /> Save Profile</>
                        )}
                    </Button>
                </div>
            </SlidePanel>
        </>
    );
}
