import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
}

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)", offset: 0 },
  { value: "America/New_York", label: "New York (EST/EDT)", offset: -5 },
  { value: "America/Chicago", label: "Chicago (CST/CDT)", offset: -6 },
  { value: "America/Denver", label: "Denver (MST/MDT)", offset: -7 },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)", offset: -8 },
  { value: "Europe/London", label: "London (GMT/BST)", offset: 0 },
  { value: "Europe/Paris", label: "Paris (CET/CEST)", offset: 1 },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)", offset: 1 },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: 9 },
  { value: "Asia/Seoul", label: "Seoul (KST)", offset: 9 },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", offset: 8 },
  { value: "Asia/Singapore", label: "Singapore (SGT)", offset: 8 },
  { value: "Asia/Dubai", label: "Dubai (GST)", offset: 4 },
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)", offset: 11 },
  { value: "Pacific/Auckland", label: "Auckland (NZDT/NZST)", offset: 13 },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Select date and time",
  label,
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState({ hours: "12", minutes: "00" });
  const [selectedTimezone, setSelectedTimezone] = useState("UTC");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setSelectedTime({
        hours: date.getHours().toString().padStart(2, "0"),
        minutes: date.getMinutes().toString().padStart(2, "0"),
      });
      updateDisplayValue(date, selectedTimezone);
    }
  }, [value]);

  const updateDisplayValue = (date: Date | null, timezone: string) => {
    if (!date) {
      setDisplayValue("");
      return;
    }

    const tzInfo = TIMEZONES.find(tz => tz.value === timezone);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone === "UTC" ? "UTC" : undefined,
    };

    const formatted = date.toLocaleString("en-US", options);
    setDisplayValue(`${formatted} ${tzInfo?.label.split(" ")[0] || timezone}`);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
      parseInt(selectedTime.hours),
      parseInt(selectedTime.minutes)
    );
    setSelectedDate(newDate);
    updateDisplayValue(newDate, selectedTimezone);
  };

  const handleTimeChange = (type: "hours" | "minutes", value: string) => {
    const newTime = { ...selectedTime, [type]: value };
    setSelectedTime(newTime);
    
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(newTime.hours));
      newDate.setMinutes(parseInt(newTime.minutes));
      setSelectedDate(newDate);
      updateDisplayValue(newDate, selectedTimezone);
    }
  };

  const handleTimezoneChange = (timezone: string) => {
    setSelectedTimezone(timezone);
    updateDisplayValue(selectedDate, timezone);
  };

  const handleApply = () => {
    if (selectedDate) {
      // Convert to ISO string with timezone info
      const isoString = selectedDate.toISOString();
      onChange(isoString);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setSelectedDate(null);
    setSelectedTime({ hours: "12", minutes: "00" });
    setDisplayValue("");
    onChange("");
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear();
      
      const isToday = new Date().getDate() === day &&
        new Date().getMonth() === currentMonth.getMonth() &&
        new Date().getFullYear() === currentMonth.getFullYear();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={cn(
            "h-9 w-9 rounded-lg text-sm font-medium transition-all",
            "hover:bg-primary/10 hover:text-primary",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            isToday && !isSelected && "border border-primary/30",
            "focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>{label}</span>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </Label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !displayValue && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {displayValue || placeholder}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-0" align="start">
          <div className="calendar-animate p-4 space-y-4 bg-background/95 backdrop-blur-xl rounded-lg border border-border/50 shadow-2xl">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigateMonth("prev")}
                className="p-1 hover:bg-muted rounded-lg macos-button-hover"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="font-semibold">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              <button
                type="button"
                onClick={() => navigateMonth("next")}
                className="p-1 hover:bg-muted rounded-lg macos-button-hover"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map(day => (
                <div key={day} className="h-9 w-9 flex items-center justify-center text-xs text-muted-foreground font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            {/* Time Selection */}
            <div className="space-y-2 pt-2 border-t">
              <Label className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Time</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={selectedTime.hours}
                  onChange={(e) => handleTimeChange("hours", e.target.value)}
                  className="w-16 text-center"
                  placeholder="HH"
                />
                <span className="text-lg font-semibold">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={selectedTime.minutes}
                  onChange={(e) => handleTimeChange("minutes", e.target.value)}
                  className="w-16 text-center"
                  placeholder="MM"
                />
                <div className="flex-1">
                  <Select value={selectedTimezone} onValueChange={handleTimezoneChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>
                          <div className="flex items-center space-x-2">
                            <Globe className="h-3 w-3" />
                            <span className="text-xs">{tz.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Selected DateTime Display */}
            {selectedDate && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Selected Launch Time</div>
                <div className="text-sm font-medium">{displayValue}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  UTC: {selectedDate.toISOString()}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between space-x-2 pt-2 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                Clear
              </Button>
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApply}
                  disabled={!selectedDate}
                  className="macos-button-hover"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}