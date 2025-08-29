import { useNavigate } from "react-router-dom";
import { SimpleServiceForm } from "@/components/organizer/SimpleServiceForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateServicePage() {
  const navigate = useNavigate();

  const handleSuccess = (slug: string) => {
    // Redirect to the service detail page in edit mode
    navigate(`/service/${slug}?edit=true`);
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-10">
        <div className="responsive-container max-w-7xl">
          <div className="flex items-center h-14 sm:h-16">
            <Button variant="ghost" size="sm" className="touch-friendly-sm" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="responsive-container max-w-7xl py-6 sm:py-8">
        <div className="animate-fade-in">
          <SimpleServiceForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </main>
    </div>
  );
}