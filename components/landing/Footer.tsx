"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-white border-t border-border pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <Reveal direction="right" delay={0.1}>
                        <div className="space-y-6">
                            <div className="font-heading text-3xl font-bold text-primary">LODGEME</div>
                            <p className="text-muted-foreground leading-relaxed max-w-xs">
                                Bridging the gap between homeowners and prospect tenants through
                                trust, security, and seamless interaction.
                            </p>
                            <div className="flex gap-4">
                                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                    <a key={i} href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                                        <Icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </Reveal>

                    <Reveal direction="up" delay={0.2}>
                        <div>
                            <h4 className="font-bold text-lg mb-8 uppercase tracking-wider">Quick Links</h4>
                            <ul className="space-y-4">
                                {["Find a Home", "List Property", "How It Works", "Pricing Plan", "Contact Us"].map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Reveal>

                    <Reveal direction="up" delay={0.3}>
                        <div>
                            <h4 className="font-bold text-lg mb-8 uppercase tracking-wider">Legal</h4>
                            <ul className="space-y-4">
                                {["Terms of Service", "Privacy Policy", "Cookie Policy", "Verification Policy", "Safety Guide"].map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Reveal>

                    <Reveal direction="left" delay={0.4}>
                        <div>
                            <h4 className="font-bold text-lg mb-8 uppercase tracking-wider">Contact</h4>
                            <ul className="space-y-5">
                                <li className="flex gap-4">
                                    <MapPin size={20} className="text-primary mt-1 shrink-0" />
                                    <span className="text-muted-foreground">12 Abijo GRA, Lekki-Epe Expressway, Lagos, Nigeria</span>
                                </li>
                                <li className="flex gap-4">
                                    <Phone size={20} className="text-primary mt-1 shrink-0" />
                                    <span className="text-muted-foreground">+234 812 345 6789</span>
                                </li>
                                <li className="flex gap-4">
                                    <Mail size={20} className="text-primary mt-1 shrink-0" />
                                    <span className="text-muted-foreground">hello@lodgeme.com</span>
                                </li>
                            </ul>
                        </div>
                    </Reveal>
                </div>

                <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-muted-foreground text-sm">
                        © 2026 Lodgeme Rental Services. All rights reserved.
                    </p>
                    <p className="text-muted-foreground text-xs italic">
                        Built for trust and transparency in the African rental market.
                    </p>
                </div>
            </div>
        </footer>
    );
};
