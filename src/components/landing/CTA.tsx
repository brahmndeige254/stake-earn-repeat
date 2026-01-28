import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-glow opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to make habits{" "}
            <span className="text-gradient-money">pay</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            {user 
              ? "You're already part of the community. Head to your dashboard to start earning!" 
              : "Join thousands who are already building habits that pay."}
          </p>

          {user ? (
            <Button variant="hero" size="xl" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="hero" size="xl" onClick={() => navigate("/auth")}>
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
