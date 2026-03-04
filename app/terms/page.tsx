"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { CheckCircle2, AlertCircle, ShieldCheck, Scale, Globe, UserCheck, MessageSquare, ExternalLink } from "lucide-react";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-white overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/terms-hero.png')",
                    }}
                >
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
                </div>

                <div className="container relative z-10 px-6 text-center text-white">
                    <Reveal direction="down" delay={0.1}>
                        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full text-primary-foreground">
                            Legal Documentation
                        </span>
                    </Reveal>
                    <Reveal direction="up" delay={0.2}>
                        <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight">Terms of Service</h1>
                    </Reveal>
                    <Reveal direction="up" delay={0.3}>
                        <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed">
                            LODGEME REAL ESTATE SERVICE PROVIDER. <br className="hidden md:block" /> TERMS AND CONDITIONS & USER POLICY
                        </p>
                    </Reveal>
                </div>

                {/* Decorative elements */}
                <div className="absolute w-full  bg-gradient-to-t from-white to-transparent z-10" />
            </section>

            {/* Content Section */}
            <section className="py-12 md:py-24 relative overflow-hidden">
                <div className="container mx-auto px-6 max-w-5xl">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                        {/* Sidebar Navigation (Desktop) */}
                        <aside className="hidden lg:block lg:col-span-3 h-fit sticky top-32 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Contents</p>
                            {[
                                { id: "intro", label: "Introduction" },
                                { id: "registration", label: "Registration" },
                                { id: "marketplace", label: "Marketplace" },
                                { id: "content", label: "User Content" },
                                { id: "disclaimer", label: "Disclaimer" },
                                { id: "liability", label: "Liability" },
                                { id: "governing-law", label: "Governing Law" },
                            ].map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    className="block py-2 px-4 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                >
                                    {item.label}
                                </a>
                            ))}

                            <div className="mt-12 p-6 bg-accent rounded-2xl border border-primary/10">
                                <p className="text-xs font-bold text-primary mb-2">LAST UPDATED</p>
                                <p className="text-sm font-mono text-foreground">02/25/2025</p>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="lg:col-span-9 space-y-20">

                            {/* Introduction */}
                            <section id="intro" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Globe size={24} />
                                    </div>
                                    <h2 className="text-3xl font-bold font-heading">LODGEME GROUP</h2>
                                </div>
                                <div className="space-y-6 text-muted-foreground leading-relaxed ">
                                    <p>
                                        LODGEME GROUP is a real estate rental and sales service provider. Our platform is solely committed to bridging the gap between homeowners/agents and those looking for rental and for sale properties regardless of their location.
                                    </p>
                                    <p>
                                        These terms and conditions shall apply to all kinds of users (being homeowners/agents and those looking for rental and/ or sale properties). Please read these terms and conditions carefully before signing up/registering on the platform.
                                    </p>
                                    <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-2xl text-red-900 font-medium my-8">
                                        <div className="flex gap-4">
                                            <AlertCircle className="shrink-0 text-red-600" />
                                            <p>
                                                BY proceeding to register/sign up, YOU AGREE, that you are 18 years or above and that you have read, understood and are to be bound by THE FOLLOWING general TERMS AND CONDITIONS in full.
                                                <span className="block mt-2 font-bold underline">If you disagree with these general terms and conditions or any part of these general terms and conditions you must not use our platform (do not register).</span>
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-base italic bg-muted/30 p-4 rounded-xl">
                                        If you register on Lodgeme in the course of a business or other organizational project then by so doing you confirm that you have obtained the necessary authority and bind both yourself and the person, company or other legal entity that operates that business to these terms.
                                    </p>
                                </div>
                            </section>

                            {/* Registration and Account */}
                            <section id="registration" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <UserCheck size={24} />
                                    </div>
                                    <h2 className="text-3xl font-bold font-heading">Registration and account</h2>
                                </div>
                                <div className="space-y-6 text-muted-foreground leading-relaxed">
                                    <p>
                                        You may not register with our platform if you are under 18 years of age. By using our platform or agreeing to these general terms and conditions you warrant and represent to us that you are at least 18 years of age.
                                    </p>
                                    <p>
                                        If you register for an account with our platform you will be asked to provide an email address/user ID and password and you agree to:
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                                        {[
                                            { icon: ShieldCheck, text: "Keep your password confidential at all times." },
                                            { icon: MessageSquare, text: "Notify us immediately if you become aware of any disclosure." },
                                            { icon: AlertCircle, text: "Be responsible for any activity resulting from password failure." },
                                            { icon: Scale, text: "You may be held liable for any losses arising out of such a failure." }
                                        ].map((item, i) => (
                                            <div key={i} className="p-4 bg-muted/30 rounded-2xl flex gap-4 items-start">
                                                <item.icon className="text-primary shrink-0 mt-1" size={18} />
                                                <span className="text-sm font-medium text-foreground">{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="font-medium text-foreground p-6 rounded-2xl border-2 border-dashed border-border">
                                        "Your account shall be used exclusively by you and you shall not transfer your account to any third party. If you authorize any third party to manage your account on your behalf this shall be at your own risk."
                                    </p>
                                </div>
                            </section>

                            {/* Marketplace */}
                            <section id="marketplace" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Globe size={24} />
                                    </div>
                                    <h2 className="text-3xl font-bold font-heading">Marketplace Management</h2>
                                </div>
                                <div className="space-y-6 text-muted-foreground">
                                    <p>
                                        LodgeMe holds the right to withhold, remove/delete any customer both user/agent content with or without notice that breaches these terms and conditions.
                                    </p>
                                    <p>
                                        You must not use our marketplace to link to any website or web page consisting of or containing material that would when posted on our marketplace breach the provisions of these general terms and conditions.
                                    </p>
                                    <p>
                                        You must not submit to our marketplace any material that is or has ever been the subject of any threatened or actual legal proceedings or other similar complaint.
                                    </p>
                                </div>
                            </section>

                            {/* User Content */}
                            <section id="content" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <MessageSquare size={24} />
                                    </div>
                                    <h2 className="text-3xl font-bold font-heading">Your Content & Behavior</h2>
                                </div>
                                <div className="space-y-6 text-muted-foreground">
                                    <p>
                                        All works and materials (including text, graphics, images, audio, video, scripts, and files) that you submit to us are true and non-fraudulent.
                                    </p>
                                    <p>
                                        You will be transparent in all your communications on the marketplace including product reviews, feedback and comments. Your content must be appropriate, civil, and tasteful.
                                    </p>
                                    <div className="bg-foreground text-white p-8 rounded-3xl space-y-6">
                                        <p className="text-lg font-medium opacity-90 italic">Content must NOT be:</p>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                            {[
                                                "Offensive, obscene or indecent",
                                                "Pornographic, lewd or sexually explicit",
                                                "Depicting graphic or gratuitous violence",
                                                "Blasphemous or discriminatory",
                                                "Deceptive, fraudulent or threatening",
                                                "Abusive, harassing or anti-social",
                                                "Constituting spam or annoyance",
                                                "Breaching intellectual property rights",
                                            ].map((item, i) => (
                                                <li key={i} className="flex gap-3 items-center text-sm opacity-80">
                                                    <XCircle size={14} className="text-secondary" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Disclaimer */}
                            <section id="disclaimer" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary-foreground">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h2 className="text-3xl font-bold font-heading">DISCLAIMER & SCOPE</h2>
                                </div>
                                <div className="space-y-6 text-muted-foreground bg-accent p-8 rounded-3xl border border-primary/10">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex gap-4">
                                            <CheckCircle2 className="text-primary shrink-0 mt-1" />
                                            <p className="text-foreground font-medium">LodgeMe do not own or manage properties.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <CheckCircle2 className="text-primary shrink-0 mt-1" />
                                            <p className="text-foreground font-medium">We do not act as real estate agents/travel agents for our customers.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <CheckCircle2 className="text-primary shrink-0 mt-1" />
                                            <p className="text-foreground font-medium">We only provide a platform where users connect with agents/landlords.</p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-primary/10 w-full my-6" />
                                    <p className="text-sm leading-relaxed">
                                        LodgeMe do not take part in, or responsibility for, any rental transactions, booking arrangements or any property management issues, meaning we are not party to any rental contract. We are only here to link you, the user to the agent/landlords. We have no control over any content transmitted on the website or/and third-party channel between the user/buyer and the agent/landlords.
                                    </p>
                                    <p className="text-sm italic">
                                        All information on the Website is available for reference only and shall not be deemed any investment advice or any form of investment solicitation.
                                    </p>
                                </div>
                            </section>

                            {/* Liability */}
                            <section id="liability" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Scale size={24} />
                                    </div>
                                    <h2 className="text-3xl font-bold font-heading">Limitation of Liability</h2>
                                </div>
                                <div className="space-y-6 text-muted-foreground">
                                    <p className="font-bold text-foreground">
                                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL LODGEME.COM BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES.
                                    </p>
                                    <p>
                                        This includes loss of use, loss of data, loss of business or loss of profits arising out of or in connection with the renter’s/ buyer’s use of the platform, whether such liability arises from any claim based upon contract, warranty, tort (including negligence), strict liability or otherwise.
                                    </p>
                                    <div className="p-6 bg-muted rounded-2xl border border-border">
                                        <p className="text-sm">
                                            Even if the third parties are our affiliates, we do not exercise any control over the linked websites and without taking any liabilities for the content of such linked websites. Website users need to make a personal independent judgment on how to use such websites.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Governing Law */}
                            <section id="governing-law" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Scale size={24} />
                                    </div>
                                    <h2 className="text-3xl font-bold font-heading">Governing Law</h2>
                                </div>
                                <div className="space-y-6 text-muted-foreground">
                                    <p>
                                        The establishment, effectiveness, interpretation, and dispute resolution of the Website and the Terms of use hereof shall be governed by the laws of the <span className="text-foreground font-bold">Federal Republic of Nigeria</span>.
                                    </p>
                                    <p>
                                        If any controversy or dispute between you and us arises, amicable negotiation is prior. If the negotiation fails, both parties agree that the dispute shall be referred to any Court of law within Nigeria.
                                    </p>
                                </div>
                            </section>

                            {/* Forward-Looking Statements */}
                            <section className="scroll-mt-32">
                                <div className="p-8 bg-muted/50 rounded-3xl border border-border">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <AlertCircle className="text-primary" size={20} />
                                        Forward-Looking Statements
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground italic">
                                        Any forward-looking statements provided on the Website concerning Lodgeme's future business are essentially inferences made based on available information, business plans, and forecasts of future situations and trends. Affected by many risks and uncertainties, we may change such statements at our sole discretion from time to time according to the market or other factors and have no intention to make any promise about any future service or plan in any way.
                                    </p>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-accent overflow-hidden">
                <div className="container mx-auto px-6 text-center max-w-2xl">
                    <Reveal direction="up">
                        <h3 className="text-3xl font-bold font-heading mb-6">Need Clarification?</h3>
                        <p className="text-muted-foreground mb-8 text-lg">
                            If you have questions regarding these terms, our team is here to help you understand your rights and obligations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="mailto:hello@lodgeme.com" className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2">
                                <MessageSquare size={18} />
                                Contact Support
                            </a>
                            
                        </div>
                    </Reveal>
                </div>
            </section>

            <Footer />
        </main>
    );
}

function XCircle({ size, className }: { size: number, className: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
        </svg>
    );
}
