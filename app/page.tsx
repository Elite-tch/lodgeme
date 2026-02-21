import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyLodgeme } from "@/components/landing/WhyLodgeme";
import { FeaturedListings } from "@/components/landing/FeaturedListings";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyLodgeme />
      <FeaturedListings />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
