import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { WaitlistJoinForm } from "@/components/waitlist/WaitlistJoinForm";
import { waitlistService, WaitlistDetails } from "@/services/waitlist.service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import heroBackground from "@/assets/hero-bg.jpg";

const AnimatedCounter = ({ value, delay = 0, fast = false }: { value: number; delay?: number; fast?: boolean }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isInView && !isAnimating) {
      setTimeout(() => {
        setIsAnimating(true);
        
        if (fast) {
          // Fast gaming counter effect - rapid random increments
          let current = 0;
          const duration = 1500; // 1.5 seconds
          const intervals = 50; // Number of updates
          const intervalTime = duration / intervals;
          
          const counter = setInterval(() => {
            current += Math.floor(Math.random() * (value / intervals * 3)) + 1;
            if (current >= value) {
              current = value;
              setDisplayValue(current);
              clearInterval(counter);
              return;
            }
            setDisplayValue(current);
          }, intervalTime);
        } else {
          // Original smooth spring animation
          let current = 0;
          const increment = value / 60; // 60 frames over 1 second
          const counter = setInterval(() => {
            current += increment;
            if (current >= value) {
              current = value;
              setDisplayValue(Math.floor(current));
              clearInterval(counter);
              return;
            }
            setDisplayValue(Math.floor(current));
          }, 16);
        }
      }, delay);
    }
  }, [value, isInView, delay, fast, isAnimating]);

  return (
    <motion.span
      ref={ref}
      className="font-bold text-2xl sm:text-3xl bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent"
      initial={{ filter: "blur(5px)", scale: 0.9 }}
      animate={{ filter: "blur(0px)", scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {displayValue.toLocaleString()}
    </motion.span>
  );
};

export default function WaitlistPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [waitlistData, setWaitlistData] = useState<WaitlistDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWaitlistData = async () => {
      if (!slug) {
        setError("Invalid waitlist URL");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const data = await waitlistService.getWaitlistBySlug(slug);
        setWaitlistData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load waitlist';
        setError(errorMessage);
        console.error("Error fetching waitlist:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlistData();
  }, [slug]);

  const handleJoin = async (email: string) => {
    if (!slug) {
      toast({
        title: "Error",
        description: "Invalid waitlist URL",
        variant: "destructive",
      });
      return;
    }

    try {
      await waitlistService.joinWaitlist(slug, { email });
      
      toast({
        title: "Success!",
        description: "You've successfully joined the waitlist. We'll be in touch soon!",
      });
      
      // Update participant count
      if (waitlistData) {
        setWaitlistData(prev => prev ? {
          ...prev,
          currentParticipants: prev.currentParticipants + 1
        } : null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join waitlist';
      console.error("Error joining waitlist:", err);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !waitlistData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="text-center max-w-md mx-auto">
          <h1 className="responsive-text-2xl font-bold text-foreground mb-4">
            Waitlist Not Found
          </h1>
          <p className="responsive-text-base text-muted-foreground">
            The gaming queue you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-gradient-to-br from-neutral-950 via-yellow-950/5 to-stone-950">
      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-20 backdrop-blur-xl bg-black/20 border border-white/10 hover:bg-black/30 hover:border-primary/50 touch-friendly transition-all duration-300"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 bg-black/20"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-yellow-500/5" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl">
        <WaitlistJoinForm
          waitlistTitle={waitlistData.title}
          waitlistDescription={waitlistData.description}
          onJoin={handleJoin}
          onJoinAnother={() => navigate('/')}
        />
        
        {/* Participant Count */}
        <div className="text-center mt-6 sm:mt-8 animate-fade-in">
          <p className="responsive-text-sm text-muted-foreground">
            <AnimatedCounter value={waitlistData.currentParticipants} delay={100} fast={true} />{" "}
            <span className="hidden sm:inline">people have already joined</span>
            <span className="sm:hidden">joined</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center px-4">
        <p className="text-xs text-muted-foreground">
          <span className="hidden sm:inline">Powered by </span>
          <span className="text-primary font-medium">WaitRush Gaming Queue</span>
        </p>
      </div>
    </div>
  );
}