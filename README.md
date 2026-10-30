# Python Lab — Learn, Code, Build

A static, browser-only Python learning site. Python runs in the browser with Pyodide inside a Web Worker. There is no backend, database or account.

## Run it locally
Web Workers need http, so don't double-click index.html. From this folder run:

    python3 -m http.server 8000

then open http://localhost:8000 (internet needed: Pyodide, CodeMirror and fonts load from CDNs).

## Publish on GitHub Pages
    git init && git add . && git commit -m "Python Lab: Loops"
    git branch -M main
    git remote add origin https://github.com/<you>/python-lab.git
    git push -u origin main

On GitHub: Settings → Pages → Source: Deploy from a branch → main / (root). The site appears at https://<you>.github.io/python-lab/.

## How it works
- data/lessons.js: all lesson content, exercises, hints, tests, quiz, badges. One entry per topic in window.TOPICS.
- js/pyodide-worker.js + python-runner.js: run Python off the main thread; a program that runs over 5 seconds is killed and Python reloads.
- js/challenge-engine.js: editor, terminal, and behaviour tests (runs the program with fixed input and compares real output).
- js/lesson-engine.js: renders Learn, Explore, Practice, Build, Code, Test, Complete. Topic demos live in the `demos` object.
- js/progress.js: XP, badges and saved code in localStorage (this browser only).

## input() in the browser
Browsers have no terminal, so input() reads lines from the "Program input" box, one line per call. If the program asks for more lines than given, it raises a clear EOFError.

## Add a new topic
1. Copy the `loops` entry in data/lessons.js, change the id, and write new content.
2. If you want a visual demo, add a function to `demos` in lesson-engine.js and set `demo: "yourname"`.
3. Tests: `stdin` (list of input lines), `expect` (exact output), `contains`, `notContains`, and `fixed` (fixes random.randint for games).
Note: the completion badge id `loop-legend` is currently used for every topic; rename it per topic if you add more.
