import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { OrderItem } from '../../types';

interface Props {
  value: OrderItem[];
  onChange: (items: OrderItem[]) => void;
}

export function OrderItemList({ value, onChange }: Props) {
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');

  function add() {
    const name = newName.trim();
    if (!name) return;
    onChange([...value, { id: uuidv4(), name, notes: newNotes.trim() }]);
    setNewName('');
    setNewNotes('');
  }

  function remove(id: string) {
    onChange(value.filter(i => i.id !== id));
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...value];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    onChange(next);
  }

  function update(id: string, field: 'name' | 'notes', val: string) {
    onChange(value.map(i => i.id === id ? { ...i, [field]: val } : i));
  }

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={item.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
          <div className="flex flex-col gap-0.5 pt-1">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
              className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 leading-none">▲</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1}
              className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 leading-none">▼</button>
          </div>
          <div className="flex-1 space-y-1">
            <input
              value={item.name}
              onChange={e => update(item.id, 'name', e.target.value)}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              placeholder="Item name"
            />
            <input
              value={item.notes}
              onChange={e => update(item.id, 'notes', e.target.value)}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1 text-gray-500"
              placeholder="Notes (optional)"
            />
          </div>
          <button type="button" onClick={() => remove(item.id)}
            className="text-gray-400 hover:text-red-500 text-lg leading-none mt-1" aria-label="Remove item">×</button>
        </div>
      ))}
      <div className="flex gap-2 items-start">
        <div className="flex-1 space-y-1">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
            placeholder="New item name"
          />
          <input
            value={newNotes}
            onChange={e => setNewNotes(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1 text-gray-500"
            placeholder="Notes (optional)"
          />
        </div>
        <button type="button" onClick={add}
          className="mt-0.5 px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600">
          Add
        </button>
      </div>
    </div>
  );
}
