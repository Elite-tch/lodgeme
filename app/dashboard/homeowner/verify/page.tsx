"use client";

import { useState } from "react";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import {
    ShieldCheck,
    MapPin,
    Camera,
    Upload,
    CheckCircle2,
    ChevronRight,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

type Step = "intro" | "id-upload" | "face-scan" | "submitting" | "completed";

export default function VerificationPage() {
    const { width, height } = useWindowSize();
    const [step, setStep] = useState<Step>("intro");
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        if (step === "intro") setStep("id-upload");
        else if (step === "id-upload") setStep("face-scan");
        else if (step === "face-scan") {
            setStep("submitting");
            setTimeout(() => setStep("completed"), 2000);
        }
    };

    return (
        <main className="p-6 lg:p-12 pt-24 min-w-0">

            <div className="max-w-xl mx-auto px-6 py-12">
                <div className="mb-12 text-center">
                    <Reveal direction="up">
                        <h1 className="text-3xl font-black mb-4">Account Verification</h1>
                        <p className="text-muted-foreground font-medium">
                            We verify all homeowners to maintain a safe and trusted network.
                        </p>
                    </Reveal>
                </div>

                {/* Wizard Content */}
                <div className="bg-[#fafafa] border border-border/50 rounded-[40px] p-8 lg:p-12 shadow-sm">
                    {step === "intro" && (
                        <Reveal direction="up" delay={0.1}>
                            <div className="space-y-8">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                                    <ShieldCheck size={32} />
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white border border-border flex-shrink-0 flex items-center justify-center font-bold text-sm">1</div>
                                        <div>
                                            <h3 className="font-bold text-lg">Government Issued ID</h3>
                                            <p className="text-muted-foreground text-sm">Upload a clear photo of your driver's license or passport.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white border border-border flex-shrink-0 flex items-center justify-center font-bold text-sm">2</div>
                                        <div>
                                            <h3 className="font-bold text-lg">Live Face Verification</h3>
                                            <p className="text-muted-foreground text-sm">A quick selfie to confirm your identity against your photo ID.</p>
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={handleNext} className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20">
                                    Begin Verification
                                </Button>
                            </div>
                        </Reveal>
                    )}

                    {step === "id-upload" && (
                        <Reveal direction="up">
                            <div className="space-y-8">
                                <div className="text-center font-bold text-sm uppercase tracking-widest text-primary mb-2">Step 1 of 2</div>
                                <h2 className="text-2xl font-black text-center">Upload Photo ID</h2>

                                <div className="border-2 border-dashed border-border rounded-3xl p-10 flex flex-col items-center justify-center bg-white hover:border-primary/50 transition-colors cursor-pointer group">
                                    <div className="w-16 h-16 bg-accent/50 rounded-full flex items-center justify-center text-muted-foreground mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        <Upload size={28} />
                                    </div>
                                    <p className="text-center font-bold">Click to upload document</p>
                                    <p className="text-center text-xs text-muted-foreground mt-1">PNG, JPG or PDF up to 5MB</p>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                                    <MapPin className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                                    <p className="text-[13px] text-blue-800 font-medium">Ensure all edges are visible and text is readable on the document.</p>
                                </div>

                                <Button onClick={handleNext} className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20">
                                    Continue
                                </Button>
                            </div>
                        </Reveal>
                    )}

                    {step === "face-scan" && (
                        <Reveal direction="up">
                            <div className="space-y-8">
                                <div className="text-center font-bold text-sm uppercase tracking-widest text-primary mb-2">Step 2 of 2</div>
                                <h2 className="text-2xl font-black text-center">Face Verification</h2>

                                <div className="relative w-48 h-48 mx-auto">
                                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin duration-[3s]" />
                                    <div className="absolute inset-4 bg-white rounded-full overflow-hidden border border-border flex items-center justify-center">
                                        <Camera size={48} className="text-muted-foreground" />
                                    </div>
                                </div>

                                <p className="text-center text-muted-foreground font-medium px-4">
                                    Match your face with your ID document. Make sure your face is well-lit and move any hair away from your eyes.
                                </p>

                                <Button onClick={handleNext} className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 flex gap-2">
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
                                <h2 className="text-2xl font-black mb-2">Processing Data</h2>
                                <p className="text-muted-foreground font-medium">This won't take long...</p>
                            </div>
                        </div>
                    )}

                    {step === "completed" && (
                        <Reveal direction="up">
                            {step === "completed" && (
                                <Confetti
                                    width={width}
                                    height={height}
                                    recycle={false}
                                    numberOfPieces={300}
                                    colors={["#bb7655", "#f0d38f", "#1c1c1c"]}
                                />
                            )}
                            <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                                    <CheckCircle2 size={40} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black mb-2">Application Received</h2>
                                    <p className="text-muted-foreground font-medium max-w-xs mx-auto mb-8">
                                        Your verification is now under review. We'll notify you once your account is fully verified.
                                    </p>
                                </div>
                                <Link href="/dashboard/homeowner" className="w-full">
                                    <Button className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20">
                                        Exit and Finish
                                    </Button>
                                </Link>
                            </div>
                        </Reveal>
                    )}
                </div>

                {/* Security Badge */}
                <div className="mt-12 flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">
                    <ShieldCheck size={14} />
                    <span>256-bit Secure Encryption</span>
                </div>
            </div>
        </main>
    );
}
