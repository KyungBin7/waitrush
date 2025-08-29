import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { CategorySelector } from "@/components/ui/CategorySelector";
import { waitlistService } from "@/services/waitlist.service";
import { useToast } from "@/hooks/use-toast";

interface SimpleServiceFormData {
  name: string;
  description: string;
  slug: string;
  launchDate: string;
  categories: string[];
}

interface SimpleServiceFormProps {
  onSuccess?: (slug: string) => void;
  onCancel?: () => void;
}

export function SimpleServiceForm({ onSuccess, onCancel }: SimpleServiceFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SimpleServiceFormData>({
    name: "",
    description: "",
    slug: "",
    launchDate: "",
    categories: [],
  });

  // Generate 8-character hash for unique slug suffix
  const generateShortHash = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Generate slug with name + hash format
  const generateUniqueSlug = (name: string): string => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const hash = generateShortHash();
    return baseSlug ? `${baseSlug}-${hash}` : hash;
  };

  const handleInputChange = (field: keyof SimpleServiceFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate unique slug from name
    if (field === 'name' && typeof value === 'string') {
      const slug = generateUniqueSlug(value);
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Service name is required");
      return false;
    }
    
    if (!formData.slug.trim()) {
      setError("Slug is required");
      return false;
    }

    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setError("Slug must contain only lowercase letters, numbers, and hyphens");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Create service with minimal required fields
      const service = await waitlistService.createService({
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        waitlistTitle: `Join the gaming queue for ${formData.name}`,
        waitlistDescription: formData.description,
        waitlistBackground: "#ffffff",
        iconImage: "", // New structure: separate icon image
        categories: formData.categories, // Use categories array
        category: formData.categories[0] || "General", // Legacy field for backward compatibility
        tagline: formData.description,
        fullDescription: formData.description,
        developer: "Independent Developer",
        language: "EN",
        platform: "Web",
        launchDate: formData.launchDate || undefined,
        detailImages: [], // New structure: separate detail images
      });
      
      toast({
        title: "Success",
        description: `Service "${service.name}" created! You can now edit it directly.`,
      });
      
      // Small delay to ensure server-side data is fully ready before redirecting
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(service.slug);
        }
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create service';
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

  return (
    <Card className="glass max-w-2xl mx-auto">
      <CardHeader className="responsive-padding">
        <CardTitle className="responsive-text-xl">Create New Service</CardTitle>
        <CardDescription className="responsive-text-base">
          Get started with the basics - you can edit everything else directly on the service page
        </CardDescription>
      </CardHeader>
      <CardContent className="responsive-padding">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="responsive-text-sm font-medium">Service Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Premium App Launch"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isLoading}
              className="touch-friendly-md"
              required
            />
          </div>



          <div className="space-y-2">
            <Label htmlFor="description" className="responsive-text-sm font-medium">Brief Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your service in a few sentences..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading}
              className="min-h-[88px] sm:min-h-[72px]"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="responsive-text-sm font-medium">Categories (Max 3)</Label>
            <CategorySelector
              value={formData.categories}
              onChange={(value) => handleInputChange('categories', value)}
              disabled={isLoading}
              placeholder="Select up to 3 categories..."
              maxSelections={3}
            />
            <p className="responsive-text-sm text-muted-foreground">
              Choose categories that best describe your service to help users discover it.
            </p>
          </div>

          <DateTimePicker
            label="Launch Date (Optional)"
            value={formData.launchDate}
            onChange={(value) => handleInputChange('launchDate', value)}
            disabled={isLoading}
            placeholder="Select launch date and time with timezone"
          />
          <p className="responsive-text-sm text-muted-foreground">
            Set when your service will launch globally. The time will be converted to UTC for storage and displayed in each user's local timezone.
          </p>

          <div className="bg-muted/50 responsive-padding rounded-lg">
            <h4 className="font-medium responsive-text-sm mb-2">What happens next?</h4>
            <p className="responsive-text-sm text-muted-foreground">
              After creating your service, you'll be taken to the live preview page where you can 
              edit everything directly - add images, detailed descriptions, set categories, and more!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <Button type="submit" disabled={isLoading} className="flex-1 touch-friendly-lg">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <span className="hidden sm:inline">Create & Start Editing</span>
              <span className="sm:hidden">Create Service</span>
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="touch-friendly-lg sm:w-auto">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}