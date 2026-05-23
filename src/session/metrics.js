const METRICS_KEY = 'metatoe/metrics/events';

export function createMetrics(storage = createBrowserStorage()) {
  function readEvents() {
    try {
      const raw = storage.get(METRICS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeEvents(events) {
    try {
      storage.set(METRICS_KEY, JSON.stringify(events));
    } catch {
      // degrade silently
    }
  }

  return {
    record(type, payload = {}) {
      const events = readEvents();
      events.push({ type, at: Date.now(), ...payload });
      writeEvents(events);
    },
    events() {
      return readEvents();
    },
    clear() {
      writeEvents([]);
    },
    terminalResolutionRate() {
      const started = readEvents().filter((e) => e.type === 'match_started').length;
      const completed = readEvents().filter((e) => e.type === 'match_completed').length;
      if (!started) return 0;
      return completed / started;
    },
    winCompletionRate() {
      const started = readEvents().filter((e) => e.type === 'match_started').length;
      const wins = readEvents().filter(
        (e) => e.type === 'match_completed' && e.outcome === 'win',
      ).length;
      if (!started) return 0;
      return wins / started;
    },
    rematchRate() {
      const completed = readEvents().filter((e) => e.type === 'match_completed').length;
      const rematches = readEvents().filter((e) => e.type === 'rematch_started').length;
      if (!completed) return 0;
      return rematches / completed;
    },
    returnRate() {
      const starts = readEvents().filter((e) => e.type === 'match_started').length;
      const returns = readEvents().filter((e) => e.type === 'rivalry_return').length;
      if (!starts) return 0;
      return returns / starts;
    },
  };
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
