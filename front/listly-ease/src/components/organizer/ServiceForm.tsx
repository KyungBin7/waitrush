import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, X } from "lucide-react";
import { waitlistService } from "@/services/waitlist.service";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServiceFormData {
  name: string;
  description: string;
  slug: string;
  waitlistTitle: string;
  waitlistDescription: string;
  waitlistBackground: string;
  iconImage: string; // Changed from image
  category: string;
  tagline: string;
  fullDescription: string;
  developer: string;
  language: string;
  platform: string;
  launchDate: string;
  detailImages: string[]; // Changed from screenshots
}

interface ServiceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ServiceForm({ onSuccess, onCancel }: ServiceFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshotInput, setScreenshotInput] = useState("");
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    slug: "",
    waitlistTitle: "",
    waitlistDescription: "",
    waitlistBackground: "#ffffff",
    iconImage: "",
    category: "",
    tagline: "",
    fullDescription: "",
    developer: "",
    language: "EN",
    platform: "Web",
    launchDate: "",
    detailImages: [],
  });

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const categoryOptions = [
    "Productivity",
    "Software",
    "Education",
    "Health & Fitness",
    "Business",
    "Entertainment",
    "Social",
    "Finance",
    "Travel",
    "Food & Drink",
    "General"
  ];

  const platformOptions = [
    "Web",
    "iOS",
    "Android",
    "Web, iOS",
    "Web, Android",
    "iOS, Android",
    "Web, iOS, Android",
    "Desktop",
    "Cross-platform"
  ];

  const languageOptions = [
    "EN",
    "KR",
    "EN, KR",
    "EN, ES",
    "EN, FR",
    "EN, DE",
    "EN, JP",
    "EN, CN",
    "Multiple"
  ];

  const addScreenshot = () => {
    if (screenshotInput.trim() && formData.detailImages.length < 5) {
      setFormData(prev => ({
        ...prev,
        detailImages: [...prev.detailImages, screenshotInput.trim()]
      }));
      setScreenshotInput("");
    }
  };

  const removeScreenshot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      detailImages: prev.detailImages.filter((_, i) => i !== index)
    }));
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
      
      // Transform formData to match CreateServiceRequest interface
      const serviceData = {
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        waitlistTitle: formData.waitlistTitle,
        waitlistDescription: formData.waitlistDescription,
        waitlistBackground: formData.waitlistBackground,
        iconImage: formData.iconImage,
        detailImages: formData.detailImages,
        category: formData.category,
        tagline: formData.tagline,
        fullDescription: formData.fullDescription,
        developer: formData.developer,
        language: formData.language,
        platform: formData.platform,
        launchDate: formData.launchDate,
      };
      
      console.log('Sending service data:', serviceData);
      const service = await waitlistService.createService(serviceData);
      
      toast({
        title: "Success",
        description: `Service "${service.name}" created successfully!`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
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
    <Card className="glass max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Service</CardTitle>
        <CardDescription>
          Set up a new gaming queue service with all details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Service Details</TabsTrigger>
              <TabsTrigger value="waitlist">Gaming Queue Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Premium App Launch"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    type="text"
                    placeholder="premium-app-launch"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    URL: /waitlist/{formData.slug}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  type="text"
                  placeholder="e.g., Revolutionize your productivity workflow"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your service (shown on cards)"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription">Full Description</Label>
                <Textarea
                  id="fullDescription"
                  placeholder="Detailed description with features, benefits, etc. (shown on detail page)"
                  value={formData.fullDescription}
                  onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                  disabled={isLoading}
                  rows={8}
                />
                <p className="text-sm text-muted-foreground">
                  Use line breaks for paragraphs. This will be shown on the service detail page.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="iconImage">Service Icon Image URL</Label>
                <Input
                  id="iconImage"
                  type="url"
                  placeholder="https://example.com/icon.jpg"
                  value={formData.iconImage}
                  onChange={(e) => handleInputChange('iconImage', e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  This will be shown as the service icon in lists and detail page header.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="developer">Developer/Company</Label>
                  <Input
                    id="developer"
                    type="text"
                    placeholder="e.g., Minimal Studio"
                    value={formData.developer}
                    onChange={(e) => handleInputChange('developer', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select 
                    value={formData.platform} 
                    onValueChange={(value) => handleInputChange('platform', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platformOptions.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(value) => handleInputChange('language', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="launchDate">Launch Date</Label>
                  <Input
                    id="launchDate"
                    type="text"
                    placeholder="e.g., Q2 2024 or March 2024"
                    value={formData.launchDate}
                    onChange={(e) => handleInputChange('launchDate', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Detail Images (Max 5)</Label>
                <p className="text-sm text-muted-foreground">
                  These images will be shown in the Screenshots/Preview section of the service detail page.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="Detail Image URL"
                    value={screenshotInput}
                    onChange={(e) => setScreenshotInput(e.target.value)}
                    disabled={isLoading || formData.detailImages.length >= 5}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addScreenshot();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addScreenshot}
                    disabled={isLoading || formData.detailImages.length >= 5}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {formData.detailImages.map((screenshot, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="text-sm flex-1 truncate">{screenshot}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeScreenshot(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="waitlist" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="waitlistTitle">Gaming Queue Page Title</Label>
                <Input
                  id="waitlistTitle"
                  type="text"
                  placeholder="Join the queue for priority access"
                  value={formData.waitlistTitle}
                  onChange={(e) => handleInputChange('waitlistTitle', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waitlistDescription">Gaming Queue Page Description</Label>
                <Textarea
                  id="waitlistDescription"
                  placeholder="Describe what gamers will get by joining your queue"
                  value={formData.waitlistDescription}
                  onChange={(e) => handleInputChange('waitlistDescription', e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waitlistBackground">Background Color</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="waitlistBackground"
                    type="color"
                    value={formData.waitlistBackground}
                    onChange={(e) => handleInputChange('waitlistBackground', e.target.value)}
                    disabled={isLoading}
                    className="w-20"
                  />
                  <Input
                    type="text"
                    value={formData.waitlistBackground}
                    onChange={(e) => handleInputChange('waitlistBackground', e.target.value)}
                    disabled={isLoading}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Service
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}