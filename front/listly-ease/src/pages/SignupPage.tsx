import { SignupForm } from "@/components/auth/SignupForm";
import heroBackground from "@/assets/hero-bg.jpg";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-20 touch-friendly"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 to-background/60 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="responsive-text-3xl font-bold text-foreground mb-2 text-glow-yellow">
            WaitRush Gaming Queue
          </h1>
          <p className="text-muted-foreground responsive-text-base">
            Gaming queues, supercharged
          </p>
        </div>
        
        <SignupForm />
      </div>
    </div>
  );
}