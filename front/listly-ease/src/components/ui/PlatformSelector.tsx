import { useState } from "react";
import { Check, ChevronsUpDown, X, Smartphone, Monitor, Tablet, Globe, Gamepad2, Watch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface PlatformOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  category: string;
}

const PLATFORM_OPTIONS: PlatformOption[] = [
  // Mobile
  { value: 'iOS', label: 'iOS', icon: <Smartphone className="h-4 w-4" />, category: 'Mobile' },
  { value: 'Android', label: 'Android', icon: <Smartphone className="h-4 w-4" />, category: 'Mobile' },
  
  // Desktop
  { value: 'Web', label: 'Web', icon: <Globe className="h-4 w-4" />, category: 'Desktop' },
  { value: 'Windows', label: 'Windows', icon: <Monitor className="h-4 w-4" />, category: 'Desktop' },
  { value: 'macOS', label: 'macOS', icon: <Monitor className="h-4 w-4" />, category: 'Desktop' },
  { value: 'Linux', label: 'Linux', icon: <Monitor className="h-4 w-4" />, category: 'Desktop' },
  
  // Gaming
  { value: 'PlayStation', label: 'PlayStation', icon: <Gamepad2 className="h-4 w-4" />, category: 'Gaming' },
  { value: 'Xbox', label: 'Xbox', icon: <Gamepad2 className="h-4 w-4" />, category: 'Gaming' },
  { value: 'Nintendo Switch', label: 'Nintendo Switch', icon: <Gamepad2 className="h-4 w-4" />, category: 'Gaming' },
  { value: 'Steam', label: 'Steam', icon: <Gamepad2 className="h-4 w-4" />, category: 'Gaming' },
  
  // Other
  { value: 'iPad', label: 'iPad', icon: <Tablet className="h-4 w-4" />, category: 'Tablet' },
  { value: 'Apple Watch', label: 'Apple Watch', icon: <Watch className="h-4 w-4" />, category: 'Wearable' },
  { value: 'Android Wear', label: 'Android Wear', icon: <Watch className="h-4 w-4" />, category: 'Wearable' },
];

interface PlatformSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxSelections?: number;
}

export function PlatformSelector({
  value = [],
  onChange,
  disabled = false,
  placeholder = "Select platforms...",
  maxSelections = 10
}: PlatformSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSelect = (platformValue: string) => {
    const isSelected = value.includes(platformValue);
    
    if (isSelected) {
      // Remove if already selected
      onChange(value.filter(v => v !== platformValue));
    } else if (value.length < maxSelections) {
      // Add if under max limit
      onChange([...value, platformValue]);
    }
  };

  const handleRemove = (platformValue: string) => {
    onChange(value.filter(v => v !== platformValue));
  };

  const selectedPlatforms = PLATFORM_OPTIONS.filter(platform => value.includes(platform.value));
  const canSelectMore = value.length < maxSelections;

  // Group platforms by category
  const groupedPlatforms = PLATFORM_OPTIONS.reduce((groups, platform) => {
    const category = platform.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(platform);
    return groups;
  }, {} as Record<string, PlatformOption[]>);

  // Filter platforms based on search
  const filteredGroups = Object.entries(groupedPlatforms).reduce((filtered, [category, platforms]) => {
    const filteredPlatforms = platforms.filter(platform =>
      platform.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      category.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    if (filteredPlatforms.length > 0) {
      filtered[category] = filteredPlatforms;
    }
    
    return filtered;
  }, {} as Record<string, PlatformOption[]>);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            <span className="text-left flex-1 truncate">
              {value.length === 0 
                ? placeholder 
                : `${value.length} platform${value.length === 1 ? '' : 's'} selected`}
            </span>
            <div className="flex items-center gap-2">
              {value.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {value.length}/{maxSelections}
                </span>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search platforms..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No platform found.</CommandEmpty>
              {Object.entries(filteredGroups).map(([category, platforms]) => (
                <CommandGroup key={category} heading={category}>
                  {platforms.map((platform) => {
                    const isSelected = value.includes(platform.value);
                    const isDisabled = !isSelected && !canSelectMore;
                    
                    return (
                      <CommandItem
                        key={platform.value}
                        value={platform.value}
                        onSelect={() => handleSelect(platform.value)}
                        disabled={isDisabled}
                        className={cn(
                          "cursor-pointer",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          {platform.icon}
                          <span>{platform.label}</span>
                        </div>
                        {isDisabled && (
                          <span className="text-xs text-muted-foreground">
                            (max {maxSelections})
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected platforms display */}
      {selectedPlatforms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPlatforms.map((platform) => (
            <Badge
              key={platform.value}
              variant="secondary"
              className="pl-2 pr-1 py-1 flex items-center gap-1"
            >
              {platform.icon}
              <span>{platform.label}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(platform.value);
                }}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}