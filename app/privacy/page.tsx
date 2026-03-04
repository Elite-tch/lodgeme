"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { ShieldCheck, Eye, Lock, Database, Bell, UserCheck, MessageSquare } from "lucide-react";

export default function PrivacyPage() {
    const sections = [
        {
            icon: Eye,
            title: "Information We Collect",
            content: "We collect information you provide directly to us when you create an account, such as your name, email address, and profile information. We also collect data about your property listings or search preferences."
        },
        {
            icon: Database,
            title: "How We Use Data",
            content: "Your data is used to provide and maintain our services, notify you about changes, allow you to participate in interactive features, and provide customer support."
        },
        {
            icon: Lock,
            title: "Security & Protection",
            content: "We implement robust security measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure."
        },
        {
            icon: Bell,
            title: "Communications",
            content: "We may use your personal information to contact you with newsletters, marketing or promotional materials, and other information that may be of interest to you."
        }
    ];

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-primary/5">
                <div className="container relative z-10 px-6 text-center">
                    <Reveal direction="down">
                        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase bg-primary/10 border border-primary/20 rounded-full text-primary">
                            Privacy Center
                        </span>
                    </Reveal>
                    <Reveal direction="up" delay={0.1}>
                        <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6 tracking-tight">Privacy Policy</h1>
                    </Reveal>
                    <Reveal direction="up" delay={0.2}>
                        <p className="text-xl opacity-70 max-w-2xl mx-auto font-light leading-relaxed">
                            Your privacy is our priority. Learn how we handle your data with transparency and care.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="space-y-16">
                        {sections.map((section, i) => (
                            <Reveal key={i} direction="up" delay={0.1 * i}>
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <section.icon size={28} />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-bold font-heading">{section.title}</h2>
                                        <p className="text-muted-foreground leading-relaxed text-lg">
                                            {section.content}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}

                        <Reveal direction="up" delay={0.5}>
                            <div className="p-8 bg-muted rounded-3xl border border-border mt-12">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <ShieldCheck className="text-primary" size={20} />
                                    Data Rights
                                </h3>
                                <p className="text-muted-foreground italic">
                                    You have the right to access, update, or delete the personal information we have on you. If you wish to exercise these rights, please contact our privacy team at hello@lodgeme.com.
                                </p>
                            </div>
                        </Reveal>
                    </div>

                    <div className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-muted-foreground text-sm">Last Updated: March 4, 2026</p>
                        <div className="flex gap-8">
                            <a href="/terms" className="text-sm font-bold text-primary hover:underline">Terms of Service</a>
                            <a href="/contact" className="text-sm font-bold text-primary hover:underline">Contact Support</a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
