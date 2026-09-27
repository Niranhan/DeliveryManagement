import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-white px-3.5 focus-within:border-brand-400">
      <Search size={18} className="text-ink-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
      />
    </div>
  );
}
