import type { WeeklyHours, DayHours } from '../../types';

const DAYS: { key: keyof WeeklyHours; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

interface Props {
  value: WeeklyHours;
  onChange: (h: WeeklyHours) => void;
  errors?: Partial<Record<keyof WeeklyHours, string>>;
}

export function HoursEditor({ value, onChange, errors = {} }: Props) {
  function updateDay(key: keyof WeeklyHours, update: Partial<DayHours>) {
    onChange({ ...value, [key]: { ...value[key], ...update } });
  }

  return (
    <div className="space-y-2">
      {DAYS.map(({ key, label }) => {
        const day = value[key];
        return (
          <div key={key}>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 w-32 cursor-pointer">
                <input
                  type="checkbox"
                  checked={day.open}
                  onChange={e => updateDay(key, { open: e.target.checked })}
                  className="accent-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </label>
              {day.open ? (
                <>
                  <input
                    type="time"
                    value={day.openTime ?? ''}
                    onChange={e => updateDay(key, { openTime: e.target.value || null })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="time"
                    value={day.closeTime ?? ''}
                    onChange={e => updateDay(key, { closeTime: e.target.value || null })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </>
              ) : (
                <span className="text-sm text-gray-400">Closed</span>
              )}
            </div>
            {errors[key] && <p className="text-xs text-red-500 mt-0.5 ml-36">{errors[key]}</p>}
          </div>
        );
      })}
    </div>
  );
}
