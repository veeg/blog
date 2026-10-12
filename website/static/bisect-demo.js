// Bisect demo: one git bisect session, one step at a time. The hashes and git
// output come from a real bisect run on a 16-commit repository; the commit
// messages were reworded to follow the blog post's discount code example, and
// the skipped commit (and the hash of the commit tested after it) was added to
// show git bisect skip.
// The commit row is built once and only its classes change between steps, so
// the HEAD marker and the suspect bracket slide instead of jumping.
(function () {
  // Oldest first. Index 0 is tagged v1.0, the last one is trunk.
  var COMMITS = [
    ["a418da3", "chore: release 1.0"],
    ["a3ee685", "feat(cart): add discount code model"],
    ["7263b9a", "feat(cart): apply discount codes to the order total"],
    ["ef57b98", "test(cart): cover expired and unknown discount codes"],
    ["b01c0c4", "docs(cart): document the discount code API"],
    ["3359cd6", "build: bump http client to 4.2"],
    ["d78b9cc", "feat(ui): add dark mode toggle"],
    ["4f78577", "perf(cart): cache product prices"],
    ["73fbb96", "refactor: rename config keys"],
    ["ced8b7b", "fix(auth): trim whitespace in usernames"],
    ["e4280cf", "perf(ui): lazy-load avatars"],
    ["ef64843", "fix(cart): recalculate total when quantity changes"],
    ["28e4e6b", "perf(ui): inline small icons"],
    ["6bad2b8", "feat: add audit log"],
    ["69fba68", "fix(ui): typo in footer"],
    ["271bdf7", "perf: speed up search index"],
    ["1dcb548", "chore: update copyright year"]
  ];
  var TAGS = { 0: "v1.0", 16: "trunk" };

  // range: the suspects still in play, [first, last], or null before bisect starts.
  // marks: commits with a known test result. head: the commit checked out.
  // culprit: the first bad commit, once found. term: what the terminal shows.
  // The test, repro.sh, is written during the story, so it is an untracked file
  // that stays put while bisect checks out older commits.
  var PASS = "✓ total 90.00 with a 10% discount code";
  var FAIL = "✗ total 81.00, expected 90.00";
  var KNOWN = { 0: "good", 16: "bad" };
  var STEPS = [
    { range: null, marks: { 16: "bad" }, head: 16,
      term: ["$ ./repro.sh", FAIL],
      caption: "Users report that their discount code is applied twice when they change the quantity in their cart. No test caught it, so you write one now that reproduces the bug. It fails on trunk, as expected." },
    { range: null, marks: KNOWN, head: 0,
      term: ["$ git checkout v1.0", "$ ./repro.sh", PASS],
      caption: "repro.sh isn't committed, so it stays in place when you check out older code. On v1.0 it passes: the bug arrived in one of the 16 commits since." },
    { range: null, marks: KNOWN, head: 0,
      term: ["$ git checkout a3ee685 && ./repro.sh", "$ git checkout 7263b9a && ./repro.sh", "$ git checkout ef57b98 && ./repro.sh",
        "# ...and so on, up to 15 times"],
      caption: "You could run the new test on every commit, one at a time. That's up to 15 runs here, and real histories are often much longer." },
    { range: [1, 16], marks: KNOWN, head: 8,
      term: ["$ git switch trunk", "$ git bisect start", "$ git bisect bad", "$ git bisect good v1.0",
        "Bisecting: 7 revisions left to test after this (roughly 3 steps)",
        "[73fbb960f08eaa25962b0f10ba13e903bfc56bee] refactor: rename config keys"],
      caption: "Instead, tell Git one bad commit and one good one. Every commit after the good one is a suspect, and Git checks out the one in the middle." },
    { range: [9, 16], marks: { 0: "good", 8: "good", 16: "bad" }, head: 12,
      term: ["$ ./repro.sh", PASS, "$ git bisect good",
        "Bisecting: 3 revisions left to test after this (roughly 2 steps)",
        "[28e4e6b7c135267e45117184a91c240f908a757e] perf(ui): inline small icons"],
      caption: "The test passes on 73fbb96, so the bug came later. One run cleared half the suspects." },
    { range: [9, 16], marks: { 0: "good", 8: "good", 12: "skip", 16: "bad" }, head: 13,
      term: ["$ ./repro.sh", "✗ build failed: icons.css: unexpected end of file", "$ git bisect skip",
        "Bisecting: 3 revisions left to test after this (roughly 2 steps)",
        "[6bad2b8e1f4c03a9d7e25b1c8a6f0d93e4b27c51] feat: add audit log"],
      caption: "28e4e6b doesn't even build, so it can't tell you anything about the bug. git bisect skip sets it aside, and Git checks out a commit next to it instead." },
    { range: [9, 13], marks: { 0: "good", 8: "good", 12: "skip", 13: "bad", 16: "bad" }, head: 10,
      term: ["$ ./repro.sh", FAIL, "$ git bisect bad",
        "Bisecting: 1 revision left to test after this (roughly 1 step)",
        "[e4280cff758afad818878e323bea112fbd0c3931] perf(ui): lazy-load avatars"],
      caption: "6bad2b8 fails, so the bug is in this commit or an earlier one. The skipped commit is still a suspect, bisect just works around it." },
    { range: [11, 13], marks: { 0: "good", 8: "good", 10: "good", 12: "skip", 13: "bad", 16: "bad" }, head: 11,
      term: ["$ ./repro.sh", PASS, "$ git bisect good",
        "Bisecting: 0 revisions left to test after this (roughly 0 steps)",
        "[ef6484397106e2b36d1879f7a56a667ab7957f87] fix(cart): recalculate total when quantity changes"],
      caption: "e4280cf passes. Only ef64843 and the skipped commit after it are left, and one more run decides it." },
    { range: [11, 11], marks: { 0: "good", 8: "good", 10: "good", 11: "bad", 12: "skip", 13: "bad", 16: "bad" }, head: 11, culprit: 11,
      term: ["$ ./repro.sh", FAIL, "$ git bisect bad",
        "ef6484397106e2b36d1879f7a56a667ab7957f87 is the first bad commit",
        "commit ef6484397106e2b36d1879f7a56a667ab7957f87", "    fix(cart): recalculate total when quantity changes"],
      caption: "ef64843 fails, and the commit before it passed. It's the first bad commit, found in 5 runs instead of up to 15, even with a commit that didn't build: recalculating the total applied the discount on top of an already discounted total." },
    { range: [11, 11], marks: { 0: "good", 8: "good", 10: "good", 11: "bad", 12: "skip", 13: "bad", 16: "bad" }, head: 16, culprit: 11,
      term: ["$ git bisect reset", "Previous HEAD position was ef64843 fix(cart): recalculate total when quantity changes", "Switched to branch 'trunk'"],
      caption: "git bisect reset takes you back to trunk. Commit the fix together with the new test, so this bug can't come back unnoticed." }
  ];

  var GLYPHS = { good: "✓", bad: "✗", skip: "?" };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Places an element over commits first..last, as a share of the row width.
  function span(node, first, last) {
    node.style.left = (first / COMMITS.length) * 100 + "%";
    node.style.width = ((last - first + 1) / COMMITS.length) * 100 + "%";
  }

  function setup(figure) {
    var stage = figure.querySelector(".bisect-demo-stage");
    var caption = figure.querySelector("figcaption");
    var controls = figure.querySelector(".bisect-demo-controls");
    var prev = figure.querySelector("[data-prev]");
    var next = figure.querySelector("[data-next]");
    var count = figure.querySelector(".bisect-demo-count");
    var current = 0;

    stage.textContent = "";
    var track = el("div", "bisect-demo-track");
    var head = el("div", "bisect-demo-head");
    head.appendChild(el("span", "", "HEAD"));
    var row = el("div", "bisect-demo-row");
    var nodes = COMMITS.map(function (commit, i) {
      var cell = el("div", "bisect-demo-cell");
      var dot = el("span", "bisect-demo-commit");
      dot.title = commit[0] + " " + commit[1];
      cell.appendChild(dot);
      if (TAGS[i]) cell.appendChild(el("span", "bisect-demo-tag", TAGS[i]));
      row.appendChild(cell);
      return dot;
    });
    var bracket = el("div", "bisect-demo-bracket");
    var suspects = el("span", "bisect-demo-suspects");
    bracket.appendChild(suspects);
    track.appendChild(head);
    track.appendChild(row);
    track.appendChild(bracket);

    var checkedOut = el("p", "bisect-demo-checkout");
    var term = el("pre", "bisect-demo-term");
    term.setAttribute("aria-label", "Terminal");
    stage.appendChild(track);
    stage.appendChild(checkedOut);
    stage.appendChild(term);

    function render(index) {
      var step = STEPS[index];
      var range = step.range;

      nodes.forEach(function (dot, i) {
        var mark = step.marks[i];
        var inRange = range && i >= range[0] && i <= range[1];
        var state = i === step.culprit ? "culprit" : mark || (!range || inRange ? "suspect" : "cleared");
        dot.className = "bisect-demo-commit is-" + state;
        dot.textContent = mark ? GLYPHS[mark] : "";
      });

      span(head, step.head, step.head);
      bracket.hidden = !range;
      if (range) {
        span(bracket, range[0], range[1]);
        var n = range[1] - range[0] + 1;
        suspects.textContent = step.culprit !== undefined ? "first bad commit" : n + " suspects";
      }

      var commit = COMMITS[step.head];
      var mark = step.marks[step.head];
      checkedOut.textContent = "";
      checkedOut.appendChild(el("span", "bisect-demo-label", "checked out"));
      checkedOut.appendChild(el("code", "", commit[0]));
      checkedOut.appendChild(document.createTextNode(" " + commit[1]));
      if (mark) checkedOut.appendChild(el("span", "bisect-demo-result is-" + mark, GLYPHS[mark] + " " + mark));

      term.textContent = "";
      step.term.forEach(function (line) {
        var kind = line.charAt(0) === "$" ? "is-cmd" : line.charAt(0) === "#" ? "is-comment" : "is-out";
        term.appendChild(el("span", kind, line));
        term.appendChild(document.createTextNode("\n"));
      });

      caption.textContent = step.caption;
      count.textContent = index + 1 + " / " + STEPS.length;
      prev.disabled = index === 0;
      next.disabled = index === STEPS.length - 1;
    }

    prev.addEventListener("click", function () { if (current > 0) render(--current); });
    next.addEventListener("click", function () { if (current < STEPS.length - 1) render(++current); });
    controls.hidden = false;
    render(current);
  }

  document.querySelectorAll("[data-bisect-demo]").forEach(setup);
})();
