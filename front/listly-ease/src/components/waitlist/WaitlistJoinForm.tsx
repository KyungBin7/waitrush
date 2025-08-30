import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface WaitlistJoinFormProps {
  waitlistTitle: string;
  waitlistDescription: string;
  onJoin?: (email: string) => Promise<void>;
  onJoinAnother?: () => void;
}

// Gaming Loading Spinner Component
const GamingLoadingSpinner = ({ message }: { message: string }) => {
  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      {/* Main Spinner */}
      <div className="relative">
        {/* Outer Ring - Spinning */}
        <motion.div
          className="w-20 h-20 border-4 border-transparent border-t-primary border-r-yellow-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Inner Ring - Counter Spinning */}
        <motion.div
          className="absolute inset-2 w-16 h-16 border-3 border-transparent border-b-primary border-l-yellow-400 rounded-full"
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Center Core - Pulsing */}
        <motion.div
          className="absolute inset-6 w-8 h-8 bg-gradient-to-r from-primary to-yellow-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Lightning Effect */}
        <motion.div
          className="absolute -inset-2 w-24 h-24 border-2 border-primary/20 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Particle Effects */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary rounded-full"
          style={{
            left: `${50 + 30 * Math.cos((i * Math.PI * 2) / 8)}%`,
            top: `${50 + 30 * Math.sin((i * Math.PI * 2) / 8)}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Loading Message */}
      <motion.div
        className="mt-6 text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <p className="text-lg font-bold bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
          ⚡ {message} ⚡
        </p>
        <div className="mt-2 flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export function WaitlistJoinForm({ 
  waitlistTitle, 
  waitlistDescription, 
  onJoin,
  onJoinAnother
}: WaitlistJoinFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowLoader(true);
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    
    try {
      await onJoin?.(email);
      
      // Complete the progress
      setLoadingProgress(100);
      
      // Wait for animation to complete
      setTimeout(() => {
        setShowLoader(false);
        setIsJoined(true);
        clearInterval(progressInterval);
      }, 1500);
      
    } catch (error) {
      clearInterval(progressInterval);
      setShowLoader(false);
      console.error("Failed to join waitlist:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 1000);
    }
  };

  // Show loading spinner during submission
  if (showLoader) {
    return (
      <div className="w-full max-w-md mx-auto animate-fade-in">
        <GamingLoadingSpinner message="Joining the Rush..." />
      </div>
    );
  }

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
        
        {/* Success Fireworks Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: i % 4 === 0 ? '#fbbf24' : i % 4 === 1 ? '#f59e0b' : i % 4 === 2 ? '#10b981' : '#06d6a0',
                left: '50%',
                top: '40%',
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0.5, 0],
                opacity: [0, 1, 0.8, 0],
                x: [0, (Math.cos((i * 22.5 * Math.PI) / 180)) * 120],
                y: [0, (Math.sin((i * 22.5 * Math.PI) / 180)) * 120 - 30],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
          
          {/* Floating sparkles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute text-yellow-400"
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${30 + (i % 3) * 20}%`,
                fontSize: '12px'
              }}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                y: [-20, -40, -60]
              }}
              transition={{
                duration: 2.5,
                delay: 0.5 + i * 0.2,
                ease: "easeOut"
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-yellow-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
          <Button 
            variant="outline" 
            onClick={() => onJoinAnother ? onJoinAnother() : setIsJoined(false)}
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