import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Smartphone, 
  Share, 
  Plus, 
  Check, 
  Zap,
  ArrowRight,
  Chrome,
  Apple
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-2xl gradient-money flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-4">App Installed!</h1>
          <p className="text-muted-foreground mb-8">
            StakeHabit is now on your home screen. Open it anytime to track your habits!
          </p>
          <Button variant="hero" size="lg" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-money">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">StakeHabit</span>
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-lg">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-3xl gradient-money flex items-center justify-center mx-auto mb-6 shadow-lg glow-primary">
            <Smartphone className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">
            Install StakeHabit
          </h1>
          <p className="text-lg text-muted-foreground">
            Get the full app experience with offline support and quick access from your home screen
          </p>
        </div>

        {/* Install Button for Android/Desktop Chrome */}
        {deferredPrompt && (
          <div className="mb-8">
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full text-lg py-6"
              onClick={handleInstall}
            >
              <Download className="mr-2 h-6 w-6" />
              Install App
            </Button>
          </div>
        )}

        {/* iOS Instructions */}
        {isIOS && (
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Apple className="h-6 w-6 text-primary" />
              <h2 className="font-display text-xl font-bold">Install on iPhone/iPad</h2>
            </div>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the <Share className="inline h-4 w-4" /> icon at the bottom of Safari
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Scroll down and tap "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the <Plus className="inline h-4 w-4" /> icon with the label
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Tap "Add" to confirm</p>
                  <p className="text-sm text-muted-foreground">
                    StakeHabit will appear on your home screen
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Android/Chrome Instructions */}
        {(isAndroid || (!isIOS && !deferredPrompt)) && (
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Chrome className="h-6 w-6 text-primary" />
              <h2 className="font-display text-xl font-bold">Install on Android/Chrome</h2>
            </div>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Tap the menu button</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the ⋮ icon in your browser's top right corner
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Tap "Install app" or "Add to Home screen"</p>
                  <p className="text-sm text-muted-foreground">
                    The option may vary depending on your browser
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Confirm the installation</p>
                  <p className="text-sm text-muted-foreground">
                    StakeHabit will be added to your apps
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Benefits */}
        <div className="space-y-4 mb-8">
          <h3 className="font-display text-lg font-bold text-center">Why install?</h3>
          <div className="grid gap-3">
            {[
              { icon: Zap, text: "Lightning fast - loads instantly" },
              { icon: Download, text: "Works offline - track habits anywhere" },
              { icon: Smartphone, text: "Full screen - no browser UI" },
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <benefit.icon className="h-5 w-5 text-primary" />
                <span className="text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skip */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Continue in browser
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Install;
