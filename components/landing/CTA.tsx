"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export const CTA = () => {
    return (
        <section className="py-24">
            <div className="container mx-auto px-6">
                <Reveal width="100%" delay={0.1}>
                    <div className="relative rounded-[40px] bg-primary overflow-hidden p-12 md:p-24 text-center">
                        {/* Abstract Background shapes */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                                Ready to Find Your Next Home?
                            </h2>
                            <p className="text-white/80 text-xl mb-12">
                                Join thousands of verified users today and experience rental search that actually works.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Button variant="secondary" size="lg" className="h-16 text-lg min-w-[240px]">
                                    Sign Up as Client
                                </Button>
                                <Button variant="outline" size="lg" className="h-16 text-lg min-w-[240px] border-white text-white hover:bg-white/10">
                                    Join as Homeowner
                                </Button>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};
