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
      <div className="text-center animate-fade-in px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
        </div>
        <h3 className="responsive-text-2xl font-semibold text-foreground mb-2">
          You're in the Rush!
        </h3>
        <p className="responsive-text-base text-muted-foreground mb-6">
          We'll notify you when {waitlistTitle} launches.
        </p>
        <Button 
          variant="outline" 
          onClick={() => setIsJoined(false)}
          className="touch-friendly-md responsive-text-sm"
        >
          <span className="hidden sm:inline">Join Another Rush</span>
          <span className="sm:hidden">Join Another</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto text-center animate-slide-up px-4">
      <h1 className="responsive-text-4xl font-bold text-foreground mb-4">
        {waitlistTitle}
      </h1>
      <p className="responsive-text-lg text-muted-foreground mb-6 sm:mb-8">
        {waitlistDescription}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="relative">
          <Mail className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 sm:pl-12 pr-4 h-12 sm:h-16 responsive-text-base sm:text-lg rounded-xl sm:rounded-2xl bg-background/90 backdrop-blur-sm border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground/60 text-left"
            required
          />
        </div>

        <Button 
          type="submit" 
          variant="hero" 
          size="xl"
          className="w-full touch-friendly-lg"
          disabled={isLoading}
        >
          {isLoading ? "Rushing In..." : "Join the Rush"}
        </Button>
      </form>

      <p className="responsive-text-sm text-muted-foreground mt-4 sm:mt-6">
        No spam, ever. Unsubscribe anytime.
      </p>
    </div>
  );
}