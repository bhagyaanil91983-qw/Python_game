// Starts the Pyodide worker, sends it code, and enforces a time limit.
const PythonRunner = (() => {
  const DEFAULT_TIMEOUT = 5000; // ms
  let worker, readyPromise, pending = null, statusCb = () => {};

  function start() {
    if (worker) worker.terminate();
    statusCb("loading");
    worker = new Worker("js/pyodide-worker.js");
    const w = worker;
    readyPromise = new Promise((resolve, reject) => {
      w.onmessage = (e) => {
        const d = e.data;
        if (d.type === "ready") { statusCb("ready"); resolve(); }
        else if (d.type === "error") { statusCb("failed", d.message); reject(new Error(d.message)); }
        else if (d.type === "result" && pending) {
          const p = pending; pending = null; clearTimeout(p.timer); p.resolve(d.result);
        }
      };
      w.onerror = (ev) => { statusCb("failed", ev.message || "worker error"); reject(new Error(ev.message)); };
    });
    readyPromise.catch(() => {});
  }

  // opts: { timeout, fixed (fixed random.randint value), echo (show input prompts) }
  async function run(code, stdin = [], opts = {}) {
    await readyPromise;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        pending = null;
        start();                                   // kill the stuck program, load a fresh worker
        resolve({ stdout: "", stderr: "", timedOut: true });
      }, opts.timeout || DEFAULT_TIMEOUT);
      pending = { resolve, timer };
      worker.postMessage({ code, stdin, fixed: opts.fixed, echo: opts.echo !== false });
    });
  }

  return { start, run, onStatus(fn) { statusCb = fn; } };
})();
