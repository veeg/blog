// Merge demo: the "no silent corruption" example from pijul.org, one step at a
// time, told as commits on two branches that are merged into trunk. Each line
// keeps its element between steps, so a line that moves slides to its new place
// instead of jumping.
(function () {
  // key: [text, who wrote it, identity tag]. A key is one element on screen, so a
  // line that appears in two columns at once needs a key per column.
  var LINES = {
    "base-a": ["A", "base"], "base-b": ["B", "base"],
    "first-g": ["G", "alice"], "first-a": ["A", "base"], "first-b": ["B", "base"],
    a1: ["A", "base", "1"], b1: ["B", "base", "1"],
    a2: ["A", "alice", "2"], b2: ["B", "alice", "2"], g: ["G", "alice"],
    "bob-a": ["A", "base"], x: ["X", "bob"], "bob-b": ["B", "base"],
    // trunk after Alice's branch is merged
    ta1: ["A", "base", "1"], tb1: ["B", "base", "1"],
    ta2: ["A", "alice", "2"], tb2: ["B", "alice", "2"], tg: ["G", "alice"],
    // Bob's change, as Git and Pijul see it
    "git-a": ["A", "context"], "git-b": ["B", "context"],
    "pijul-a": ["after A", "context", "1"], "pijul-b": ["before B", "context", "1"],
    // trunk after Bob's branch is merged
    ma1: ["A", "base", "1"], mb1: ["B", "base", "1"],
    ma2: ["A", "alice", "2"], mb2: ["B", "alice", "2"], mg: ["G", "alice"], mx: ["X", "bob"]
  };

  // A column is the file at one commit. `commit` places it in the commit graph
  // above the columns: `lane` 0 is trunk, 1 is Alice's branch and 2 is Bob's.
  // `parents` are the columns it was made from; two parents make a merge commit.
  var trunk = { title: "trunk", note: "A, B", lines: ["base-a", "base-b"],
    commit: { kind: "base", lane: 0 } };
  var aliceFirst = { title: "alice", note: "add G", lines: ["first-g", "first-a", "first-b"],
    commit: { kind: "alice", lane: 1, parents: [0] } };
  var aliceSecond = { title: "alice", note: "add A, B", lines: ["a2", "b2", "g", "a1", "b1"],
    commit: { kind: "alice", lane: 1, parents: [1] } };
  var bob = { title: "bob", note: "insert X", lines: ["bob-a", "x", "bob-b"],
    commit: { kind: "bob", lane: 2, parents: [0] } };
  var trunkAlice = { title: "trunk", note: "merge alice", lines: ["ta2", "tb2", "tg", "ta1", "tb1"],
    commit: { kind: "merge", lane: 0 } };

  // In the merge steps, trunk moves on to Alice's merge, while Bob's branch still
  // starts from the original trunk: he never sees her changes.
  var trunkAfterAlice = { title: "trunk", note: "merge alice", lines: trunkAlice.lines,
    commit: { kind: "merge", lane: 0, parents: [0] } };
  function bobChange(look) {
    var lines = look === "git" ? ["git-a", "x", "git-b"] : ["pijul-a", "x", "pijul-b"];
    return { title: "bob", note: "his change", lines: lines, commit: { kind: "bob", lane: 2, parents: [0] } };
  }

  // look: "setup" colours lines by author, "git" only shows text, "pijul" adds identities.
  var STEPS = [
    { look: "setup", columns: [trunk],
      caption: "trunk holds a file with two lines, A and B. Each column shows that file at one commit." },
    { look: "setup", columns: [trunk, aliceFirst],
      caption: "Alice branches off trunk and commits a change that adds G at the top of the file." },
    { look: "setup", columns: [trunk, aliceFirst, aliceSecond],
      caption: "She commits again, adding a new A and B above it." },
    { look: "setup", columns: [trunk, aliceFirst, aliceSecond, bob],
      caption: "Bob also branches off trunk and never sees Alice's work. He commits a change that inserts X between A and B." },
    { look: "setup", columns: [trunk, aliceFirst, aliceSecond, bob,
        { title: "trunk", note: "merge alice", lines: trunkAlice.lines,
          commit: { kind: "merge", lane: 0, parents: [0, 2] } }],
      caption: "Alice's branch is merged into trunk first. trunk now holds her version of the file." },
    { look: "git", columns: [trunk, trunkAfterAlice, bobChange("git")],
      caption: "Bob's branch still starts from the original trunk, so he never saw Alice's changes. Git merges text, and to Git every A looks the same: put X after an A and before a B." },
    { look: "git", columns: [trunk, trunkAfterAlice, bobChange("git"),
        { title: "trunk", note: "git merge", lines: ["ma2", "mx", "mb2", "mg", "ma1", "mb1"],
          commit: { kind: "merge", lane: 0, parents: [1, 2] } }],
      caption: "The first A and B Git finds are Alice's new ones. X lands between them in the merge commit, with no conflict and no warning." },
    { look: "pijul", columns: [trunk, trunkAfterAlice, bobChange("pijul")],
      caption: "Pijul gives every line an identity. Bob's change says: put X after the original A and before the original B." },
    { look: "pijul", columns: [trunk, trunkAfterAlice, bobChange("pijul"),
        { title: "trunk", note: "pijul merge", lines: ["ma2", "mb2", "mg", "ma1", "mx", "mb1"],
          commit: { kind: "merge", lane: 0, parents: [1, 2] } }],
      caption: "X lands between the original A and B in the merge commit, where Bob put it." }
  ];

  var SVG = "http://www.w3.org/2000/svg";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setup(figure) {
    var stage = figure.querySelector(".merge-demo-stage");
    var caption = figure.querySelector("figcaption");
    var controls = figure.querySelector(".merge-demo-controls");
    var prev = figure.querySelector("[data-prev]");
    var next = figure.querySelector("[data-next]");
    var count = figure.querySelector(".merge-demo-count");
    var elements = {};
    var graph = null;
    var current = 0;
    var shown = 0;

    function lineElement(key, look) {
      var line = LINES[key];
      var el = elements[key];
      if (!el) {
        el = elements[key] = document.createElement("span");
        el.textContent = line[0];
        if (line[2]) {
          var tag = document.createElement("sub");
          tag.textContent = line[2];
          el.appendChild(tag);
        }
      }
      var kind = line[1];
      if (look === "git" && kind !== "bob" && kind !== "context") kind = "plain";
      el.className = "merge-demo-line is-" + kind;
      el.classList.toggle("show-tag", look === "pijul");
      return el;
    }

    // Draws the edges between commit nodes. Called after layout, since the
    // edges follow wherever the columns ended up.
    function drawGraph(columns) {
      if (graph) graph.remove();
      graph = null;
      var nodes = stage.querySelectorAll(".merge-demo-node");
      if (!nodes.length) return;

      graph = document.createElementNS(SVG, "svg");
      graph.setAttribute("class", "merge-demo-graph");
      graph.setAttribute("aria-hidden", "true");
      stage.prepend(graph);
      var origin = stage.getBoundingClientRect();
      var centre = function (node) {
        var r = node.getBoundingClientRect();
        return { x: r.left + r.width / 2 - origin.left, y: r.top + r.height / 2 - origin.top };
      };

      columns.forEach(function (column, i) {
        var commit = column.commit;
        if (!commit || !commit.parents) return;
        commit.parents.forEach(function (parent) {
          var from = centre(nodes[parent]);
          var to = centre(nodes[i]);
          var bend = Math.abs(to.y - from.y);
          var d;
          if (from.y === to.y) {
            // Same lane: a straight line.
            d = "M" + from.x + " " + from.y + " L" + to.x + " " + to.y;
          } else if (to.y > from.y) {
            // Branching off: drop down from the parent, then run along the new lane.
            d = "M" + from.x + " " + from.y + " Q" + from.x + " " + to.y + " " + (from.x + bend) + " " + to.y +
              " L" + to.x + " " + to.y;
          } else {
            // Merging back: run along the branch's lane, then rise into the merge commit.
            d = "M" + from.x + " " + from.y + " L" + (to.x - bend) + " " + from.y +
              " Q" + to.x + " " + from.y + " " + to.x + " " + to.y;
          }
          // An edge takes the colour of the branch it belongs to: the new branch when
          // branching off, the branch being merged in when merging.
          var kind = commit.kind === "merge" ? columns[parent].commit.kind : commit.kind;
          var path = document.createElementNS(SVG, "path");
          path.setAttribute("d", d);
          path.setAttribute("class", "is-" + (kind === "merge" ? "base" : kind));
          graph.appendChild(path);
        });
      });
    }

    function render(index, animate) {
      var step = STEPS[index];
      var before = {};
      Object.keys(elements).forEach(function (key) {
        var el = elements[key];
        before[key] = { rect: el.getBoundingClientRect(), color: getComputedStyle(el).backgroundColor };
      });
      var hadGraph = !!graph;

      stage.textContent = "";
      graph = null;
      var used = {};
      var hasGraph = step.columns.some(function (column) { return column.commit; });
      step.columns.forEach(function (column) {
        var col = document.createElement("div");
        col.className = "merge-demo-column";
        if (hasGraph) {
          var lane = document.createElement("div");
          lane.className = "merge-demo-lanes";
          var node = document.createElement("span");
          node.className = "merge-demo-node is-" + column.commit.kind + " lane-" + column.commit.lane;
          lane.appendChild(node);
          col.appendChild(lane);
        }
        var title = document.createElement("div");
        title.className = "merge-demo-title";
        var name = document.createElement("span");
        name.textContent = column.title;
        if (column.commit) name.className = "is-" + column.commit.kind;
        title.appendChild(name);
        if (column.note) {
          title.appendChild(document.createElement("br"));
          title.appendChild(document.createTextNode(column.note));
        }
        col.appendChild(title);
        var file = document.createElement("div");
        file.className = "merge-demo-file";
        var fileName = document.createElement("span");
        fileName.className = "merge-demo-file-name";
        fileName.textContent = "file.txt";
        file.appendChild(fileName);
        column.lines.forEach(function (key) {
          file.appendChild(lineElement(key, step.look));
          used[key] = true;
        });
        col.appendChild(file);
        stage.appendChild(col);
      });
      Object.keys(elements).forEach(function (key) {
        if (!used[key]) delete elements[key];
      });
      drawGraph(step.columns);

      caption.textContent = step.caption;
      count.textContent = index + 1 + " / " + STEPS.length;
      prev.disabled = index === 0;
      next.disabled = index === STEPS.length - 1;

      var last = shown;
      shown = index;
      if (!animate || reduceMotion.matches || !Element.prototype.animate) return;
      var appear = function (el) {
        el.animate([{ opacity: 0, transform: "scale(0.8)" }, { opacity: 1, transform: "none" }],
          { duration: 300, delay: 200, easing: "ease-out", fill: "backwards" });
      };
      Object.keys(used).forEach(function (key) {
        var el = elements[key];
        var old = before[key];
        if (!old) return appear(el);
        var now = el.getBoundingClientRect();
        var dx = old.rect.left - now.left;
        var dy = old.rect.top - now.top;
        el.animate([
          { transform: "translate(" + dx + "px, " + dy + "px)", backgroundColor: old.color },
          { transform: "none", backgroundColor: getComputedStyle(el).backgroundColor }
        ], { duration: 500, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
      });
      // The graph is redrawn each step, so only the newest node and edge animate in.
      if (graph) {
        var nodes = stage.querySelectorAll(".merge-demo-node");
        if (!hadGraph) {
          graph.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 200, fill: "backwards" });
          nodes.forEach(appear);
        } else if (index > last) {
          appear(nodes[nodes.length - 1]);
          if (graph.lastChild) {
            graph.lastChild.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 200, fill: "backwards" });
          }
        }
      }
    }

    prev.addEventListener("click", function () { if (current > 0) render(--current, true); });
    next.addEventListener("click", function () { if (current < STEPS.length - 1) render(++current, true); });
    // Columns can shift when the page resizes, so redraw the edges to match.
    if (window.ResizeObserver) {
      new ResizeObserver(function () { drawGraph(STEPS[current].columns); }).observe(stage);
    }
    controls.hidden = false;
    render(current, false);
  }

  document.querySelectorAll("[data-merge-demo]").forEach(setup);
})();
