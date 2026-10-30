// Renders each stage of a topic from its data in lessons.js.
const LessonEngine = (() => {
  const required = (t) => [...t.exercises, t.project];
  const allDone = (t) => required(t).every((c) => Progress.isDone(t.id, c.id));

  function dashboard(host, t) {
    const items = required(t);
    const done = items.filter((c) => Progress.isDone(t.id, c.id)).length;
    host.innerHTML = `
      <section class="hero">
        <div>
          <h1>${t.icon} ${esc(t.title)}</h1>
          <p class="lead">${esc(t.tagline)} ${esc(t.description)}</p>
          <p class="muted">${esc(t.level)} · ${esc(t.duration)}</p>
          <button class="btn primary big" data-go="learn">${done ? "Continue learning" : "Start with Learn"}</button>
        </div>
        <div class="goal">
          <h3>What you will be able to do</h3>
          <ul>${t.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>
        </div>
      </section>
      <section class="panel">
        <h3>Your progress: ${done} of ${items.length} challenges passed</h3>
        <ul class="checklist">${items.map((c) => `<li class="${Progress.isDone(t.id, c.id) ? "pass" : ""}">${esc(c.title)} <span class="muted">${esc(c.level)}, ${c.xp} XP</span></li>`).join("")}</ul>
      </section>
      <section class="panel"><h3>Badges</h3>${badgeGrid(t)}</section>`;
  }

  function badgeGrid(t) {
    return `<div class="badges">${Object.entries(t.badges).map(([id, b]) => {
      const on = Progress.hasBadge(t.id, id);
      return `<div class="badge ${on ? "on" : ""}"><span>${on ? b.icon : "🔒"}</span><b>${esc(b.name)}</b><small>${esc(b.desc)}</small></div>`;
    }).join("")}</div>`;
  }

  // ---- Stage 1: Learn ----
  function learn(host, t) {
    host.innerHTML = `<h1>Learn: ${esc(t.title)}</h1>` + t.learn.map((s, i) => `
      <article class="panel lesson" data-i="${i}">
        <h2>${esc(s.title)}</h2>
        ${s.body.map((p) => `<p>${p}</p>`).join("")}
        <pre class="code">${esc(s.code)}</pre>
        <div class="btns"><button class="btn primary small" data-run>Run this example</button><button class="btn small" data-edit>Open in the editor</button></div>
        <pre class="terminal small-term" hidden></pre>
        <p class="what"><b>What happens:</b></p>
        <ul>${s.explain.map((e) => `<li>${e}</li>`).join("")}</ul>
      </article>`).join("") + `<button class="btn primary big" data-go="explore">Next: Explore</button>`;

    host.querySelectorAll(".lesson").forEach((el) => {
      const s = t.learn[+el.dataset.i], term = el.querySelector(".terminal");
      el.querySelector("[data-run]").onclick = async () => {
        term.hidden = false; term.textContent = "Running…";
        try {
          const r = await PythonRunner.run(s.code, []);
          term.innerHTML = r.timedOut ? "Timed out." : esc(r.stdout) + (r.stderr ? `<span class="err">${esc(r.stderr)}</span>` : "");
        } catch (e) { term.textContent = "Python could not start. Check your connection."; }
      };
      el.querySelector("[data-edit]").onclick = () => App.openInEditor(s.code);
    });
  }

  // ---- Stage 2: Explore (topic-specific demos are registered here) ----
  const demos = {
    loops(host) {
      host.innerHTML = `
        <div class="panel">
          <div class="seg"><button data-m="for" class="on">for loop</button><button data-m="while">while loop</button></div>
          <div class="controls"></div>
          <pre class="code demo-code"></pre>
          <div class="track" aria-label="Loop steps"></div>
          <p class="demo-msg" aria-live="polite"></p>
          <div class="btns"><button class="btn primary" data-a="step">Do one round</button><button class="btn" data-a="reset">Restart</button><button class="btn" data-a="open">Open this code in the editor</button></div>
          <h4>Printed so far</h4><pre class="terminal small-term demo-out"></pre>
        </div>`;
      const $ = (s) => host.querySelector(s);
      let mode = "for", pos = 0, x = 0, rounds = 0, out = [], finished = false;
      const FIELDS = {
        for: [["start", "start", 1], ["stop", "stop (not included)", 6], ["step", "step", 1]],
        while: [["start", "x starts at", 1], ["limit", "keep going while x <", 5], ["inc", "x grows by", 1]],
      };
      const num = (k) => { const v = Number(host.querySelector(`[data-f="${k}"]`).value); return Number.isFinite(v) ? v : 0; };

      function code() {
        if (mode === "for") return `for i in range(${num("start")}, ${num("stop")}, ${num("step")}):\n    print(i)`;
        return `x = ${num("start")}\nwhile x < ${num("limit")}:\n    print(x)\n    x = x + ${num("inc")}`;
      }
      function forValues() {
        const a = num("start"), b = num("stop"), s = num("step"), v = [];
        if (s === 0) return null;
        for (let i = a; s > 0 ? i < b : i > b; i += s) { v.push(i); if (v.length >= 40) break; }
        return v;
      }
      function reset() {
        pos = 0; rounds = 0; out = []; finished = false; x = num("start");
        $(".demo-code").textContent = code();
        $(".demo-out").textContent = "";
        $('[data-a="step"]').disabled = false;
        let msg = "Press “Do one round” to run the loop one step at a time.";
        if (mode === "for") {
          const v = forValues();
          if (v === null) { msg = "A step of 0 is not allowed: range() raises an error."; $('[data-a="step"]').disabled = true; }
          else if (!v.length) msg = "This range is empty, so the loop body will never run.";
          $(".track").innerHTML = (v || []).map((n, i) => `<span class="cell" data-i="${i}">${n}</span>`).join("") + `<span class="cell stop">stop = ${num("stop")}</span>`;
        } else {
          if (num("inc") <= 0 && num("start") < num("limit")) msg = "Careful: x never gets bigger, so x < limit stays True forever. This is an infinite loop.";
          $(".track").innerHTML = `<span class="cell cur" id="xcell">x = ${x}</span>`;
        }
        $(".demo-msg").textContent = msg;
      }
      function step() {
        if (finished) return;
        if (mode === "for") {
          const v = forValues(), cells = host.querySelectorAll(".cell[data-i]");
          if (pos >= v.length) { $(".demo-msg").textContent = "No values left, so the for loop ends by itself."; finished = true; return; }
          cells.forEach((c) => c.classList.remove("cur"));
          cells[pos].classList.add("cur", "done");
          out.push(v[pos]);
          $(".demo-msg").textContent = `Round ${pos + 1}: i is ${v[pos]}, so print(i) shows ${v[pos]}.`;
          pos++;
        } else {
          const lim = num("limit");
          if (!(x < lim)) { $(".demo-msg").textContent = `Check: ${x} < ${lim} is False, so Python leaves the loop.`; finished = true; $('[data-a="step"]').disabled = true; return; }
          out.push(x);
          $(".demo-msg").textContent = `Check: ${x} < ${lim} is True, so print(${x}) runs, then x becomes ${x + num("inc")}.`;
          x += num("inc"); rounds++;
          $("#xcell").textContent = `x = ${x}`;
          if (rounds >= 25 && x < lim) { $(".demo-msg").textContent = "25 rounds and the condition is still True. This loop would never stop, so Python Lab stopped it for you."; finished = true; $('[data-a="step"]').disabled = true; }
        }
        $(".demo-out").textContent = out.join("\n");
      }
      function drawControls() {
        $(".controls").innerHTML = FIELDS[mode].map(([k, label, d]) => `<label>${label}<input type="number" data-f="${k}" value="${d}"></label>`).join("");
        $(".controls").oninput = reset;
        reset();
      }
      host.onclick = (e) => {
        const m = e.target.closest("[data-m]"), a = e.target.closest("[data-a]");
        if (m) { mode = m.dataset.m; host.querySelectorAll("[data-m]").forEach((b) => b.classList.toggle("on", b === m)); drawControls(); }
        if (a) { if (a.dataset.a === "step") step(); else if (a.dataset.a === "reset") reset(); else App.openInEditor(code()); }
      };
      drawControls();
    },
  };

  function explore(host, t) {
    host.innerHTML = `<h1>Explore: see the loop run</h1><p class="lead">Change the numbers, then step through the loop one round at a time. When you are ready, send the code to the editor and run it for real.</p><div class="demo-host"></div><button class="btn primary big" data-go="practice">Next: Practice</button>`;
    (demos[t.demo] || (() => {}))(host.querySelector(".demo-host"));
  }

  // ---- Stage 3 & 4: challenges ----
  function practice(host, t, state) {
    const tabs = t.exercises.map((c, i) => `<button class="tab ${i === state.ex ? "on" : ""} ${Progress.isDone(t.id, c.id) ? "pass" : ""}" data-ex="${i}">${esc(c.level)}: ${esc(c.title)}</button>`).join("");
    host.innerHTML = `<h1>Practice</h1><div class="tabs">${tabs}</div><div class="ws-host"></div>`;
    ChallengeEngine.mount(host.querySelector(".ws-host"), t, t.exercises[state.ex]);
    host.querySelector(".tabs").onclick = (e) => { const b = e.target.closest("[data-ex]"); if (b) { state.ex = +b.dataset.ex; App.render(); } };
  }
  function build(host, t) {
    host.innerHTML = `<h1>Build: ${esc(t.project.title)}</h1><div class="ws-host"></div>`;
    ChallengeEngine.mount(host.querySelector(".ws-host"), t, t.project);
  }

  // ---- Stage 5: free code ----
  function code(host, t) {
    host.innerHTML = `<h1>Code: your own playground</h1><p class="lead">Write anything you like. Your code is saved in this browser. If your program uses <code>input()</code>, type the answers in the Program input box, one per line.</p><div class="ws-host"></div>`;
    ChallengeEngine.mount(host.querySelector(".ws-host"), t, {
      id: "free", sampleInput: "",
      starter: `# Free coding area. Try a loop of your own!\nfor i in range(3):\n    print("Python Lab", i)\n`,
    });
  }

  // ---- Stage 6: final assessment ----
  function test(host, t) {
    const qs = t.quiz.map((q, i) => `
      <fieldset class="panel q" data-q="${i}"><legend>Question ${i + 1}</legend>
        <pre class="qtext">${esc(q.q)}</pre>
        ${q.options.map((o, j) => `<label class="opt"><input type="radio" name="q${i}" value="${j}"> ${esc(o)}</label>`).join("")}
        <p class="fb" aria-live="polite"></p>
      </fieldset>`).join("");
    const rows = [...t.exercises, t.project].map((c) => `<li class="${Progress.isDone(t.id, c.id) ? "pass" : ""}">${esc(c.title)}: ${Progress.isDone(t.id, c.id) ? "tests passed" : "not passed yet"}</li>`).join("");
    host.innerHTML = `<h1>Test: check what you know</h1>
      <section class="panel"><h3>Challenge test results</h3><ul class="checklist">${rows}</ul><p class="muted">Each challenge runs real tests on your program. Go back to Practice or Build to run them.</p></section>
      <h2>Final quiz</h2>${qs}<div class="btns"><button class="btn primary big" data-check>Check my answers</button></div><div class="quiz-result"></div>`;
    host.querySelector("[data-check]").onclick = () => {
      let right = 0, gained = 0;
      t.quiz.forEach((q, i) => {
        const fs = host.querySelector(`[data-q="${i}"]`), sel = fs.querySelector("input:checked"), fb = fs.querySelector(".fb");
        if (!sel) { fb.className = "fb bad"; fb.textContent = "Choose an answer."; return; }
        const ok = +sel.value === q.answer;
        if (ok) { right++; if (Progress.complete(t.id, "quiz-" + q.id, 10)) gained += 10; }
        fb.className = "fb " + (ok ? "good" : "bad");
        fb.textContent = (ok ? "Correct. " : "Not quite. ") + q.why;
      });
      if (right === t.quiz.length) Progress.addBadge(t.id, "quiz-whiz");
      host.querySelector(".quiz-result").innerHTML = `<div class="note ${right === t.quiz.length ? "good" : "bad"}"><b>${right} of ${t.quiz.length} correct.</b> ${gained ? `+${gained} XP.` : ""} ${right === t.quiz.length ? "Badge unlocked: Quiz Whiz." : "Read the notes, change your answers and check again."}</div>`;
      App.afterProgress(t, true);
    };
  }

  // ---- Stage 7: complete ----
  function complete(host, t) {
    if (!allDone(t)) {
      const left = required(t).filter((c) => !Progress.isDone(t.id, c.id));
      host.innerHTML = `<h1>Almost there</h1><div class="note bad">Pass these challenges to finish ${esc(t.title)}:<ul>${left.map((c) => `<li>${esc(c.title)}</li>`).join("")}</ul></div>`;
      return;
    }
    host.innerHTML = `
      <section class="hero done"><div>
        <h1>${t.icon} ${esc(t.title)} complete</h1>
        <p class="lead">You passed every required challenge. You now have ${Progress.xp()} XP in total.</p>
        <h3>Skills you practiced</h3><ul class="chips">${t.skills.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
      </div></section>
      <section class="panel"><h3>Your badges</h3>${badgeGrid(t)}</section>
      <h2>Want a harder challenge?</h2><div class="ws-host"></div>
      <p class="muted">Suggested next topic: ${esc(t.nextTopicSuggestion)}. Ask your facilitator to add it to data/lessons.js.</p>`;
    ChallengeEngine.mount(host.querySelector(".ws-host"), t, t.bonus[0]);
  }

  return { dashboard, learn, explore, practice, build, code, test, complete, allDone };
})();
