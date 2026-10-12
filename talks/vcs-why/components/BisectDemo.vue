<script setup lang="ts">
// Slidev port of website/static/bisect-demo.js: one git bisect session, one step
// per click. Pass the slide's `$clicks` as `step`. The captions from the blog post
// live in the slide's speaker notes instead.
// The commit row is rendered once and only its classes change between steps, so
// the HEAD marker and the suspect bracket slide instead of jumping.
import { computed } from 'vue'

const props = defineProps<{ step: number }>()

// Oldest first. Index 0 is tagged v1.0, the last one is trunk.
const COMMITS = [
  ['a418da3', 'chore: release 1.0'],
  ['a3ee685', 'feat(cart): add discount code model'],
  ['7263b9a', 'feat(cart): apply discount codes to the order total'],
  ['ef57b98', 'test(cart): cover expired and unknown discount codes'],
  ['b01c0c4', 'docs(cart): document the discount code API'],
  ['3359cd6', 'build: bump http client to 4.2'],
  ['d78b9cc', 'feat(ui): add dark mode toggle'],
  ['4f78577', 'perf(cart): cache product prices'],
  ['73fbb96', 'refactor: rename config keys'],
  ['ced8b7b', 'fix(auth): trim whitespace in usernames'],
  ['e4280cf', 'perf(ui): lazy-load avatars'],
  ['ef64843', 'fix(cart): recalculate total when quantity changes'],
  ['28e4e6b', 'perf(ui): inline small icons'],
  ['6bad2b8', 'feat: add audit log'],
  ['69fba68', 'fix(ui): typo in footer'],
  ['271bdf7', 'perf: speed up search index'],
  ['1dcb548', 'chore: update copyright year'],
]
const TAGS: Record<number, string> = { 0: 'v1.0', 16: 'trunk' }

type Mark = 'good' | 'bad' | 'skip'
interface Step {
  range: [number, number] | null
  marks: Record<number, Mark>
  head: number
  culprit?: number
  term: string[]
}

const PASS = '✓ total 90.00 with a 10% discount code'
const FAIL = '✗ total 81.00, expected 90.00'
const KNOWN: Record<number, Mark> = { 0: 'good', 16: 'bad' }
const STEPS: Step[] = [
  { range: null, marks: { 16: 'bad' }, head: 16,
    term: ['$ ./repro.sh', FAIL] },
  { range: null, marks: KNOWN, head: 0,
    term: ['$ git checkout v1.0', '$ ./repro.sh', PASS] },
  { range: null, marks: KNOWN, head: 0,
    term: ['$ git checkout a3ee685 && ./repro.sh', '$ git checkout 7263b9a && ./repro.sh', '$ git checkout ef57b98 && ./repro.sh',
      '# ...and so on, up to 15 times'] },
  { range: [1, 16], marks: KNOWN, head: 8,
    term: ['$ git switch trunk', '$ git bisect start', '$ git bisect bad', '$ git bisect good v1.0',
      'Bisecting: 7 revisions left to test after this (roughly 3 steps)',
      '[73fbb960f08eaa25962b0f10ba13e903bfc56bee] refactor: rename config keys'] },
  { range: [9, 16], marks: { 0: 'good', 8: 'good', 16: 'bad' }, head: 12,
    term: ['$ ./repro.sh', PASS, '$ git bisect good',
      'Bisecting: 3 revisions left to test after this (roughly 2 steps)',
      '[28e4e6b7c135267e45117184a91c240f908a757e] perf(ui): inline small icons'] },
  { range: [9, 16], marks: { 0: 'good', 8: 'good', 12: 'skip', 16: 'bad' }, head: 13,
    term: ['$ ./repro.sh', '✗ build failed: icons.css: unexpected end of file', '$ git bisect skip',
      'Bisecting: 3 revisions left to test after this (roughly 2 steps)',
      '[6bad2b8e1f4c03a9d7e25b1c8a6f0d93e4b27c51] feat: add audit log'] },
  { range: [9, 13], marks: { 0: 'good', 8: 'good', 12: 'skip', 13: 'bad', 16: 'bad' }, head: 10,
    term: ['$ ./repro.sh', FAIL, '$ git bisect bad',
      'Bisecting: 1 revision left to test after this (roughly 1 step)',
      '[e4280cff758afad818878e323bea112fbd0c3931] perf(ui): lazy-load avatars'] },
  { range: [11, 13], marks: { 0: 'good', 8: 'good', 10: 'good', 12: 'skip', 13: 'bad', 16: 'bad' }, head: 11,
    term: ['$ ./repro.sh', PASS, '$ git bisect good',
      'Bisecting: 0 revisions left to test after this (roughly 0 steps)',
      '[ef6484397106e2b36d1879f7a56a667ab7957f87] fix(cart): recalculate total when quantity changes'] },
  { range: [11, 11], marks: { 0: 'good', 8: 'good', 10: 'good', 11: 'bad', 12: 'skip', 13: 'bad', 16: 'bad' }, head: 11, culprit: 11,
    term: ['$ ./repro.sh', FAIL, '$ git bisect bad',
      'ef6484397106e2b36d1879f7a56a667ab7957f87 is the first bad commit',
      'commit ef6484397106e2b36d1879f7a56a667ab7957f87', '    fix(cart): recalculate total when quantity changes'] },
  { range: [11, 11], marks: { 0: 'good', 8: 'good', 10: 'good', 11: 'bad', 12: 'skip', 13: 'bad', 16: 'bad' }, head: 16, culprit: 11,
    term: ['$ git bisect reset', 'Previous HEAD position was ef64843 fix(cart): recalculate total when quantity changes', "Switched to branch 'trunk'"] },
]

const GLYPHS: Record<Mark, string> = { good: '✓', bad: '✗', skip: '?' }

const current = computed(() => STEPS[Math.min(Math.max(props.step, 0), STEPS.length - 1)])

function state(i: number) {
  const { marks, range, culprit } = current.value
  if (i === culprit) return 'culprit'
  if (marks[i]) return marks[i]
  return !range || (i >= range[0] && i <= range[1]) ? 'suspect' : 'cleared'
}

// Places an element over commits first..last, as a share of the row width.
function span(first: number, last: number) {
  return {
    left: `${(first / COMMITS.length) * 100}%`,
    width: `${((last - first + 1) / COMMITS.length) * 100}%`,
  }
}

const headMark = computed(() => current.value.marks[current.value.head])

function lineKind(line: string) {
  return line.startsWith('$') ? 'is-cmd' : line.startsWith('#') ? 'is-comment' : 'is-out'
}
</script>

<template>
  <figure class="bisect">
    <div class="track">
      <div class="head" :style="span(current.head, current.head)"><span>HEAD</span></div>
      <div class="row">
        <div v-for="(commit, i) in COMMITS" :key="commit[0]" class="cell">
          <span class="commit" :class="`is-${state(i)}`" :title="`${commit[0]} ${commit[1]}`">
            {{ current.marks[i] ? GLYPHS[current.marks[i]] : '' }}
          </span>
          <span v-if="TAGS[i]" class="tag">{{ TAGS[i] }}</span>
        </div>
      </div>
      <div v-show="current.range" class="bracket" :style="current.range ? span(...current.range) : undefined">
        <span class="suspects">
          {{ current.culprit !== undefined ? 'first bad commit' : current.range && `${current.range[1] - current.range[0] + 1} suspects` }}
        </span>
      </div>
    </div>

    <p class="checkout">
      <span class="label">checked out</span>
      <code>{{ COMMITS[current.head][0] }}</code> {{ COMMITS[current.head][1] }}
      <span v-if="headMark" class="result" :class="`is-${headMark}`">{{ GLYPHS[headMark] }} {{ headMark }}</span>
    </p>

    <pre class="term"><template v-for="(line, i) in current.term" :key="i"><span :class="lineKind(line)">{{ line }}</span>
</template></pre>
  </figure>
</template>

<style scoped>
.bisect {
  --good: #0b7a0b;
  --bad: #c62f2f;
  --accent: #1d6f66;
  --muted: #6f6a62;
  --border: #d6cfc0;
  --surface: #f1ece1;
  --code-bg: #f6f2ea;
  margin: 0;
}
:global(html.dark) .bisect {
  --good: #2fae2f;
  --bad: #e06060;
  --accent: #6fc2b8;
  --muted: #8d8a83;
  --border: #3a3f45;
  --surface: #1b1e22;
  --code-bg: #15181b;
}

/* The commit row: one equal-width cell per commit, so the HEAD marker and the
 * suspect bracket can be placed by percentage and slide between steps. */
.track { position: relative; padding: 1.9rem 0 2.4rem; }
.row { position: relative; display: grid; grid-template-columns: repeat(17, 1fr); }
.row::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 2%;
  right: 2%;
  border-top: 2px solid var(--border);
}
.cell { position: relative; display: flex; justify-content: center; }
.commit {
  position: relative;
  display: grid;
  place-items: center;
  width: 1.6rem;
  aspect-ratio: 1;
  border: 2px solid var(--muted);
  border-radius: 50%;
  background: var(--surface);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
  transition: background-color 0.3s, border-color 0.3s, opacity 0.3s, box-shadow 0.3s;
}
.commit.is-cleared { border-color: var(--border); background: var(--border); opacity: 0.6; }
.commit.is-good { border-color: var(--good); background: var(--good); }
.commit.is-bad { border-color: var(--bad); background: var(--bad); }
.commit.is-skip { border-color: var(--muted); background: var(--muted); }
.commit.is-culprit {
  border-color: var(--bad);
  background: var(--bad);
  box-shadow: 0 0 0 3px var(--surface), 0 0 0 5px var(--bad);
}
.tag {
  position: absolute;
  top: 100%;
  margin-top: 0.3rem;
  color: var(--muted);
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 0.75rem;
  white-space: nowrap;
}
.head,
.bracket { position: absolute; transition: left 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.45s cubic-bezier(0.2, 0.8, 0.2, 1); }
.head { top: 0; display: flex; justify-content: center; }
.head span {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--accent);
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}
.head span::after { content: "▾"; line-height: 1; }
/* Sits below the tags, as a line with end ticks over the suspects. */
.bracket {
  bottom: 0;
  height: 0.5rem;
  border: 2px solid var(--accent);
  border-top: 0;
  border-radius: 0 0 4px 4px;
}
.suspects {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.15rem;
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.checkout { margin: 1.6rem 0 0.6rem; font-size: 0.95rem; text-align: center; }
.label {
  margin-right: 0.5rem;
  color: var(--muted);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.result { margin-left: 0.6rem; font-weight: 700; }
.result.is-good { color: var(--good); }
.result.is-bad { color: var(--bad); }
.result.is-skip { color: var(--muted); }

/* Tall enough for the longest step, so nothing jumps between clicks. */
.term {
  min-height: 10.5rem;
  margin: 0;
  padding: 0.7rem 0.9rem;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--code-bg);
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 0.75rem;
  line-height: 1.6;
}
.term .is-cmd { font-weight: 700; }
.term .is-comment { color: var(--muted); }
</style>
