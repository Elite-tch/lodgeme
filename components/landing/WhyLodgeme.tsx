"use client";

import { Reveal } from "@/components/ui/Reveal";
import { UserCheck, Star, Shield, MapPin } from "lucide-react";
import Image from "next/image";

const pillars = [
    { icon: UserCheck, title: "Verified Homeowners", desc: "Rigorous ID and face verification for building trust." },
    { icon: Star, title: "Transparent Ratings", desc: "Honest feedback from actual tenants for every listing." },
    { icon: Shield, title: "Secure Communication", desc: "In-app messaging to keep your data and chats safe." },
    { icon: MapPin, title: "No Location Barriers", desc: "Search and close deals from anywhere in the world." },
];

export const WhyLodgeme = () => {
    return (
        <section className="py-8 bg-accent/30 overflow-hidden">
            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <Reveal direction="right" delay={0.1}>
                        <h2 className="text-4xl font-bold mb-6">Built for Trust and Convenience</h2>
                    </Reveal>
                    <Reveal direction="right" delay={0.2}>
                        <p className="text-lg text-muted-foreground mb-5">
                            Lodgeme is more than just a listing site. We are creating a level playing field
                            for both parties to interact seamlessly and remotely.
                        </p>
                    </Reveal>

                    <div className="">
                        {pillars.map((pillar, index) => (
                            <Reveal key={pillar.title} direction="right" delay={0.1 * index} width="100%">
                                <div className="flex gap-5 p-4 rounded-xl hover:bg-white/50 transition-colors duration-300">
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                        <pillar.icon size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{pillar.title}</h4>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{pillar.desc}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>

                <Reveal direction="left" delay={0.4} width="100%">
                    <div className="relative">
                        <div className=" absolute -inset-4 blur-3xl rounded opacity-50 -z-10 animate-pulse" />
                        <div className="rounded overflow-hidden shadow  bg-white/50 backdrop-blur-sm ">
                            <Image
                                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2000&auto=format&fit=crop"
                                alt="Premium Verified Property"
                                width={1000}
                                height={800}
                                className="w-full h-auto rounded shadow-inner transition-transform duration-700"
                            />
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};
