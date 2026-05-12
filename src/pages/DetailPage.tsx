import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRestaurant, deleteRestaurant } from '../db/restaurants';
import type { Restaurant, WeeklyHours } from '../types';

const DAYS: { key: keyof WeeklyHours; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

function fmt12(time: string | null): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const ALCOHOL_LABEL: Record<string, string> = { none: 'None', 'beer-wine': 'Beer & Wine', 'full-bar': 'Full Bar' };
const SERVICE_LABEL: Record<string, string> = { 'dine-in': 'Dine-in', takeout: 'Takeout', both: 'Dine-in & Takeout' };
const FORMALITY_LABEL: Record<number, string> = { 1: 'Very casual', 2: 'Casual', 3: 'Moderate', 4: 'Upscale', 5: 'Fine dining' };

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!id) return;
    getRestaurant(id).then(r => {
      setRestaurant(r ?? null);
      setLoading(false);
    });
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    await deleteRestaurant(id);
    navigate('/', { replace: true });
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-6 text-gray-400">Loading…</div>;
  if (!restaurant) return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <p className="text-gray-500">Restaurant not found.</p>
      <Link to="/" className="text-orange-500 hover:underline text-sm">← Back</Link>
    </div>
  );

  const r = restaurant;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <div className="ml-auto flex gap-2">
          <Link to={`/restaurant/${r.id}/edit`}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">Edit</Link>
          {confirming ? (
            <div className="flex gap-1">
              <button onClick={handleDelete} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700">Confirm delete</button>
              <button onClick={() => setConfirming(false)} className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)} className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50">Delete</button>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{r.name}</h1>
      <div className="flex flex-wrap gap-1 mb-3">
        {r.cuisine.map(c => (
          <span key={c} className="text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded">{c}</span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div><span className="text-gray-500">Frequency</span><div className="font-medium">{r.frequency}/5</div></div>
        {r.distanceMiles != null && <div><span className="text-gray-500">Distance</span><div className="font-medium">{r.distanceMiles} miles</div></div>}
        {r.travelTimeMinutes != null && <div><span className="text-gray-500">Travel time</span><div className="font-medium">{r.travelTimeMinutes} min</div></div>}
        <div><span className="text-gray-500">Formality</span><div className="font-medium">{r.formality} — {FORMALITY_LABEL[r.formality]}</div></div>
        <div><span className="text-gray-500">Service</span><div className="font-medium">{SERVICE_LABEL[r.serviceType]}</div></div>
        <div><span className="text-gray-500">Alcohol</span><div className="font-medium">{ALCOHOL_LABEL[r.alcohol]}</div></div>
        {r.lastVisited && <div><span className="text-gray-500">Last visited</span><div className="font-medium">{r.lastVisited}</div></div>}
      </div>

      {r.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</h2>
          <div className="flex flex-wrap gap-1">
            {r.tags.map(t => (
              <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Hours</h2>
        <table className="text-sm w-full">
          <tbody>
            {DAYS.map(({ key, label }) => {
              const day = r.hours[key];
              return (
                <tr key={key} className="border-b border-gray-100 last:border-0">
                  <td className="py-1.5 font-medium text-gray-700 w-32">{label}</td>
                  <td className="py-1.5 text-gray-600">
                    {day.open && day.openTime && day.closeTime
                      ? `${fmt12(day.openTime)} – ${fmt12(day.closeTime)}`
                      : <span className="text-gray-400">Closed</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {r.frequentlyOrdered.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Frequently Ordered</h2>
          <ul className="space-y-2">
            {r.frequentlyOrdered.map(item => (
              <li key={item.id} className="text-sm">
                <span className="font-medium text-gray-800">{item.name}</span>
                {item.notes && <span className="text-gray-500 ml-2">— {item.notes}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {r.notes && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.notes}</p>
        </div>
      )}

      <p className="text-xs text-gray-400">Added {r.createdAt.slice(0, 10)} · Updated {r.updatedAt.slice(0, 10)}</p>
    </div>
  );
}
