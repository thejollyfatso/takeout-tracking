import type { SortKey } from '../../types';

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'distance', label: 'Distance (nearest)' },
  { value: 'rating', label: 'Rating (highest)' },
  { value: 'frequency', label: 'Frequency (most)' },
  { value: 'lastVisited', label: 'Last visited (longest ago)' },
  { value: 'createdAt', label: 'Recently added' },
];

interface Props {
  value: SortKey;
  onChange: (s: SortKey) => void;
}

export function SortSelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as SortKey)}
      className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white"
      aria-label="Sort restaurants"
    >
      {OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
