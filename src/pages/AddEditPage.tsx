import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getRestaurant, putRestaurant } from '../db/restaurants';
import { useMeta } from '../hooks/useMeta';
import { HoursEditor } from '../components/restaurant/HoursEditor';
import { OrderItemList } from '../components/restaurant/OrderItemList';
import { TagInput } from '../components/ui/TagInput';
import { ScaleInput } from '../components/ui/ScaleInput';
import { defaultWeeklyHours } from '../lib/hours';
import type { Restaurant, WeeklyHours } from '../types';

type FormErrors = Partial<Record<string, string>> & {
  hours?: Partial<Record<keyof WeeklyHours, string>>;
};

function emptyForm(): Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    cuisine: [],
    distanceMiles: null,
    travelTimeMinutes: null,
    formality: 3,
    serviceType: 'both',
    alcohol: 'none',
    frequency: 3,
    lastVisited: null,
    hours: defaultWeeklyHours(),
    frequentlyOrdered: [],
    notes: '',
    tags: [],
  };
}

interface DistanceInputProps {
  distanceMiles: number | null;
  travelTimeMinutes: number | null;
  onChangeMiles: (v: number | null) => void;
  onChangeMinutes: (v: number | null) => void;
  fieldClass: string;
  labelClass: string;
}

function DistanceInput({ distanceMiles, travelTimeMinutes, onChangeMiles, onChangeMinutes, fieldClass, labelClass }: DistanceInputProps) {
  const [mode, setMode] = useState<'miles' | 'minutes'>(
    travelTimeMinutes != null && distanceMiles == null ? 'minutes' : 'miles'
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className={labelClass.replace('mb-1', '')}>Distance</span>
        <div className="flex rounded overflow-hidden border border-gray-300 ml-1">
          <button type="button" onClick={() => setMode('miles')}
            className={`px-2 py-0.5 text-xs font-medium transition-colors ${mode === 'miles' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            mi
          </button>
          <button type="button" onClick={() => setMode('minutes')}
            className={`px-2 py-0.5 text-xs font-medium transition-colors border-l border-gray-300 ${mode === 'minutes' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            min
          </button>
        </div>
      </div>
      {mode === 'miles' ? (
        <input type="number" min={0} step={0.1}
          value={distanceMiles ?? ''}
          placeholder="e.g. 1.5"
          onChange={e => onChangeMiles(e.target.value ? Number(e.target.value) : null)}
          className={fieldClass} />
      ) : (
        <input type="number" min={0} step={1}
          value={travelTimeMinutes ?? ''}
          placeholder="e.g. 20"
          onChange={e => onChangeMinutes(e.target.value ? Number(e.target.value) : null)}
          className={fieldClass} />
      )}
    </div>
  );
}

interface CuisineSelectProps {
  value: string[];
  onChange: (v: string[]) => void;
  cuisineList: string[];
  onAddCuisine: (c: string) => void;
}

function CuisineSelect({ value, onChange, cuisineList, onAddCuisine }: CuisineSelectProps) {
  const [input, setInput] = useState('');
  const filtered = cuisineList.filter(c =>
    c.toLowerCase().includes(input.toLowerCase()) && !value.includes(c)
  );

  function toggle(c: string) {
    onChange(value.includes(c) ? value.filter(x => x !== c) : [...value, c]);
  }

  function addNew() {
    const c = input.trim();
    if (!c) return;
    onAddCuisine(c);
    if (!value.includes(c)) onChange([...value, c]);
    setInput('');
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        {value.map(c => (
          <span key={c} className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">
            {c}
            <button type="button" onClick={() => toggle(c)} aria-label={`Remove ${c}`}>×</button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Search cuisines…"
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
        />
        {input && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
            {filtered.map(c => (
              <button key={c} type="button" onMouseDown={() => { toggle(c); setInput(''); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">{c}</button>
            ))}
            {input.trim() && !cuisineList.includes(input.trim()) && (
              <button type="button" onMouseDown={addNew}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-orange-600">
                Add "{input.trim()}"
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const DAYS_OF_WEEK: (keyof WeeklyHours)[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

function validateForm(form: ReturnType<typeof emptyForm>): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  const hoursErrors: Partial<Record<keyof WeeklyHours, string>> = {};
  for (const day of DAYS_OF_WEEK) {
    const d = form.hours[day];
    if (d.open && (!d.openTime || !d.closeTime)) {
      hoursErrors[day] = 'Both open and close time required.';
    }
  }
  if (Object.keys(hoursErrors).length) errors.hours = hoursErrors;
  return errors;
}

export function AddEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { meta, updateMeta } = useMeta();

  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [originalId, setOriginalId] = useState<string | null>(null);
  const [originalCreatedAt, setOriginalCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getRestaurant(id).then(r => {
      if (!r) return;
      setOriginalId(r.id);
      setOriginalCreatedAt(r.createdAt);
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = r;
      setForm(rest);
    });
  }, [id]);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleAddCuisine(cuisine: string) {
    await updateMeta(m => ({
      ...m,
      cuisineList: Array.from(new Set([...m.cuisineList, cuisine])).sort(),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);

    const newTags = form.tags.filter(t => !meta?.tagList.includes(t));
    if (newTags.length) {
      await updateMeta(m => ({
        ...m,
        tagList: Array.from(new Set([...m.tagList, ...newTags])).sort(),
      }));
    }

    const now = new Date().toISOString();
    const restaurant: Restaurant = {
      ...form,
      id: originalId ?? uuidv4(),
      createdAt: originalCreatedAt ?? now,
      updatedAt: now,
    };
    await putRestaurant(restaurant);
    navigate(`/restaurant/${restaurant.id}`, { replace: true });
  }

  const fieldClass = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const sectionClass = 'space-y-4';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
        <h1 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Restaurant' : 'Add Restaurant'}</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className={sectionClass}>
          <div>
            <label className={labelClass}>Name *</label>
            <input value={form.name} onChange={e => update('name', e.target.value)}
              className={fieldClass} placeholder="Restaurant name" />
            {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
          </div>

          <div>
            <label className={labelClass}>Cuisine</label>
            <CuisineSelect
              value={form.cuisine}
              onChange={v => update('cuisine', v)}
              cuisineList={meta?.cuisineList ?? []}
              onAddCuisine={handleAddCuisine}
            />
          </div>

          <DistanceInput
            distanceMiles={form.distanceMiles}
            travelTimeMinutes={form.travelTimeMinutes}
            onChangeMiles={v => update('distanceMiles', v)}
            onChangeMinutes={v => update('travelTimeMinutes', v)}
            fieldClass={fieldClass}
            labelClass={labelClass}
          />
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-gray-700 mb-2">Service Type</legend>
          <div className="flex gap-4">
            {(['dine-in', 'takeout', 'both'] as const).map(v => (
              <label key={v} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="radio" name="serviceType" value={v} checked={form.serviceType === v}
                  onChange={() => update('serviceType', v)} className="accent-orange-500" />
                {v === 'dine-in' ? 'Dine-in' : v === 'takeout' ? 'Takeout' : 'Both'}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-gray-700 mb-2">Alcohol</legend>
          <div className="flex gap-4">
            {(['none', 'beer-wine', 'full-bar'] as const).map(v => (
              <label key={v} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="radio" name="alcohol" value={v} checked={form.alcohol === v}
                  onChange={() => update('alcohol', v)} className="accent-orange-500" />
                {v === 'none' ? 'None' : v === 'beer-wine' ? 'Beer & Wine' : 'Full Bar'}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label className={labelClass}>Formality</label>
          <ScaleInput value={form.formality} onChange={v => update('formality', v as 1|2|3|4|5)}
            lowLabel="Casual" highLabel="Fine dining" name="Formality" />
        </div>

        <div>
          <label className={labelClass}>Frequency (how often you visit)</label>
          <ScaleInput value={form.frequency} onChange={v => update('frequency', v as 1|2|3|4|5)}
            lowLabel="Rarely" highLabel="Often" name="Frequency" />
        </div>

        <div>
          <label className={labelClass}>Last Visited</label>
          <input type="date" value={form.lastVisited ?? ''}
            onChange={e => update('lastVisited', e.target.value || null)}
            className={fieldClass} />
        </div>

        <div>
          <label className={labelClass}>Tags</label>
          <TagInput
            value={form.tags}
            onChange={v => update('tags', v)}
            suggestions={meta?.tagList ?? []}
          />
        </div>

        <div>
          <label className={labelClass}>Operating Hours</label>
          <HoursEditor value={form.hours} onChange={v => update('hours', v)} errors={errors.hours} />
        </div>

        <div>
          <label className={labelClass}>Frequently Ordered Items</label>
          <OrderItemList value={form.frequentlyOrdered} onChange={v => update('frequentlyOrdered', v)} />
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea value={form.notes} onChange={e => update('notes', e.target.value)}
            rows={4} className={fieldClass} placeholder="Any notes about this place…" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-orange-500 text-white font-medium rounded hover:bg-orange-600 disabled:opacity-50">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add restaurant'}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
