import type { Filters } from '../../types';

interface Props {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  cuisineList: string[];
  tagList: string[];
  onClose: () => void;
}

function MultiCheckbox({ label, options, selected, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(v: string) {
    onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]);
  }
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={`text-xs px-2 py-1 rounded-full border transition-colors ${
              selected.includes(o.value)
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FilterPanel({ filters, onChange, cuisineList, tagList, onClose }: Props) {
  const serviceTypeOptions = [
    { value: 'dine-in', label: 'Dine-in' },
    { value: 'takeout', label: 'Takeout' },
    { value: 'both', label: 'Both' },
  ];
  const alcoholOptions = [
    { value: 'none', label: 'None' },
    { value: 'beer-wine', label: 'Beer & Wine' },
    { value: 'full-bar', label: 'Full Bar' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Filters</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
      </div>

      <MultiCheckbox
        label="Cuisine"
        options={cuisineList.map(c => ({ value: c, label: c }))}
        selected={filters.cuisine}
        onChange={cuisine => onChange({ cuisine })}
      />

      <MultiCheckbox
        label="Service Type"
        options={serviceTypeOptions}
        selected={filters.serviceType}
        onChange={serviceType => onChange({ serviceType })}
      />

      <MultiCheckbox
        label="Alcohol"
        options={alcoholOptions}
        selected={filters.alcohol}
        onChange={alcohol => onChange({ alcohol })}
      />

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Formality: {filters.formalityMin}–{filters.formalityMax}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Casual</span>
          <input type="range" min={1} max={5} value={filters.formalityMin}
            onChange={e => onChange({ formalityMin: Math.min(Number(e.target.value), filters.formalityMax) })}
            className="flex-1 accent-orange-500" />
          <input type="range" min={1} max={5} value={filters.formalityMax}
            onChange={e => onChange({ formalityMax: Math.max(Number(e.target.value), filters.formalityMin) })}
            className="flex-1 accent-orange-500" />
          <span className="text-xs text-gray-400">Fine dining</span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Max Distance (miles)</p>
        <input
          type="number"
          min={0}
          step={0.5}
          value={filters.distanceMax ?? ''}
          placeholder="Any"
          onChange={e => onChange({ distanceMax: e.target.value ? Number(e.target.value) : null })}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
        />
      </div>

      {tagList.length > 0 && (
        <MultiCheckbox
          label="Tags"
          options={tagList.map(t => ({ value: t, label: t }))}
          selected={filters.tags}
          onChange={tags => onChange({ tags })}
        />
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.openNow}
          onChange={e => onChange({ openNow: e.target.checked })}
          className="accent-orange-500"
        />
        <span className="text-sm text-gray-700">Open now</span>
      </label>
    </div>
  );
}
