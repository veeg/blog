<script setup lang="ts">
// Slidev port of website/static/merge-demo.js: the "no silent corruption" example
// from pijul.org, told as commits on two branches that are merged into trunk, one
// step per click. Pass the slide's `$clicks` as `step`. The captions from the blog
// post live in the slide's speaker notes instead.
// Each line keeps its element between steps, so a line that moves slides to its
// new place instead of jumping.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ step: number }>()

// key: [text, who wrote it, identity tag]. A key is one element on screen, so a
// line that appears in two columns at once needs a key per column.
const LINES: Record<string, [string, string, string?]> = {
  'base-a': ['A', 'base'], 'base-b': ['B', 'base'],
  'first-g': ['G', 'alice'], 'first-a': ['A', 'base'], 'first-b': ['B', 'base'],
  'a1': ['A', 'base', '1'], 'b1': ['B', 'base', '1'],
  'a2': ['A', 'alice', '2'], 'b2': ['B', 'alice', '2'], 'g': ['G', 'alice'],
  'bob-a': ['A', 'base'], 'x': ['X', 'bob'], 'bob-b': ['B', 'base'],
  // trunk after Alice's branch is merged
  'ta1': ['A', 'base', '1'], 'tb1': ['B', 'base', '1'],
  'ta2': ['A', 'alice', '2'], 'tb2': ['B', 'alice', '2'], 'tg': ['G', 'alice'],
  // Bob's change, as Git and Pijul see it
  'git-a': ['A', 'context'], 'git-b': ['B', 'context'],
  'pijul-a': ['after A', 'context', '1'], 'pijul-b': ['before B', 'context', '1'],
  // trunk after Bob's branch is merged
  'ma1': ['A', 'base', '1'], 'mb1': ['B', 'base', '1'],
  'ma2': ['A', 'alice', '2'], 'mb2': ['B', 'alice', '2'], 'mg': ['G', 'alice'], 'mx': ['X', 'bob'],
}

// A column is the file at one commit. `commit` places it in the commit graph
// above the columns: `lane` 0 is trunk, 1 is Alice's branch and 2 is Bob's.
// `parents` are the columns it was made from; two parents make a merge commit.
interface Column {
  title: string
  note: string
  lines: string[]
  commit: { kind: string, lane: number, parents?: number[] }
}
type Look = 'setup' | 'git' | 'pijul'

const trunk: Column = { title: 'trunk', note: 'A, B', lines: ['base-a', 'base-b'],
  commit: { kind: 'base', lane: 0 } }
const aliceFirst: Column = { title: 'alice', note: 'add G', lines: ['first-g', 'first-a', 'first-b'],
  commit: { kind: 'alice', lane: 1, parents: [0] } }
const aliceSecond: Column = { title: 'alice', note: 'add A, B', lines: ['a2', 'b2', 'g', 'a1', 'b1'],
  commit: { kind: 'alice', lane: 1, parents: [1] } }
const bob: Column = { title: 'bob', note: 'insert X', lines: ['bob-a', 'x', 'bob-b'],
  commit: { kind: 'bob', lane: 2, parents: [0] } }
const aliceMerged = ['ta2', 'tb2', 'tg', 'ta1', 'tb1']

// In the merge steps, trunk moves on to Alice's merge, while Bob's branch still
// starts from the original trunk: he never sees her changes.
const trunkAfterAlice: Column = { title: 'trunk', note: 'merge alice', lines: aliceMerged,
  commit: { kind: 'merge', lane: 0, parents: [0] } }
function bobChange(look: Look): Column {
  const lines = look === 'git' ? ['git-a', 'x', 'git-b'] : ['pijul-a', 'x', 'pijul-b']
  return { title: 'bob', note: 'his change', lines, commit: { kind: 'bob', lane: 2, parents: [0] } }
}

// look: "setup" colours lines by author, "git" only shows text, "pijul" adds identities.
const STEPS: { look: Look, columns: Column[] }[] = [
  { look: 'setup', columns: [trunk] },
  { look: 'setup', columns: [trunk, aliceFirst] },
  { look: 'setup', columns: [trunk, aliceFirst, aliceSecond] },
  { look: 'setup', columns: [trunk, aliceFirst, aliceSecond, bob] },
  { look: 'setup', columns: [trunk, aliceFirst, aliceSecond, bob,
    { title: 'trunk', note: 'merge alice', lines: aliceMerged, commit: { kind: 'merge', lane: 0, parents: [0, 2] } }] },
  { look: 'git', columns: [trunk, trunkAfterAlice, bobChange('git')] },
  { look: 'git', columns: [trunk, trunkAfterAlice, bobChange('git'),
    { title: 'trunk', note: 'git merge', lines: ['ma2', 'mx', 'mb2', 'mg', 'ma1', 'mb1'],
      commit: { kind: 'merge', lane: 0, parents: [1, 2] } }] },
  { look: 'pijul', columns: [trunk, trunkAfterAlice, bobChange('pijul')] },
  { look: 'pijul', columns: [trunk, trunkAfterAlice, bobChange('pijul'),
    { title: 'trunk', note: 'pijul merge', lines: ['ma2', 'mb2', 'mg', 'ma1', 'mx', 'mb1'],
      commit: { kind: 'merge', lane: 0, parents: [1, 2] } }] },
]

const SVG = 'http://www.w3.org/2000/svg'
const stage = ref<HTMLDivElement>()
const elements: Record<string, HTMLSpanElement> = {}
let graph: SVGSVGElement | null = null
let shown = 0
let observer: ResizeObserver | undefined

function clampStep(step: number) {
  return Math.min(Math.max(step, 0), STEPS.length - 1)
}

// Slidev scales the whole slide with a CSS transform, while the measurements
// below come back in screen pixels. Divide by this to get slide pixels.
function scaleOf(el: HTMLElement) {
  return el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1
}

function lineElement(key: string, look: Look) {
  const line = LINES[key]
  let el = elements[key]
  if (!el) {
    el = elements[key] = document.createElement('span')
    el.textContent = line[0]
    if (line[2]) {
      const tag = document.createElement('sub')
      tag.textContent = line[2]
      el.appendChild(tag)
    }
  }
  let kind = line[1]
  if (look === 'git' && kind !== 'bob' && kind !== 'context') kind = 'plain'
  el.className = `merge-demo-line is-${kind}`
  el.classList.toggle('show-tag', look === 'pijul')
  return el
}

// Draws the edges between commit nodes. Called after layout, since the
// edges follow wherever the columns ended up.
function drawGraph(columns: Column[]) {
  const root = stage.value!
  graph?.remove()
  graph = null
  const nodes = root.querySelectorAll<HTMLElement>('.merge-demo-node')
  if (!nodes.length || !root.offsetWidth) return

  graph = document.createElementNS(SVG, 'svg')
  graph.setAttribute('class', 'merge-demo-graph')
  graph.setAttribute('aria-hidden', 'true')
  root.prepend(graph)
  const origin = root.getBoundingClientRect()
  const scale = scaleOf(root)
  const centre = (node: HTMLElement) => {
    const r = node.getBoundingClientRect()
    return {
      x: Math.round((r.left + r.width / 2 - origin.left) / scale),
      y: Math.round((r.top + r.height / 2 - origin.top) / scale),
    }
  }

  columns.forEach((column, i) => {
    const commit = column.commit
    commit.parents?.forEach((parent) => {
      const from = centre(nodes[parent])
      const to = centre(nodes[i])
      const bend = Math.abs(to.y - from.y)
      let d
      if (from.y === to.y) {
        // Same lane: a straight line.
        d = `M${from.x} ${from.y} L${to.x} ${to.y}`
      }
      else if (to.y > from.y) {
        // Branching off: drop down from the parent, then run along the new lane.
        d = `M${from.x} ${from.y} Q${from.x} ${to.y} ${from.x + bend} ${to.y} L${to.x} ${to.y}`
      }
      else {
        // Merging back: run along the branch's lane, then rise into the merge commit.
        d = `M${from.x} ${from.y} L${to.x - bend} ${from.y} Q${to.x} ${from.y} ${to.x} ${to.y}`
      }
      // An edge takes the colour of the branch it belongs to: the new branch when
      // branching off, the branch being merged in when merging.
      const kind = commit.kind === 'merge' ? columns[parent].commit.kind : commit.kind
      const path = document.createElementNS(SVG, 'path')
      path.setAttribute('d', d)
      path.setAttribute('class', `is-${kind === 'merge' ? 'base' : kind}`)
      graph!.appendChild(path)
    })
  })
}

function render(index: number, animate: boolean) {
  const root = stage.value!
  const step = STEPS[index]
  const scale = scaleOf(root)
  const before: Record<string, { rect: DOMRect, color: string }> = {}
  for (const [key, el] of Object.entries(elements))
    before[key] = { rect: el.getBoundingClientRect(), color: getComputedStyle(el).backgroundColor }
  const hadGraph = !!graph

  root.textContent = ''
  graph = null
  const used = new Set<string>()
  for (const column of step.columns) {
    const col = document.createElement('div')
    col.className = 'merge-demo-column'
    const lane = document.createElement('div')
    lane.className = 'merge-demo-lanes'
    const node = document.createElement('span')
    node.className = `merge-demo-node is-${column.commit.kind} lane-${column.commit.lane}`
    lane.appendChild(node)
    col.appendChild(lane)

    const title = document.createElement('div')
    title.className = 'merge-demo-title'
    const name = document.createElement('span')
    name.textContent = column.title
    name.className = `is-${column.commit.kind}`
    title.appendChild(name)
    title.appendChild(document.createElement('br'))
    title.appendChild(document.createTextNode(column.note))
    col.appendChild(title)

    const file = document.createElement('div')
    file.className = 'merge-demo-file'
    const fileName = document.createElement('span')
    fileName.className = 'merge-demo-file-name'
    fileName.textContent = 'file.txt'
    file.appendChild(fileName)
    for (const key of column.lines) {
      file.appendChild(lineElement(key, step.look))
      used.add(key)
    }
    col.appendChild(file)
    root.appendChild(col)
  }
  for (const key of Object.keys(elements)) {
    if (!used.has(key))
      delete elements[key]
  }
  drawGraph(step.columns)

  const last = shown
  shown = index
  if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches)
    return
  const appear = (el: Element) => {
    el.animate([{ opacity: 0, transform: 'scale(0.8)' }, { opacity: 1, transform: 'none' }],
      { duration: 300, delay: 200, easing: 'ease-out', fill: 'backwards' })
  }
  for (const key of used) {
    const el = elements[key]
    const old = before[key]
    if (!old) {
      appear(el)
      continue
    }
    const now = el.getBoundingClientRect()
    const dx = (old.rect.left - now.left) / scale
    const dy = (old.rect.top - now.top) / scale
    el.animate([
      { transform: `translate(${dx}px, ${dy}px)`, backgroundColor: old.color },
      { transform: 'none', backgroundColor: getComputedStyle(el).backgroundColor },
    ], { duration: 500, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' })
  }
  // The graph is redrawn each step, so only the newest node and edge animate in.
  if (graph) {
    const nodes = root.querySelectorAll('.merge-demo-node')
    if (!hadGraph) {
      graph.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 200, fill: 'backwards' })
      nodes.forEach(appear)
    }
    else if (index > last) {
      appear(nodes[nodes.length - 1])
      graph.lastElementChild?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 200, fill: 'backwards' })
    }
  }
}

onMounted(() => {
  render(clampStep(props.step), false)
  // Columns shift when the slide resizes, or is laid out for the first time
  // after being hidden, so redraw the edges to match.
  observer = new ResizeObserver(() => drawGraph(STEPS[shown].columns))
  observer.observe(stage.value!)
})
onBeforeUnmount(() => observer?.disconnect())
watch(() => clampStep(props.step), index => render(index, true))
</script>

<template>
  <div ref="stage" class="merge-demo" />
</template>

<style>
/* Not scoped: the stage's contents are created by the script above. */
.merge-demo {
  --merge-plain: #6b7280;
  --merge-base: #0f766e;
  --merge-alice: #c2410c;
  --merge-bob: #7e22ce;
  --merge-muted: #6f6a62;
  --merge-border: #d6cfc0;
  --merge-bg: #fbf8f1;
  position: relative;
  display: flex;
  justify-content: center;
  gap: 2rem;
  /* Tall enough for the longest file, so nothing jumps between clicks. */
  min-height: 24rem;
}
html.dark .merge-demo {
  --merge-base: #14a396;
  --merge-alice: #ea6a2b;
  --merge-bob: #a855f7;
  --merge-muted: #8d8a83;
  --merge-border: #3a3f45;
  --merge-bg: #15181b;
}
.merge-demo-column { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; min-width: 0; }
.merge-demo-title { min-height: 2.8em; color: var(--merge-muted); font-size: 0.85rem; line-height: 1.3; text-align: center; white-space: nowrap; }
.merge-demo-title > span { font-weight: 700; }
.merge-demo-title > .is-base,
.merge-demo-title > .is-merge { color: var(--merge-base); }
.merge-demo-title > .is-alice { color: var(--merge-alice); }
.merge-demo-title > .is-bob { color: var(--merge-bob); }

/* Commit graph: a node above each column, on one of three lanes (trunk, alice, bob), joined by SVG edges drawn behind them. */
.merge-demo-lanes { position: relative; width: 100%; height: 3.6rem; }
.merge-demo-node {
  position: absolute;
  left: 50%;
  z-index: 1;
  width: 0.9rem;
  height: 0.9rem;
  margin-left: -0.45rem;
  border-radius: 50%;
}
.merge-demo-node.lane-0 { top: 0.2rem; }
.merge-demo-node.lane-1 { top: 1.4rem; }
.merge-demo-node.lane-2 { top: 2.6rem; }
.merge-demo-node.is-base { background: var(--merge-base); }
.merge-demo-node.is-alice { background: var(--merge-alice); }
.merge-demo-node.is-bob { background: var(--merge-bob); }
/* A merge commit: a ring, so it stands out from ordinary commits on trunk. */
.merge-demo-node.is-merge { border: 3px solid var(--merge-base); background: var(--merge-bg); }
.merge-demo-graph { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.merge-demo-graph path { fill: none; stroke-width: 2.5; }
.merge-demo-graph .is-alice { stroke: var(--merge-alice); }
.merge-demo-graph .is-bob { stroke: var(--merge-bob); }
.merge-demo-graph .is-base { stroke: var(--merge-base); }
.merge-demo-line {
  display: grid;
  place-items: center;
  grid-auto-flow: column;
  min-width: 3rem;
  height: 2.3rem;
  padding: 0 0.5rem;
  border-radius: 4px;
  color: #fff;
  font-family: var(--slidev-code-font-family, monospace);
  font-weight: 700;
  font-size: 1rem;
}
.merge-demo-line sub { display: none; font-size: 0.65em; opacity: 0.85; }
.merge-demo-line.show-tag sub { display: inline; }
.merge-demo-line.is-plain { background: var(--merge-plain); }
.merge-demo-line.is-base { background: var(--merge-base); }
.merge-demo-line.is-alice { background: var(--merge-alice); }
.merge-demo-line.is-bob { background: var(--merge-bob); }
.merge-demo-line.is-context { color: var(--merge-muted); font-weight: 400; }
/* Each column's lines sit in a card titled after the file, so it reads as the file at that commit. */
.merge-demo-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.45rem 0.45rem;
  border: 1px solid var(--merge-border);
  border-radius: 4px;
  background: var(--merge-bg);
}
.merge-demo-file-name { color: var(--merge-muted); font-family: var(--slidev-code-font-family, monospace); font-size: 0.7rem; }
</style>
