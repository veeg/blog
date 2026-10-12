---
theme: default
title: Git vs Pijul merges
info: |
  The "no silent corruption" example from pijul.org, animated.
transition: view-transition
mdc: true
---

# Same edits, two merges

How Git and Pijul merge the same two branches

<div class="pt-8 opacity-60">Example from pijul.org: "no silent corruption"</div>

---

# The setup

<div class="mt-6 w-140">
  <svg viewBox="0 0 560 80" class="w-140 h-20">
    <g v-click="1">
      <line x1="70" y1="20" x2="210" y2="20" stroke="#f97316" stroke-width="3" />
      <circle cx="210" cy="20" r="10" fill="#f97316" />
    </g>
    <g v-click="2">
      <line x1="210" y1="20" x2="350" y2="20" stroke="#f97316" stroke-width="3" />
      <circle cx="350" cy="20" r="10" fill="#f97316" />
    </g>
    <g v-click="3">
      <path d="M70 20 Q70 60 110 60 L490 60" fill="none" stroke="#9333ea" stroke-width="3" />
      <circle cx="490" cy="60" r="10" fill="#9333ea" />
    </g>
    <circle cx="70" cy="20" r="10" fill="#0d9488" />
  </svg>

  <div class="grid grid-cols-4 mt-2">
    <div class="flex flex-col items-center gap-2">
      <div class="text-sm h-10 text-center leading-tight"><span class="text-teal-600 font-bold">base</span></div>
      <Line kind="base">A</Line>
      <Line kind="base">B</Line>
    </div>
    <div v-click="1" class="flex flex-col items-center gap-2">
      <div class="text-sm h-10 text-center leading-tight"><span class="text-orange-500 font-bold">alice</span><br><span class="opacity-60">add G at top</span></div>
      <Line kind="alice">G</Line>
      <Line kind="base">A</Line>
      <Line kind="base">B</Line>
    </div>
    <div v-click="2" class="flex flex-col items-center gap-2">
      <div class="text-sm h-10 text-center leading-tight"><span class="text-orange-500 font-bold">alice</span><br><span class="opacity-60">add A,B at top</span></div>
      <Line id="a2" kind="alice">A</Line>
      <Line id="b2" kind="alice">B</Line>
      <Line id="g" kind="alice">G</Line>
      <Line id="a1" kind="base">A</Line>
      <Line id="b1" kind="base">B</Line>
    </div>
    <div v-click="3" class="flex flex-col items-center gap-2">
      <div class="text-sm h-10 text-center leading-tight"><span class="text-purple-600 font-bold">bob</span><br><span class="opacity-60">insert X</span></div>
      <Line kind="base">A</Line>
      <Line id="x" kind="bob">X</Line>
      <Line kind="base">B</Line>
    </div>
  </div>
</div>

<div v-click="3" class="absolute right-12 top-32 max-w-60">

Bob starts from `base` too. He never sees Alice's changes.

</div>

<!--
Both branches start from base (teal).
Alice adds G at the top, then adds a new A and B above that.
Bob, also starting from base, inserts X between the original A and B.
-->

---

# Git: merging text

<div class="flex gap-20 mt-10 items-start">
  <div>
    <h3 class="mb-4">alice</h3>
    <div class="flex flex-col gap-2">
      <Line id="a2">A</Line>
      <Line id="b2">B</Line>
      <Line id="g">G</Line>
      <Line id="a1">A</Line>
      <Line id="b1">B</Line>
    </div>
  </div>

  <div>
    <h3 class="mb-4">bob's diff vs. base</h3>
    <div class="flex flex-col gap-2">
      <div class="h-10 flex items-center font-mono opacity-60">&nbsp;A</div>
      <Line id="x" kind="bob">X</Line>
      <div class="h-10 flex items-center font-mono opacity-60">&nbsp;B</div>
    </div>
  </div>

  <div class="max-w-xs mt-14">

To Git, a line is just its text. Bob's change says: put `X` after an `A` and before a `B`.

The first place that matches is at the top.

  </div>
</div>

---

# Git: merging text

<div class="flex gap-20 mt-10 items-start">
  <div>
    <h3 class="mb-4">merged</h3>
    <div class="flex flex-col gap-2">
      <Line id="a2">A</Line>
      <Line id="x" kind="bob">X</Line>
      <Line id="b2">B</Line>
      <Line id="g">G</Line>
      <Line id="a1">A</Line>
      <Line id="b1">B</Line>
    </div>
  </div>

  <div class="max-w-xs mt-14">

`X` ended up between **Alice's** new lines, not the originals.

<span class="text-red-400">No conflict, no warning.</span>

  </div>
</div>

---

# Pijul: merging changes

<div class="flex gap-20 mt-10 items-start">
  <div>
    <h3 class="mb-4">alice</h3>
    <div class="flex flex-col gap-2">
      <Line id="a2" kind="alice" tag="2">A</Line>
      <Line id="b2" kind="alice" tag="2">B</Line>
      <Line id="g" kind="alice">G</Line>
      <Line id="a1" kind="base" tag="1">A</Line>
      <Line id="b1" kind="base" tag="1">B</Line>
    </div>
  </div>

  <div>
    <h3 class="mb-4">bob's change vs. base</h3>
    <div class="flex flex-col gap-2">
      <div class="h-10 flex items-center font-mono text-teal-400">after A<sub>1</sub></div>
      <Line id="x" kind="bob">X</Line>
      <div class="h-10 flex items-center font-mono text-teal-400">before B<sub>1</sub></div>
    </div>
  </div>

  <div class="max-w-xs mt-14">

In Pijul, every line has an identity. Bob's change points to the **original** `A` and `B`, not to any line with that text.

  </div>
</div>

---

# Pijul: merging changes

<div class="flex gap-20 mt-10 items-start">
  <div>
    <h3 class="mb-4">merged</h3>
    <div class="flex flex-col gap-2">
      <Line id="a2" kind="alice" tag="2">A</Line>
      <Line id="b2" kind="alice" tag="2">B</Line>
      <Line id="g" kind="alice">G</Line>
      <Line id="a1" kind="base" tag="1">A</Line>
      <Line id="x" kind="bob">X</Line>
      <Line id="b1" kind="base" tag="1">B</Line>
    </div>
  </div>

  <div class="max-w-xs mt-14">

`X` lands between the original `A` and `B`, where Bob put it.

<span class="text-green-400">The order between lines is always kept.</span>
If it can't be known, Pijul reports a conflict.

  </div>
</div>

---

# Side by side

<div class="flex gap-20 mt-10 items-start">
  <div>
    <h3 class="mb-4">git</h3>
    <div class="flex flex-col gap-2">
      <Line>A</Line>
      <Line kind="bob">X</Line>
      <Line>B</Line>
      <Line>G</Line>
      <Line>A</Line>
      <Line>B</Line>
    </div>
  </div>

  <div>
    <h3 class="mb-4">pijul</h3>
    <div class="flex flex-col gap-2">
      <Line id="a2" kind="alice">A</Line>
      <Line id="b2" kind="alice">B</Line>
      <Line id="g" kind="alice">G</Line>
      <Line id="a1" kind="base">A</Line>
      <Line id="x" kind="bob">X</Line>
      <Line id="b1" kind="base">B</Line>
    </div>
  </div>

  <div class="max-w-xs mt-14">

Git's 3-way merge matches **text**.
Pijul's merge follows **line identity**.

  </div>
</div>
