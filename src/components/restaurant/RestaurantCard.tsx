import { Link } from 'react-router-dom';
import type { Restaurant } from '../../types';

const SERVICE_LABEL: Record<string, string> = {
  'dine-in': 'Dine-in',
  'takeout': 'Takeout',
  'both': 'Dine-in & Takeout',
};

function DistanceBadge({ r }: { r: Restaurant }) {
  const parts: string[] = [];
  if (r.distanceMiles != null) parts.push(`${r.distanceMiles} mi`);
  if (r.travelTimeMinutes != null) parts.push(`${r.travelTimeMinutes} min`);
  if (!parts.length) return null;
  return <span>{parts.join(' · ')}</span>;
}

interface Props {
  restaurant: Restaurant;
  layout: 'card' | 'row';
}

export function RestaurantCard({ restaurant: r, layout }: Props) {
  if (layout === 'row') {
    return (
      <Link to={`/restaurant/${r.id}`}
        className="flex items-center gap-4 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">{r.name}</p>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {r.cuisine.map(c => (
              <span key={c} className="text-xs bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">{c}</span>
            ))}
          </div>
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          <p className="text-xs text-gray-500"><DistanceBadge r={r} /> · {SERVICE_LABEL[r.serviceType]}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/restaurant/${r.id}`}
      className="flex flex-col bg-white border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all overflow-hidden">
      <div className="p-4 flex-1">
        <h3 className="font-semibold text-gray-800 text-base mb-1">{r.name}</h3>
        <div className="flex flex-wrap gap-1 mb-2">
          {r.cuisine.map(c => (
            <span key={c} className="text-xs bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">{c}</span>
          ))}
        </div>
        <p className="text-sm text-gray-500"><DistanceBadge r={r} /></p>
        <p className="text-xs text-gray-400 mt-1">{SERVICE_LABEL[r.serviceType]}</p>
        {r.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {r.tags.map(t => (
              <span key={t} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
