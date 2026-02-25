"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Camera, Upload, CheckCircle2, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { useRef, useEffect } from "react";

interface VerificationModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
}

type Step = "intro" | "id-upload" | "face-scan" | "submitting" | "completed";

export const VerificationModal = ({ isOpen, onCloseAction }: VerificationModalProps) => {
    const [step, setStep] = useState<Step>("intro");
    const [loading, setLoading] = useState(false);

    // File & Camera Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Data States
    const [idFile, setIdFile] = useState<File | null>(null);
    const [idFilePreview, setIdFilePreview] = useState<string | null>(null);
    const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);

    const startCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false
            });
            setStream(s);
            if (videoRef.current) videoRef.current.srcObject = s;
        } catch (err) {
            console.error("Camera error:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const captureSelfie = () => {
        if (videoRef.current) {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const dataUrl = canvas.toDataURL("image/jpeg");
                setCapturedSelfie(dataUrl);
                stopCamera();
                return dataUrl;
            }
        }
        stopCamera();
        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIdFile(file);
            setIdFilePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (selfieToUse?: string) => {
        if (!auth.currentUser) return;

        setStep("submitting");
        try {
            const userUid = auth.currentUser.uid;

            // Use the provided selfie or the state if not provided
            const selfie = selfieToUse || capturedSelfie;

            // 1. Upload ID File to Cloudinary
            let idUrl = "";
            if (idFile) {
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

                const formData = new FormData();
                formData.append("file", idFile);
                formData.append("upload_preset", uploadPreset!);
                formData.append("folder", `verifications/${userUid}/id`);

                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();
                idUrl = data.secure_url;
            }

            // 2. Upload Selfie to Cloudinary
            let selfieUrl = "";
            if (selfie) {
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

                const formData = new FormData();
                formData.append("file", selfie);
                formData.append("upload_preset", uploadPreset!);
                formData.append("folder", `verifications/${userUid}/selfie`);

                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();
                selfieUrl = data.secure_url;
            }

            const userRef = doc(db, "users", userUid);

            // Update user status
            await updateDoc(userRef, {
                verificationStatus: "pending",
                updatedAt: serverTimestamp()
            });

            // Create a verification request record
            const verificationRef = doc(db, "verifications", userUid);
            await setDoc(verificationRef, {
                uid: userUid,
                email: auth.currentUser.email,
                displayName: auth.currentUser.displayName,
                status: "pending",
                submittedAt: serverTimestamp(),
                details: {
                    idType: "Government ID",
                    idUrl: idUrl,
                    selfieUrl: selfieUrl,
                    submittedAt: new Date().toISOString()
                }
            });

            setStep("completed");
        } catch (error) {
            console.error("Verification submission error:", error);
            setStep("face-scan"); // fallback
            alert("Submission failed. Please try again.");
        }
    };

    const handleNext = () => {
        if (step === "intro") setStep("id-upload");
        else if (step === "id-upload") {
            if (!idFile) {
                alert("Please upload your ID first.");
                return;
            }
            setStep("face-scan");
            startCamera();
        }
        else if (step === "face-scan") {
            if (!capturedSelfie) {
                const selfie = captureSelfie();
                if (selfie) {
                    handleSubmit(selfie);
                }
            } else {
                handleSubmit();
            }
        }
    };

    // Clean up camera on unmount or step change
    useEffect(() => {
        return () => stopCamera();
    }, []);

    const handleReset = () => {
        setStep("intro");
        onCloseAction();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleReset}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-border/50 flex justify-between items-center bg-[#fafafa] shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 text-primary rounded">
                                    <ShieldCheck size={20} />
                                </div>
                                <h2 className="text-xl font-black">Identity Verification</h2>
                            </div>
                            <button
                                onClick={handleReset}
                                className="p-2 hover:bg-accent rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 lg:p-10 overflow-y-auto no-scrollbar">
                            {step === "intro" && (
                                <Reveal width="100%" direction="up" delay={0.1}>
                                    <div className="space-y-8">
                                        <div className="text-center">
                                            <h3 className="text-2xl font-black mb-2">Maintain a Trusted Network</h3>
                                            <p className="text-muted-foreground font-medium">
                                                To list your properties, we need to verify your identity.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex gap-4 p-4 rounded bg-accent/30 border border-border/30">
                                                <div className="w-10 h-10 rounded-full bg-white border border-border flex-shrink-0 flex items-center justify-center font-black text-sm text-primary">1</div>
                                                <div>
                                                    <h4 className="font-bold text-base">Government Issued ID</h4>
                                                    <p className="text-muted-foreground text-xs font-medium">Driver's License, International Passport or National ID.</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 p-4 rounded bg-accent/30 border border-border/30">
                                                <div className="w-10 h-10 rounded-full bg-white border border-border flex-shrink-0 flex items-center justify-center font-black text-sm text-primary">2</div>
                                                <div>
                                                    <h4 className="font-bold text-base">Live Face Verification</h4>
                                                    <p className="text-muted-foreground text-xs font-medium">A quick selfie to confirm your identity against your photo ID.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Button onClick={handleNext} className="w-full h-14 text-lg font-black rounded shadow-xl shadow-primary/20">
                                            Begin Verification
                                        </Button>
                                    </div>
                                </Reveal>
                            )}

                            {step === "id-upload" && (
                                <Reveal width="100%" direction="up">
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Step 1 of 2</div>
                                            <h3 className="text-2xl font-black mb-2">Upload Photo ID</h3>
                                        </div>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*,.pdf"
                                            onChange={handleFileChange}
                                        />

                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-border rounded-3xl p-10 flex flex-col items-center justify-center bg-accent/10 hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden min-h-[160px]"
                                        >
                                            {idFilePreview ? (
                                                <img src={idFilePreview} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Preview" />
                                            ) : null}

                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-muted-foreground mb-4 group-hover:text-primary transition-all shadow-sm relative z-10">
                                                <Upload size={28} />
                                            </div>
                                            <p className="font-black text-sm uppercase tracking-widest relative z-10">
                                                {idFile ? idFile.name : "Click to upload doc"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 font-medium italic relative z-10">PNG, JPG or PDF up to 5MB</p>
                                        </div>

                                        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded flex gap-3 items-start">
                                            <MapPin className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                                            <p className="text-[11px] text-blue-800 font-bold leading-relaxed">Ensure all edges are visible and text is readable on the document. No glare or blurry text.</p>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button variant="outline" onClick={() => setStep("intro")} className="flex-1 h-14 font-bold border-border/60">
                                                Back
                                            </Button>
                                            <Button onClick={handleNext} className="flex-[2] h-14 text-lg font-black rounded shadow-xl shadow-primary/20">
                                                Continue
                                            </Button>
                                        </div>
                                    </div>
                                </Reveal>
                            )}

                            {step === "face-scan" && (
                                <Reveal width="100%" direction="up">
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Step 2 of 2</div>
                                            <h3 className="text-2xl font-black mb-2">Face Verification</h3>
                                        </div>

                                        <div className="relative w-48 h-48 mx-auto">
                                            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin duration-[3s]" />
                                            <div className="absolute inset-4 bg-accent/20 rounded-full overflow-hidden border border-border/50 flex items-center justify-center">
                                                {capturedSelfie ? (
                                                    <img src={capturedSelfie} className="w-full h-full object-cover" alt="Selfie" />
                                                ) : (
                                                    <video
                                                        ref={videoRef}
                                                        autoPlay
                                                        playsInline
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-center text-muted-foreground font-bold text-sm px-4">
                                            {capturedSelfie ? "Lookin' good! Submitting your verification..." : "Make sure your face is well-lit and move any hair away from your eyes."}
                                        </p>

                                        <Button
                                            onClick={handleNext}
                                            disabled={!!capturedSelfie}
                                            className="w-full h-14 text-lg font-black rounded shadow-xl shadow-primary/20 flex gap-3"
                                        >
                                            <Camera size={20} />
                                            {capturedSelfie ? "Capturing..." : "Take Selfie"}
                                        </Button>
                                    </div>
                                </Reveal>
                            )}

                            {step === "submitting" && (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    <div>
                                        <h3 className="text-2xl font-black mb-2 uppercase tracking-tight font-outfit">Syncing Data</h3>
                                        <p className="text-muted-foreground font-bold text-sm tracking-wider animate-pulse">Encryption taking place...</p>
                                    </div>
                                </div>
                            )}

                            {step === "completed" && (
                                <Reveal width="100%" direction="up">
                                    <div className="py-6 flex  flex-col items-center justify-center text-center space-y-6">

                                        <div className=" ">
                                            <h3 className="text-3xl  font-black mb-2 font-outfit uppercase tracking-tighter">Request Received</h3>
                                            <p className="text-muted-foreground font-medium max-w-xs mx-auto mb-8">
                                                Our team will review your application within 24 hours. You'll be notified immediately on approval.
                                            </p>
                                        </div>
                                        <Button onClick={handleReset} className="w-full h-14 text-lg font-black rounded shadow-xl shadow-primary/20">
                                            Finish and Close
                                        </Button>
                                    </div>
                                </Reveal>
                            )}
                        </div>


                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
