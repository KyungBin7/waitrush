import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
}

export function EditableField({
  value,
  onSave,
  isEditing,
  onEdit,
  onCancel,
  className,
  inputClassName,
  placeholder,
  multiline = false,
  maxLength
}: EditableFieldProps) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(editValue);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      onCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full bg-transparent border border-primary rounded-md p-3 focus:outline-none resize-none",
            inputClassName
          )}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={6}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-transparent border-b-2 border-primary focus:outline-none w-full",
          inputClassName
        )}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    );
  }

  return (
    <div
      className={cn(
        "cursor-pointer hover:bg-muted/50 rounded px-2 py-1 transition-colors",
        className
      )}
      onClick={onEdit}
    >
      {value || placeholder}
    </div>
  );
}