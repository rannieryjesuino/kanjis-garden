(function () {
  "use strict";

  const KEY = "kanjis-garden-state-v2";
  const DEFAULT_STATE = {
    selectedIds: null,
    stats: { answered: 0, correct: 0 },
    theme: "dark",
    activeSession: null
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return {
        selectedIds: Array.isArray(parsed.selectedIds) ? parsed.selectedIds : null,
        stats: {
          answered: Number(parsed.stats?.answered || 0),
          correct: Number(parsed.stats?.correct || 0)
        },
        theme: parsed.theme === "light" ? "light" : "dark",
        activeSession: parsed.activeSession && typeof parsed.activeSession === "object" ? parsed.activeSession : null
      };
    } catch {
      return structuredClone(DEFAULT_STATE);
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  window.KanjiGardenStorage = { load, save };
})();
