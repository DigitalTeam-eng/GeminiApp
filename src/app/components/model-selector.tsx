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
        <SelectValue placeholder="Vælg en model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Pro">
          <div>
            <p className="font-semibold">Pro</p>
            <p className="text-xs text-muted-foreground">Den mest avancerede model til komplekse opgaver.</p>
          </div>
        </SelectItem>
        <SelectItem value="Flash">
          <div>
            <p className="font-semibold">Flash</p>
            <p className="text-xs text-muted-foreground">Hurtig og effektiv til generelle formål.</p>
          </div>
        </SelectItem>
        <SelectItem value="Flash-Lite">
          <div>
            <p className="font-semibold">Flash-Lite</p>
            <p className="text-xs text-muted-foreground">Den letteste og hurtigste model til simple opgaver.</p>
          </div>
        </SelectItem>
        <SelectItem value="Image">
          <div>
            <p className="font-semibold">Billede</p>
            <p className="text-xs text-muted-foreground">Genererer billeder fra tekstbeskrivelser.</p>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
