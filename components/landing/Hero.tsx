"use client";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import Image from "next/image";
import Link from "next/link";

const avatars = [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
];

export const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background Image Container */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"
                    alt="Modern apartment interior"
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                {/* Light Overlay for spacious feel + readability */}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl">
                    <Reveal direction="right" delay={0.1}>
                        <span className="inline-block px-4 py-1.5 mt-20 mb-6 text-sm font-semibold tracking-wide text-primary uppercase bg-primary/10 rounded-full border border-primary/20">
                            Trust & Transparency First
                        </span>
                    </Reveal>

                    <Reveal direction="right" delay={0.2}>
                        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-[1.1]">
                            Find Verified Rental <span className="text-primary italic">Homes</span> Without Stress
                        </h1>
                    </Reveal>

                    <Reveal direction="right" delay={0.3}>
                        <p className="text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed font-medium">
                            LODGEME bridges the gap between verified homeowners and prospect tenants.
                            Secure, remote, and convenient interactions for modern living.
                        </p>
                    </Reveal>

                    <Reveal direction="right" delay={0.4}>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/auth">
                                <Button size="sm" className="shadow-xl py-3 px-6 shadow-primary/20">
                                    Find a Home
                                </Button>
                            </Link>
                            <Link href="/auth">
                                <Button variant="outline" size="sm" className="bg-white/50 backdrop-blur-md px-6 py-3">
                                    List Your Property
                                </Button>
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </div>

            {/* Floating Info card for visual interest */}
            <div className="absolute bottom-12 right-12 hidden lg:block z-10">
                <Reveal direction="up" delay={0.6}>
                    <div className="px-8 py-6 glass rounded-[2.5rem] max-w-[300px] shadow-2xl border-white/50 ring-1 ring-black/5">
                        <div className="flex -space-x-4 mb-4">
                            {avatars.map((url, i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-secondary shadow-lg overflow-hidden relative">
                                    <Image
                                        src={url}
                                        alt={`User ${i + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm font-bold text-foreground leading-snug">
                            Joined by 1,000+ Verified Homeowners across Nigeria
                        </p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};
