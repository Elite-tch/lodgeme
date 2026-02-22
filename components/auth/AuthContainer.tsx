"use client";

import { useState, useEffect, Suspense } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { auth, googleProvider, db } from "@/lib/firebase";
import {
    signInWithPopup,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

type Role = "tenant" | "homeowner";
type Mode = "login" | "signup";

export const AuthContainer = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <AuthContainerContent />
        </Suspense>
    );
};

const AuthContainerContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [role, setRole] = useState<Role>("tenant");
    const [mode, setMode] = useState<Mode>("signup");
    const [showPassword, setShowPassword] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [resetMode, setResetMode] = useState(false);

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    // Read URL params for mode
    useEffect(() => {
        const modeParam = searchParams.get("mode");
        if (modeParam === "login" || modeParam === "signup") {
            setMode(modeParam as Mode);
        }
    }, [searchParams]);

    // Observer: only redirect if user is ALREADY logged in when they visit this page
    // This handles returning sessions (e.g. pressing Back after login)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const storedRole = userDoc.data().role;
                        if (storedRole === "homeowner") {
                            router.push("/dashboard/homeowner");
                        } else {
                            router.push("/dashboard/client");
                        }
                    }
                    // If no doc exists, do NOT redirect — let the user stay on auth page
                } catch (err) {
                    // On error, do NOT redirect anywhere — just log it
                    console.error("Session check error:", err);
                }
            }
            // If no user, do nothing — just show the form
        });

        return () => unsubscribe();
    }, [router]);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const { sendPasswordResetEmail } = await import("firebase/auth");
            await sendPasswordResetEmail(auth, email);
            setSuccess("Password reset link sent to your email!");
        } catch (err: any) {
            console.error(err);
            setError("Failed to send reset email. Please check the address.");
        } finally {
            setEmailLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (mode === "signup") {
                // --- SIGN UP FLOW ---
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(result.user, { displayName: fullName });

                // Save role to Firestore (role is set by which tab is selected)
                await setDoc(doc(db, "users", result.user.uid), {
                    uid: result.user.uid,
                    displayName: fullName,
                    email: email,
                    role: role,
                    createdAt: serverTimestamp(),
                });

                setSuccess("Account created! Redirecting...");
                // Redirect based on the chosen role
                router.push(role === "homeowner" ? "/dashboard/homeowner" : "/dashboard/client");

            } else {
                // --- LOGIN FLOW ---
                const result = await signInWithEmailAndPassword(auth, email.trim(), password);

                // Fetch the user's REAL role from Firestore
                const userDoc = await getDoc(doc(db, "users", result.user.uid));

                if (!userDoc.exists()) {
                    const superAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
                    if (email.trim() === superAdminEmail) {
                        // Secret Admin: Auto-create the profile if it's missing
                        await setDoc(doc(db, "users", result.user.uid), {
                            uid: result.user.uid,
                            displayName: "System Admin",
                            email: email.trim(),
                            role: "admin",
                            createdAt: serverTimestamp(),
                        });
                        router.push("/dashboard/admin");
                        return;
                    }

                    // For everyone else, show error
                    await signOut(auth);
                    setError("Account data not found. Please contact support.");
                    setEmailLoading(false);
                    return;
                }

                const storedRole = userDoc.data().role;
                const superAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

                // Super Admin Bypass: Always allow and redirect to admin panel
                if (email.trim() === superAdminEmail) {
                    router.push("/dashboard/admin");
                    return;
                }

                // ROLE ENFORCEMENT for everyone else
                if (storedRole !== role) {
                    await signOut(auth);
                    const roleName = storedRole === "homeowner" ? "Homeowner" : "Tenant";
                    setError(`This account is registered as a ${roleName}. Please select the correct tab.`);
                    setEmailLoading(false);
                    return;
                }

                // Role matches — redirect to the correct dashboard
                if (storedRole === "homeowner") {
                    router.push("/dashboard/homeowner");
                } else {
                    router.push("/dashboard/client");
                }
            }
        } catch (err: any) {
            console.error("Auth Error:", err);
            // NEVER redirect on error — just show the message
            const code = err.code;
            if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
                setError("Invalid email or password. Please try again.");
            } else if (code === "auth/email-already-in-use") {
                setError("This email is already registered. Please log in instead.");
            } else if (code === "auth/too-many-requests") {
                setError("Too many failed attempts. Please try again later.");
            } else if (code === "auth/weak-password") {
                setError("Password must be at least 6 characters.");
            } else {
                setError("Something went wrong. Please try again.");
            }
            setEmailLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // New Google user — save with the selected role
                await setDoc(userDocRef, {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    role: role,
                    createdAt: serverTimestamp(),
                });
                router.push(role === "homeowner" ? "/dashboard/homeowner" : "/dashboard/client");
            } else {
                // Existing Google user — check role matches selected tab
                const storedRole = userDoc.data().role;
                if (storedRole !== role) {
                    await signOut(auth);
                    const roleName = storedRole === "homeowner" ? "Homeowner" : "Tenant";
                    setError(`This account is registered as a ${roleName}. Please select the correct tab.`);
                    return;
                }
                router.push(storedRole === "homeowner" ? "/dashboard/homeowner" : "/dashboard/client");
            }
        } catch (err: any) {
            console.error(err);
            setError("Google Sign-In failed. Please try again.");
        } finally {
            setGoogleLoading(false);
        }
    };

    const images = {
        tenant: "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?q=80&w=2070&auto=format&fit=crop",
        homeowner: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop",
    };

    const content = {
        tenant: {
            title: mode === "login" ? "Welcome Back, Tenant" : "Start Your Search",
            desc: "Find and secure your next home with verified properties and zero stress.",
        },
        homeowner: {
            title: mode === "login" ? "Welcome Back, Homeowner" : "List Your Property",
            desc: "Manage your rentals and connect with high-intent, verified tenants.",
        },
    };

    return (
        <section className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
            {/* Left Side: Visuals */}
            <div className="flex h-[550px] lg:h-auto lg:w-1/2 relative overflow-hidden bg-primary shrink-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={role}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={images[role]}
                            alt={role}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                        <div className="absolute bottom-10 left-8 right-8 lg:bottom-16 lg:left-16 lg:right-16 text-white">
                            <Reveal direction="up" delay={0.2}>
                                <h2 className="text-3xl lg:text-4xl font-bold mb-4">{content[role].title}</h2>
                                <p className="text-base lg:text-lg text-white/80 max-w-md">{content[role].desc}</p>
                            </Reveal>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <Link href="/" className="absolute top-6 left-6 lg:top-10 lg:left-10 z-20 flex items-center gap-2">
                    <Image src="/logo.png" alt="LODGEME" width={120} height={32} className="h-10 lg:h-14 w-auto" />
                </Link>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col justify-center px-6 lg:px-24 py-12 relative">
                <div className="max-w-md w-full mx-auto">

                    {/* Role Tabs */}
                    <div className="flex p-1.5 bg-accent/50 rounded mb-10 w-full">
                        <button
                            onClick={() => { setRole("tenant"); setError(null); }}
                            className={`flex-1 py-3 rounded text-sm font-bold transition-all duration-300 ${role === "tenant"
                                ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            I am a Tenant
                        </button>
                        <button
                            onClick={() => { setRole("homeowner"); setError(null); }}
                            className={`flex-1 py-3 rounded text-sm font-bold transition-all duration-300 ${role === "homeowner"
                                ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            I am a Homeowner
                        </button>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h3 className="text-3xl font-black mb-3">
                            {resetMode
                                ? "Reset password"
                                : mode === "login" ? "Login to your account" : "Create your account"}
                        </h3>
                        <p className="text-muted-foreground">
                            {resetMode
                                ? "Enter your email to receive a password reset link."
                                : mode === "login"
                                    ? "Enter your credentials to access your dashboard."
                                    : "Join our community of verified renters and owners."}
                        </p>
                    </div>

                    {/* Error / Success Banners */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg font-medium text-center"
                            >
                                {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!resetMode && (
                        <>
                            {/* Google Sign In */}
                            <div className="grid grid-cols-1 gap-4 mb-8">
                                <Button
                                    variant="outline"
                                    className="h-12 border-border/60 font-bold flex gap-3 hover:bg-accent/50 disabled:opacity-50"
                                    onClick={handleGoogleSignIn}
                                    disabled={googleLoading || emailLoading}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.43 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    {googleLoading ? "Connecting..." : "Continue with Google"}
                                </Button>
                            </div>

                            <div className="relative mb-8">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/60" /></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground font-bold tracking-widest">Or with email</span></div>
                            </div>
                        </>
                    )}

                    {resetMode ? (
                        <form className="space-y-5" onSubmit={handleForgotPassword}>
                            <div className="space-y-2">
                                <Label htmlFor="reset-email">Email Address</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-12 h-12 bg-accent/30 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 rounded"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={emailLoading}
                                className="w-full h-14 text-lg font-black shadow-lg shadow-primary/20 mt-4 rounded"
                            >
                                {emailLoading ? "Sending..." : "Send Reset Link"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => { setResetMode(false); setError(null); setSuccess(null); }}
                                className="w-full text-sm font-bold text-muted-foreground hover:text-primary transition-colors mt-4"
                            >
                                Back to Login
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-5" onSubmit={handleEmailAuth}>
                            {mode === "signup" && (
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <User size={18} />
                                        </div>
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="pl-12 h-12 bg-accent/30 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 rounded"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-12 h-12 bg-accent/30 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-transparent transition-all duration-300 rounded"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {mode === "login" && (
                                        <button
                                            type="button"
                                            onClick={() => { setResetMode(true); setError(null); setSuccess(null); }}
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
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

                            <Button
                                type="submit"
                                disabled={googleLoading || emailLoading}
                                className="w-full h-14 text-lg font-black shadow-lg shadow-primary/20 mt-4 rounded"
                            >
                                {emailLoading ? "Processing..." : (mode === "login" ? "Log In" : "Create Account")}
                            </Button>
                        </form>
                    )}

                    <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
                        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccess(null); }}
                            className="text-primary font-black hover:underline"
                        >
                            {mode === "login" ? "Sign Up" : "Log In"}
                        </button>
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-10 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    <p>© 2024 LODGEME — Secure Property Rental Network</p>
                    <div className="mt-2 flex justify-center gap-4">
                        <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
