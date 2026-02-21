"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Camera, Upload, CheckCircle2, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

interface VerificationModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
}

type Step = "intro" | "id-upload" | "face-scan" | "submitting" | "completed";

export const VerificationModal = ({ isOpen, onCloseAction }: VerificationModalProps) => {
    const [step, setStep] = useState<Step>("intro");

    const handleNext = () => {
        if (step === "intro") setStep("id-upload");
        else if (step === "id-upload") setStep("face-scan");
        else if (step === "face-scan") {
            setStep("submitting");
            setTimeout(() => setStep("completed"), 2000);
        }
    };

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

                                        <div className="border-2 border-dashed border-border rounded-3xl p-10 flex flex-col items-center justify-center bg-accent/10 hover:border-primary/50 transition-colors cursor-pointer group">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-muted-foreground mb-4 group-hover:text-primary transition-all shadow-sm">
                                                <Upload size={28} />
                                            </div>
                                            <p className="font-black text-sm uppercase tracking-widest">Click to upload doc</p>
                                            <p className="text-xs text-muted-foreground mt-1 font-medium italic">PNG, JPG or PDF up to 5MB</p>
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
                                                <Camera size={48} className="text-muted-foreground/60" />
                                            </div>
                                        </div>

                                        <p className="text-center text-muted-foreground font-bold text-sm px-4">
                                            Make sure your face is well-lit and move any hair away from your eyes.
                                        </p>

                                        <Button onClick={handleNext} className="w-full h-14 text-lg font-black rounded shadow-xl shadow-primary/20 flex gap-3">
                                            <Camera size={20} />
                                            Take Selfie
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
