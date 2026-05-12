import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMeta } from '../hooks/useMeta';
import { useRestaurants } from '../hooks/useRestaurants';
import { exportZip } from '../lib/export';
import { importZip, type ImportMode, type ImportResult } from '../lib/import';
import { putRestaurant } from '../db/restaurants';

function TagManager({ tagList, onUpdate }: {
  tagList: string[];
  onUpdate: (tags: string[]) => void;
}) {
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  function startRename(tag: string) {
    setRenaming(tag);
    setRenameValue(tag);
  }

  function commitRename() {
    if (!renaming) return;
    const newTag = renameValue.trim();
    if (!newTag || newTag === renaming) { setRenaming(null); return; }
    onUpdate(tagList.map(t => t === renaming ? newTag : t));
    setRenaming(null);
  }

  function removeTag(tag: string) {
    onUpdate(tagList.filter(t => t !== tag));
  }

  if (tagList.length === 0) return <p className="text-sm text-gray-400">No tags yet.</p>;

  return (
    <ul className="space-y-1">
      {tagList.map(tag => (
        <li key={tag} className="flex items-center gap-2">
          {renaming === tag ? (
            <>
              <input
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(null); }}
                className="flex-1 text-sm border border-orange-400 rounded px-2 py-0.5"
                autoFocus
              />
              <button onClick={commitRename} className="text-xs text-orange-600 hover:underline">Save</button>
              <button onClick={() => setRenaming(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
            </>
          ) : (
            <>
              <span className="flex-1 text-sm text-gray-700">{tag}</span>
              <button onClick={() => startRename(tag)} className="text-xs text-gray-400 hover:text-gray-700">Rename</button>
              <button onClick={() => removeTag(tag)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function CuisineManager({ cuisineList, onUpdate, restaurantCuisines }: {
  cuisineList: string[];
  onUpdate: (list: string[]) => void;
  restaurantCuisines: Set<string>;
}) {
  const [newCuisine, setNewCuisine] = useState('');

  function addCuisine() {
    const c = newCuisine.trim();
    if (!c || cuisineList.includes(c)) return;
    onUpdate([...cuisineList, c].sort());
    setNewCuisine('');
  }

  function removeCuisine(c: string) {
    if (restaurantCuisines.has(c)) return;
    onUpdate(cuisineList.filter(x => x !== c));
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={newCuisine}
          onChange={e => setNewCuisine(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCuisine(); } }}
          placeholder="Add cuisine…"
          className="flex-1 text-sm border border-gray-300 rounded px-2 py-1.5"
        />
        <button onClick={addCuisine} className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600">Add</button>
      </div>
      <ul className="space-y-1 max-h-64 overflow-y-auto">
        {cuisineList.map(c => {
          const inUse = restaurantCuisines.has(c);
          return (
            <li key={c} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-gray-700">{c}</span>
              {inUse && <span className="text-xs text-gray-400">in use</span>}
              <button
                onClick={() => removeCuisine(c)}
                disabled={inUse}
                className="text-xs text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >Delete</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SettingsPage() {
  const { meta, updateMeta, refresh: refreshMeta } = useMeta();
  const { restaurants, refresh: refreshRestaurants } = useRestaurants();
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const restaurantCuisines = new Set(restaurants.flatMap(r => r.cuisine));

  async function handleExport() {
    try {
      await exportZip();
    } catch (e) {
      alert('Export failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  async function handleImport(file: File) {
    setImporting(true);
    setImportResult(null);
    setImportError(null);
    try {
      const result = await importZip(file, importMode);
      setImportResult(result);
      await refreshRestaurants();
      await refreshMeta();
    } catch (e) {
      setImportError(e instanceof Error ? e.message : String(e));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleTagUpdate(tags: string[]) {
    const old = meta?.tagList ?? [];
    const removed = old.filter(t => !tags.includes(t));
    const renamed = old.reduce<Record<string, string>>((acc, t) => {
      const newT = tags.find((nt, i) => nt !== old[i] && old[i] === t);
      if (newT) acc[t] = newT;
      return acc;
    }, {});

    for (const r of restaurants) {
      let newTags = r.tags.filter(t => !removed.includes(t));
      newTags = newTags.map(t => renamed[t] ?? t);
      if (newTags.join(',') !== r.tags.join(',')) {
        await putRestaurant({ ...r, tags: newTags, updatedAt: new Date().toISOString() });
      }
    }

    await updateMeta(m => ({ ...m, tagList: tags }));
    await refreshRestaurants();
  }

  const sectionClass = 'bg-white border border-gray-200 rounded-lg p-4 space-y-3';
  const headingClass = 'text-sm font-semibold text-gray-700 mb-2';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="space-y-4">
        <div className={sectionClass}>
          <h2 className={headingClass}>Export Data</h2>
          <p className="text-sm text-gray-500">Download all your restaurants as a .zip file.</p>
          <button onClick={handleExport}
            className="px-4 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600">
            Export .zip
          </button>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Import Data</h2>
          <div className="flex gap-4 text-sm">
            {(['merge', 'replace'] as const).map(mode => (
              <label key={mode} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="importMode" value={mode} checked={importMode === mode}
                  onChange={() => setImportMode(mode)} className="accent-orange-500" />
                {mode === 'merge' ? 'Merge (keep existing)' : 'Replace all'}
              </label>
            ))}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".zip"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); }}
              className="text-sm text-gray-600"
              disabled={importing}
            />
          </div>
          {importing && <p className="text-sm text-gray-400">Importing…</p>}
          {importResult && (
            <div className="text-sm">
              {importResult.warning && <p className="text-amber-600 mb-1">⚠ {importResult.warning}</p>}
              <p className="text-green-700">Added {importResult.added} restaurant{importResult.added !== 1 ? 's' : ''}.
                {importResult.skipped > 0 && ` Skipped ${importResult.skipped} duplicate${importResult.skipped !== 1 ? 's' : ''}.`}
              </p>
            </div>
          )}
          {importError && <p className="text-sm text-red-600">{importError}</p>}
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Manage Tags</h2>
          {meta ? (
            <TagManager tagList={meta.tagList} onUpdate={handleTagUpdate} />
          ) : (
            <p className="text-sm text-gray-400">Loading…</p>
          )}
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Manage Cuisines</h2>
          {meta ? (
            <CuisineManager
              cuisineList={meta.cuisineList}
              onUpdate={list => updateMeta(m => ({ ...m, cuisineList: list }))}
              restaurantCuisines={restaurantCuisines}
            />
          ) : (
            <p className="text-sm text-gray-400">Loading…</p>
          )}
        </div>
      </div>
    </div>
  );
}
