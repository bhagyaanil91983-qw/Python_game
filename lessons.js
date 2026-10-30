// ALL educational content for a topic lives here. To add a topic, add another
// entry to window.TOPICS (same shape) — the engines render whatever they find.
window.TOPICS = window.TOPICS || {};

window.TOPICS.loops = {
  id: "loops",
  icon: "🔁",
  title: "Python Loops",
  tagline: "Make Python repeat work so you don't have to.",
  level: "Beginner",
  duration: "About 1 hour",
  description: "A loop repeats a block of code. You will use for loops, while loops, break and continue, then build a number-guessing game.",
  objectives: [
    "Explain why programs use loops",
    "Repeat code with for and range()",
    "Loop over the items of a list",
    "Repeat code until a condition changes with while",
    "Stop a loop early with break and skip a turn with continue",
    "Spot and fix an infinite loop",
  ],
  skills: ["for loops", "range()", "while loops", "loop conditions", "break and continue", "avoiding infinite loops"],

  // ---------- Stage 1: Learn ----------
  learn: [
    {
      title: "Why do we need loops?",
      body: [
        "Imagine brushing your teeth. You do the same move again and again until every tooth is clean. You don't write a separate instruction for each tooth.",
        "A <b>loop</b> lets Python do the same thing: repeat a block of code. Compare these two programs.",
      ],
      code: `# Without a loop: copy and paste
print("Hello!")
print("Hello!")
print("Hello!")

# With a loop: say it once, repeat 3 times
for turn in range(3):
    print("Hello!")`,
      explain: [
        "Both programs print Hello! three times.",
        "The loop version is shorter, and changing 3 to 300 takes one edit.",
      ],
    },
    {
      title: "The for loop and range()",
      body: [
        "Use <code>for</code> when you know how many times to repeat. <code>range(1, 6)</code> hands out the numbers 1, 2, 3, 4, 5. It <b>stops before</b> the last number.",
        "The indented lines are the <b>loop body</b>. Python runs them once for each number.",
      ],
      code: `for number in range(1, 6):
    print("Step", number)
print("Done!")`,
      explain: [
        "<code>number</code> becomes 1, then 2, then 3, 4, 5.",
        "Each time, the indented <code>print</code> runs.",
        "<code>print(\"Done!\")</code> is not indented, so it runs once, after the loop.",
      ],
    },
    {
      title: "Looping over a list",
      body: [
        "A for loop can also walk through the items of a list, one at a time, like a teacher calling names from a register.",
      ],
      code: `snacks = ["apple", "banana", "mango"]
for snack in snacks:
    print("I like", snack)`,
      explain: [
        "Each round, <code>snack</code> holds the next item in the list.",
        "The loop ends by itself when the list runs out.",
      ],
    },
    {
      title: "The while loop",
      body: [
        "Use <code>while</code> when you don't know how many times to repeat. Think of stirring a sauce: you keep stirring <i>while</i> it is still thin.",
        "Python checks the condition before every round. If it is <code>True</code>, the body runs. If it is <code>False</code>, the loop ends.",
      ],
      code: `countdown = 3
while countdown > 0:
    print(countdown)
    countdown = countdown - 1
print("Liftoff!")`,
      explain: [
        "<code>countdown = countdown - 1</code> changes the value the condition checks.",
        "Without that line the condition would stay True forever. That is an <b>infinite loop</b>.",
        "Always ask: what makes this condition become False?",
      ],
    },
    {
      title: "break and continue",
      body: [
        "<code>break</code> leaves the loop immediately. <code>continue</code> skips the rest of this round and jumps to the next one.",
      ],
      code: `for number in range(1, 10):
    if number == 3:
        continue      # skip 3
    if number == 6:
        break         # stop completely at 6
    print(number)`,
      explain: [
        "It prints 1, 2, 4, 5.",
        "3 is skipped by <code>continue</code>. The loop ends at 6 because of <code>break</code>, so 6 is never printed.",
      ],
    },
  ],

  // ---------- Stage 2: Explore (rendered by lesson-engine's "loops" demo) ----------
  demo: "loops",

  // ---------- Stage 3: Practice ----------
  exercises: [
    {
      id: "ex-count-up", level: "Easy", xp: 20, badge: "first-loop",
      title: "Count up",
      prompt: "<p>Read a whole number <code>n</code>. Use a <b>for loop</b> with <code>range()</code> to print the numbers from 1 up to <code>n</code>, one per line.</p><p>Example: if <code>n</code> is 3, print 1, 2, 3 on three lines.</p>",
      starter: `n = int(input("How high? "))
# Use a for loop with range() to print 1 up to n
`,
      sampleInput: "4",
      hints: [
        "range(1, 4) gives 1, 2, 3. The end number is not included.",
        "To include n, the end of the range needs to be one more than n.",
        "Shape: for i in range(1, ____):  then an indented print(i).",
      ],
      tests: [
        { name: "n = 3", stdin: ["3"], expect: "1\n2\n3" },
        { name: "n = 1", stdin: ["1"], expect: "1" },
        { name: "n = 6", stdin: ["6"], expect: "1\n2\n3\n4\n5\n6" },
      ],
      success: "Your loop repeats the right number of times. That is the heart of a for loop.",
    },
    {
      id: "ex-running-total", level: "Medium", xp: 30, badge: "while-warrior",
      title: "Running total",
      prompt: "<p>Finish the program. It keeps asking for numbers and adds them up. When the user types <code>0</code>, the loop ends and the total is printed.</p><p>Replace each <code>____</code> with code. Remember: a while loop needs something inside it that changes the condition.</p>",
      starter: `total = 0
number = int(input("Enter a number (0 to stop): "))
while number != 0:
    ____   # add number to total
    ____   # ask for the next number
print("Total:", total)
`,
      sampleInput: "5\n10\n0",
      hints: [
        "A NameError mentioning ____ means a blank is still in your code.",
        "The first blank: total = total + number.",
        "The second blank repeats the input() line, so number gets a new value and the condition can become False.",
      ],
      tests: [
        { name: "5, 10, 0", stdin: ["5", "10", "0"], contains: ["Total: 15"] },
        { name: "stop right away", stdin: ["0"], contains: ["Total: 0"] },
        { name: "negative numbers", stdin: ["4", "-2", "1", "0"], contains: ["Total: 3"] },
      ],
      success: "Your while loop runs until the user decides to stop, and the loop body changes the thing the condition checks.",
    },
    {
      id: "ex-positive-counter", level: "Hard", xp: 50, badge: "break-master",
      title: "Positive counter",
      prompt: "<p>Read numbers until the user types <code>stop</code>.</p><ul><li>Ignore any number below 1 (use <code>continue</code>).</li><li>Count the other numbers and add them up.</li><li>When the user types <code>stop</code>, leave the loop with <code>break</code>.</li></ul><p>Then print <code>Count: X</code> and <code>Sum: Y</code> on separate lines.</p>",
      starter: `count = 0
total = 0
while True:
    text = input("Number (or stop): ")
    # 1. If text is "stop", leave the loop
    # 2. Turn text into an int
    # 3. If it is less than 1, skip it
    # 4. Otherwise update count and total
print("Count:", count)
print("Sum:", total)
`,
      sampleInput: "3\n-1\n4\nstop",
      hints: [
        "Check for \"stop\" before calling int(). int(\"stop\") causes an error.",
        "The order is: if text == \"stop\": break, then number = int(text), then if number < 1: continue.",
        "After the checks, do count = count + 1 and total = total + number.",
      ],
      tests: [
        { name: "3, -1, 4, stop", stdin: ["3", "-1", "4", "stop"], expect: "Count: 2\nSum: 7" },
        { name: "stop immediately", stdin: ["stop"], expect: "Count: 0\nSum: 0" },
        { name: "zero and negatives ignored", stdin: ["10", "0", "-5", "5", "stop", "99"], expect: "Count: 2\nSum: 15" },
      ],
      success: "You combined while True, break and continue. This pattern appears in menus, games and chat bots.",
    },
  ],

  // ---------- Stage 4: Build ----------
  project: {
    id: "project-guessing-game", level: "Project", xp: 100, badge: "guess-master",
    title: "Number guessing game",
    prompt: "<p>The computer picks a secret number from 1 to 20. The player has <b>5 guesses</b>.</p><ul><li>Each turn, ask <code>Guess: </code> and count the guess.</li><li>Too small: print <code>Too low!</code>. Too big: print <code>Too high!</code>.</li><li>Right: print <code>Correct! Guesses: N</code> and stop the loop.</li><li>Out of guesses: print <code>Out of guesses! The number was N.</code> (N is the secret).</li></ul><p>Tip: in the editor, type your guesses in the Program input box. The tests use a fixed secret of 7.</p>",
    starter: `import random

secret = random.randint(1, 20)
max_guesses = 5
guesses = 0

print("I'm thinking of a number from 1 to 20.")

# Loop until the player guesses or runs out of guesses.
# Each turn: ask for a guess with input("Guess: "), add 1 to guesses.
# Print "Too low!" or "Too high!" when it is wrong.
# When right: print "Correct! Guesses: N" and stop the loop.
# After the loop, if the guesses ran out, print:
#   "Out of guesses! The number was N."
`,
    sampleInput: "10\n5\n7",
    hints: [
      "Use while guesses < max_guesses: so the loop ends after 5 turns.",
      "Inside the loop: guess = int(input(\"Guess: \")), then guesses = guesses + 1.",
      "Use if / elif / else to compare guess with secret. On a correct guess, print the message and break.",
      "Make the out-of-guesses message appear only if the player never guessed right. Try a variable like won = False that you set to True before break.",
    ],
    tests: [
      { name: "low, high, then correct", stdin: ["3", "10", "7"], fixed: 7, contains: ["Too low!", "Too high!", "Correct! Guesses: 3"], notContains: ["Out of guesses"] },
      { name: "correct on the first guess", stdin: ["7"], fixed: 7, contains: ["Correct! Guesses: 1"], notContains: ["Too low", "Too high", "Out of guesses"] },
      { name: "five wrong guesses", stdin: ["1", "2", "3", "4", "5"], fixed: 7, contains: ["Out of guesses! The number was 7."], notContains: ["Correct!"] },
      { name: "correct on the last guess", stdin: ["20", "1", "2", "3", "7"], fixed: 7, contains: ["Correct! Guesses: 5"], notContains: ["Out of guesses"] },
    ],
    success: "You built a complete game with a loop at its core. Try changing the range or the number of guesses!",
  },

  // ---------- Optional harder challenge (Complete stage) ----------
  bonus: [
    {
      id: "bonus-triangle", level: "Bonus", xp: 40, badge: "nested-ninja",
      title: "Star triangle (loop inside a loop)",
      prompt: "<p>Read a number <code>n</code>. Print a triangle of stars with <code>n</code> rows: row 1 has 1 star, row 2 has 2 stars, and so on.</p><p>Example for n = 3:</p><pre class=\"code\">*\n**\n***</pre>",
      starter: `n = int(input("Rows: "))
# Hint: an outer loop picks the row, and each row prints that many stars
`,
      sampleInput: "4",
      hints: [
        "Strings can be repeated: \"*\" * 3 gives \"***\".",
        "A single for loop over rows is enough: for row in range(1, n + 1): print(\"*\" * row).",
        "You can also use a second for loop inside the first and print with end=\"\".",
      ],
      tests: [
        { name: "n = 1", stdin: ["1"], expect: "*" },
        { name: "n = 3", stdin: ["3"], expect: "*\n**\n***" },
        { name: "n = 5", stdin: ["5"], expect: "*\n**\n***\n****\n*****" },
      ],
      success: "Loops can live inside loops. Rows and columns, grids and tables all use this idea.",
    },
  ],

  // ---------- Stage 6: Test (final assessment) ----------
  quiz: [
    { id: "q1", q: "What does range(1, 4) give you?", options: ["1, 2, 3", "1, 2, 3, 4", "0, 1, 2, 3", "2, 3, 4"], answer: 0,
      why: "range stops before the end number, so 4 is not included." },
    { id: "q2", q: "You want to keep asking for a password until it is right. You don't know how many tries it will take. Which loop fits best?", options: ["for", "while", "if", "range"], answer: 1,
      why: "while repeats as long as a condition is True, with no fixed count." },
    { id: "q3", q: "What is wrong with this code?\n\nx = 0\nwhile x < 3:\n    print(x)", options: ["Nothing, it prints 0 1 2", "x never changes, so the loop never ends", "print cannot be inside a loop", "while needs range()"], answer: 1,
      why: "x stays 0, so x < 3 is always True. Add x = x + 1 inside the loop." },
    { id: "q4", q: "What does continue do inside a loop?", options: ["Ends the whole loop", "Skips the rest of this round and starts the next", "Restarts the program", "Prints the loop variable"], answer: 1,
      why: "continue jumps straight to the next round. break is the one that ends the loop." },
  ],

  // ---------- Badges ----------
  badges: {
    "first-loop":    { icon: "🥇", name: "First Loop", desc: "Passed Count up" },
    "while-warrior": { icon: "⚔️", name: "While Warrior", desc: "Passed Running total" },
    "break-master":  { icon: "🔨", name: "Break Master", desc: "Passed Positive counter" },
    "guess-master":  { icon: "🎯", name: "Guess Master", desc: "Built the guessing game" },
    "nested-ninja":  { icon: "🥷", name: "Nested Ninja", desc: "Passed the bonus triangle" },
    "quiz-whiz":     { icon: "🧠", name: "Quiz Whiz", desc: "All quiz answers correct" },
    "loop-legend":   { icon: "🏆", name: "Loop Legend", desc: "Finished every required challenge" },
  },
  completionBonusXp: 50,
  nextTopicSuggestion: "Python Functions",
};
