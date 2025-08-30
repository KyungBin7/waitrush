import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle } from "lucide-react";

interface WaitlistJoinFormProps {
  waitlistTitle: string;
  waitlistDescription: string;
  onJoin?: (email: string) => Promise<void>;
}

export function WaitlistJoinForm({ 
  waitlistTitle, 
  waitlistDescription, 
  onJoin 
}: WaitlistJoinFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onJoin?.(email);
      setIsJoined(true);
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Failed to join waitlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isJoined) {
    return (
      <div className="text-center animate-fade-in px-4 relative">
        {/* Gaming success background */}
        <div className="absolute inset-0 backdrop-blur-xl bg-black/20 border border-white/5 rounded-3xl shadow-2xl" />
        <div className="relative z-10 p-6 sm:p-8">
        <div className="relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-4">
          {/* Gaming success glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur opacity-75 animate-pulse" />
          <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3">
            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>
        <h3 className="responsive-text-2xl font-bold text-foreground mb-2">
          🎉 <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">You're in the Rush!</span>
        </h3>
        <p className="responsive-text-base text-muted-foreground mb-6">
          We'll notify you when {waitlistTitle} launches.
        </p>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-yellow-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
          <Button 
            variant="outline" 
            onClick={() => setIsJoined(false)}
            className="relative touch-friendly-md responsive-text-sm bg-black/40 border-white/10 hover:bg-black/60 transition-all duration-300"
          >
            <span className="hidden sm:inline">Join Another Rush</span>
            <span className="sm:hidden">Join Another</span>
          </Button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto text-center animate-slide-up px-4 relative">
      {/* Glass morphism card background */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/20 border border-white/5 rounded-3xl shadow-2xl" />
      <div className="relative z-10 p-6 sm:p-8">
      <h1 className="responsive-text-4xl font-bold text-foreground mb-4">
        {waitlistTitle}
      </h1>
      <p className="responsive-text-lg text-muted-foreground mb-6 sm:mb-8">
        {waitlistDescription}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="relative group">
          {/* Gaming glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-yellow-400 rounded-2xl blur opacity-30 group-hover:opacity-50 group-focus-within:opacity-75 transition duration-300" />
          <div className="relative">
          <Mail className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 sm:pl-12 pr-4 h-12 sm:h-16 responsive-text-base sm:text-lg rounded-xl sm:rounded-2xl bg-black/40 backdrop-blur-xl border-2 border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-black/60 hover:bg-black/50 transition-all duration-300 placeholder:text-muted-foreground/60 text-left shadow-lg"
            required
          />
          </div>
        </div>

        <div className="relative group">
          {/* Gaming button glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-yellow-400 rounded-2xl blur opacity-60 group-hover:opacity-80 transition duration-300" />
          <Button 
            type="submit" 
            variant="hero" 
            size="xl"
            className="relative w-full touch-friendly-lg bg-gradient-to-r from-primary to-yellow-400 hover:from-primary/90 hover:to-yellow-400/90 text-black font-bold shadow-2xl hover:shadow-primary/25 transition-all duration-300 border-0"
            disabled={isLoading}
          >
            {isLoading ? "⚡ Rushing In..." : "🚀 Join the Rush"}
          </Button>
        </div>
      </form>

        <p className="responsive-text-sm text-muted-foreground mt-4 sm:mt-6">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}