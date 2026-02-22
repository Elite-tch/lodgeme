"use client";

import { HomeownerSidebar } from "@/components/layout/HomeownerSidebar";
import { HomeownerHeader } from "@/components/layout/HomeownerHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    PlusCircle,
    Building2,
    MapPin,
    Camera,
    ArrowRight,
    ChevronLeft,
    CheckCircle2,
    Home,
    Droplets,
    Calendar,
    Upload,
    Trash2,
    Info
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function AddPropertyPage() {
    const router = useRouter();
    const { width, height } = useWindowSize();
    const [userData, setUserData] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        type: " ",
        address: "",
        beds: "",
        baths: "",
        waterSource: " ",
        description: "",
        images: [] as string[]
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) setUserData(userDoc.data());
            } else {
                router.push("/auth");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep = (s: number) => {
        if (s === 1) {
            return formData.title && formData.price && formData.type && formData.description;
        }
        if (s === 2) {
            return formData.beds && formData.baths && formData.waterSource;
        }
        if (s === 3) {
            return formData.address;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setError(null);
            setStep(prev => Math.min(prev + 1, 4));
        } else {
            setError("Please fill in all required fields.");
        }
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    // --- Image Handling ---
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newFiles = [...imageFiles, ...files].slice(0, 8); // max 8 images
        setImageFiles(newFiles);

        // Generate previews
        const previews = newFiles.map(f => URL.createObjectURL(f));
        setImagePreviews(previews);
    };

    const removeImage = (index: number) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
    };

    // --- Upload images to Cloudinary and return URLs ---
    const uploadImages = async (): Promise<string[]> => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        const urls: string[] = [];

        for (let i = 0; i < imageFiles.length; i++) {
            const formDataUpload = new FormData();
            formDataUpload.append("file", imageFiles[i]);
            formDataUpload.append("upload_preset", uploadPreset!);
            formDataUpload.append("folder", "lodgeme/properties");

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: "POST", body: formDataUpload }
            );

            const data = await res.json();

            if (!res.ok) {
                // Log the full Cloudinary error so we can see exactly what's wrong
                console.error("Cloudinary upload error:", JSON.stringify(data));
                throw new Error(data?.error?.message || `Upload failed for image ${i + 1}`);
            }

            urls.push(data.secure_url);

            // Update progress after each image
            setUploadProgress(Math.round(((i + 1) / imageFiles.length) * 100));
        }

        return urls;
    };

    const handleSubmit = async () => {
        if (!auth.currentUser) return;
        setError(null);
        setLoading(true);
        try {
            // Upload images first, then save property
            const imageUrls = imageFiles.length > 0 ? await uploadImages() : [];

            await addDoc(collection(db, "properties"), {
                ...formData,
                images: imageUrls,
                ownerUid: auth.currentUser.uid,
                ownerName: auth.currentUser.displayName,
                price: Number(formData.price),
                beds: Number(formData.beds),
                baths: Number(formData.baths),
                createdAt: serverTimestamp(),
                status: "pending",
                verified: false
            });
            setStep(5); // Success step
        } catch (err: any) {
            console.error("Error adding property:", err);
            setError(err?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const steps = [
        { id: 1, name: "Marketing", icon: Home },
        { id: 2, name: "Details", icon: Info },
        { id: 3, name: "Location", icon: MapPin },
        { id: 4, name: "Media", icon: Camera },
    ];

    const inputClasses = "h-14 rounded bg-accent/30 border-transparent focus:bg-white focus:border-primary/20 focus:ring-0 focus:outline-none transition-all font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

    return (
        <div className="min-h-screen bg-[#fafafa] flex text-foreground">
            <HomeownerSidebar />
            <HomeownerHeader />

            <main className="flex-1 lg:ml-64 p-6 lg:p-12 mb-20 lg:mb-0 pt-16">
                <div className="max-w-3xl mx-auto">
                    {/* Progress Header */}
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-8">
                            <Link href="/dashboard/homeowner">
                                <Button variant="ghost" size="sm" className="rounded-full p-2 h-10 w-10">
                                    <ChevronLeft size={20} />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black font-outfit uppercase tracking-tight">List Property</h1>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Step {step > 4 ? 4 : step} of 4</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex gap-2 h-1.5 w-full bg-accent/30 rounded-full overflow-hidden">
                            {[1, 2, 3, 4].map((s) => (
                                <div
                                    key={s}
                                    className={`flex-1 transition-all duration-500 rounded-full ${step >= s ? "bg-primary" : "bg-transparent"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-border p-8 rounded shadow-sm">
                                    <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 text-primary rounded">
                                            <Home size={20} />
                                        </div>
                                        Basic Information
                                    </h2>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catchy Title (Sales Copy)*</Label>
                                            <Input
                                                name="title"
                                                required
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Luxury 2 Bedroom Apartment in Lekki Phase 1"
                                                className={inputClasses}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Property Type*</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {["Self-contain", "Mini flat", "1 Bedroom", "2 Bedroom", "3 Bedroom", "Duplex", "Bungalow"].map(t => (
                                                        <button
                                                            key={t}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, type: t }))}
                                                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${formData.type === t
                                                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                                                : "bg-accent/30 text-muted-foreground border-transparent hover:bg-accent/50"
                                                                }`}
                                                        >
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Annual Rent (₦)*</Label>
                                                <Input
                                                    name="price"
                                                    required
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                    placeholder="2,500,000"
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description*</Label>
                                            <textarea
                                                name="description"
                                                required
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows={4}
                                                placeholder="Describe the unique features of your lodge..."
                                                className="w-full p-4 rounded bg-accent/30 border border-transparent focus:bg-white focus:border-primary/20 focus:ring-0 focus:outline-none outline-none transition-all font-medium resize-none shadow-none"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="text-red-500 text-xs font-black uppercase tracking-widest text-center animate-pulse">
                                            {error}
                                        </p>
                                    )}

                                    <Button onClick={nextStep} className="w-full h-14 text-lg font-black rounded shadow-xl shadow-primary/20">
                                        Next: Property Details
                                        <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-border p-8 rounded shadow-sm">
                                    <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <Info size={20} />
                                        </div>
                                        Property Specifications
                                    </h2>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bedrooms*</Label>
                                            <div className="relative">
                                                <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                <Input
                                                    name="beds"
                                                    required
                                                    value={formData.beds}
                                                    onChange={handleInputChange}
                                                    placeholder="2"
                                                    className={inputClasses + " pl-12"}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bathrooms*</Label>
                                            <div className="relative">
                                                <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                <Input
                                                    name="baths"
                                                    required
                                                    value={formData.baths}
                                                    onChange={handleInputChange}
                                                    placeholder="2"
                                                    className={inputClasses + " pl-12"}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Water Source*</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {["Borehole", "Well", "Public Tap", "Pipe Borne", "None"].map(w => (
                                                    <button
                                                        key={w}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, waterSource: w }))}
                                                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${formData.waterSource === w
                                                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                                            : "bg-accent/30 text-muted-foreground border-transparent hover:bg-accent/50"
                                                            }`}
                                                    >
                                                        {w}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-xs font-black uppercase tracking-widest text-center animate-pulse">
                                        Please fill in all required fields
                                    </p>
                                )}

                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={prevStep} className="h-14 px-8 font-black rounded border-border/60">
                                        Back
                                    </Button>
                                    <Button onClick={nextStep} className="flex-1 h-14 text-lg font-black rounded shadow-xl shadow-primary/20">
                                        Next: Location
                                        <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-border p-8 rounded shadow-sm">
                                    <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded">
                                            <MapPin size={20} />
                                        </div>
                                        Property Location
                                    </h2>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Address*</Label>
                                            <Input
                                                name="address"
                                                required
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                                                className={inputClasses}
                                            />
                                        </div>

                                        <div className="aspect-video w-full bg-accent/20 rounded border border-border flex items-center justify-center text-muted-foreground grayscale opacity-50">
                                            <div className="text-center">
                                                <MapPin className="mx-auto mb-2" size={32} />
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Map module coming soon</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-xs font-black uppercase tracking-widest text-center animate-pulse">
                                        Please fill in all required fields
                                    </p>
                                )}

                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={prevStep} className="h-14 px-8 font-black rounded border-border/60">
                                        Back
                                    </Button>
                                    <Button onClick={nextStep} className="flex-1 h-14 text-lg font-black rounded shadow-xl shadow-primary/20">
                                        Next: Photos
                                        <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="bg-white border border-border p-8 rounded shadow-sm">
                                    <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-amber-50 text-amber-600 rounded">
                                            <Camera size={20} />
                                        </div>
                                        Photos & Media
                                    </h2>

                                    <div className="space-y-4">
                                        {/* Hidden file input */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleImageSelect}
                                        />

                                        {/* Image Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {imagePreviews.map((src, i) => (
                                                <div key={i} className="relative aspect-square rounded overflow-hidden border border-border group">
                                                    <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(i)}
                                                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    {i === 0 && (
                                                        <div className="absolute bottom-2 left-2 bg-primary text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                                                            Cover
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Upload Button */}
                                            {imagePreviews.length < 8 && (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="aspect-square bg-accent/30 rounded border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:bg-white transition-all cursor-pointer group"
                                                >
                                                    <Upload size={24} className="group-hover:text-primary transition-colors" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest mt-2">Add Photo</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Upload Progress */}
                                        {loading && uploadProgress > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                                    <span>Uploading photos...</span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-accent/30 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-primary/5 border border-primary/10 p-4 rounded flex gap-3 items-start">
                                            <Info className="text-primary shrink-0 mt-0.5" size={16} />
                                            <p className="text-[11px] text-primary/80 font-bold leading-relaxed">
                                                Upload up to 8 photos. The first photo will be the cover image. Bright, wide-angle shots work best.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-xs font-black uppercase tracking-widest text-center animate-pulse mb-4">
                                        Please fill in all required fields
                                    </p>
                                )}

                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={prevStep} className="h-14 px-8 font-black rounded border-border/60">
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-1 h-14 text-lg font-black rounded shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
                                    >
                                        {loading ? "Publishing..." : "Finish and Publish"}
                                        {!loading && <CheckCircle2 size={20} className="ml-2" />}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12 space-y-8"
                            >
                                <Confetti
                                    width={width}
                                    height={height}
                                    recycle={false}
                                    numberOfPieces={500}
                                    gravity={0.15}
                                    colors={["#bb7655", "#f0d38f", "#1c1c1c"]}
                                />

                                <div>
                                    <h2 className="text-4xl font-black font-outfit uppercase tracking-tighter">Listing Published!</h2>
                                    <p className="text-muted-foreground font-medium mt-2 max-w-xs mx-auto">
                                        Your property is now live on LODGEME and visible to thousands of potential tenants.
                                    </p>
                                </div>
                                <div className="flex flex-col md:flex-row w-[95%] mx-auto gap-3 md:gap-8">
                                    <Link href="/dashboard/homeowner/listings" className="w-full">
                                        <Button className="w-full mx-auto h-12 font-black rounded shadow">View My Listings</Button>
                                    </Link>
                                    <Button variant="ghost" onClick={() => {
                                        setFormData({
                                            title: "", price: "", type: "Apartment", address: "", beds: "", baths: "",
                                            waterSource: "Borehole", description: "", images: []
                                        });
                                        setStep(1);
                                    }} className="h-12 font-black border-primary border rounded mx-auto w-full uppercase text-[10px] tracking-widest">
                                        List Another Property
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Mobile Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-border px-8 py-4 flex justify-between items-center shadow-2xl pb-safe">
                <Link href="/dashboard/homeowner" className="text-muted-foreground flex flex-col items-center gap-1">
                    <Home size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
                </Link>
                <div className="bg-primary text-white p-4 rounded-full -mt-12 shadow-xl shadow-primary/40 border-8 border-[#fafafa]">
                    <PlusCircle size={28} />
                </div>
                <Link href="/dashboard/homeowner/profile" className="text-muted-foreground flex flex-col items-center gap-1">
                    <UserCircle size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
                </Link>
            </nav>
        </div>
    );
}

// Icon shim
const UserCircle = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
