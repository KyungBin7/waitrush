import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadService } from '@/services/upload.service';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  // Upload API props
  serviceId?: string; // Required for API upload
  uploadType?: 'icon' | 'detail'; // Type of image being uploaded
  onUploadStart?: () => void;
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: string) => void;
}

export function ImageUpload({ 
  value, 
  onChange, 
  className, 
  placeholder = "Enter image URL or upload file",
  disabled,
  serviceId,
  uploadType = 'detail',
  onUploadStart,
  onUploadComplete,
  onUploadError
}: ImageUploadProps) {
  const { toast } = useToast();
  const [urlInput, setUrlInput] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    onChange(url);
  };

  const handleFileUpload = async (file: File) => {
    // Validate file first
    const validation = uploadService.validateImageFile(file);
    if (!validation.isValid) {
      const errorMessage = validation.error || 'Invalid file';
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
      onUploadError?.(errorMessage);
      return;
    }

    // If no serviceId provided, fallback to temporary URL (for URL input mode)
    if (!serviceId) {
      const url = URL.createObjectURL(file);
      handleUrlChange(url);
      return;
    }

    try {
      setIsUploading(true);
      onUploadStart?.();

      let response;
      if (uploadType === 'icon') {
        response = await uploadService.uploadIconImage(serviceId, file);
      } else {
        response = await uploadService.uploadDetailImage(serviceId, file);
      }

      const uploadedUrl = response.imageUrl;
      handleUrlChange(uploadedUrl);
      onUploadComplete?.(uploadedUrl);

      // Upload success toast removed for better UX

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const clearImage = () => {
    setUrlInput('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder={placeholder}
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={disabled}
            className="pl-10"
          />
        </div>
        {urlInput && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearImage}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* File Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          (disabled || isUploading) && "opacity-50 cursor-not-allowed"
        )}
      >
        {isUploading ? (
          <Loader2 className="h-8 w-8 mx-auto mb-2 text-primary animate-spin" />
        ) : (
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground mb-2">
          {isUploading 
            ? "Uploading image..." 
            : "Drag & drop an image here, or click to browse"
          }
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            "Choose File"
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Image Preview */}
      {urlInput && (
        <div className="relative">
          <img
            src={urlInput}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
            onError={() => {
              // If image fails to load, clear it
              clearImage();
            }}
          />
        </div>
      )}
    </div>
  );
}