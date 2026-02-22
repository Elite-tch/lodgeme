"use client";

import { HomeownerSidebar } from "@/components/layout/HomeownerSidebar";
import { HomeownerHeader } from "@/components/layout/HomeownerHeader";
import { Reveal } from "@/components/ui/Reveal";
import {
    Building2, PlusCircle, MapPin, BedDouble, Bath, Eye, Pencil,
    Trash2, ArrowRight, X, CheckCircle2, Clock, Save, Images,
    Droplets, Calendar, Upload, Home as HomeIcon
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
                    {/* Fixed Header */}
                    <div className="flex justify-between items-center px-8 py-6 border-b border-border shrink-0">
                        <h2 className="text-xl font-black">{title}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {children}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

// ─── View Modal ───────────────────────────────────────────────────────────────
const ViewModal = ({ prop, onClose }: { prop: any; onClose: () => void }) => {
    const [activeImg, setActiveImg] = useState(0);
    useEffect(() => { setActiveImg(0); }, [prop]);

    if (!prop) return null;
    return (
        <SlidePanel isOpen={!!prop} onClose={onClose} title={prop?.title ?? "Property Details"}>
            <div>
                {/* Hero Image */}
                <div className="relative w-full h-64 bg-accent/30">
                    {prop.images?.length > 0 ? (
                        <Image src={prop.images[activeImg]} alt={prop.title} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Building2 size={48} strokeWidth={1} />
                        </div>
                    )}
                    {/* Status badge */}
                    <div className={cn(
                        "absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                        prop.status === "verified" || prop.status === "active" ? "bg-green-100 text-green-700" :
                            prop.status === "pending" ? "bg-amber-100 text-amber-700" :
                                "bg-red-100 text-red-700"
                    )}>
                        {prop.status === "verified" || prop.status === "active" ? <CheckCircle2 size={11} /> :
                            prop.status === "pending" ? <Clock size={11} /> : <X size={11} />}
                        {prop.status === "active" ? "Verified" : prop.status || "Pending"}
                    </div>
                </div>

                {/* Thumbnail strip */}
                {prop.images?.length > 1 && (
                    <div className="flex gap-2 px-6 py-3 border-b border-border overflow-x-auto no-scrollbar bg-accent/20">
                        {prop.images.map((img: string, i: number) => (
                            <button key={i} onClick={() => setActiveImg(i)}
                                className={`relative w-16 h-12 rounded shrink-0 overflow-hidden border-2 transition-all ${i === activeImg ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}>
                                <Image src={img} alt="" fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Title & Address */}
                    <div>
                        <h3 className="text-2xl font-black leading-tight mb-2">{prop.title}</h3>
                        <p className="text-muted-foreground font-semibold text-sm flex items-center gap-1.5">
                            <MapPin size={14} className="shrink-0" /> {prop.address}
                        </p>
                    </div>

                    {/* Price */}
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Annual Rent</p>
                            <p className="text-3xl font-black text-primary">₦{Number(prop.price).toLocaleString()}</p>
                        </div>
                        <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                            {prop.type}
                        </span>
                    </div>

                    {/* Specs */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Property Specs</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: BedDouble, label: "Bedrooms", value: `${prop.beds} Bed${prop.beds != 1 ? "s" : ""}` },
                                { icon: Bath, label: "Bathrooms", value: `${prop.baths} Bath${prop.baths != 1 ? "s" : ""}` },
                                { icon: Droplets, label: "Water Source", value: prop.waterSource || "—" },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="bg-accent/30 rounded-xl p-4 flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Icon size={16} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</p>
                                        <p className="font-black text-sm mt-0.5">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    {prop.description && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Description</p>
                            <p className="text-sm font-medium text-foreground/80 leading-relaxed">{prop.description}</p>
                        </div>
                    )}

                    {/* Footer info */}
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground pt-4 border-t border-border/50">
                        <Images size={14} />
                        {prop.images?.length || 0} photos uploaded
                    </div>
                </div>
            </div>
        </SlidePanel>
    );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({ prop, onClose, onSaved }: {
    prop: any; onClose: () => void; onSaved: (updated: any) => void;
}) => {
    const [form, setForm] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [savedOk, setSavedOk] = useState(false);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [uploadingImgs, setUploadingImgs] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (prop) { setForm({ ...prop }); setNewImages([]); } }, [prop]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((p: any) => ({ ...p, [e.target.name]: e.target.value }));

    const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setNewImages(prev => [...prev, ...files].slice(0, 8));
    };

    const removeExistingImg = (i: number) =>
        setForm((p: any) => ({ ...p, images: p.images.filter((_: string, idx: number) => idx !== i) }));

    const uploadToCloudinary = async (files: File[]): Promise<string[]> => {
        const cn = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const up = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        const urls: string[] = [];
        for (const file of files) {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("upload_preset", up!);
            fd.append("folder", "lodgeme/properties");
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cn}/image/upload`, { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || "Upload failed");
            urls.push(data.secure_url);
        }
        return urls;
    };

    const handleSave = async () => {
        if (!form) return;
        setSaving(true);
        try {
            let finalImages = form.images ?? [];
            if (newImages.length > 0) {
                setUploadingImgs(true);
                const uploaded = await uploadToCloudinary(newImages);
                finalImages = [...finalImages, ...uploaded];
                setUploadingImgs(false);
            }
            const { id, createdAt, ownerUid, ownerName, ...rest } = form;
            await updateDoc(doc(db, "properties", id), {
                ...rest,
                images: finalImages,
                price: Number(form.price.toString().replace(/,/g, '')),
                beds: Number(form.beds),
                baths: Number(form.baths),
            });
            onSaved({ ...form, images: finalImages });
            setSavedOk(true);
            setTimeout(() => { setSavedOk(false); onClose(); }, 1200);
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setSaving(false);
            setUploadingImgs(false);
        }
    };

    const Field = ({ label, name, type = "text", placeholder = "", inputMode }: { label: string; name: string; type?: string; placeholder?: string; inputMode?: any }) => (
        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
            <Input
                name={name}
                type={type}
                inputMode={inputMode}
                value={form?.[name] ?? ""}
                onChange={handleChange}
                placeholder={placeholder}
                className="h-12 rounded bg-accent/30 border-transparent focus:bg-white focus:border-primary/20 transition-all font-bold"
            />
        </div>
    );

    if (!prop) return null;
    return (
        <SlidePanel isOpen={!!prop} onClose={onClose} title="Edit Listing">
            {form && (
                <div className="p-8 space-y-8">

                    {/* Photos Section */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Photos</p>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            {(form.images ?? []).map((img: string, i: number) => (
                                <div key={i} className="relative aspect-square rounded overflow-hidden border border-border group">
                                    <Image src={img} alt="" fill className="object-cover" />
                                    <button onClick={() => removeExistingImg(i)}
                                        className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={12} />
                                    </button>
                                    {i === 0 && (
                                        <div className="absolute bottom-1.5 left-1.5 bg-primary text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                                            Cover
                                        </div>
                                    )}
                                </div>
                            ))}
                            {/* New image previews */}
                            {newImages.map((file, i) => (
                                <div key={`new-${i}`} className="relative aspect-square rounded overflow-hidden border-2 border-dashed border-primary/40 group">
                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                    <button onClick={() => setNewImages(p => p.filter((_, idx) => idx !== i))}
                                        className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={12} />
                                    </button>
                                    <div className="absolute bottom-1.5 left-1.5 bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">New</div>
                                </div>
                            ))}
                            {/* Add more button */}
                            {(form.images?.length ?? 0) + newImages.length < 8 && (
                                <button onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square bg-accent/30 rounded border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/40 hover:bg-white transition-all group">
                                    <Upload size={20} className="group-hover:text-primary transition-colors" />
                                    <span className="text-[9px] font-black uppercase tracking-widest mt-1.5">Add</span>
                                </button>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleNewImages} />
                        {newImages.length > 0 && (
                            <p className="text-[10px] font-bold text-primary">{newImages.length} new photo{newImages.length > 1 ? "s" : ""} will be uploaded on save</p>
                        )}
                        {uploadingImgs && (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mt-1">
                                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                Uploading photos...
                            </div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Basic Info</p>
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Property Type</Label>
                                <div className="flex flex-wrap gap-2">
                                    {["Self-contain", "Mini flat", "1 Bedroom", "2 Bedroom", "3 Bedroom", "Duplex", "Bungalow"].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setForm((p: any) => ({ ...p, type: t }))}
                                            className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${form.type === t
                                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
                                                : "bg-accent/30 text-muted-foreground border-transparent hover:bg-accent/50 hover:text-foreground"
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Field label="Property Title" name="title" placeholder="e.g. Cosy 2-bedroom flat" />
                            <Field label="Annual Rent (₦)" name="price" type="text" inputMode="numeric" placeholder="e.g. 500000" />
                        </div>
                    </div>

                    {/* Specifications */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Specifications</p>
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Bedrooms" name="beds" type="text" inputMode="numeric" placeholder="2" />
                                <Field label="Bathrooms" name="baths" type="text" inputMode="numeric" placeholder="2" />
                            </div>
                            {/* Water Source Selection */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Water Source</Label>
                                <div className="flex flex-wrap gap-2">
                                    {["Borehole", "Well", "Public Tap", "Pipe Borne"].map(w => (
                                        <button
                                            key={w}
                                            type="button"
                                            onClick={() => setForm((p: any) => ({ ...p, waterSource: w }))}
                                            className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${form.waterSource === w
                                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
                                                : "bg-accent/30 text-muted-foreground border-transparent hover:bg-accent/50 hover:text-foreground"
                                                }`}
                                        >
                                            {w}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Location</p>
                        <Field label="Full Address" name="address" placeholder="Street, area, city" />
                    </div>

                    {/* Description */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Description</p>
                        <div className="space-y-2">
                            <textarea name="description" value={form.description ?? ""} onChange={handleChange} rows={5}
                                className="w-full p-4 rounded bg-accent/30 border border-transparent focus:bg-white focus:border-primary/20 font-medium text-sm outline-none resize-none" />
                        </div>
                    </div>

                    {/* Save Button */}
                    <Button onClick={handleSave} disabled={saving || savedOk}
                        className="w-full h-14 font-black rounded shadow-lg shadow-primary/20">
                        {savedOk ? (
                            <><CheckCircle2 size={18} className="mr-2" /> Saved!</>
                        ) : saving ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                {uploadingImgs ? "Uploading photos..." : "Saving..."}</>
                        ) : (
                            <><Save size={18} className="mr-2" /> Save Changes</>
                        )}
                    </Button>
                </div>
            )}
        </SlidePanel>
    );
};

// ─── Property Card ────────────────────────────────────────────────────────────
const PropertyCard = ({ prop, onView, onEdit, onDelete, isDeleting, index }: {
    prop: any; onView: () => void; onEdit: () => void; onDelete: () => void;
    isDeleting: boolean; index: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: index * 0.06 }}
        className={`bg-white border border-border rounded overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
    >
        {/* Image */}
        <div className="relative h-52 bg-accent/30 overflow-hidden group">
            {prop.images?.[0] ? (
                <Image src={prop.images[0]} alt={prop.title} fill
                    className="object-cover transition-transform duration-500 " />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Building2 size={44} strokeWidth={1} />
                </div>
            )}
            {/* Status badge only on image */}
            <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm ${prop.status === "active" ? "bg-[#bb7655] text-white" : "bg-amber-100/90 text-amber-700"}`}>
                {prop.status === "active" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                {prop.status || "Active"}
            </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-col flex-1 p-5">
            {/* Title */}
            <h3 className="font-black text-base line-clamp-1 mb-1">{prop.title}</h3>

            {/* Address */}
            <p className="text-muted-foreground text-xs font-semibold flex items-center gap-1 mb-4 line-clamp-1">
                <MapPin size={12} className="shrink-0" /> {prop.address}
            </p>

            {/* Price — below the fold, NOT on image */}
            <div className="flex items-end justify-between mb-4">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Annual Rent</p>
                    <p className="text-xl font-black text-primary">₦{Number(prop.price).toLocaleString()}</p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest bg-accent/60 px-2.5 py-1 rounded-full text-muted-foreground">
                    {prop.type}
                </span>
            </div>

            {/* Specs row */}
            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground pb-4 border-b border-border/50">
                <span className="flex items-center gap-1.5">
                    <BedDouble size={13} className="text-primary/60" />
                    {prop.beds} Bed{prop.beds != 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                    <Bath size={13} className="text-primary/60" />
                    {prop.baths} Bath{prop.baths != 1 ? "s" : ""}
                </span>
                {prop.images?.length > 0 && (
                    <span className="ml-auto flex items-center gap-1 opacity-50">
                        <Images size={12} /> {prop.images.length}
                    </span>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-4">
                <button onClick={onView}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 text-[11px] font-black uppercase tracking-wider rounded bg-accent/40 hover:bg-primary hover:text-white transition-all">
                    <Eye size={13} /> View
                </button>
                <button onClick={onEdit}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 text-[11px] font-black uppercase tracking-wider rounded bg-accent/40 hover:bg-primary hover:text-white transition-all">
                    <Pencil size={13} /> Edit
                </button>
                <button onClick={onDelete}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors shrink-0">
                    {isDeleting
                        ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <Trash2 size={13} />}
                </button>
            </div>
        </div>
    </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyListingsPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewProp, setViewProp] = useState<any>(null);
    const [editProp, setEditProp] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);

    const fetchListings = async (uid: string) => {
        try {
            const q = query(collection(db, "properties"), where("ownerUid", "==", uid));
            const snap = await getDocs(q);
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a: any, b: any) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
            setProperties(list);
        } catch (err) {
            console.error("Error fetching listings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                fetchListings(user.uid);
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) setUserData(userDoc.data());
            }
            else setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this listing? This cannot be undone.")) return;
        setDeletingId(id);
        try {
            await deleteDoc(doc(db, "properties", id));
            setProperties(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleSaved = (updated: any) => {
        setProperties(prev => prev.map(p => p.id === updated.id ? updated : p));
        // Also refresh viewProp if open
        if (viewProp?.id === updated.id) setViewProp(updated);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            <HomeownerSidebar />
            <HomeownerHeader />

            <main className="flex-1 lg:ml-64 p-6 lg:p-10 mb-20 lg:mb-0 pt-16">
                <div className="max-w-6xl mx-auto">

                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black">My Listings</h1>
                            <p className="text-muted-foreground font-medium mt-1 text-sm">
                                {loading ? "Loading..." : `${properties.length} ${properties.length === 1 ? "property" : "properties"} listed`}
                            </p>
                        </div>
                        <Link href="/dashboard/homeowner/add">
                            <Button className="font-bold flex gap-2 h-12 px-6 rounded-lg shadow-lg shadow-primary/20">
                                <PlusCircle size={18} /> Add Listing
                            </Button>
                        </Link>
                    </div>

                    {/* Skeleton Loaders */}
                    {loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-xl border border-border animate-pulse overflow-hidden">
                                    <div className="h-52 bg-accent/50" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-5 bg-accent/50 rounded w-3/4" />
                                        <div className="h-4 bg-accent/50 rounded w-1/2" />
                                        <div className="h-8 bg-accent/50 rounded mt-2" />
                                        <div className="h-10 bg-accent/50 rounded mt-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && properties.length === 0 && (
                        <Reveal width="100%" direction="up" delay={0.1}>
                            <div className="bg-white border border-border rounded-xl p-12 lg:p-24 text-center shadow-sm">
                                <div className="w-20 h-20 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                                    <Building2 size={32} />
                                </div>
                                <h3 className="text-2xl font-black mb-2">No properties yet</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mb-8 font-medium">
                                    Once you list your first property, it will appear here for management.
                                </p>
                                <Link href="/dashboard/homeowner/add">
                                    <Button variant="outline" className="font-bold rounded-full border-border/60">
                                        Start Listing <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </Reveal>
                    )}

                    {/* Property Grid */}
                    {!loading && properties.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {properties.map((prop, i) => (
                                    <PropertyCard
                                        key={prop.id}
                                        prop={prop}
                                        index={i}
                                        onView={() => setViewProp(prop)}
                                        onEdit={() => setEditProp(prop)}
                                        onDelete={() => handleDelete(prop.id)}
                                        isDeleting={deletingId === prop.id}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>

            {/* Slide-in Modals */}
            <ViewModal prop={viewProp} onClose={() => setViewProp(null)} />
            <EditModal prop={editProp} onClose={() => setEditProp(null)} onSaved={handleSaved} />
        </div>
    );
}
