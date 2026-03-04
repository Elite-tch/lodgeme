"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { verifyPasswordResetCode, confirmPasswordReset, applyActionCode } from "firebase/auth";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { CheckCircle2, AlertCircle, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthActionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <AuthActionContent />
        </Suspense>
    );
}

function AuthActionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");

    const [status, setStatus] = useState<"verifying" | "ready" | "success" | "error" | "invalid">("verifying");
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (!oobCode || !mode) {
            setStatus("invalid");
            return;
        }

        const verifyCode = async () => {
            try {
                if (mode === "resetPassword") {
                    const userEmail = await verifyPasswordResetCode(auth, oobCode);
                    setEmail(userEmail);
                    setStatus("ready");
                } else if (mode === "verifyEmail") {
                    await applyActionCode(auth, oobCode);
                    setStatus("success");
                } else {
                    setStatus("invalid");
                }
            } catch (err: any) {
                setStatus("error");
                setError("This link has expired or has already been used. Please request a new one.");
            }
        };

        verifyCode();
    }, [oobCode, mode]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await confirmPasswordReset(auth, oobCode!, password);
            setStatus("success");
        } catch (err: any) {
            setError("Failed to reset password. The link may have expired. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
            {/* Left hero panel — matches AuthContainer */}
            <div className="flex h-[400px] lg:h-auto lg:w-1/2 relative overflow-hidden bg-primary shrink-0">
                <Image
                    src="https://images.unsplash.com/photo-1560448204-61dc36dc98c8?q=80&w=2070&auto=format&fit=crop"
                    alt="Reset password"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute bottom-10 left-8 right-8 lg:bottom-16 lg:left-16 lg:right-16 text-white">
                    <Reveal direction="up" delay={0.2}>
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                            {status === "success" ? "You're All Set!" : "Reset Your Password"}
                        </h2>
                        <p className="text-base lg:text-lg text-white/80 max-w-md">
                            {status === "success"
                                ? "Your account is secure. Log in with your new credentials to continue."
                                : "Choose a strong new password to keep your Lodgeme account safe and secure."}
                        </p>
                    </Reveal>
                </div>

                <Link href="/" className="absolute top-6 left-6 lg:top-10 lg:left-10 z-20 flex items-center gap-2">
                    <Image src="/logo.png" alt="LODGEME" width={120} height={32} className="h-10 lg:h-14 w-auto" />
                </Link>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex flex-col justify-center px-6 lg:px-24 py-12 relative">
                <div className="max-w-md w-full mx-auto">

                    {/* Verifying */}
                    {status === "verifying" && (
                        <div className="text-center py-10">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
                            <h3 className="text-2xl font-black mb-2">Verifying Link</h3>
                            <p className="text-muted-foreground">Please wait a moment...</p>
                        </div>
                    )}

                    {/* Ready — show password form */}
                    {status === "ready" && mode === "resetPassword" && (
                        <>
                            <div className="mb-10 text-center lg:text-left">
                                <h3 className="text-3xl font-black mb-3">Set New Password</h3>
                                <p className="text-muted-foreground">
                                    Creating a new password for{" "}
                                    <span className="text-foreground font-bold">{email}</span>
                                </p>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium flex items-center gap-3"
                                    >
                                        <AlertCircle size={16} className="shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form className="space-y-5" onSubmit={handleResetPassword}>
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min. 6 characters"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-12 pr-12 h-12 bg-accent/30 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <Input
                                            id="confirm-password"
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Repeat your password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-12 pr-12 h-12 bg-accent/30 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 text-lg font-black shadow-lg shadow-primary/20 mt-4 rounded"
                                >
                                    {loading ? "Updating..." : "Reset Password"}
                                </Button>
                            </form>

                            <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
                                Remember your password?{" "}
                                <Link href="/auth?mode=login" className="text-primary font-black hover:underline">
                                    Log In
                                </Link>
                            </p>
                        </>
                    )}

                    {/* Success */}
                    {status === "success" && (
                        <div className="text-center pt-20">
                            
                            <h3 className="text-3xl font-black mb-3">
                                {mode === "verifyEmail" ? "Email Verified!" : "Password Reset!"}
                            </h3>
                            <p className="text-muted-foreground mb-10 leading-relaxed">
                                {mode === "verifyEmail"
                                    ? "Your email has been verified. You can now log in and start exploring properties."
                                    : "Your password has been updated successfully. You can now log in with your new credentials."}
                            </p>
                            <Link href="/auth?mode=login">
                                <Button className="w-full h-14 text-lg font-black shadow-lg shadow-primary/20 rounded">
                                    Go to Login
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Error / Invalid */}
                    {(status === "error" || status === "invalid") && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={40} className="text-red-500" />
                            </div>
                            <h3 className="text-3xl font-black mb-3">Link Expired</h3>
                            <p className="text-muted-foreground mb-10 leading-relaxed">
                                {error || "This link is invalid, expired, or has already been used. Please request a fresh password reset."}
                            </p>
                            <Link href="/auth?mode=login">
                                <Button
                                    variant="outline"
                                    className="w-full h-14 text-lg font-black border-border/60 rounded"
                                >
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    )}

                </div>

                {/* Footer note */}
                <div className="mt-auto pt-10 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    <p>© 2024 LODGEME — Secure Property Rental Network</p>
                    <div className="mt-2 flex justify-center gap-4">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
