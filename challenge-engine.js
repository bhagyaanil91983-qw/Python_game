// Builds the editor + terminal workspace and runs behaviour tests against it.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const ChallengeEngine = (() => {
  const parseStdin = (text) => (text === "" ? [] : text.replace(/\n$/, "").split("\n"));
  const norm = (s) => s.split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").trim();

  // CodeMirror editor, with a plain <textarea> fallback if the CDN is blocked.
  function makeEditor(host, value, onRun) {
    if (window.CodeMirror) {
      const cm = CodeMirror(host, {
        value, mode: "python", lineNumbers: true, indentUnit: 4, viewportMargin: Infinity,
        extraKeys: { Tab: (c) => c.execCommand("insertSoftTab"), "Ctrl-Enter": onRun, "Cmd-Enter": onRun },
      });
      return { get: () => cm.getValue(), set: (v) => cm.setValue(v), onChange: (f) => cm.on("change", f), refresh: () => cm.refresh() };
    }
    const ta = document.createElement("textarea");
    ta.className = "fallback-editor"; ta.value = value; host.appendChild(ta);
    return { get: () => ta.value, set: (v) => (ta.value = v), onChange: (f) => ta.addEventListener("input", f), refresh() {} };
  }

  function showRun(term, r) {
    if (r.timedOut) {
      term.innerHTML = '<span class="err">Stopped after 5 seconds. A loop probably never ends. Check that something inside the loop changes the condition, or add a break.</span>';
      return;
    }
    const gap = r.stdout && !r.stdout.endsWith("\n") ? "\n" : "";
    term.innerHTML = esc(r.stdout) + (r.stderr ? `<span class="err">${gap}${esc(r.stderr)}</span>` : "");
    if (!r.stdout && !r.stderr) term.textContent = "(the program printed nothing)";
  }

  // Runs every test with the real program; compares real output.
  async function runTests(code, tests) {
    const results = [];
    for (const t of tests) {
      const r = await PythonRunner.run(code, t.stdin || [], { fixed: t.fixed, echo: false, timeout: 3000 });
      let ok = true, why = "";
      if (r.timedOut) { ok = false; why = "The program never finished. Is there a loop that never ends?"; }
      else if (r.stderr) { ok = false; why = r.stderr.trim().split("\n").pop(); }
      else {
        const out = norm(r.stdout);
        if (t.expect !== undefined && out !== norm(t.expect)) { ok = false; why = "The output was different from what was expected."; }
        for (const s of t.contains || []) if (ok && !out.includes(s)) { ok = false; why = `The output should include: ${s}`; }
        for (const s of t.notContains || []) if (ok && out.includes(s)) { ok = false; why = `The output should not include: ${s}`; }
      }
      results.push({ t, ok, why, got: r.stdout });
    }
    return results;
  }

  // ch = a challenge object from lessons.js, or a free-code object with no tests/prompt.
  function mount(host, topic, ch) {
    const key = `${topic.id}:${ch.id}`;
    const hasTests = !!(ch.tests && ch.tests.length);
    let hintsShown = 0, busy = false;

    host.innerHTML = `
      <div class="ws ${ch.prompt ? "" : "ws-solo"}">
        ${ch.prompt ? `<section class="panel ws-info">
          <h2>${esc(ch.title)}</h2>
          <p class="tags"><span class="tag">${esc(ch.level)}</span><span class="tag xp-tag">${ch.xp} XP</span>${Progress.isDone(topic.id, ch.id) ? '<span class="tag done-tag">Passed</span>' : ""}</p>
          <div class="prompt">${ch.prompt}</div>
          <div class="hints"><button class="btn small" data-act="hint">Show a hint</button><ol class="hint-list"></ol></div>
        </section>` : ""}
        <section class="panel ws-code">
          <div class="editor"></div>
          <label class="lbl">Program input: one line for each <code>input()</code> call</label>
          <textarea class="stdin" rows="3" spellcheck="false">${esc(ch.sampleInput || "")}</textarea>
          <div class="btns">
            <button class="btn primary" data-act="run">Run (Ctrl+Enter)</button>
            ${hasTests ? '<button class="btn good" data-act="test">Run tests</button>' : ""}
            <button class="btn" data-act="clear">Clear output</button>
            <button class="btn" data-act="reset">Reset code</button>
          </div>
          <pre class="terminal" aria-live="polite">Output appears here.</pre>
          <div class="results" aria-live="polite"></div>
        </section>
      </div>`;

    const $ = (s) => host.querySelector(s);
    const term = $(".terminal"), results = $(".results"), stdinEl = $(".stdin");
    const ed = makeEditor($(".editor"), Progress.loadCode(key) ?? ch.starter ?? "", () => act("run"));
    ed.onChange(() => Progress.saveCode(key, ed.get()));
    setTimeout(() => ed.refresh(), 0);

    async function act(name) {
      if (name === "hint") {
        if (hintsShown < ch.hints.length) {
          $(".hint-list").insertAdjacentHTML("beforeend", `<li>${esc(ch.hints[hintsShown++])}</li>`);
        }
        if (hintsShown >= ch.hints.length) $('[data-act="hint"]').disabled = true;
        else $('[data-act="hint"]').textContent = "Show another hint";
        return;
      }
      if (name === "clear") { term.textContent = ""; results.innerHTML = ""; return; }
      if (name === "reset") { ed.set(ch.starter ?? ""); results.innerHTML = ""; return; }
      if (busy) return;
      busy = true; host.classList.add("busy");
      try {
        if (name === "run") {
          term.textContent = "Running…";
          showRun(term, await PythonRunner.run(ed.get(), parseStdin(stdinEl.value)));
        } else if (name === "test") {
          results.innerHTML = '<p class="muted">Running tests…</p>';
          renderResults(await runTests(ed.get(), ch.tests));
        }
      } catch (e) {
        term.innerHTML = `<span class="err">Python could not start: ${esc(e.message)}\nCheck your internet connection and reload the page.</span>`;
      }
      busy = false; host.classList.remove("busy");
    }

    function renderResults(res) {
      const passed = res.filter((r) => r.ok).length;
      let html = `<ul class="tests">${res.map((r) => `<li class="${r.ok ? "pass" : "fail"}">${r.ok ? "Passed" : "Failed"}: ${esc(r.t.name)}</li>`).join("")}</ul>`;
      const bad = res.find((r) => !r.ok);
      if (bad) {
        html += `<div class="note bad"><b>${passed} of ${res.length} tests passed.</b><br>Test "${esc(bad.t.name)}" with input <code>${esc((bad.t.stdin || []).join(", ") || "none")}</code>: ${esc(bad.why)}`;
        if (bad.t.expect !== undefined) html += `<br>Expected:<pre class="code">${esc(bad.t.expect)}</pre>Your program printed:<pre class="code">${esc(bad.got || "(nothing)")}</pre>`;
        html += `<br>Stuck? Use the hint button.</div>`;
      } else {
        const first = Progress.complete(topic.id, ch.id, ch.xp);
        if (ch.badge) Progress.addBadge(topic.id, ch.badge);
        const b = topic.badges[ch.badge];
        html += `<div class="note good"><b>All ${res.length} tests passed.</b> ${first ? `You earned <b>${ch.xp} XP</b>${b ? ` and the badge ${b.icon} <b>${esc(b.name)}</b>` : ""}.` : "XP for this challenge was already awarded."}<br>${esc(ch.success || "")}</div>`;
        App.afterProgress(topic);
      }
      results.innerHTML = html;
    }

    host.onclick = (e) => { const b = e.target.closest("[data-act]"); if (b && host.contains(b)) act(b.dataset.act); };
  }

  return { mount };
})();
