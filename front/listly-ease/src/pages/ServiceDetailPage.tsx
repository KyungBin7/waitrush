import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, ArrowLeft, Clock, Download, Share2, LogOut, LayoutDashboard, Calendar } from "lucide-react";
import { WaitlistJoinForm } from "@/components/waitlist/WaitlistJoinForm";
import { Skeleton } from "@/components/ui/skeleton";
import { EditableField } from "@/components/ui/EditableField";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { waitlistService } from "@/services/waitlist.service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import premiumAppImage from "@/assets/premium-app.jpg";
import DdayCounter from "@/components/ui/DdayCounter";
import { CategorySelector } from "@/components/ui/CategorySelector";
import { PlatformSelector } from "@/components/ui/PlatformSelector";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import betaTestingImage from "@/assets/beta-testing.jpg";
import courseImage from "@/assets/course.jpg";

interface ServiceDetail {
  id: string;
  organizerId?: string;
  name: string;
  description?: string;
  slug: string;
  iconImage?: string; // For service icon/avatar
  category?: string; // Legacy field
  categories?: string[]; // New field for multiple categories
  tagline?: string;
  fullDescription?: string;
  participantCount: number;
  developer?: string;
  language?: string; // Legacy field
  languages?: string[]; // New field
  platform?: string; // Legacy field
  platforms?: string[]; // New field
  launchDate?: string;
  detailImages?: string[]; // For Screenshots/Preview section

  waitlistTitle?: string;
  waitlistDescription?: string;
  waitlistUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Gaming Counter Animation Component
const AnimatedCounter = ({ value, delay = 0 }: { value: number; delay?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 25,
    stiffness: 120,
  });
  const isInView = useInView(ref, { once: true, margin: "-10px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // 즉시 값을 표시하고 애니메이션 시작
    if (isInView && value > 0) {
      motionValue.set(value);
    }
  }, [value, isInView, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      const rounded = Math.floor(latest);
      setDisplayValue(rounded);
      if (ref.current) {
        ref.current.textContent = rounded.toLocaleString();
      }
    });

    return () => unsubscribe();
  }, [springValue]);

  // 즉시 표시를 위한 fallback
  useEffect(() => {
    if (!isInView && value > 0) {
      setDisplayValue(value);
      if (ref.current) {
        ref.current.textContent = value.toLocaleString();
      }
    }
  }, [value, isInView]);

  return (
    <motion.span
      ref={ref}
      className="font-bold text-2xl sm:text-3xl bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay / 1000, duration: 0.3 }}
    >
      {displayValue.toLocaleString()}
    </motion.span>
  );
};

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isAuthenticated, user, loading: authLoading, logout } = useAuth();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(searchParams.get('edit') === 'true');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Check if current user can edit this service
  const canEdit = isAuthenticated && service && user && service.organizerId === user.id;
  

  // Effect to disable edit mode if user doesn't have permission
  useEffect(() => {
    // Only check permissions if we have completed loading and authentication
    if (isEditMode && !loading && !authLoading && service) {
      console.log("=== Permission Check ===");
      console.log("isAuthenticated:", isAuthenticated, "user:", user?.id, "service.organizerId:", service.organizerId);
      
      // Additional safety check: ensure user exists and is properly authenticated
      if (!isAuthenticated || !user || !user.id) {
        console.log("Authentication failed - disabling edit mode");
        setIsEditMode(false);
        toast({
          title: "Authentication Required",
          description: "Please log in to edit services.",
          variant: "destructive",
        });
        return;
      }
      
      // Special handling for newly created services - if service lacks organizerId but we're in edit mode,
      // wait a bit longer for proper data to load
      if (!service.organizerId && searchParams.get('edit') === 'true') {
        console.log("Service lacks organizerId but edit mode requested - waiting for proper data load");
        return; // Don't show access denied yet
      }
      
      // Check if user can edit this specific service
      if (!canEdit) {
        console.log("canEdit failed - access denied");
        setIsEditMode(false);
        toast({
          title: "Access Denied",
          description: "You can only edit services you created.",
          variant: "destructive",
        });
      } else {
        console.log("Permission check passed!");
      }
    }
  }, [isEditMode, canEdit, authLoading, service, loading, isAuthenticated, user, toast, searchParams]);

  useEffect(() => {
    const fetchService = async () => {
      if (!slug) return;
      
      console.log("=== Starting fetchService ===");
      console.log("isAuthenticated:", isAuthenticated, "authLoading:", authLoading);
      
      try {
        setLoading(true);

        
        // Try private API first (includes organizerId) - only if authenticated
        let data;
        
        // Only try private API if user is authenticated and auth is fully loaded
        if (isAuthenticated && !authLoading && user?.id) {
          try {
            console.log("User is authenticated, trying private API...");
            // First, get all services to find the service ID by slug
            const services = await waitlistService.getServices();
            const serviceMatch = services.find(service => service.slug === slug);
            
            if (serviceMatch) {
              console.log("Found service match, fetching full details for ID:", serviceMatch.id);
              // Now get the full service details using the ID
              data = await waitlistService.getService(serviceMatch.id);
              console.log("Found service from private API with full details:", data);
              console.log("Service organizerId:", data.organizerId, "User ID:", user?.id);
              setService(data);
              return;
            } else {
              console.log("Service not found in private API results, might be newly created. Retrying in 1 second...");
              
              // Wait and retry for newly created services
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              try {
                const retryServices = await waitlistService.getServices();
                const retryServiceMatch = retryServices.find(service => service.slug === slug);
                
                if (retryServiceMatch) {
                  console.log("Found service on retry, fetching full details for ID:", retryServiceMatch.id);
                  data = await waitlistService.getService(retryServiceMatch.id);
                  console.log("Found service from private API with full details (retry):", data);
                  console.log("Service organizerId (retry):", data.organizerId, "User ID:", user?.id);
                  setService(data);
                  return;
                } else {
                  console.log("Service still not found after retry, will fallback to public API");
                }
              } catch (retryError) {
                console.log("Retry failed:", retryError);
              }
            }
          } catch (privateError) {
            console.log("Private API failed:", privateError);
            // Continue to public API fallback
          }
        }
        
        // Fall back to public API
        console.log("Falling back to public API...");
        const response = await fetch(`/api/public/services/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Service not found");
          } else {
            throw new Error("Failed to fetch service");
          }
          return;
        }
        
        data = await response.json();
        console.log("Found service from public API:", data);
        
        // If we're in edit mode and got data from public API, 
        // the organizerId might be missing, which could cause access denied
        if (searchParams.get('edit') === 'true' && !data.organizerId) {
          console.warn("Edit mode requested but service from public API lacks organizerId. This may cause access denied.");
        }
        
        setService(data);
      } catch (err) {

        setError("Failed to load service details");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug, isAuthenticated, authLoading, user?.id]); // Re-fetch when auth state changes
  
  // Additional effect to re-fetch with proper authentication when auth completes
  useEffect(() => {
    // If we have a service without organizerId but now we're authenticated, re-fetch
    if (service && !service.organizerId && isAuthenticated && !authLoading && user?.id && searchParams.get('edit') === 'true') {
      console.log("=== Re-fetching with authentication ===");
      console.log("Service lacks organizerId, re-fetching with auth...");
      
      const refetchWithAuth = async () => {
        try {
          console.log("Trying to re-fetch with private API...");
          const services = await waitlistService.getServices();
          const serviceMatch = services.find(s => s.slug === slug);
          
          if (serviceMatch) {
            console.log("Found service match on re-fetch, fetching full details for ID:", serviceMatch.id);
            const data = await waitlistService.getService(serviceMatch.id);
            console.log("Re-fetched service with full details:", data);
            console.log("Service organizerId (re-fetch):", data.organizerId, "User ID:", user?.id);
            setService(data);
          }
        } catch (error) {
          console.log("Re-fetch failed:", error);
        }
      };
      
      refetchWithAuth();
    }
  }, [service, isAuthenticated, authLoading, user?.id, slug, searchParams]);

  const validateField = useCallback((field: string, value: string | string[]): string | null => {
    if (Array.isArray(value)) {
      // Handle array values (categories, platforms, languages)
      return null; // Arrays don't need validation in this context
    }
    
    switch (field) {
      case 'title':
        if (!value || value.trim().length === 0) return 'Title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        if (value.trim().length > 100) return 'Title must be less than 100 characters';
        break;
      case 'slug':
        if (!value || value.trim().length === 0) return 'URL slug is required';
        if (!/^[a-z0-9-]+$/.test(value)) return 'Slug must contain only lowercase letters, numbers, and hyphens';
        break;
      case 'tagline':
        if (value && value.length > 200) return 'Tagline must be less than 200 characters';
        break;
      case 'fullDescription':
        if (value && value.length > 5000) return 'Description must be less than 5000 characters';
        break;
      case 'developer':
        if (value && value.length > 100) return 'Developer name must be less than 100 characters';
        break;
    }
    return null;
  }, []);

  const autoSave = useCallback(async (updatedService: ServiceDetail) => {
    if (!hasUnsavedChanges || isSaving || !updatedService.id) {

      return;
    }
    
    try {
      setIsSaving(true);

      
      // Prepare update data - only include fields that exist in UpdateServiceRequest
      const updateData = {
        name: updatedService.name,
        description: updatedService.description,
        slug: updatedService.slug,
        waitlistTitle: updatedService.waitlistTitle,
        waitlistDescription: updatedService.waitlistDescription,
        waitlistBackground: '#ffffff', // Default value
        iconImage: updatedService.iconImage,
        category: updatedService.categories?.[0] || updatedService.category,
        categories: updatedService.categories,
        tagline: updatedService.tagline,
        fullDescription: updatedService.fullDescription,
        developer: updatedService.developer,
        language: updatedService.languages?.[0] || updatedService.language,
        languages: updatedService.languages,
        platform: updatedService.platforms?.[0] || updatedService.platform,
        platforms: updatedService.platforms,
        launchDate: updatedService.launchDate,
        detailImages: updatedService.detailImages,

      };
      
      console.log("Auto-save attempt - service ID:", updatedService.id);
      console.log("Auto-save attempt - update data:", updateData);
      const result = await waitlistService.updateService(updatedService.id, updateData);
      console.log("Auto-save result:", result);
      
      setHasUnsavedChanges(false);
      
      toast({
        title: "💾 Auto-saved",
        description: "Changes saved automatically",
        duration: 2000,
        className: "border-blue-500/20 bg-blue-50 dark:bg-blue-950",
      });
    } catch (err) {
      console.error("Auto-save error:", err);
      toast({
        title: "Auto-save failed",
        description: "Your changes were not saved automatically. Please save manually.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, isSaving, toast]);

  const handleFieldEdit = useCallback((field: string, value: string | string[]) => {
    if (!service) return;
    
    // Validate the field
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
    
    // Update service state
    const updatedService = {
      ...service,
      [field]: value
    };
    setService(updatedService);
    setHasUnsavedChanges(true);
    
    // Trigger auto-save after a short delay
    if (!error) {
      setTimeout(() => autoSave(updatedService), 1000);
    }
  }, [service, validateField, autoSave]);

  const handleSave = async () => {
    if (!service || !service.id) {

      return;
    }
    
    try {
      setIsSaving(true);

      
      // Prepare update data - only include fields that exist in UpdateServiceRequest
      const updateData = {
        name: service.name,
        description: service.description,
        slug: service.slug,
        waitlistTitle: service.waitlistTitle,
        waitlistDescription: service.waitlistDescription,
        waitlistBackground: '#ffffff', // Default value
        iconImage: service.iconImage,
        category: service.categories?.[0] || service.category,
        categories: service.categories,
        tagline: service.tagline,
        fullDescription: service.fullDescription,
        developer: service.developer,
        language: service.languages?.[0] || service.language,
        languages: service.languages,
        platform: service.platforms?.[0] || service.platform,
        platforms: service.platforms,
        launchDate: service.launchDate,
        detailImages: service.detailImages,

      };
      
      console.log("Manual save attempt - service ID:", service.id);
      console.log("Manual save attempt - update data:", updateData);
      const updatedService = await waitlistService.updateService(service.id, updateData);
      console.log("Manual save result:", updatedService);
      
      // Update the service with the response from API
      setService(prev => prev ? { ...prev, ...updatedService } : null);
      setHasUnsavedChanges(false);
      setIsEditMode(false);
      setEditingField(null);
      
      toast({
        title: "✅ Success",
        description: "Service updated successfully!",
        className: "border-green-500/20 bg-green-50 dark:bg-green-950",
      });
    } catch (err) {
      console.error("Manual save error:", err);
      toast({
        title: "Error",
        description: "Failed to save service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to format launch date
  const formatLaunchDate = (launchDate?: string): string | null => {
    if (!launchDate) return null;
    
    try {
      const date = new Date(launchDate);
      if (isNaN(date.getTime())) return launchDate; // Return original if invalid
      
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Format the date nicely
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      const formattedDate = date.toLocaleDateString('en-US', options);
      
      // Add relative time info
      if (diffDays > 0) {
        if (diffDays === 1) return `${formattedDate} (Tomorrow)`;
        if (diffDays <= 7) return `${formattedDate} (${diffDays} days)`;
        if (diffDays <= 30) return `${formattedDate} (${Math.ceil(diffDays/7)} weeks)`;
        return formattedDate;
      } else if (diffDays === 0) {
        return `${formattedDate} (Today)`;
      } else {
        return `${formattedDate} (Launched)`;
      }
    } catch (error) {
      return launchDate; // Return original if parsing fails
    }
  };

  // Default images for screenshots if none provided
  const getDefaultImage = (serviceSlug?: string) => {
    const imageMap: { [key: string]: string } = {
      "premium-app-launch": premiumAppImage,
      "beta-testing": betaTestingImage,
      "early-access-course": courseImage,
    };
    return serviceSlug && imageMap[serviceSlug] ? imageMap[serviceSlug] : premiumAppImage;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="gaming-nav border-b border-border/50 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="flex gap-6 lg:flex-1">
              <Skeleton className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl" />
              <div className="flex-1">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
            <Skeleton className="lg:w-80 h-48" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || "Service Not Found"}
          </h1>
          <Link to="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (showJoinForm) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <WaitlistJoinForm 
          waitlistTitle={service.waitlistTitle || service.title || service.name}
          waitlistDescription={service.waitlistDescription || service.description}
          onJoin={(email) => {

            // TODO: Implement API call
          }}
        />
      </div>
    );
  }

  // Use service iconImage or default based on slug (for icon only)
  const serviceImage = service.iconImage || getDefaultImage(service.slug);
  
  // Use detailImages or default static images for screenshots (completely independent of iconImage)
  const getDefaultScreenshots = () => {
    // Always use premiumAppImage as default for screenshots, regardless of iconImage
    return [premiumAppImage, premiumAppImage, premiumAppImage];
  };
  
  const screenshots = service.detailImages && service.detailImages.length > 0 
    ? service.detailImages 
    : getDefaultScreenshots();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gaming-nav border-b border-border/50 sticky top-0 z-10">
        <div className="responsive-container max-w-6xl">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground hover:text-foreground transition-colors touch-friendly">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {isEditMode ? (
                <>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center space-x-1 text-primary">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="font-medium">Edit Mode</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Click dashed elements to edit</span>
                  </div>
                  {isSaving && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </div>
                  )}
                  {hasUnsavedChanges && !isSaving && (
                    <span className="text-sm text-amber-600 animate-pulse">● Unsaved changes</span>
                  )}
                  <Button onClick={handleSave} size="sm" disabled={isSaving} className="animate-bounce-once">
                    ✓ Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditMode(false)} size="sm" disabled={isSaving}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  {canEdit && (
                    <Button variant="outline" onClick={() => setIsEditMode(true)} size="sm">
                      Edit Service
                    </Button>
                  )}
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground">
                        Welcome, {user?.email?.split('@')[0]}
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/dashboard">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={logout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" asChild>
                      <Link to="/login">Organizer Login</Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="responsive-container max-w-6xl py-6 sm:py-8">
        {/* App Store Style Header */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Left: App Icon & Basic Info */}
          <div className={`flex gap-6 lg:flex-1 ${
            isEditMode && canEdit && editingField === 'iconImage' 
              ? 'flex-col' 
              : 'flex-col lg:flex-row'
          }`}>
            <div className={`flex gap-6 ${
              isEditMode && canEdit && editingField === 'iconImage' 
                ? 'flex-col sm:flex-row' 
                : ''
            }`}>
              {isEditMode && canEdit && editingField === 'iconImage' ? (
                <div className={`w-80 sm:w-96 border-2 border-primary border-solid bg-primary/5 rounded-2xl p-4 animate-pulse ${
                  service.launchDate && new Date(service.launchDate).getTime() > new Date().getTime() 
                    ? 'mt-4' 
                    : 'mt-1'
                }`}>
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-primary">Update Service Icon</div>
                    <ImageUpload
                      value={service.iconImage || ''}
                      onChange={(value) => handleFieldEdit('iconImage', value)}
                      className="w-full"
                      serviceId={service.id}
                      uploadType="icon"
                      placeholder="Enter icon image URL or upload file"
                      onUploadStart={() => setEditingField(null)}
                      onUploadComplete={(url) => {
                        handleFieldEdit('iconImage', url);
                        setEditingField(null);
                      }}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditingField(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => setEditingField(null)} 
                        className="bg-gradient-to-r from-primary to-yellow-400 hover:from-primary/90 hover:to-yellow-400/90 text-black font-bold shadow-lg hover:shadow-primary/25 transition-all duration-200"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className={cn(
                    `relative transition-all duration-300 ${
                      service.launchDate && new Date(service.launchDate).getTime() > new Date().getTime() 
                        ? 'mt-4' 
                        : 'mt-1'
                    }`,
                    isEditMode && canEdit 
                      ? editingField === 'iconImage'
                        ? 'border-2 border-primary border-solid bg-primary/5 rounded-2xl p-2 animate-pulse'
                        : 'border-2 border-dashed border-muted-foreground/40 cursor-pointer hover:border-primary/60 hover:bg-muted/10 rounded-2xl p-2'
                      : ''
                  )}
                  onClick={() => isEditMode && canEdit && setEditingField('iconImage')}
                >
                  <div className="relative p-1 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.02) 50%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(0.5px)'
                  }}>
                    <Avatar className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl shadow-lg">
                    <AvatarImage src={serviceImage} alt={service.title || service.name} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-primary text-primary-foreground rounded-2xl">
                      {(service.name)?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  </div>
                  {isEditMode && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">Click to edit</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                {/* Service Name - Bold and prominent */}
                <div className="mb-2">
                  <EditableField
                    value={service.title || service.name || service.name}
                    onSave={(value) => handleFieldEdit('name', value)}
                    isEditing={isEditMode && canEdit && editingField === 'title'}
                    onEdit={() => canEdit && setEditingField('title')}
                    onCancel={() => setEditingField(null)}
                    className={cn(
                      "text-3xl lg:text-4xl font-black text-foreground leading-tight tracking-tight transition-all duration-300",
                      isEditMode && canEdit 
                        ? editingField === 'title'
                          ? 'border-2 border-primary border-solid bg-primary/5 rounded-lg p-2 animate-pulse'
                          : 'border-2 border-dashed border-muted-foreground/40 cursor-pointer hover:border-primary/60 hover:bg-muted/20 rounded-lg p-2'
                        : 'hover:bg-transparent px-0 py-0'
                    )}
                    inputClassName="text-3xl lg:text-4xl font-black text-foreground leading-tight tracking-tight border-2 border-primary rounded-lg"
                  />
                </div>

                {/* Developer - Same style as BY text */}
                <div className="mb-4">
                  <span className="text-sm font-medium text-muted-foreground/60 uppercase tracking-wider mr-2">
                    BY
                  </span>
                  <EditableField
                    value={service.developer || "Independent Developer"}
                    onSave={(value) => handleFieldEdit('developer', value)}
                    isEditing={isEditMode && canEdit && editingField === 'developer'}
                    onEdit={() => canEdit && setEditingField('developer')}
                    onCancel={() => setEditingField(null)}
                    className={cn(
                      "text-sm font-medium text-muted-foreground/60 uppercase tracking-wider inline transition-all duration-300",
                      isEditMode && canEdit 
                        ? editingField === 'developer'
                          ? 'border-2 border-primary border-solid bg-primary/5 rounded-lg px-2 py-1 animate-pulse'
                          : 'border-2 border-dashed border-muted-foreground/40 cursor-pointer hover:border-primary/60 hover:bg-muted/20 rounded-lg px-2 py-1'
                        : 'hover:bg-transparent px-0 py-0'
                    )}
                    inputClassName="text-sm font-medium text-muted-foreground/60 uppercase tracking-wider border-2 border-primary rounded-lg"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Button 
                    size="lg" 
                    className="shadow-button -mt-1"
                    asChild
                  >
                    <Link to={`/waitlist/${service.slug}`}>
                      Join Rush
                    </Link>
                  </Button>
                  <DdayCounter launchDate={service.launchDate} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Stats */}
          <div className="lg:w-80">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Card className="glass relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  animate={{
                    boxShadow: [
                      "0 0 5px hsla(var(--primary) / 0.1)",
                      "0 0 15px hsla(var(--primary) / 0.2)",
                      "0 0 5px hsla(var(--primary) / 0.1)"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <motion.span 
                      className="text-sm text-muted-foreground relative"
                      animate={{ 
                        textShadow: [
                          "0 0 5px hsla(var(--primary) / 0.3)",
                          "0 0 10px hsla(var(--primary) / 0.5)",
                          "0 0 5px hsla(var(--primary) / 0.3)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      Rush
                      <motion.div
                        className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-primary rounded-full"
                        animate={{ 
                          scale: [0, 1.2, 0],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 4
                        }}
                      />
                    </motion.span>
                    <motion.div 
                      className="flex items-center space-x-1 relative"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      >
                        <Users className="h-4 w-4 text-primary" />
                      </motion.div>
                      {service.participantCount > 0 ? (
                        <AnimatedCounter value={service.participantCount || 0} delay={100} />
                      ) : (
                        <span className="font-bold text-2xl sm:text-3xl bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
                          {(service.participantCount || 0).toLocaleString()}
                        </span>
                      )}
                      <motion.span 
                        className="text-primary ml-1"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        +
                      </motion.span>
                    </motion.div>
                  </div>
                  {(service.categories?.length || service.category) && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {service.categories?.length ? (
                          service.categories.map((cat, index) => (
                            <motion.div
                              key={cat}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Badge 
                                variant="secondary" 
                                className="text-xs relative overflow-hidden"
                                style={{
                                  background: 'linear-gradient(45deg, hsla(var(--primary) / 0.15), hsla(var(--primary) / 0.05))',
                                  border: '1px solid hsla(var(--primary) / 0.3)',
                                  color: 'hsl(var(--primary))'
                                }}
                              >
                                {cat}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                  animate={{
                                    x: ['-100%', '100%']
                                  }}
                                  transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatDelay: 4,
                                    ease: "easeInOut"
                                  }}
                                />
                              </Badge>
                            </motion.div>
                          ))
                        ) : (
                          <Badge variant="secondary">{service.category}</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {(service.platforms?.length || service.platform) && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">Platform</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {service.platforms?.length ? (
                          service.platforms.map((platform, index) => (
                            <motion.div
                              key={platform}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Badge 
                                variant="outline" 
                                className="text-xs relative overflow-hidden"
                                style={{
                                  background: 'linear-gradient(45deg, hsla(120, 60%, 50%, 0.15), hsla(120, 60%, 50%, 0.05))',
                                  border: '1px solid hsla(120, 60%, 50%, 0.3)',
                                  color: 'hsl(120, 60%, 50%)'
                                }}
                              >
                                {platform}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                                  animate={{
                                    x: ['-100%', '100%']
                                  }}
                                  transition={{
                                    duration: 3.5,
                                    repeat: Infinity,
                                    repeatDelay: 5,
                                    ease: "easeInOut"
                                  }}
                                />
                              </Badge>
                            </motion.div>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">{service.platform}</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {service.launchDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Launch</span>
                      <span className="text-sm font-medium">{formatLaunchDate(service.launchDate)}</span>
                    </div>
                  )}
                  {(service.languages?.length || service.language) && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">Language</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {service.languages?.length ? (
                          service.languages.map((language, index) => (
                            <motion.div
                              key={language}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Badge 
                                variant="outline" 
                                className="text-xs relative overflow-hidden"
                                style={{
                                  background: 'linear-gradient(45deg, hsla(280, 60%, 50%, 0.15), hsla(280, 60%, 50%, 0.05))',
                                  border: '1px solid hsla(280, 60%, 50%, 0.3)',
                                  color: 'hsl(280, 60%, 50%)'
                                }}
                              >
                                {language}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                                  animate={{
                                    x: ['-100%', '100%']
                                  }}
                                  transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    repeatDelay: 6,
                                    ease: "easeInOut"
                                  }}
                                />
                              </Badge>
                            </motion.div>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">{service.language}</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </div>

        {/* Screenshots Section */}
        {(
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Preview</h2>
              {isEditMode && canEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingField('detailImages')}
                  disabled={editingField === 'detailImages'}
                >
                  {editingField === 'detailImages' ? 'Editing...' : 'Edit Images'}
                </Button>
              )}
            </div>
            
            {isEditMode && canEdit && editingField === 'detailImages' ? (
              <div className="border-2 border-primary border-dashed rounded-2xl p-6 bg-primary/5 animate-pulse">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload detail images for the Screenshots/Preview section. These are separate from the service icon.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="space-y-2">
                        <label className="text-sm font-medium">Image {index + 1}</label>
                        <ImageUpload
                          value={service.detailImages?.[index] || ''}
                          onChange={(value) => {
                            const newDetailImages = [...(service.detailImages || [])];
                            if (value) {
                              newDetailImages[index] = value;
                            } else {
                              newDetailImages.splice(index, 1);
                            }
                            handleFieldEdit('detailImages', newDetailImages);
                          }}
                          className="aspect-[9:19.4] sm:aspect-[3:4] lg:aspect-[16:10] rounded-xl"
                          serviceId={service.id}
                          uploadType="detail"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      onClick={() => setEditingField(null)} 
                      className="bg-gradient-to-r from-primary to-yellow-400 hover:from-primary/90 hover:to-yellow-400/90 text-black font-bold shadow-lg hover:shadow-primary/25 transition-all duration-200"
                    >
                      ⚡ Done
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto pb-4">
                {screenshots.map((screenshot, index) => (
                  <div key={index} className="flex-shrink-0 w-72 sm:w-80 md:w-96 lg:w-[520px] xl:w-[640px]">
                    {isEditMode && canEdit && editingField === `detailImage-${index}` ? (
                      <div className="aspect-[9:19.4] sm:aspect-[3:4] lg:aspect-[16:10] border-2 border-primary border-solid bg-primary/5 rounded-2xl p-2 animate-pulse">
                        <ImageUpload
                          value={service.detailImages?.[index] || ''}
                          onChange={(value) => {
                            const newDetailImages = [...(service.detailImages || [])];
                            if (value) {
                              // Ensure array is large enough
                              while (newDetailImages.length <= index) {
                                newDetailImages.push('');
                              }
                              newDetailImages[index] = value;
                            } else if (newDetailImages[index]) {
                              // Remove empty entries
                              newDetailImages.splice(index, 1);
                            }
                            handleFieldEdit('detailImages', newDetailImages.filter(img => img.trim() !== ''));
                          }}
                          className="w-full h-full"
                          serviceId={service.id}
                          uploadType="detail"
                          onUploadComplete={() => setEditingField(null)}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            onClick={() => setEditingField(null)} 
                            className="bg-gradient-to-r from-primary to-yellow-400 hover:from-primary/90 hover:to-yellow-400/90 text-black font-bold shadow-lg hover:shadow-primary/25 transition-all duration-200"
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={cn(
                          "relative p-1 rounded-2xl transition-all duration-300"
                        )}
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.02) 50%, rgba(255,255,255,0.05) 100%)',
                          backdropFilter: 'blur(0.5px)'
                        }}
                      >
                        <div 
                          className={cn(
                            "relative aspect-[9:19.4] sm:aspect-[3:4] lg:aspect-[16:10] rounded-xl overflow-hidden shadow-lg transition-all duration-300",
                          isEditMode && canEdit 
                            ? "border-2 border-dashed border-muted-foreground/40 cursor-pointer hover:border-primary/60 hover:bg-muted/10"
                            : ""
                        )}
                        onClick={() => isEditMode && canEdit && setEditingField(`detailImage-${index}`)}
                      >
                        <img 
                          src={screenshot} 
                          alt={`${service.title || service.name} screenshot ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {isEditMode && canEdit && (
                          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-medium">Click to edit</span>
                          </div>
                        )}
                      </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add New Image Button - only show in edit mode if less than 5 images */}
                {isEditMode && canEdit && (service.detailImages || []).length < 5 && (
                  <div className="flex-shrink-0 w-72 sm:w-80 md:w-96 lg:w-[520px] xl:w-[640px]">
                    {editingField === 'detailImage-new' ? (
                      <div className="aspect-[9:19.4] sm:aspect-[3:4] lg:aspect-[16:10] border-2 border-primary border-solid bg-primary/5 rounded-2xl p-2 animate-pulse">
                        <ImageUpload
                          value=""
                          onChange={(value) => {
                            if (value) {
                              const newDetailImages = [...(service.detailImages || []), value];
                              handleFieldEdit('detailImages', newDetailImages);
                              setEditingField(null);
                            }
                          }}
                          className="w-full h-full"
                          placeholder="Add new screenshot"
                          serviceId={service.id}
                          uploadType="detail"
                          onUploadComplete={() => setEditingField(null)}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            onClick={() => setEditingField(null)} 
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="aspect-[9:19.4] sm:aspect-[3:4] lg:aspect-[16:10] border-2 border-dashed border-primary/40 rounded-2xl flex items-center justify-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
                        onClick={() => setEditingField('detailImage-new')}
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl text-primary">+</span>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">Add Image</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Description Section - Always show */}
        {(
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">About {service.title || service.name}</h2>
            <Card className="glass">
              <CardContent className="p-6">
                <div className="prose prose-lg max-w-none text-foreground">
                  <EditableField
                    value={service.fullDescription || service.description || "Add a detailed description of your service here..."}
                    onSave={(value) => handleFieldEdit('fullDescription', value)}
                    isEditing={isEditMode && canEdit && editingField === 'fullDescription'}
                    onEdit={() => canEdit && setEditingField('fullDescription')}
                    onCancel={() => setEditingField(null)}
                    className={cn(
                      "transition-all duration-300",
                      isEditMode && canEdit 
                        ? editingField === 'fullDescription'
                          ? 'border-2 border-primary border-solid bg-primary/5 rounded-lg p-3 animate-pulse'
                          : 'border-2 border-dashed border-muted-foreground/40 cursor-pointer hover:border-primary/60 hover:bg-muted/20 rounded-lg p-3'
                        : 'whitespace-pre-line leading-relaxed'
                    )}
                    inputClassName="h-64 border-2 border-primary rounded-lg"
                    multiline={true}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Information Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            { (
              <Card className="glass">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Developer</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Company</p>
                    <EditableField
                      value={service.developer || "Independent Developer"}
                      onSave={(value) => handleFieldEdit('developer', value)}
                      isEditing={isEditMode && canEdit && editingField === 'developer-info'}
                      onEdit={() => canEdit && setEditingField('developer-info')}
                      onCancel={() => setEditingField(null)}
                      className={cn(
                        "font-medium transition-all duration-300",
                        isEditMode && canEdit 
                          ? editingField === 'developer-info'
                            ? 'border-2 border-primary border-solid bg-primary/5 rounded-lg p-2 animate-pulse'
                            : 'border-2 border-dashed border-muted-foreground/40 cursor-pointer hover:border-primary/60 hover:bg-muted/20 rounded-lg p-2'
                          : ''
                      )}
                      inputClassName="border-2 border-primary rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="glass">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Details</h3>
                <div className="space-y-3">
                  {(service.categories?.length || service.category) && (
                    <div>
                      <span className="text-sm text-muted-foreground">Categories</span>
                      {isEditMode && canEdit && editingField === 'categories' ? (
                        <div className="mt-2 border-2 border-primary border-solid bg-primary/5 rounded-lg p-3 animate-pulse">
                          <CategorySelector
                            value={service.categories || (service.category ? [service.category] : [])}
                            onChange={(value) => handleFieldEdit('categories', value)}
                            disabled={false}
                            placeholder="Select up to 3 categories..."
                            maxSelections={3}
                          />
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              onClick={() => setEditingField(null)} 
                              className="bg-gradient-to-r from-primary to-yellow-400 hover:from-primary/90 hover:to-yellow-400/90 text-black font-bold shadow-lg hover:shadow-primary/25 transition-all duration-200"
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className={cn(
                            "mt-2 flex flex-wrap gap-1",
                            isEditMode && canEdit && 
                            "border-2 border-dashed border-muted-foreground/40 cursor-pointer hover:border-primary/60 hover:bg-muted/10 rounded-lg p-2"
                          )}
                          onClick={() => isEditMode && canEdit && setEditingField('categories')}
                        >
                          {service.categories?.length ? (
                            service.categories.map((cat) => (
                              <Badge key={cat} variant="secondary" className="text-xs">
                                {cat}
                              </Badge>
                            ))
                          ) : service.category ? (
                            <Badge variant="secondary">{service.category}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">No categories selected</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {(service.platforms?.length || service.platform) && (
                    <div>
                      <span className="text-sm text-muted-foreground">Platforms</span>
                      {isEditMode && canEdit && editingField === 'platforms' ? (
                        <div className="mt-2 border-2 border-primary border-solid bg-primary/5 rounded-lg p-3 animate-pulse">
                          <PlatformSelector
                            value={service.platforms || (service.platform ? [service.platform] : [])}
                            onChange={(value) => handleFieldEdit('platforms', value)}
                            disabled={false}
                            placeholder="Select platforms..."
                            maxSelections={10}
                          />
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              onClick={() => setEditingField(null)} 
                              className="bg-gradient-to-r from-primary to-yellow-400 hover:from-primary/90 hover:to-yellow-400/90 text-black font-bold shadow-lg hover:shadow-primary/25 transition-all duration-200"
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className={cn(
                            "mt-2 flex flex-wrap gap-1",
                            isEditMode && canEdit && 
                            "border-2 border-dashed border-muted-foreground/40 cursor-pointer hover:border-primary/60 hover:bg-muted/10 rounded-lg p-2"
                          )}
                          onClick={() => isEditMode && canEdit && setEditingField('platforms')}
                        >
                          {service.platforms?.length ? (
                            service.platforms.map((platform) => (
                              <Badge key={platform} variant="outline" className="text-xs">
                                {platform}
                              </Badge>
                            ))
                          ) : service.platform ? (
                            <Badge variant="outline">{service.platform}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">No platforms selected</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {(service.languages?.length || service.language) && (
                    <div>
                      <span className="text-sm text-muted-foreground">Languages</span>
                      {isEditMode && canEdit && editingField === 'languages' ? (
                        <div className="mt-2 border-2 border-primary border-solid bg-primary/5 rounded-lg p-3 animate-pulse">
                          <LanguageSelector
                            value={service.languages || (service.language ? [service.language] : [])}
                            onChange={(value) => handleFieldEdit('languages', value)}
                            disabled={false}
                            placeholder="Select languages..."
                            maxSelections={10}
                          />
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              onClick={() => setEditingField(null)} 
                              className="bg-gradient-to-r from-primary to-yellow-400 hover:from-primary/90 hover:to-yellow-400/90 text-black font-bold shadow-lg hover:shadow-primary/25 transition-all duration-200"
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className={cn(
                            "mt-2 flex flex-wrap gap-1",
                            isEditMode && canEdit && 
                            "border-2 border-dashed border-muted-foreground/40 cursor-pointer hover:border-primary/60 hover:bg-muted/10 rounded-lg p-2"
                          )}
                          onClick={() => isEditMode && canEdit && setEditingField('languages')}
                        >
                          {service.languages?.length ? (
                            service.languages.map((language) => (
                              <Badge key={language} variant="outline" className="text-xs">
                                {language}
                              </Badge>
                            ))
                          ) : service.language ? (
                            <Badge variant="outline">{service.language}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">No languages selected</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {service.launchDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Launch Date</span>
                      <span className="text-sm">{formatLaunchDate(service.launchDate)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA with Gaming Effects */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <Card className="glass shadow-card-premium relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 6,
                ease: "easeInOut"
              }}
            />
            <CardContent className="p-8 text-center relative z-10">
              <motion.h3 
                className="text-2xl font-bold text-foreground mb-3 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
              >
                <motion.span
                  animate={{
                    textShadow: [
                      "0 0 10px hsla(var(--primary) / 0.2)",
                      "0 0 20px hsla(var(--primary) / 0.4)",
                      "0 0 10px hsla(var(--primary) / 0.2)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  Ready to join the rush?
                </motion.span>
                <motion.div
                  className="absolute -top-1 -right-3 text-primary"
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  ⚡
                </motion.div>
              </motion.h3>
              <motion.p 
                className="text-muted-foreground mb-6 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
              >
                Be among the first to experience {service.title || service.name}. Join{' '}
                <motion.span
                  className="font-semibold text-primary"
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {(service.participantCount || 0).toLocaleString()}
                </motion.span>
                {' '}others who are already rushing in.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.8, duration: 0.6, type: "spring" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  className="shadow-button relative overflow-hidden"
                  asChild
                >
                  <Link to={`/waitlist/${service.slug}`}>
                    <motion.span className="relative z-10">
                      Join Rush Now
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 4,
                        ease: "easeInOut"
                      }}
                    />
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default ServiceDetailPage;