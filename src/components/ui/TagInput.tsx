import { useState, useRef, useEffect } from 'react';

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  placeholder?: string;
}

export function TagInput({ value, onChange, suggestions, placeholder = 'Add tag...' }: Props) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  function add(tag: string) {
    const t = tag.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput('');
    setOpen(false);
  }

  function remove(tag: string) {
    onChange(value.filter(t => t !== tag));
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex flex-wrap gap-1 p-2 border border-gray-300 rounded min-h-[2.5rem] bg-white">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">
            {tag}
            <button type="button" onClick={() => remove(tag)} className="hover:text-orange-900" aria-label={`Remove ${tag}`}>×</button>
          </span>
        ))}
        <input
          className="flex-1 outline-none text-sm min-w-[100px]"
          value={input}
          placeholder={placeholder}
          onChange={e => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (input.trim()) add(input); }
            if (e.key === 'Backspace' && !input && value.length) remove(value[value.length - 1]);
          }}
        />
      </div>
      {open && (filtered.length > 0 || input.trim()) && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(s => (
            <button key={s} type="button" onMouseDown={() => add(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
              {s}
            </button>
          ))}
          {input.trim() && !suggestions.includes(input.trim()) && (
            <button type="button" onMouseDown={() => add(input)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-orange-600">
              Create "{input.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
