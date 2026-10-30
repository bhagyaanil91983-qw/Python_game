// Runs Python (Pyodide) inside a Web Worker so the page never freezes.
// If a program runs too long, python-runner.js simply terminates this worker.
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");

// Python helper that runs the student's code. String.raw keeps "\n" as typed.
const HARNESS = String.raw`
import sys, io, json, builtins, traceback, random

def run_user_code(payload):
    p = json.loads(payload)
    lines = iter(p["stdin"])
    echo = p.get("echo", True)
    out = io.StringIO()
    real_stdout = sys.stdout
    sys.stdout = out

    # Browsers have no terminal, so input() reads from the "Program input" box.
    def fake_input(prompt=""):
        if echo:
            out.write(str(prompt))
        try:
            line = str(next(lines))
        except StopIteration:
            raise EOFError("input() was called but there is no more input. Add more lines to the Program input box.")
        if echo:
            out.write(line + "\n")
        return line
    builtins.input = fake_input

    real_randint = random.randint
    if p.get("fixed") is not None:
        random.randint = lambda a, b: p["fixed"]   # makes random games testable

    err = ""
    try:
        exec(compile(p["code"], "main.py", "exec"), {"__name__": "__main__"})
    except SystemExit:
        pass
    except BaseException:
        et, ev, tb = sys.exc_info()
        frames = [f for f in traceback.extract_tb(tb) if f.filename == "main.py"]
        err = "Traceback (most recent call last):\n" + "".join(traceback.format_list(frames)) + "".join(traceback.format_exception_only(et, ev))
    finally:
        sys.stdout = real_stdout
        random.randint = real_randint

    text = out.getvalue()
    if len(text) > 20000:
        text = text[:20000] + "\n... output cut off ..."
    return json.dumps({"stdout": text, "stderr": err})
`;

let runner = null;

async function init() {
  try {
    const pyodide = await loadPyodide();
    pyodide.runPython(HARNESS);
    runner = pyodide.globals.get("run_user_code");
    postMessage({ type: "ready" });
  } catch (e) {
    postMessage({ type: "error", message: String(e) });
  }
}
init();

onmessage = (e) => {
  if (!runner) return;
  const { code, stdin, fixed, echo } = e.data;
  const payload = JSON.stringify({ code, stdin, fixed: fixed ?? null, echo });
  postMessage({ type: "result", result: JSON.parse(runner(payload)) });
};
