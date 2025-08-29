import { LoginForm } from "@/components/auth/LoginForm";
import heroBackground from "@/assets/hero-bg.jpg";
import waitrushLogo from "@/assets/waitrush-logo.png";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 lg:p-6 relative overflow-hidden gaming-lightning-accents">
      {/* Gaming Background System */}
      <div className="gaming-bg-main gaming-bg-animated gaming-bg-lightning" />
      <div className="gaming-bg-grid fixed inset-0 z-0" />
      <div className="gaming-bg-particles fixed inset-0 z-0" />
      
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-20 touch-friendly"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md">
        <div className="text-center mb-2 sm:mb-3">
          <div className="flex justify-center mb-1">
            <img 
              src={waitrushLogo} 
              alt="WaitRush Gaming Queue" 
              className="waitrush-logo waitrush-logo-auth h-80 sm:h-96 w-auto"
            />
          </div>
          <p className="text-muted-foreground responsive-text-base">
            Gaming queues, supercharged
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}