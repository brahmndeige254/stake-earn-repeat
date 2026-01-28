import { Target, DollarSign, CheckCircle2, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Target,
    title: "Set Your Habit",
    description: "Choose a habit you want to build. Daily meditation, morning workouts, reading—anything that matters to you.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: DollarSign,
    title: "Stake Your Money",
    description: "Put $5, $20, or $100 on the line. The higher the stakes, the stronger your commitment.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: CheckCircle2,
    title: "Complete & Verify",
    description: "Check in daily with photo proof, GPS verification, or app integrations. No cheating allowed.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: TrendingUp,
    title: "Get Paid",
    description: "Complete your streak and get your stake back plus bonus rewards. Fail and lose it to the community pool.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            How it <span className="text-gradient-money">works</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Simple mechanics, powerful results. Turn your intentions into actions with real consequences.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative group"
            >
              {/* Connector Line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent z-0" />
              )}
              
              <div className="glass-card rounded-2xl p-6 h-full hover-lift relative z-10">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center">
                  <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                </div>
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl ${step.bgColor} flex items-center justify-center mb-4`}>
                  <step.icon className={`h-7 w-7 ${step.color}`} />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
