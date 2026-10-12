# Talks

Slidev decks, one per folder: `talks/<name>/slides.md`, with its own `components/` and `public/`.
They share the dependencies in this folder.

```sh
npm install
npm run dev -- git-lecture/slides.md      # live preview at http://localhost:3030 (presenter: /presenter)
npm run export -- git-lecture/slides.md   # PDF (requires playwright-chromium)
```

## Publishing

A talk is built to `veeg.dev/talks/<name>/` and listed on the homepage only when its
headmatter says so:

```yaml
title: Version Control Systems
info: Why We do What We Do    # the description
publish: true
date: 2026-10-14
routerMode: hash              # required: GitHub Pages can't serve /talks/<name>/3 on reload
```

`npm run build` builds the slides into `website/static/talks/<name>/` and writes
`website/content/talks.json`, which the homepage reads. Both are generated and git-ignored.

To see it all locally:

```sh
npm run build
cd ../website && zola serve     # http://127.0.0.1:1111
```

Re-run `npm run build` after editing a talk (`npm run index` if only the headmatter changed).
