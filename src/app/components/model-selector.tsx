'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ModelSelector({ value, onValueChange }: ModelSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full sm:w-1/2">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Pro">Pro</SelectItem>
        <SelectItem value="Flash">Flash</SelectItem>
        <SelectItem value="Flash-Lite">Flash-Lite</SelectItem>
        <SelectItem value="Image">Image</SelectItem>
      </SelectContent>
    </Select>
  );
}
