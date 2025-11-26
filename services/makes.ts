import type { CarMakesResponse, MakeItem, CategoryField, GovernorateItem } from '@/models/makes';

function toArray(x: unknown): unknown[] {
  return Array.isArray(x) ? x : [];
}

function normalizeString(x: unknown): string | null {
  if (typeof x === 'string' || typeof x === 'number') {
    const s = String(x).trim();
    return s.length ? s : null;
  }
  return null;
}

function normalizeModels(val: unknown): string[] {
  const out: string[] = [];
  const pushToken = (t: unknown) => {
    const s = normalizeString(t);
    if (s) out.push(s);
  };
  if (typeof val === 'string' || typeof val === 'number') {
    const raw = String(val);
    const tokens = raw.split(/[\,\n،]/).map(t => t.trim()).filter(t => t.length > 0);
    for (const tok of tokens) pushToken(tok);
  } else if (Array.isArray(val)) {
    for (const it of val) {
      const s = normalizeString(it);
      if (s) { out.push(s); continue; }
      if (it && typeof it === 'object') {
        const o = it as Record<string, unknown>;
        const cand = normalizeString(o['name'])
          || normalizeString(o['model'])
          || normalizeString(o['title'])
          || normalizeString(o['value']);
        if (cand) out.push(cand);
      }
    }
  } else if (val && typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      const s = normalizeString(v);
      if (s) { out.push(s); continue; }
      if (Array.isArray(v)) {
        for (const it of v) {
          const si = normalizeString(it);
          if (si) { out.push(si); continue; }
          if (it && typeof it === 'object') {
            const o = it as Record<string, unknown>;
            const cand = normalizeString(o['name'])
              || normalizeString(o['model'])
              || normalizeString(o['title'])
              || normalizeString(o['value']);
            if (cand) out.push(cand);
          }
        }
      }
    }
  }
  return Array.from(new Set(out));
}

export async function fetchCarMakes(token?: string): Promise<CarMakesResponse> {
  const t = token ?? (typeof window !== 'undefined' ? localStorage.getItem('authToken') ?? undefined : undefined);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch('https://api.nasmasr.app/api/makes', { method: 'GET', headers });
  const raw = (await res.json().catch(() => null)) as unknown;
  if (!res.ok || !raw) {
    const err = raw as { error?: string; message?: string } | null;
    const message = (err?.error || err?.message || 'تعذر جلب الماركات والموديلات');
    throw new Error(message);
  }
  let makes: MakeItem[] = [];
  let count: number | undefined = undefined;
  if (Array.isArray(raw)) {
    makes = raw
      .map((it) => {
        const obj = it as Record<string, unknown>;
        const name = (obj['name'] ?? obj['make'] ?? obj['brand']) as string | undefined;
        const models = normalizeModels(obj['models']);
        if (!name) return null;
        return { name, models } as MakeItem;
      })
      .filter(Boolean) as MakeItem[];
  } else if (typeof raw === 'object' && raw) {
    const obj = raw as Record<string, unknown>;
    const arr = (obj['makes'] ?? obj['data']) as unknown;
    if (Array.isArray(arr)) {
      makes = arr
        .map((it) => {
          const o = it as Record<string, unknown>;
          const name = (o['name'] ?? o['make'] ?? o['brand']) as string | undefined;
          const models = normalizeModels(o['models']);
          if (!name) return null;
          return { name, models } as MakeItem;
        })
        .filter(Boolean) as MakeItem[];
      const c = obj['count'];
      if (typeof c === 'number') count = c;
    } else {
      const keys = Object.keys(obj);
      const items: MakeItem[] = [];
      for (const k of keys) {
        const v = obj[k];
        const models = normalizeModels(v);
        if (models.length) items.push({ name: k, models });
      }
      makes = items;
    }
  }
  return { makes, count } as CarMakesResponse;
}

export async function fetchCategoryFields(categorySlug: string, token?: string): Promise<CategoryField[]> {
  const t = token ?? (typeof window !== 'undefined' ? localStorage.getItem('authToken') ?? undefined : undefined);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (t) headers.Authorization = `Bearer ${t}`;
  const url = `https://api.nasmasr.app/api/category-fields?category_slug=${encodeURIComponent(categorySlug)}`;
  const res = await fetch(url, { method: 'GET', headers });
  const raw = (await res.json().catch(() => null)) as unknown;
  if (!res.ok || !raw) {
    const err = raw as { error?: string; message?: string } | null;
    const message = (err?.error || err?.message || 'تعذر جلب حقول التصنيف');
    throw new Error(message);
  }
  const normalizeOptions = (val: unknown): string[] => normalizeModels(val);
  const out: CategoryField[] = [];
  if (Array.isArray(raw)) {
    for (const it of raw) {
      if (it && typeof it === 'object') {
        const o = it as Record<string, unknown>;
        const name = (o['field_name'] ?? o['name'] ?? o['title']) as string | undefined;
        const options = normalizeOptions(o['options']);
        if (name) out.push({ field_name: name, options });
      }
    }
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const arr = obj['fields'] ?? obj['data'];
    if (Array.isArray(arr)) {
      for (const it of arr) {
        if (it && typeof it === 'object') {
          const o = it as Record<string, unknown>;
          const name = (o['field_name'] ?? o['name'] ?? o['title']) as string | undefined;
          const options = normalizeOptions(o['options']);
          if (name) out.push({ field_name: name, options });
        }
      }
    } else {
      const keys = Object.keys(obj);
      for (const k of keys) {
        const v = obj[k];
        const options = normalizeOptions(v);
        if (options.length) out.push({ field_name: k, options });
      }
    }
  }
  return out;
}

export async function fetchGovernorates(token?: string): Promise<GovernorateItem[]> {
  const t = token ?? (typeof window !== 'undefined' ? localStorage.getItem('authToken') ?? undefined : undefined);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch('https://api.nasmasr.app/api/governorates', { method: 'GET', headers });
  const raw = (await res.json().catch(() => null)) as unknown;
  if (!res.ok || !raw) {
    const err = raw as { error?: string; message?: string } | null;
    const message = err?.error || err?.message || 'تعذر جلب المحافظات والمدن';
    throw new Error(message);
  }
  const out: GovernorateItem[] = [];
  const pushGov = (o: Record<string, unknown>) => {
    const nameRaw = o['name'] ?? o['governorate'] ?? o['title'];
    const name = typeof nameRaw === 'string' || typeof nameRaw === 'number' ? String(nameRaw).trim() : '';
    const cities = normalizeModels(o['cities']);
    if (name) out.push({ name, cities });
  };
  if (Array.isArray(raw)) {
    for (const it of raw) {
      if (it && typeof it === 'object') pushGov(it as Record<string, unknown>);
    }
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const arr = obj['governorates'] ?? obj['data'];
    if (Array.isArray(arr)) {
      for (const it of arr) {
        if (it && typeof it === 'object') pushGov(it as Record<string, unknown>);
      }
    } else {
      const keys = Object.keys(obj);
      for (const k of keys) {
        const v = obj[k];
        const cities = normalizeModels(v);
        if (cities.length) out.push({ name: k, cities });
      }
    }
  }
  return out;
}

export async function postAdminGovernorates(payload: { name: string; cities: unknown[] }, token?: string): Promise<GovernorateItem[]> {
  const t = token ?? (typeof window !== 'undefined' ? localStorage.getItem('authToken') ?? undefined : undefined);
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' };
  if (t) headers.Authorization = `Bearer ${t}`;
  const body = JSON.stringify({ name: payload.name, cities: payload.cities });
  const res = await fetch('https://api.nasmasr.app/api/admin/governorates', { method: 'POST', headers, body });
  const raw = (await res.json().catch(() => null)) as unknown;
  if (!res.ok || !raw) {
    const err = raw as { error?: string; message?: string } | null;
    const message = err?.error || err?.message || 'تعذر حفظ المحافظات والمدن';
    throw new Error(message);
  }
  const out: GovernorateItem[] = [];
  const pushGov = (o: Record<string, unknown>) => {
    const nameRaw = o['name'] ?? o['governorate'] ?? o['title'];
    const name = typeof nameRaw === 'string' || typeof nameRaw === 'number' ? String(nameRaw).trim() : '';
    const cities = normalizeModels(o['cities']);
    if (name) out.push({ name, cities });
  };
  if (Array.isArray(raw)) {
    for (const it of raw) {
      if (it && typeof it === 'object') pushGov(it as Record<string, unknown>);
    }
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const arr = obj['governorates'] ?? obj['data'];
    if (Array.isArray(arr)) {
      for (const it of arr) {
        if (it && typeof it === 'object') pushGov(it as Record<string, unknown>);
      }
    } else if (obj['id'] || obj['name'] || obj['cities']) {
      pushGov(obj);
    } else {
      const keys = Object.keys(obj);
      for (const k of keys) {
        const v = obj[k];
        const cities = normalizeModels(v);
        if (cities.length) out.push({ name: k, cities });
      }
    }
  }
  return out;
}
