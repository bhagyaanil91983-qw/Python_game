// Saves XP, finished challenges, badges and the student's code in localStorage.
const Progress = (() => {
  const KEY = "pythonlab.progress.v1";
  let state = load();

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { xp: 0, topics: {} }; }
    catch { return { xp: 0, topics: {} }; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
  function t(id) { return (state.topics[id] ||= { done: {}, badges: [], code: {} }); }

  return {
    xp: () => state.xp,
    level: () => Math.floor(state.xp / 100) + 1,
    levelProgress: () => state.xp % 100,
    isDone: (topic, item) => !!t(topic).done[item],
    // Award XP once per item. Returns true only the first time.
    complete(topic, item, xp) {
      if (t(topic).done[item]) return false;
      t(topic).done[item] = true; state.xp += xp; save(); return true;
    },
    addBadge(topic, id) { if (!t(topic).badges.includes(id)) { t(topic).badges.push(id); save(); } },
    hasBadge: (topic, id) => t(topic).badges.includes(id),
    saveCode(key, code) { t(key.split(":")[0]).code[key] = code; save(); },
    loadCode: (key) => t(key.split(":")[0]).code[key],
    resetAll() { state = { xp: 0, topics: {} }; save(); },
  };
})();
