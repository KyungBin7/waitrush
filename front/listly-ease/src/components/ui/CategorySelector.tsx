import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X, Laptop, Building2, Heart, Palette, GraduationCap } from "lucide-react";
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

export interface CategoryConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  subcategories: string[];
}

const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    id: 'technology',
    name: 'Technology & Software',
    icon: <Laptop className="h-4 w-4" />,
    subcategories: ['Software/SaaS', 'Web/App Development', 'Hardware', 'Productivity Tools', 'Developer Tools', 'AI/Machine Learning']
  },
  {
    id: 'business',
    name: 'Business & Finance',
    icon: <Building2 className="h-4 w-4" />,
    subcategories: ['E-commerce', 'Marketing/Advertising', 'Fintech', 'CRM', 'Payment Services', 'Investment']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Services',
    icon: <Heart className="h-4 w-4" />,
    subcategories: ['Health/Wellness', 'Food & Beverage', 'Fashion/Beauty', 'Fitness', 'Food Delivery', 'Personal Styling']
  },
  {
    id: 'culture',
    name: 'Culture & Entertainment',
    icon: <Palette className="h-4 w-4" />,
    subcategories: ['Art/Design', 'Gaming', 'Media/Content', 'Streaming', 'Comics/Novels', 'NFT']
  },
  {
    id: 'education',
    name: 'Education & Community',
    icon: <GraduationCap className="h-4 w-4" />,
    subcategories: ['Education', 'Community', 'Events', 'Online Classes', 'Language Learning', 'Workshops']
  }
];

interface CategorySelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxSelections?: number;
}

export function CategorySelector({
  value = [],
  onChange,
  disabled = false,
  placeholder = "Select categories...",
  maxSelections = 3
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Generate flat list of all categories for easy searching
  const allCategories = CATEGORY_CONFIG.flatMap(category => 
    category.subcategories.map(sub => ({
      value: sub,
      label: sub,
      parent: category.name,
      parentId: category.id,
      icon: category.icon
    }))
  );

  const handleSelect = (categoryValue: string) => {
    const isSelected = value.includes(categoryValue);
    
    if (isSelected) {
      // Remove if already selected
      onChange(value.filter(v => v !== categoryValue));
    } else if (value.length < maxSelections) {
      // Add if under max limit
      onChange([...value, categoryValue]);
    }
  };

  const handleRemove = (categoryValue: string) => {
    onChange(value.filter(v => v !== categoryValue));
  };

  const selectedCategories = allCategories.filter(cat => value.includes(cat.value));
  const canSelectMore = value.length < maxSelections;

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
                : `${value.length} categor${value.length === 1 ? 'y' : 'ies'} selected`}
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
              placeholder="Search categories..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No category found.</CommandEmpty>
              {CATEGORY_CONFIG.map((category) => {
                const filteredSubcategories = category.subcategories.filter(sub =>
                  sub.toLowerCase().includes(searchValue.toLowerCase()) ||
                  category.name.toLowerCase().includes(searchValue.toLowerCase())
                );

                if (filteredSubcategories.length === 0) return null;

                return (
                  <CommandGroup key={category.id} heading={
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span>{category.name}</span>
                    </div>
                  }>
                    {filteredSubcategories.map((subcategory) => {
                      const isSelected = value.includes(subcategory);
                      const isDisabled = !isSelected && !canSelectMore;
                      
                      return (
                        <CommandItem
                          key={subcategory}
                          value={subcategory}
                          onSelect={() => handleSelect(subcategory)}
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
                          <span className="flex-1">{subcategory}</span>
                          {isDisabled && (
                            <span className="text-xs text-muted-foreground">
                              (max {maxSelections})
                            </span>
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected categories display */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge
              key={category.value}
              variant="secondary"
              className="pl-2 pr-1 py-1 flex items-center gap-1"
            >
              {category.icon}
              <span>{category.value}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(category.value);
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