"use client";

import { Reveal } from "@/components/ui/Reveal";
import Image from "next/image";

const steps = [
    {
        role: "For Clients",
        items: [
            {
                image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop",
                title: "Search Properties",
                desc: "Discover hand-picked homes that match your desired lifestyle and location."
            },
            {
                image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop",
                title: "Chat Verified Owners",
                desc: "Connect directly with trusted property owners through our secure portal."
            },
            {
                image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=800&auto=format&fit=crop",
                title: "Close the Deal",
                desc: "Experience a seamless move-in process with our end-to-end guidance."
            },
        ]
    },
    {
        role: "For Homeowners",
        items: [
            {
                image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
                title: "List Property",
                desc: "Showcase your premium rentals to a global audience of qualified tenants."
            },
            {
                image: "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?q=80&w=800&auto=format&fit=crop",
                title: "Get Verified",
                desc: "Enhance your credibility with our rigorous owner verification program."
            },
            {
                image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=800&auto=format&fit=crop",
                title: "Receive Inquiries",
                desc: "Easily manage high-intent inquiries from your personalized dashboard."
            },
        ]
    }
];

export const HowItWorks = () => {
    return (
        <section className="py-14 bg-white relative">
            <div className="container mx-auto px-6">
                <Reveal width="100%" delay={0.1}>
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            A refined and simple journey to your next rental success.
                            Built on trust, speed, and elegance.
                        </p>
                    </div>
                </Reveal>

                {steps.map((group, gIndex) => (
                    <div key={group.role} className={gIndex === 0 ? "mb-10" : ""}>
                        <Reveal width="100%" delay={0.2}>
                            <h3 className="text-sm font-bold mb-12 text-center text-primary uppercase tracking-[0.3em]">
                                {group.role}
                            </h3>
                        </Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {group.items.map((item, iIndex) => (
                                <Reveal key={item.title} delay={0.1 * iIndex} width="100%" className="h-full">
                                    <div className="group bg-white rounded overflow-hidden hover:shadow transition-all duration-500 cursor-default border border-border/60 hover:border-primary/20 h-full flex flex-col">
                                        <div className="relative h-64 w-full overflow-hidden shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="object-cover transition-transform duration-1000"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </div>
                                        <div className="md:p-10 p-6 flex flex-col flex-grow">
                                            <h4 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                                                {item.title}
                                            </h4>
                                            <p className="text-muted-foreground leading-relaxed text-base leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
