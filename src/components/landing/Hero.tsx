import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, TrendingUp, Shield } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Launching Soon • Join the Waitlist</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
            Habits that{" "}
            <span className="text-gradient-money">pay you</span>
            <br />
            or cost you
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Put real money on the line. Complete your habits and get rewarded. 
            Skip them and lose your stake. Finally, accountability that works.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl" className="w-full sm:w-auto" onClick={() => navigate("/auth")}>
              Start Earning
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="glass" size="xl" className="w-full sm:w-auto" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="glass-card rounded-2xl p-6 hover-lift">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="number-display text-3xl font-bold">$2.4M</span>
              </div>
              <p className="text-sm text-muted-foreground">Earned by users</p>
            </div>
            <div className="glass-card rounded-2xl p-6 hover-lift">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="number-display text-3xl font-bold">89%</span>
              </div>
              <p className="text-sm text-muted-foreground">Habit completion rate</p>
            </div>
            <div className="glass-card rounded-2xl p-6 hover-lift">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="number-display text-3xl font-bold">50K+</span>
              </div>
              <p className="text-sm text-muted-foreground">Active users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
