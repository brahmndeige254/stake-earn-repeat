import { Brain, Flame, Trophy, Users, Wallet, Sparkles } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Loss Aversion Psychology",
    description: "Science shows we hate losing 2x more than we love winning. We use this to supercharge your motivation.",
    highlight: "2x stronger motivation",
  },
  {
    icon: Flame,
    title: "Streak Protection",
    description: "Life happens. Use one-time shields to protect your streak without losing your stake.",
    highlight: "Emergency shields included",
  },
  {
    icon: Trophy,
    title: "One-Off Goals",
    description: "Not just daily habits. Set milestones for major life goals—finish that book, launch that project, apply for that job.",
    highlight: "Big wins, big rewards",
  },
  {
    icon: Users,
    title: "Accountability Squads",
    description: "Join groups where everyone has skin in the game. Shared stakes mean shared motivation.",
    highlight: "Social accountability",
  },
  {
    icon: Wallet,
    title: "No Subscriptions",
    description: "We only win when you win. Our revenue comes from sponsors and stake management—not monthly guilt fees.",
    highlight: "Aligned incentives",
  },
  {
    icon: Sparkles,
    title: "Sponsored Habits",
    description: "Brands pay you to try their products through habit challenges. Earn money for healthy behaviors.",
    highlight: "Get paid to build habits",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Built for <span className="text-gradient-money">results</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Every feature is designed around one goal: making you actually do the thing.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-6 hover-lift group"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-display text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{feature.description}</p>
              
              {/* Highlight Tag */}
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {feature.highlight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
