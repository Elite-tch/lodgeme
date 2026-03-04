"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { Copy, Shield, FileText, Globe, AlertCircle, MessageSquare } from "lucide-react";

export default function CopyrightPage() {
    return (
        <main className="min-h-screen bg-white overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/copyright-hero.png')",
                    }}
                >
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                </div>

                <div className="container relative z-10 px-6 text-center text-white">
                    <Reveal direction="down" delay={0.1}>
                        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                            Intellectual Property
                        </span>
                    </Reveal>
                    <Reveal direction="up" delay={0.2}>
                        <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight">Copyright Statement</h1>
                    </Reveal>
                    <Reveal direction="up" delay={0.3}>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed">
                            Protecting the innovation and identity of the Lodgeme platform.
                        </p>
                    </Reveal>
                </div>

                {/* Decorative gradient overlay at bottom */}
                <div className="absolute  bg-gradient-to-t from-white to-transparent z-10" />
            </section>

            {/* Content Section */}
            <section className="py-16 md:py-24 relative overflow-hidden">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="space-y-16">

                        {/* Trademarks */}
                        <section>
                            <Reveal direction="up">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Shield size={24} />
                                    </div>
                                    <h2 className="text-3xl font-bold font-heading uppercase tracking-tight">Trademarks</h2>
                                </div>
                                <div className="space-y-6 text-muted-foreground leading-relaxed ">
                                    <p>
                                        The words and/or logos such as, <span className="text-foreground font-bold">"Lodgeme"</span> on the Website, as well as other identifications, emblems, products, properties, and service names on the Website, are the registered trademarks of us and our affiliates (collectively, the "Lodgeme") in Nigeria and other countries.
                                    </p>
                                    <div className="p-8 bg-accent rounded-3xl border border-primary/10 my-8">
                                        <p className="text-foreground font-medium italic">
                                            "Without the written authorization of the rights holder, you shall not display, use, or otherwise deal with such trademarks in any way (including but not limited to copy, broadcast, display, mirror, upload, and download), or indicate that you have the right to do so."
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        </section>

                        {/* Intellectual Property Rights */}
                        <section>
                            <Reveal direction="up">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary-foreground">
                                        <Copy size={24} />
                                    </div>
                                    <h2 className="text-3xl font-bold font-heading uppercase tracking-tight">Ownership & IP Rights</h2>
                                </div>
                                <div className="space-y-6 text-muted-foreground leading-relaxed">
                                    <p>
                                        The intellectual property rights in all properties, services, products, technologies, and programs on the Website shall be vested in and owned by us or the rights holders thereof.
                                    </p>
                                    <p>
                                        Unless otherwise stated, we own all rights (including but not limited to <span className="text-foreground font-semibold">copyrights, trademarks, patents, trade secrets, and other related rights</span>) in documents and other information (including but not limited to text, graphics, pictures, photos, audio, videos, icons, colors, page layouts, and electronic documents) that we publish on the Website.
                                    </p>

                                    <div className="flex flex-col md:flex-row gap-6 mt-12">
                                        <div className="flex-1 p-6 bg-muted/30 rounded-2xl border border-border">
                                            <div className="text-primary mb-4"><Globe size={20} /></div>
                                            <p className="text-sm">
                                                Without permission, you shall not monitor, copy, broadcast, display, mirror, upload, or download any content through programs or devices.
                                            </p>
                                        </div>
                                        <div className="flex-1 p-6 bg-muted/30 rounded-2xl border border-border">
                                            <div className="text-primary mb-4"><FileText size={20} /></div>
                                            <p className="text-sm">
                                                If authorized to disseminate information, it must not be for commercial purposes and must include this Copyright Statement.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </section>

                        {/* Note/Warning */}
                        <Reveal direction="up">
                            <div className="p-8 bg-red-50/50 border border-red-100 rounded-3xl flex gap-6 items-start">
                                <AlertCircle className="text-red-500 shrink-0 mt-1" size={24} />
                                <div className="space-y-2">
                                    <h4 className="text-red-900 font-bold uppercase tracking-wider text-sm">Legal Protection</h4>
                                    <p className="text-red-800/80 text-sm leading-relaxed">
                                        Lodgeme actively monitors unauthorized use of its intellectual property and reserves the right to take legal action to protect its brand and digital assets from infringement.
                                    </p>
                                </div>
                            </div>
                        </Reveal>

                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-accent overflow-hidden">
                <div className="container mx-auto px-6 text-center max-w-2xl">
                    <Reveal direction="up">
                        <h3 className="text-3xl font-bold font-heading mb-6 tracking-tight">Intellectual Property Inquiry</h3>
                        <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
                            For licensing requests or to report potential copyright infringement, please contact our legal team.
                        </p>
                        <div className="flex justify-center">
                            <a href="mailto:hello@lodgeme.com" className="px-10 py-4 bg-primary text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3">
                                <MessageSquare size={18} />
                                Contact Legal Support
                            </a>
                        </div>
                    </Reveal>
                </div>
            </section>

            <Footer />
        </main>
    );
}
