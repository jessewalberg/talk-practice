const MS_168H = 168 * 60 * 60 * 1000;
const STORAGE_PREFIX = 'metatoe/rivalry/';

export function normalizeName(name) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function canonicalPairKey(nameA, nameB) {
  const a = normalizeName(nameA);
  const b = normalizeName(nameB);
  return [a, b].sort().join('|');
}

export function createRivalryStorage(storage = createBrowserStorage()) {
  return { storage };
}

export function recordLastPlayed(rivalry, names, timestamp = Date.now()) {
  try {
    const key = `${STORAGE_PREFIX}${canonicalPairKey(names[0], names[1])}`;
    rivalry.storage.set(key, JSON.stringify({ lastPlayedAt: timestamp }));
  } catch {
    // degrade silently for private browsing / quota errors
  }
}

export function getLastPlayedAt(rivalry, names) {
  try {
    const raw = rivalry.storage.get(`${STORAGE_PREFIX}${canonicalPairKey(names[0], names[1])}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed.lastPlayedAt === 'number' ? parsed.lastPlayedAt : null;
  } catch {
    return null;
  }
}

export function isReturningPair(rivalry, names, now = Date.now()) {
  const last = getLastPlayedAt(rivalry, names);
  if (last == null) return false;
  return now - last <= MS_168H;
}

function createBrowserStorage() {
  if (typeof localStorage === 'undefined') {
    return memoryStorage();
  }
  return {
    get: (key) => localStorage.getItem(key),
    set: (key, value) => localStorage.setItem(key, value),
  };
}

function memoryStorage() {
  const data = new Map();
  return {
    get(key) {
      return data.get(key) ?? null;
    },
    set(key, value) {
      data.set(key, value);
    },
  };
}
