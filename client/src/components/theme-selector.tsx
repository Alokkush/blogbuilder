import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ThemeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const themes = [
  { id: 'modern', name: 'Modern Clean', description: 'Clean, minimalist design with plenty of whitespace' },
  { id: 'dark', name: 'Minimal Dark', description: 'Dark theme with subtle accents' },
  { id: 'professional', name: 'Professional', description: 'Classic business-oriented layout' },
  { id: 'creative', name: 'Creative', description: 'Vibrant, artistic design for creative content' },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Blog Theme
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full" data-testid="select-theme">
          <SelectValue placeholder="Choose a theme" />
        </SelectTrigger>
        <SelectContent>
          {themes.map((theme) => (
            <SelectItem key={theme.id} value={theme.id}>
              <div>
                <div className="font-medium">{theme.name}</div>
                <div className="text-sm text-muted-foreground">{theme.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
