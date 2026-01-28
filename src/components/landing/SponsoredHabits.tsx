import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, Star } from "lucide-react";
import { useSponsoredHabits } from "@/hooks/useSponsoredHabits";

const SponsoredHabits = () => {
  const { sponsoredHabits, loading } = useSponsoredHabits();

  return (
    <section id="sponsors" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-2 block">
              Sponsored Habits
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Get <span className="text-gradient-money">paid</span> to build habits
            </h2>
            <p className="text-muted-foreground text-lg">
              Brands pay you to complete habit challenges. Real money, real results—no strings attached.
            </p>
          </div>
          <Button variant="outline" className="self-start lg:self-auto">
            View All Challenges
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Sponsored Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="p-6 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary" />
                    <div className="space-y-2">
                      <div className="h-3 w-16 bg-secondary rounded" />
                      <div className="h-4 w-20 bg-secondary rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-3/4 bg-secondary rounded mb-2" />
                  <div className="h-4 w-full bg-secondary rounded" />
                </div>
                <div className="p-6 pt-4">
                  <div className="h-8 w-16 bg-secondary rounded" />
                </div>
              </div>
            ))
          ) : (
            sponsoredHabits.slice(0, 3).map((habit) => (
              <div
                key={habit.id}
                className="glass-card rounded-2xl overflow-hidden hover-lift group"
              >
                {/* Header with Brand */}
                <div className="p-6 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                      {habit.brand_logo}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Sponsored by</p>
                      <p className="font-semibold">{habit.brand_name}</p>
                    </div>
                  </div>
                  <h3 className="font-display text-lg font-bold mb-1">{habit.title}</h3>
                  <p className="text-muted-foreground text-sm">{habit.description}</p>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="number-display text-2xl font-bold text-primary">{habit.reward_amount}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{habit.participants_count.toLocaleString()} participants</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span className="font-semibold">{habit.rating}</span>
                    </div>
                    <Button size="sm" variant="hero" className="mt-2">
                      Join
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Brand CTA */}
        <div className="mt-16 glass-card rounded-2xl p-8 md:p-12 text-center">
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Are you a brand?
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Sponsor habits and pay only for completed actions. Get real behavior change, not just impressions.
          </p>
          <Button variant="outline" size="lg">
            Partner With Us
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SponsoredHabits;
