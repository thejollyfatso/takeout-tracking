interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
  name: string;
}

export function ScaleInput({ value, onChange, min = 1, max = 5, lowLabel, highLabel, name }: Props) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return (
    <div className="flex items-center gap-2">
      {lowLabel && <span className="text-xs text-gray-500 w-16 text-right">{lowLabel}</span>}
      <div className="flex rounded overflow-hidden border border-gray-300">
        {options.map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              value === n
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border-r last:border-r-0 border-gray-300`}
            aria-label={`${name} ${n}`}
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
      {highLabel && <span className="text-xs text-gray-500 w-16">{highLabel}</span>}
    </div>
  );
}
