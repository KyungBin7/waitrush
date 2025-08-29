import { useState, useEffect } from "react";
import { DashboardStats } from "@/components/organizer/DashboardStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Settings, LogOut, ExternalLink, Users, Download, Loader2, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { waitlistService, Service } from "@/services/waitlist.service";
import { useToast } from "@/hooks/use-toast";
import { DeleteServiceDialog } from "@/components/service/DeleteServiceDialog";

export default function DashboardPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalServices: 0,
    totalParticipants: 0,
    activeWaitlists: 0,
    recentSignups: 0
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const servicesData = await waitlistService.getServices();
      setServices(servicesData);
      
      // Calculate stats from real data
      const totalServices = servicesData.length;
      const totalParticipants = servicesData.reduce((sum, service) => sum + service.participantCount, 0);
      const activeWaitlists = servicesData.length; // All services are considered active
      const averageParticipants = totalServices > 0 ? Math.round(totalParticipants / totalServices) : 0;
      
      setStats({
        totalServices,
        totalParticipants,
        activeWaitlists,
        recentSignups: averageParticipants // Using average as a proxy for recent signups
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load services';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCsv = async (service: Service) => {
    try {
      await waitlistService.downloadParticipantsCsv(service.id, service.name);
      toast({
        title: "Success",
        description: `CSV file downloaded for ${service.name}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download CSV';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleServiceDeleted = () => {
    loadServices(); // Reload services after deletion
  };

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-10">
        <div className="responsive-container">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">
              WaitRush Gaming Queue
            </h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" className="touch-friendly-sm" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Go Home</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="touch-friendly-sm" asChild>
                <Link to="/settings">
                  <Settings className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="touch-friendly-sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="responsive-container py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Welcome Section */}
          <div className="text-center animate-fade-in px-4">
            <h2 className="responsive-text-3xl font-bold text-foreground mb-2">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h2>
            <p className="text-muted-foreground responsive-text-lg">
              Manage your gaming queues and track participant growth
            </p>
          </div>

          {/* Stats */}
          <DashboardStats {...stats} />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in px-4 sm:px-0">
            <Button size="lg" className="w-full sm:w-auto sm:min-w-[200px] touch-friendly-lg" asChild>
              <Link to="/create-service">
                <Plus className="h-5 w-5 mr-2" />
                Create New Service
              </Link>
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4"
                  onClick={loadServices}
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Services List */}
          <div className="space-y-4 sm:space-y-6 animate-slide-up">
            <div className="flex items-center justify-between px-4 sm:px-0">
              <h3 className="responsive-text-2xl font-semibold text-foreground">
                Your Services
              </h3>
              {isLoading && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
            
            {!isLoading && services.length === 0 ? (
              <Card className="glass text-center py-12">
                <CardContent>
                  <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No services yet</h4>
                  <p className="text-muted-foreground mb-6">
                    Create your first service to start collecting queue signups
                  </p>
                  <Button asChild>
                    <Link to="/create-service">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Service
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="responsive-grid-cols-3 px-2 sm:px-0">
                {services.map((service, index) => (
                  <Card key={service.id} className="glass shadow-card-premium animate-fade-in hover:shadow-glass transition-all duration-300 hover:-translate-y-1" style={{animationDelay: `${index * 0.1}s`}}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription className="text-sm">
                            Created {new Date(service.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-xs text-muted-foreground">
                            Active
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {service.participantCount} participants
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link to={`/service/${service.slug}`}>
                            <Settings className="h-4 w-4 mr-2" />
                            View Service Details
                          </Link>
                        </Button>
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleDownloadCsv(service)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download CSV
                          </Button>
                          <DeleteServiceDialog 
                            service={service}
                            onDeleted={handleServiceDeleted}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}