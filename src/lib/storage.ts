'use client';

import { Worksheet } from '@/types/worksheet';
import { STORAGE_KEY, COUNTER_KEY } from './constants';

function getStore(): Worksheet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStore(worksheets: Worksheet[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(worksheets));
}

function nextId(): string {
  if (typeof window === 'undefined') return 'H-0000-0001';
  const year = new Date().getFullYear();
  const raw = localStorage.getItem(COUNTER_KEY);
  const count = raw ? parseInt(raw, 10) + 1 : 1;
  localStorage.setItem(COUNTER_KEY, count.toString());
  return `H-${year}-${String(count).padStart(4, '0')}`;
}

export function getAllWorksheets(): Worksheet[] {
  return getStore().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getWorksheet(id: string): Worksheet | undefined {
  return getStore().find((w) => w.id === id);
}

export function saveWorksheet(worksheet: Omit<Worksheet, 'id' | 'createdAt'>): Worksheet {
  const all = getStore();
  const newItem: Worksheet = {
    ...worksheet,
    id: nextId(),
    createdAt: new Date().toISOString(),
  };
  setStore([...all, newItem]);
  return newItem;
}

export function updateWorksheet(id: string, updates: Partial<Worksheet>): Worksheet | null {
  const all = getStore();
  const idx = all.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  const updated = { ...all[idx], ...updates };
  all[idx] = updated;
  setStore(all);
  return updated;
}

export function deleteWorksheet(id: string): boolean {
  const all = getStore();
  const filtered = all.filter((w) => w.id !== id);
  if (filtered.length === all.length) return false;
  setStore(filtered);
  return true;
}

export function togglePublic(id: string): boolean {
  const ws = getWorksheet(id);
  if (!ws) return false;
  updateWorksheet(id, { isPublic: !ws.isPublic });
  return true;
}
