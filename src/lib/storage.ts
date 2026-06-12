import { get, set } from 'idb-keyval';

export type BarcodeFormat =
  | 'qr_code'
  | 'code_128'
  | 'code_39'
  | 'ean_13'
  | 'ean_8'
  | 'upc_a'
  | 'upc_e'
  | 'itf';

export interface Membership {
  id: string;
  name: string;
  code: string;
  format: BarcodeFormat;
  color: string;
  iconBlob: Blob;
  createdAt: number;
}

const KEY = 'memberships';

export async function listMemberships(): Promise<Membership[]> {
  return (await get<Membership[]>(KEY)) ?? [];
}

export async function getMembership(id: string): Promise<Membership | undefined> {
  const all = await listMemberships();
  return all.find((m) => m.id === id);
}

export async function saveMembership(m: Membership): Promise<void> {
  const all = await listMemberships();
  const idx = all.findIndex((x) => x.id === m.id);
  if (idx >= 0) all[idx] = m;
  else all.push(m);
  await set(KEY, all);
}

export async function deleteMembership(id: string): Promise<void> {
  const all = await listMemberships();
  await set(
    KEY,
    all.filter((m) => m.id !== id),
  );
}

export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `card-${Math.floor(performance.now())}`;
}

export async function uniqueId(base: string): Promise<string> {
  const all = await listMemberships();
  const taken = new Set(all.map((m) => m.id));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
