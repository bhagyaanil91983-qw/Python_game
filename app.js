// Wires the header, navigation and stage rendering together.
const App = (() => {
  const state = { topicId: Object.keys(TOPICS)[0], stage: "dashboard", ex: 0 };
  const STAGES = [
    ["dashboard", "Dashboard"], ["learn", "1 Learn"], ["explore", "2 Explore"], ["practice", "3 Practice"],
    ["build", "4 Build"], ["code", "5 Code"], ["test", "6 Test"], ["complete", "7 Complete"],
  ];
  const topic = () => TOPICS[state.topicId];
  const $ = (s) => document.querySelector(s);

  function refreshHeader() {
    $("#level").textContent = "Level " + Progress.level();
    $("#xp-num").textContent = Progress.xp() + " XP";
    $("#xp-bar").style.width = Progress.levelProgress() + "%";
  }

  function render() {
    const t = topic();
    $("#nav").innerHTML = STAGES.map(([id, label]) => `<button class="${id === state.stage ? "on" : ""}" data-stage="${id}">${label}</button>`).join("");
    const host = $("#stage");
    LessonEngine[state.stage](host, t, state);
    host.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => go(b.dataset.go)));
    refreshHeader();
  }

  function go(stage) { state.stage = stage; render(); window.scrollTo(0, 0); }

  // Called after XP changes. Awards the completion badge and bonus once everything required is passed.
  function afterProgress(t, keepPage) {
    if (LessonEngine.allDone(t) && !Progress.hasBadge(t.id, "loop-legend")) {
      Progress.addBadge(t.id, "loop-legend");
      Progress.complete(t.id, "completion-bonus", t.completionBonusXp);
    }
    refreshHeader();
    if (!keepPage) document.querySelectorAll(".tab").forEach((b, i) => b.classList.toggle("pass", t.exercises[i] && Progress.isDone(t.id, t.exercises[i].id)));
  }

  function openInEditor(code) {
    Progress.saveCode(`${state.topicId}:free`, code);
    go("code");
  }

  function init() {
    $("#topic-select").innerHTML = Object.values(TOPICS).map((t) => `<option value="${t.id}">${t.icon} ${esc(t.title)}</option>`).join("");
    $("#topic-select").onchange = (e) => { state.topicId = e.target.value; state.stage = "dashboard"; state.ex = 0; render(); };
    $("#nav").onclick = (e) => { const b = e.target.closest("[data-stage]"); if (b) go(b.dataset.stage); };
    $("#reset-progress").onclick = () => { if (confirm("Delete all XP, badges and saved code in this browser?")) { Progress.resetAll(); render(); } };

    const bar = $("#py-status");
    PythonRunner.onStatus((s, msg) => {
      bar.hidden = s === "ready";
      bar.classList.toggle("fail", s === "failed");
      bar.textContent = s === "failed" ? "Python could not load (" + (msg || "unknown error") + "). Check your internet connection and reload." : "Loading Python… the first load can take 10–20 seconds.";
    });
    PythonRunner.start();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
  return { render, afterProgress, openInEditor };
})();
