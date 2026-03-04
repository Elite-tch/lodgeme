"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import {
    Mail,
    Phone,
    MapPin,
    Send,
    CheckCircle2,
    AlertCircle,
    Facebook,
    Twitter,
    Instagram,
    Linkedin
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus("success");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                const data = await response.json();
                throw new Error(data.message || "Something went wrong.");
            }
        } catch (error: any) {
            setStatus("error");
            setErrorMessage(error.message);
        }
    };

    const contactInfo = [
        {
            icon: Phone,
            title: "Phone",
            value: "+234 800 000 0000",
            description: "Mon-Fri from 8am to 5pm",
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            icon: Mail,
            title: "Email",
            value: "hello@lodgeme.com",
            description: "Our friendly team is here to help.",
            color: "text-orange-500",
            bg: "bg-orange-50"
        },
        {
            icon: MapPin,
            title: "Office",
            value: "Lagos, Nigeria",
            description: "Come say hello at our HQ.",
            color: "text-green-500",
            bg: "bg-green-50"
        }
    ];

    return (
        <main className="min-h-screen bg-[#FAFAFA] overflow-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-20 h-[50vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/contact-hero.png')" }}
                >
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                </div>

                <div className="container relative z-10 px-6 text-center text-white">
                    <Reveal direction="down" delay={0.1}>
                        <h1 className="text-5xl md:text-7xl font-black font-heading mb-6 tracking-tight">Get in Touch</h1>
                    </Reveal>
                    <Reveal direction="up" delay={0.2}>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed">
                            Have questions or need assistance? Our team is dedicated to providing you with the best real estate service experience.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 relative z-20">
                <div className="container mx-auto px-6">
                    <div className=" ">

                       

                        {/* Form Column */}
                        <div className="md:w-[70%] mx-auto">
                            <Reveal direction="left" delay={0.2}>
                                <div className=" p-8 md:p-12 rounded-2xl border border-border">
                                    <h2 className="text-3xl font-black font-heading mb-4 uppercase tracking-tight">Send a Message</h2>
                                    <p className="text-muted-foreground mb-10">
                                        Fill out the form below and we'll get back to you as soon as possible.
                                    </p>

                                    {status === "success" ? (
                                        <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
                                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                                                <CheckCircle2 size={40} className="text-[#0077B6]" />
                                            </div>
                                            <h3 className="text-2xl font-black mb-2">Message Sent!</h3>
                                            <p className="text-muted-foreground mb-8">Thank you for reaching out. We will contact you shortly.</p>
                                            <Button onClick={() => setStatus("idle")} variant="outline">
                                                Send Another Message
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="John Doe"
                                                        className="w-full h-14 px-5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary/50 transition-all font-medium"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Email Address</label>
                                                    <input
                                                        type="email"
                                                        required
                                                        placeholder="john@example.com"
                                                        className="w-full h-14 px-5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary/50 transition-all font-medium"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Subject</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="How can we help?"
                                                    className="w-full h-14 px-5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary/50 transition-all font-medium"
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Your Message</label>
                                                <textarea
                                                    required
                                                    placeholder="Tell us more about your inquiry..."
                                                    rows={6}
                                                    className="w-full p-5 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary/50 transition-all font-medium resize-none"
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                />
                                            </div>

                                            {status === "error" && (
                                                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 italic">
                                                    <AlertCircle size={18} />
                                                    {errorMessage}
                                                </div>
                                            )}

                                            <Button
                                                type="submit"
                                                className="w-full md:w-auto h-14 px-12 rounded-lg font-black uppercase tracking-widest flex items-center gap-3 group"
                                                disabled={status === "loading"}
                                            >
                                                {status === "loading" ? "Sending..." : "Send Message"}
                                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
