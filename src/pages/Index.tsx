import Header from "@/components/layout/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Dashboard from "@/components/landing/Dashboard";
import SponsoredHabits from "@/components/landing/SponsoredHabits";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Dashboard />
        <SponsoredHabits />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
