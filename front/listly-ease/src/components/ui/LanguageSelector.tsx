import { useState } from "react";
import { Check, ChevronsUpDown, X, Globe } from "lucide-react";
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

interface LanguageOption {
  value: string;
  label: string;
  nativeName: string;
  region: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  // Major Languages
  { value: 'EN', label: 'English', nativeName: 'English', region: 'Global' },
  { value: 'ZH', label: 'Chinese', nativeName: '中文', region: 'Asia' },
  { value: 'ES', label: 'Spanish', nativeName: 'Español', region: 'Americas/Europe' },
  { value: 'HI', label: 'Hindi', nativeName: 'हिन्दी', region: 'Asia' },
  { value: 'AR', label: 'Arabic', nativeName: 'العربية', region: 'Middle East/Africa' },
  { value: 'BN', label: 'Bengali', nativeName: 'বাংলা', region: 'Asia' },
  { value: 'PT', label: 'Portuguese', nativeName: 'Português', region: 'Americas/Europe' },
  { value: 'RU', label: 'Russian', nativeName: 'Русский', region: 'Europe/Asia' },
  { value: 'JA', label: 'Japanese', nativeName: '日本語', region: 'Asia' },
  { value: 'PA', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Asia' },
  { value: 'DE', label: 'German', nativeName: 'Deutsch', region: 'Europe' },
  { value: 'JV', label: 'Javanese', nativeName: 'Basa Jawa', region: 'Asia' },
  { value: 'WU', label: 'Wu Chinese', nativeName: '吳語', region: 'Asia' },
  { value: 'MS', label: 'Malay', nativeName: 'Bahasa Melayu', region: 'Asia' },
  { value: 'TE', label: 'Telugu', nativeName: 'తెలుగు', region: 'Asia' },
  { value: 'VI', label: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Asia' },
  { value: 'KO', label: 'Korean', nativeName: '한국어', region: 'Asia' },
  { value: 'FR', label: 'French', nativeName: 'Français', region: 'Europe/Africa/Americas' },
  { value: 'MR', label: 'Marathi', nativeName: 'मराठी', region: 'Asia' },
  { value: 'TA', label: 'Tamil', nativeName: 'தமிழ்', region: 'Asia' },
  { value: 'UR', label: 'Urdu', nativeName: 'اردو', region: 'Asia' },
  { value: 'TR', label: 'Turkish', nativeName: 'Türkçe', region: 'Europe/Asia' },
  { value: 'IT', label: 'Italian', nativeName: 'Italiano', region: 'Europe' },
  { value: 'YUE', label: 'Cantonese', nativeName: '粵語', region: 'Asia' },
  { value: 'TH', label: 'Thai', nativeName: 'ไทย', region: 'Asia' },
  { value: 'GU', label: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Asia' },
  { value: 'JIN', label: 'Jin Chinese', nativeName: '晉語', region: 'Asia' },
  { value: 'MIN', label: 'Min Chinese', nativeName: '閩語', region: 'Asia' },
  { value: 'PL', label: 'Polish', nativeName: 'Polski', region: 'Europe' },
  { value: 'UK', label: 'Ukrainian', nativeName: 'Українська', region: 'Europe' },
  { value: 'NL', label: 'Dutch', nativeName: 'Nederlands', region: 'Europe' },
  { value: 'SV', label: 'Swedish', nativeName: 'Svenska', region: 'Europe' },
  { value: 'NO', label: 'Norwegian', nativeName: 'Norsk', region: 'Europe' },
  { value: 'DA', label: 'Danish', nativeName: 'Dansk', region: 'Europe' },
  { value: 'FI', label: 'Finnish', nativeName: 'Suomi', region: 'Europe' },
  { value: 'HE', label: 'Hebrew', nativeName: 'עברית', region: 'Middle East' },
  { value: 'ID', label: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'Asia' },
  { value: 'CS', label: 'Czech', nativeName: 'Čeština', region: 'Europe' },
  { value: 'EL', label: 'Greek', nativeName: 'Ελληνικά', region: 'Europe' },
  { value: 'HU', label: 'Hungarian', nativeName: 'Magyar', region: 'Europe' },
  { value: 'RO', label: 'Romanian', nativeName: 'Română', region: 'Europe' },
  { value: 'BG', label: 'Bulgarian', nativeName: 'Български', region: 'Europe' },
  { value: 'HR', label: 'Croatian', nativeName: 'Hrvatski', region: 'Europe' },
  { value: 'SK', label: 'Slovak', nativeName: 'Slovenčina', region: 'Europe' },
  { value: 'SL', label: 'Slovenian', nativeName: 'Slovenščina', region: 'Europe' },
  { value: 'ET', label: 'Estonian', nativeName: 'Eesti', region: 'Europe' },
  { value: 'LV', label: 'Latvian', nativeName: 'Latviešu', region: 'Europe' },
  { value: 'LT', label: 'Lithuanian', nativeName: 'Lietuvių', region: 'Europe' },
];

interface LanguageSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxSelections?: number;
}

export function LanguageSelector({
  value = [],
  onChange,
  disabled = false,
  placeholder = "Select languages...",
  maxSelections = 10
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSelect = (languageValue: string) => {
    const isSelected = value.includes(languageValue);
    
    if (isSelected) {
      // Remove if already selected
      onChange(value.filter(v => v !== languageValue));
    } else if (value.length < maxSelections) {
      // Add if under max limit
      onChange([...value, languageValue]);
    }
  };

  const handleRemove = (languageValue: string) => {
    onChange(value.filter(v => v !== languageValue));
  };

  const selectedLanguages = LANGUAGE_OPTIONS.filter(lang => value.includes(lang.value));
  const canSelectMore = value.length < maxSelections;

  // Group languages by region
  const groupedLanguages = LANGUAGE_OPTIONS.reduce((groups, language) => {
    const region = language.region;
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(language);
    return groups;
  }, {} as Record<string, LanguageOption[]>);

  // Filter languages based on search
  const filteredGroups = Object.entries(groupedLanguages).reduce((filtered, [region, languages]) => {
    const filteredLanguages = languages.filter(language =>
      language.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      language.nativeName.toLowerCase().includes(searchValue.toLowerCase()) ||
      language.value.toLowerCase().includes(searchValue.toLowerCase()) ||
      region.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    if (filteredLanguages.length > 0) {
      filtered[region] = filteredLanguages;
    }
    
    return filtered;
  }, {} as Record<string, LanguageOption[]>);

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
                : `${value.length} language${value.length === 1 ? '' : 's'} selected`}
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
              placeholder="Search languages..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No language found.</CommandEmpty>
              {Object.entries(filteredGroups).map(([region, languages]) => (
                <CommandGroup key={region} heading={region}>
                  {languages.map((language) => {
                    const isSelected = value.includes(language.value);
                    const isDisabled = !isSelected && !canSelectMore;
                    
                    return (
                      <CommandItem
                        key={language.value}
                        value={`${language.label} ${language.nativeName} ${language.value}`}
                        onSelect={() => handleSelect(language.value)}
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
                          <Globe className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span>{language.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {language.nativeName} ({language.value})
                            </span>
                          </div>
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

      {/* Selected languages display */}
      {selectedLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map((language) => (
            <Badge
              key={language.value}
              variant="secondary"
              className="pl-2 pr-1 py-1 flex items-center gap-1"
            >
              <Globe className="h-3 w-3" />
              <span>{language.label}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(language.value);
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