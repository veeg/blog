// Publishes talks to the blog. A talk is talks/<name>/slides.md, and it is only
// picked up when its headmatter has `publish: true`.
//
//   node publish.mjs index    Write website/content/talks.json, which the homepage
//                             reads to list the talks. It lives in content/ because
//                             `zola serve` re-renders pages when content changes, but
//                             only copies changed static files.
//   node publish.mjs slides   Build each talk to website/static/talks/<name>/,
//                             served at /talks/<name>/.
//
// Both outputs are generated and git-ignored. Run them before `zola build` or
// `zola serve`.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const talksDir = dirname(fileURLToPath(import.meta.url));
const website = join(talksDir, "..", "website");
const indexFile = join(website, "content", "talks.json");
const outDir = join(website, "static", "talks");

function fail(message) {
  console.error(`publish: ${message}`);
  process.exit(1);
}

function headmatter(file) {
  const match = readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return (match && parse(match[1])) || {};
}

function publishedTalks() {
  const talks = readdirSync(talksDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(talksDir, entry.name, "slides.md")))
    .map((entry) => {
      const slides = join(talksDir, entry.name, "slides.md");
      return { name: entry.name, slides, meta: headmatter(slides) };
    })
    .filter((talk) => talk.meta.publish === true);

  for (const { name, meta } of talks) {
    if (typeof meta.title !== "string") fail(`${name}: published talks need a \`title\``);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(meta.date))) fail(`${name}: published talks need a \`date: YYYY-MM-DD\``);
    // History-mode URLs 404 on reload, since GitHub Pages has no single-page-app fallback.
    if (meta.routerMode !== "hash") fail(`${name}: published talks need \`routerMode: hash\``);
  }
  // Newest first, like the posts.
  return talks.sort((a, b) => String(b.meta.date).localeCompare(String(a.meta.date)));
}

function writeIndex(talks) {
  const index = talks.map(({ name, meta }) => ({
    title: meta.title,
    date: String(meta.date),
    description: meta.info ? String(meta.info).trim() : "",
    url: `/talks/${name}/`,
  }));
  writeFileSync(indexFile, JSON.stringify(index, null, 2) + "\n");
  console.log(`publish: listed ${talks.length} talk(s) in ${indexFile}`);
}

function buildSlides(talks) {
  // Generated in full, so start clean to drop unpublished talks and stale assets.
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const slidev = join(talksDir, "node_modules", ".bin", "slidev");
  for (const { name, slides } of talks) {
    const result = spawnSync(slidev, ["build", slides, "--base", `/talks/${name}/`, "--out", join(outDir, name)], {
      cwd: talksDir,
      stdio: "inherit",
    });
    if (result.status !== 0) fail(`${name}: slidev build failed`);
  }
  console.log(`publish: built ${talks.length} talk(s) into ${outDir}`);
}

const modes = process.argv.slice(2);
if (!modes.length || modes.some((mode) => mode !== "index" && mode !== "slides")) {
  fail("usage: node publish.mjs [index] [slides]");
}
const talks = publishedTalks();
if (modes.includes("slides")) buildSlides(talks);
if (modes.includes("index")) writeIndex(talks);
