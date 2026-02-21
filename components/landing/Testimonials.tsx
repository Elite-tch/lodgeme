"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
    {
        name: "Olawale Johnson",
        role: "Tenant",
        content: "Found my apartment in Lekki in just 2 days. The verification process gave me so much peace of mind compared to other sites.",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop",
        rating: 5
    },
    {
        name: "Sarah Adebayo",
        role: "Homeowner",
        content: "Listing my property was seamless. I started receiving inquiries from serious, verified tenants within hours. Highly recommended!",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
        rating: 5
    },
    {
        name: "Emeka Obi",
        role: "Agent",
        content: "Lodgeme has changed how I interact with clients. No more location barriers or trust issues. It's a game changer for the Nigerian market.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
        rating: 5
    }
];

export const Testimonials = () => {
    return (
        <section className="py-8 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <Reveal width="100%" delay={0.1}>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-2 font-heading">What Our Users Say</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Real stories from real people who found their home or tenant through Lodgeme.
                        </p>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {testimonials.map((t, index) => (
                        <Reveal key={t.name} delay={0.1 * index} width="100%" className="h-full">
                            <div className="bg-accent/30 p-10 rounded-3xl relative group hover:bg-white hover:shadow transition-all duration-500 border border-transparent hover:border-primary/20 h-full flex flex-col">
                                <div className="absolute top-8 right-10 text-primary/10 group-hover:text-primary/20 transition-colors">
                                    <Quote size={60} fill="currentColor" />
                                </div>

                                <div className="flex gap-1 mb-6">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} size={18} className="fill-secondary text-secondary" />
                                    ))}
                                </div>

                                <p className="text-lg text-foreground mb-8 relative z-10 font-medium italic leading-relaxed">
                                    "{t.content}"
                                </p>

                                <div className="mt-auto flex items-center gap-4">
                                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                                        <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{t.name}</h4>
                                        <p className="text-primary text-sm font-semibold">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};
