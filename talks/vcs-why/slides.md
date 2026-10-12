---
theme: default
title: Version Control Systems
info: |
  Why We do What We Do
# Listed on veeg.dev and built to /talks/git-lecture/ only when true.
publish: true
date: 2026-10-14
# Hash URLs (/talks/git-lecture/#/3) keep working on reload; GitHub Pages has no SPA fallback.
routerMode: hash
colorSchema: light
transition: view-transition
mdc: true
layout: cover
---

# {{ $slidev.configs.title }}

Why We do What We Do

<div class="pt-8 opacity-60">{{ new Date($slidev.configs.date).toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' }) }}</div>
<div class="opacity-60">Vegard Sandengen</div>

<!--
An opinionated walk through of version control systems, and how to use them.
Mostly Git, with some honorable mentions on how we got to today's workflow, and where it might go next.

- Last time in StoreAud - advanced distributed systems - 2014.
-->

---

# About Me

- Graduated from UiT with Masters' in 2015
- Worked for the majority of my career in the space industry
  - Currently at Kongsberg Satellite Services
- Rustacean

---
layout: section
---

# History

---

# 1972 → 2005

<div class="grid grid-cols-[6rem_1fr] gap-y-3 mt-8 text-xl">

<div v-click="1" class="font-mono opacity-60">1972</div><div v-click="1"><b>SCCS</b> · lock the file</div>
<div v-click="2" class="font-mono opacity-60">1982</div><div v-click="2"><b>RCS</b> · still local</div>
<div v-click="3" class="font-mono opacity-60">1990s</div><div v-click="3"><b>CVS</b> · <b>Subversion</b> · <b>TFS</b> · client-server</div>
<div v-click="4" class="font-mono opacity-60">2002</div><div v-click="4"><b>BitKeeper</b> · Linux kernel</div>
<div v-click="5" class="font-mono opacity-60">2005</div><div v-click="5"><b>Git</b> · <b>Mercurial</b></div>

</div>

<!--
[click] 1972: SCCS, Source Code Control System. The first VCS purpose-built for source code. IBM 370 first, then PDP-11 on Unix a year later.
Purely local. No server, no network. The history of each file lives next to it on a single shared machine everyone logs into.
To change a file, you lock it. Nobody else touches it until you're done. A coordinated dance of who has which files locked.

[click] 1982: RCS, Revision Control System. Same premise, still local.

[click] CVS started as scripts on top of RCS, and dropped the locking. Everyone edits their own copy; conflicts merged on check-in. Mid-90s it got client-server support: share a server, not a machine.
Subversion set out to be a better CVS. Same model. Still widely used in enterprise.

Microsoft's Team Foundation Server: server workspaces (read-only until checked out, lockable — the old days)
and local workspaces (CVS style).

All of these are centralized: one server holds the one true history. You need it to commit, branch and resolve conflicts.

[click] Distributed VCS existed in already in the 90s (Sun's TeamWare), but caught on after 2000. BitKeeper, by Larry McVoy (who also designed TeamWare), mattered because the Linux kernel used it 2002–2005.
The free license was revoked...

[click] ...and multiple alternatives were built at the same time. Mercurial is still around. Git won the adoption race.
-->

---
layout: section
---

# Centralized Distributed Version Control

<!--
Git gave us distributed version control. But we often still want one canonical truth.
You can host your own: git itself and the Linux kernel do, on git.kernel.org. With thousands of derivatives built on top.
Most people don't want to run that infrastructure.
-->

---

# SourceForge, 2008

<img src="./images/sourceforge_project_capture_anno_2008.png" class="h-95 mx-auto rounded shadow" />

<!--
SourceForge launched in 1999: software discovery plus hosting for a range of client-server VCS.
For a decade, "download it from SourceForge" was how you got open source software.

It was a cluttered mess. Git support only arrived in 2009, as one choice among many.

From 2008, a newcomer called GitHub innovated on the social side of coding: forks, pull requests, contributor profiles. Clean, and built for developers.
By 2011 GitHub had passed SourceForge and Google Code in activity.
-->

---

# **Git**Hub

<v-clicks>

- 2010: SVN support <span class="hint">yes, a Git host serving Subversion</span>
- 2024: SVN sunset <span class="hint">fourteen years later</span>
- 225M developers · 800M repos · 90% of Fortune 100 <span class="hint">a new developer every second</span>

</v-clicks>

<!--
GitHub is the de facto open source hub. It dethroned SourceForge before there were alternatives.

[click] Fun fact: in its quest for mainstream adoption, GitHub announced Subversion support on April 1. 2010. (github.blog/2010-04-01-announcing-svn-support — yes, April 1st, but it was real.)

[click] Sunset in 2024.

[click] Today, per their about page: 225M+ developers, 4M organizations, 800M repositories. Eightfold growth in developers in under a decade. A new developer joins every second, according to Octoverse.
-->

---

# 2018: Microsoft buys GitHub

<div class="text-5xl font-bold mt-16 text-center">#movingtogitlab</div>

<div v-click class="text-3xl mt-12 text-center opacity-80">50 000 / 85 000 000 = <span class="text-teal-500">0.06%</span></div>

<!--
Mid 2018. Scarred developers remembered 1990s Microsoft: "embrace, extend, extinguish". They were not quiet.
#movingtogitlab trended on Twitter. GitLab saw 10x its normal daily imports, and leaned into it with heavily discounted plans.
By the end of the following week, over 50,000 projects had moved.

[click] Sounds like an exodus. But GitHub hosted 85 million repositories. 0.06%. It never registered on the Richter scale.

-->

---

# GitHub uptime

<img src="./images/github_historical_uptime_oct_2026.png" class="h-95 mx-auto rounded shadow" />

<!--
Even if the exodus crowd was tiny, they might have been on to something. When Big Tech enters the picture, things get shaken up.
Historic uptime graph, built solely from GitHub's own status page (damrnelson.github.io/github-historical-uptime).

Caveat: the further back we look, the more incomplete the data may be.

-->

---

# Back to centralized

<v-clicks>

- GitHub · GitLab · Bitbucket · Azure DevOps
- Codeberg · SourceHut · Gitea

</v-clicks>

<!--
With all the features around collaborating on software, we've almost removed the distributed nature of our VCS. We depend on the platform.
Exception: Git and the Linux kernel themselves. Still patches over mailing lists. More on that later.
The only thing separating us from the old client-server model: we can pack up and leave, or juggle multiple remotes.

[click] The big ones.
[click] And some alternatives.
-->

---
layout: section
---

# What Even Is Trunk

---

# Delta chain → trunk

<v-clicks>

- 1975: "delta chain" (Rochkind) <span class="hint">the first SCCS paper: no branches yet</span>
- 1977: "trunk" & "branch" (SCCS/PWB manual) <span class="hint">deltas as the nodes of a tree</span>
- 1985: RCS: "A young revision tree is slender" <span class="hint">one branch, called the trunk</span>
- 2020: `init.defaultBranch` <span class="hint">master, main or trunk: your call</span>

</v-clicks>

<!--
Where do "branch" and "trunk" come from?

[click] The original SCCS paper by Marc Rochkind, 1975, talks about "delta chains". No branches.

[click] The SCCS/PWB User's Manual, Bell Labs 1977, on SCCS v4: "It is convenient to conceive of the deltas applied to an SCCS file as the nodes of a tree... Such a structure may be termed the 'trunk'... there are situations in which it is necessary to cause a branching in the tree."
So the terms came from SCCS, after Rochkinds paper announcing SCCS to the wider world, and v4 that are are referencing here..

[click] Walter F. Tichy's RCS paper, 1985: "A young revision tree is slender: It consists of only one branch, called the trunk. As the tree ages, side branches may form."
CVS and Subversion took it from there. Mercurial went with "default". Git with "master".

[click] Git 2.28, 2020, added init.defaultBranch. The default hasn't changed yet, but your config may have.
-->

---

<img src="./images/trunk_and_branches.svg" class="h-110 mx-auto" />

<!--
A nice visual metaphor: a single stem, with branches springing out of it.
-->

---
layout: section
---

# Git Good

---
layout: center
class: text-center
---

# Learn the CLI

<HotTip label="" />

<!--
Hot tip for you

Before we get into the how: invest the time to learn Git on the command line.
I have never really met a GUI-only Git user with a thorough grasp of how Git works.
They are often unable to make the adjustments needed to follow the team's development guidelines: rebasing, splitting commits, fixing up history.

The GUI is fine for simple tasks. The CLI is where you learn the model.

Everything in the rest of this talk is a CLI command.
-->

---

# Streamed Lines, 1998

<div class="grid grid-cols-2 gap-12 mt-8">
<div>

### Patterns

<v-clicks>

- Branch per Task <span class="hint">every change on its own branch</span>
- Codeline per Release <span class="hint">one line per supported version</span>
- Mainline <span class="hint">the line everything returns to</span>
- Merge Early and Often <span class="hint">self-explanatory</span>

</v-clicks>
</div>
<div>

### Pitfalls

<v-clicks>

- Merge-a-phobia <span class="hint">merging is scary, so nobody does</span>
- Branch-a-holic <span class="hint">a branch for everything</span>
- Spaghetti Branching <span class="hint">tangled merges between lines</span>
- Continual Cascading <span class="hint">branches that never come home</span>

</v-clicks>
</div>
</div>

<div class="source">
Appleton, Berczuk, Cabrera &amp; Orenstein. <i>Streamed Lines: Branching Patterns for Parallel Software Development</i>. PLoP '98.
</div>

<!--
Branching strategies are not a Git invention.
"Streamed Lines: Branching Patterns for Parallel Software Development" from 1998.
Reading the catalog of patterns today is uncanny. The patterns we still argue about in PRs were named 25+ years ago.

[click] Branch per Task: each change on its own branch.
[click] Codeline per Release.
[click] Mainline: one primary codeline everything joins back into.
[click] Merge Early and Often. Needs no explanation.

Equally valuable, the traps and pitfalls:
[click] Merge-a-phobia
[click] Branch-a-holic
[click] Spaghetti Branching
[click] Continual Cascading: branches branching off "into a wider and wider project-version-tree without ever 'coming back home to roost'".
-->

---

# Story time: the release matrix

<div class="grid grid-cols-2 gap-4 mt-12 text-xl">
<div v-click>🖥️ server generation</div>
<div v-click>🔌 PCIe card version</div>
<div v-click>🐧 SLES version</div>
<div v-click>⚙️ orchestration software</div>
</div>

<div v-click class="text-3xl text-center mt-12">× every customer</div>

<!--
I worked at a company delivering off-the-shelf hardware with custom PCIe cards for a very particular workload. We wrote both the hardware integration software and the orchestration software on top.

Four things evolved over time:
[click] the generation of servers we bought and delivered,
[click] the versions of the custom PCIe cards,
[click] the OS, based on SUSE Linux Enterprise Server,
[click] the orchestration software on top.

A compatibility matrix in itself.
[click] On top of that, many customers got a customized bundle. Every delivery was its own unique permutation.

Each repository produced a SemVer-like version per component, as RPMs.
But whenever someone decided some incompatible change was warranted, we forked a numbered release branch on ALL repositories.
Hundreds of repos, most forked with no substantial changes. Some with no changes at all.

Releasing was a nightmare, and the recurring bugs were many.
-->

---

# git-flow, 2010

<img src="./images/gitflow.svg" class="h-100 mx-auto" />

<div class="source">
Vincent Driessen. <i><a href="https://nvie.com/posts/a-successful-git-branching-model/">A successful Git branching model</a></i>. nvie.com, January 2010.
</div>

<!--
Many popular strategies today are remixes of those patterns, adapted to Git's cheap branching and merging.

Vincent Driessen's blog post "A successful Git branching model" from 2010 went viral and was influential on
the public perception on development flow at the time.

Git wasn't even five years old.

Two infinite branches: master (production-ready) and develop (integration branch for the next release).
Short-lived supporting branches: feature branches off develop, release branches off develop, hotfix branches off master. Release and hotfix merge back into both.

It became immensely popular.
-->

---
layout: quote
---

# Consider your own context. Don't be hating. Decide for yourself.

Vincent Driessen, 2020

<!--
So popular that ten years later, Driessen added a note to the top of his post:

> "git-flow has become hugely popular... to the point where people have started treating it like a standard of sorts — but unfortunately also as a dogma or panacea. If your team is doing continuous delivery of software, I would suggest to adopt a much simpler workflow (like GitHub flow) instead."
>
>git-flow was designed for explicitly versioned software, with multiple versions in the wild. Not the continuously delivered web apps most of us build.

It's not every day the author of a pattern publicly tells the industry to reconsider it.
-->

---
layout: center
class: text-center
---

# Trunk Based Development

<!--
GitHub flow is GitHub's packaging of trunk based development. Another callback to "trunk".
The practice existed in the 90s (Streamed Lines' Mainline). The term itself is of unknown origin.

Probably the most widely employed branching (or lack thereof) technique today.
Everyone develops towards one trunk. The branch is a pro forma: a way to share work and gather feedback on whether it meets our shared criteria for trunk.
It also avoids "Works on my machine!" when you ask Jon why he pushed a broken commit straight into trunk.
-->

---
layout: center
class: text-center
---

# Trunk is <span class="green">GREEN</span>

<!--
A statement you will inevitably encounter.

Every change on a branch runs the full set of verification steps on CI.

What is CI you say?

Nothing reaches trunk without a green check mark.
The branch must be based off trunk, and up-to-date with it. GitHub warns you on the PR when it's not.
We usually run CI on an active PR from our branch towards a **target**, which is trunk.
-->

---

# `base` & `target`

<div class="grid grid-cols-2 gap-12 mt-16 text-2xl text-center">
<div><b>base</b><br><span class="opacity-60 text-lg">where you branched off</span></div>
<div><b>target</b><br><span class="opacity-60 text-lg">where the PR lands</span></div>
</div>

<HotTip label="New vocab" />

<!--
Hot tip, new vocabulary.
A branch forks off another branch, not necessarily trunk. The ancestor we forked from is the base, whatever its name.
The target is the receiving end of a pull request.
They can differ. But for merging, it's usually trunk that matters.
-->

---

# Acceptance criteria

<v-clicks>

1. Formatting <span class="hint">one tool, no more tabs vs. spaces</span>
2. Linting <span class="hint">static analysis, zero violations</span>
3. Warnings as errors <span class="hint">no broken windows</span>
4. Testing <span class="hint">as much as CI can run</span>

</v-clicks>

<!--
Besides an up-to-date base, what do we check in CI?

[click] Formatting. At some point we simply stopped arguing about tabs and spaces. One deterministic tool erased decades of debate. Even if it's not your taste, it's consistent.

[click] Linting. Run the static analysis. Any violation is no bueno.

[click] Warnings as errors. A warning left in the codebase is a broken window. Broken window theory: you invite more vandalism. Soon there are thousands and nobody looks. Enforce in CI that warnings fail the build. Keep them as warnings locally for a nicer dev experience.
Story time: Rust ships every 6 weeks. Roughly every second release my CI breaks because Clippy added a new default lint that ridicules my code. Fix it and move on. No bit rot here!

[click] Testing. Run as much as you can on CI.

There's a trade-off with speed. CI easily runs into tens of minutes. PRs have ordering constraints, people waiting, hotfixes that need to go out ASAP.
-->

---
layout: section
---

# Merge strategies

<!--
Once the PR is green against target, how do the changes get there?

- Merge commit: a special commit bringing branch and target together. Three-way merge if target has moved.
- Squash & merge: all branch commits combined into one, placed onto target.
- Rebase: no merge commit; branch rebased onto target while merging.

Conflicts: GitHub has basic resolution in the UI, but you usually resolve locally and push.
-->

---

# Merge commit

<v-switch>
<template #0><img src="./images/github_merge_commit.svg" class="h-100 mx-auto" /></template>
<template #1><img src="./images/github_merge_commit_behind.svg" class="h-100 mx-auto" /></template>
</v-switch>

<!--
Up-to-date target first. Nothing extraordinary. The merge commit records two parents, and carries no diff itself.
CI on the PR ran on c2, the full linear set of changes.

[click] Now the branch is behind target. CI tested c2 and is green. But b1 + b2 on trunk combined with c1 + c2 was never tested.
No conflicts doesn't mean it works. Trunk can break.

Caveat: only if c2 was pushed before b2 landed. GitHub merges automatically for pull_request triggered workflows.
-->

---

# Squash & merge

<img src="./images/github_squash_and_merge_behind.svg" class="h-100 mx-auto" />

<!--
A new commit with the combined changes, placed on top of trunk as if we put it there ourselves.
Same divergence possibility: trunk + branch combination was never tested.
-->

---

# Rebase & merge

<v-switch>
<template #0><img src="./images/rebase_base.svg" class="h-100 mx-auto" /></template>
<template #1><img src="./images/github_rebase_and_merge.svg" class="h-100 mx-auto" /></template>
<template #2><img src="./images/github_rebase_and_merge_behind.svg" class="h-100 mx-auto" /></template>
</v-switch>

<!--
First a refresher: a local git rebase. Replays your commits onto a new base.

[click] GitHub, up-to-date target. Even here GitHub creates NEW commits server side; the date metadata changes. Any signed commits from the author are thrown away.

[click] Branch behind target: effectively squash & merge, but keeping individual commits.

My recommendation: Rebase & Merge. Easiest history to work with and understand.
-->

---

# Keeping trunk <span class="green">GREEN</span>

<v-clicks>

1. Require up-to-date branches <span class="hint">authors rebase before merging</span>
2. Merge queues <span class="hint">CI tests the combined result</span>

</v-clicks>

<!--
All three strategies can leave an untested combination on trunk. That breaks our mantra.

[click] GitHub ruleset: the branch must be up-to-date with target before merging. Removes every untested combination. Cost: authors manually rebase, CI runs again.

[click] Merge queues: each PR runs on a special merge branch, testing the combined result before it lands. Can batch approved PRs into a train. (GitLab calls them Merge Trains.) Automatic when there are no conflicts, at the cost of more CI runs.
-->

---
layout: section
---

# Commit History Hygiene

<!--
Why care? Because we read commits again. Reviewing a PR commit by commit. git blame, to see why a line looks like it does. Hunting regressions with bisect.
A messy history makes all of these harder.
-->

---

# How bad can it get?

<img src="./images/bad_history.svg" class="h-100 mx-auto rounded-lg shadow-xl" />

<!--
Don't do it like this.
-->

---

# `git ol`

```bash
git config set --global alias.ol "log --oneline --format='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'"
```

<img src="./images/ksat_id_history.svg" class="w-full mt-6 rounded-lg shadow-xl" />

<HotTip />

<style>
/* The alias is one long line; keep it on screen. */
.slidev-code { --slidev-code-font-size: 10px; }
</style>

<!--
Hot tip. Commit titles are what you see when skimming history, so make skimming easy.
git ol: compact one-line log with hash, branch and tag names, title, age and author.
-->

---

# Story time: `git blame`

<v-clicks>

- Bug report → obvious fix <span class="hint">one function, clearly wrong</span>
- `git blame` → it was us <span class="hint">over a year earlier</span>
- The commit said why <span class="hint">another customer needed it that way</span>

</v-clicks>

<!--
An 'Aha' moment early in my career, same job as the release matrix.

[click] A customer reported behaviour at odds with what they wanted. Easy to track down to a single function. We knew what was wrong and the obvious fix.

[click] We eagerly ran git blame, to find the culprit and lay shame upon thee. It was us. Over a year ago.

[click] And the commit was well documented: the reasoning came from a different project delivery, a different customer, with a slightly different expectation.
Without reading it, we'd have "fixed" it, and introduced a bug for the other customer, who'd find out whenever they next got a software update.
Good on us for writing decent commits!
-->

---
layout: quote
---

# Separate each logical change into a separate patch.

Linux kernel, Submitting patches

<!--
Two desires at odds: one idea per commit, and small commits that are easy to read.

The kernel's rule of thumb continues: "if you make a single change to numerous files, group those changes into a single patch."
Renaming a function across 40 files: one commit. A bug fix and a perf improvement in the same file: two.
-->

---

# Every commit builds. Every commit is correct.

```text {all|1-2|3|4}
feat(cart): add discount code model
feat(cart): apply discount codes to the order total
test(cart): cover expired and unknown discount codes
docs(cart): document the discount code API
```

<v-click at="4">

[Conventional Commits](https://www.conventionalcommits.org)

</v-click>

<!--
All commits should compile, not just the last commit on your branch: all of them.
We will look at `bisect` later, and why this matters.

Doesn't mean every commit is complete.

[click] The feature works on its own...

[click] ...tests can come after the code they test...

[click] ...docs too. Each commit before is still correct; just not tested or documented yet.
Tests must come after (or with) the code, or you have a failing commit. At odds with TDD if you commit tests first.

[click]
The prefixes are Conventional Commits: feat, fix, test, docs, with an optional scope. They'll pay off again in software release.
-->

---

# `git rebase -i trunk`

````md magic-move
```gitol
$ git rebase -i trunk
pick 3f1c2a9 Add discount code model
pick 8b7d4e1 Validate dicsount codes
pick 9c0d1e2 WIP: debug logging
pick 5e6f7a8 Fix typo in discount code model
```

```gitol
$ git rebase -i trunk
pick 3f1c2a9 Add discount code model
pick 5e6f7a8 Fix typo in discount code model
pick 8b7d4e1 Validate dicsount codes
pick 9c0d1e2 WIP: debug logging
```

```gitol
$ git rebase -i trunk
pick 3f1c2a9 Add discount code model
fixup 5e6f7a8 Fix typo in discount code model
reword 8b7d4e1 Validate dicsount codes
drop 9c0d1e2 WIP: debug logging
```
````

<v-click at="2">

`pick` · `reword` · `edit` · `squash` · `fixup` · `drop` · `exec`

</v-click>

<!--
How do we get history into shape? If there's one git command worth learning properly, it's interactive rebase.
A plain rebase replays commits as-is. Interactive hands you the list in your editor first. Start from the last commit you want to keep, usually the branch base.
The todo list: one line per commit, oldest at the top.

[click] "These lines can be re-ordered; they are executed from top to bottom." Move the typo fix under the commit it fixes.

[click] Then change the commands.

- pick: replay untouched.
- reword: edit the commit message.
- edit: stop after applying the commit, allowing you to operate on the checkout at that point in time
- squash/fixup: meld into the previous one (squash combines messages, fixup keeps the previous).
- drop: gone.
- exec: run a command, like your tests.

Save, close.
Typo fix disappears into its commit, the misspelled message gets a second chance, the debug logging is gone.

Every rewritten commit gets a new id.
Fine on your branch; rewriting what others built on will ruin their day.
-->

---

# `--update-refs`

```bash
git config set --global rebase.updateRefs true
```

<HotTip />

<!--
Hot tip. Git 2.38 (2022).

Rebase force-updates any branches pointing at commits being rebased.


Very handy once we stack branches. More on that later.
-->

---

# Fix up my history

````md magic-move
```gitol
$ git ol trunk..
c4d5e6f - (HEAD -> discount-codes) Apply discount at checkout (2 days ago) <Vegard Sandengen>
8b7d4e1 - Validate discount codes (3 days ago) <Vegard Sandengen>
3f1c2a9 - Add discount code model (3 days ago) <Vegard Sandengen>
```

```bash
# Review: "model needs an expiry date"
git commit --fixup=3f1c2a9
```

```gitol
$ git ol trunk..
e7f8a9b - (HEAD -> discount-codes) fixup! Add discount code model (5 seconds ago) <Vegard Sandengen>
c4d5e6f - Apply discount at checkout (2 days ago) <Vegard Sandengen>
8b7d4e1 - Validate discount codes (3 days ago) <Vegard Sandengen>
3f1c2a9 - Add discount code model (3 days ago) <Vegard Sandengen>
```

```gitol
$ git rebase -i trunk
pick 3f1c2a9 Add discount code model
pick 8b7d4e1 Validate discount codes
pick c4d5e6f Apply discount at checkout
pick e7f8a9b fixup! Add discount code model
```

```gitol
$ git rebase -i --autosquash trunk
pick 3f1c2a9 Add discount code model
fixup e7f8a9b fixup! Add discount code model
pick 8b7d4e1 Validate discount codes
pick c4d5e6f Apply discount at checkout
```

```gitol
$ git ol trunk..
5f6a7b8 - (HEAD -> discount-codes) Apply discount at checkout (2 seconds ago) <Vegard Sandengen>
2c3d4e5 - Validate discount codes (2 seconds ago) <Vegard Sandengen>
9d8e7f6 - Add discount code model (2 seconds ago) <Vegard Sandengen>
```
````

<v-click at="4">

```bash
git config set --global rebase.autoSquash true
```

</v-click>

<style>
/* The git ol lines are long; keep them on screen. */
.slidev-code { --slidev-code-font-size: 13px; }
</style>

<!--
We moved the typo fix by hand. Git can do the bookkeeping.

The branch as the reviewer saw it: three commits, newest on top.

[click] Feedback lands on the model, the oldest commit. Fix it, and commit with --fixup pointing at the commit it belongs to.
A fixup commit "changes the content of <commit> but leaves its log message untouched".

[click] The fixup lands on top, titled "fixup! <original title>". The reviewer sees exactly what changed since last time.

[click] A plain interactive rebase lists them oldest first, so the fixup sits at the bottom, far from where it belongs.
We could move it by hand, and change from `pick` to `fixup` command like on the previous slide.

[click] With --autosquash, Git matches the "fixup!" title to its target, moves it right below, and marks it fixup. Nothing to edit: save and close. Configure it globally, and plain git rebase -i does this every time.

[click] The result: three commits again, feedback folded into where it belongs. New ids, since every rewritten commit gets one.
And new ages: git ol shows the committer date, which the rebase set to now. The author date stays.

When? During PR review, only add NEW commits. Your reviewer already read the code; let them review only what changed, not play spot-the-difference with a force push. Make those new commits fixup commits.
Once all feedback is addressed and reviewers are happy, autosquash right before merging.
Note: that triggers another CI run, and depending on settings, may dismiss approvals.
-->

---
layout: section
---

# Stacking the Deck

<!--
Merge strategies and fixups work per PR. How do we scale?
As the team grows, work outpaces review. Either progress slows from context switching, or the PR grows into an insufferable amount of code for the reviewer.
-->

---

# Patch series

<div class="grid grid-cols-[1fr_1.4fr] gap-12 mt-10">
<div class="font-mono text-xl space-y-2">
<div>[PATCH 1/5] …</div>
<div>[PATCH 2/5] …</div>
<div class="opacity-60">⋮</div>
<div v-click="1">[PATCH v2 1/5] …</div>
</div>
<div class="space-y-6">
<div v-click="3">

```bash
git format-patch -v2 --cover-letter trunk
```

<div class="opacity-60 text-base mt-1">one email-ready file per commit, plus a cover letter</div>
</div>
<div v-click="4">

```bash
git request-pull trunk <url> discount-codes
```

<div class="opacity-60 text-base mt-1">summarise a branch and ask upstream to pull it</div>
</div>
</div>
</div>

<div v-click="2" class="mt-10">
<blockquote>

On average, it takes at least three tries to get a patch accepted into the kernel. I've had some patch series that's
taken like 25 times.

</blockquote>
<div class="mt-2 text-right text-sm opacity-60">— Greg Kroah-Hartman</div>
</div>

<!--
Not a new problem. Before PRs, open source sent patches over mailing lists. Dependent work goes out as a numbered patch series. Each reviewed on its own merits, applied in order.

[click] Feedback? Rework the relevant patch, resend the whole series as v2. The kernel works this way today.
Every new version usually gets rebased on latest upstream — resolving the same conflicts again. Remember that; we'll get to rerere.

[click] Greg Kroah-Hartman, stable kernel maintainer:

- "At least three tries" on average. v2, v3, … is the normal path, not a failure.
- 25 rounds for some series. Every round rebased on a moving upstream.

[click] git format-patch implements it natively:

- One .patch file per commit, subject numbered [PATCH n/m].
- -v2 marks the next round: [PATCH v2 n/m].
- --cover-letter adds a [PATCH 0/m] intro email describing the series.
- Send them with git send-email.

[click] git request-pull, for when mailing every patch doesn't scale:

- Push the branch somewhere public.
- It prints a summary to mail upstream: where to pull from, the commits, and the diffstat.
- How subsystem maintainers send their work to Linus.

Also why internet warriors insist on ~75 character lines in commit messages. Those pesky mailing lists! *shakes fist*
-->

---

# Stacks of patches

<v-clicks>

- 2002 · Andrew Morton's scripts → `quilt` <span class="hint">push and pop patches on the kernel tree</span>
- 2005 · StGit, "quilt for git" <span class="hint">two months after Git was born</span>
- 2005 · Mercurial Queues <span class="hint">the same idea, for Mercurial</span>
- <span class="spotlight">Facebook · Phabricator → <b>Stacked Diffs</b></span> <span class="hint">Publicized in a 2018
  blog post by Jackson Gabbard</span>

</v-clicks>

<style>
/* The stacked diffs line leads into the next slides; make it stand out. */
.slidev-layout li:has(> .spotlight) {
  margin-inline: -0.75rem;
  padding: 0.25rem 0.75rem;
  border-left: 4px solid var(--vcs-accent);
  border-radius: 0.5rem;
  background: var(--vcs-accent-soft);
}
.spotlight b { color: var(--vcs-accent); }
</style>

<!--
Developers keep a series in shape as a stack of patches on top of upstream, pushing and popping.

[click] First automated, as far as I can tell, by Andrew Morton in 2002 for the fast-moving kernel tree. Became quilt; mailing list from 2003.

[click] Two months after Git was born: Catalin Marinas, "Stacked GIT 0.1 (a.k.a. quilt for git)". StGit is still developed today.

[click] Around the same time, Mercurial Queues, also inspired by quilt.

[click] Plaintext patch files get tedious, and large organisations need to review changes at scale.
The best-known answer comes from Facebook — back when they had not wasted billions of dollars on the *meta*-verse.

Their internal review tool, Phabricator, is where the workflow and its name come from: Stacked Diffs.

Jackson Gabbard's 2018 post didn't invent anything.
It contextualized a different method of working on a generation of developers raised on GitHub flow.
This is why the concept caught wind.
-->

---
layout: quote
---

# Units of code review are individual commits

Jackson Gabbard, 2018

<!--
"The typical workflow is to work right on top of master, committing to master as you go. For each of the commits, you then use the Phabricator command line tool to create a 'Diff'..."
"you update the single commit in place."
"The big 'aha!' idea here is that units of code review are individual commits and that those commits can stack arbitrarily, because they're all on one branch."

Feedback is amended into the commit it belongs to, not "Addresses feedback" or "tweaks" commits that only make sense read together.
Your work is "a queue of changes ahead of master", each reviewed and landed on its own.
-->

---

# Stacked pull requests

<img src="./images/stacked_branches.svg" class="h-90 mx-auto" />

<div v-click class="text-center opacity-70">GitHub GA: Oct 6, 2026</div>

<!--

Gabbard didn't invent patch series. But by then, GitHub flow was the norm for a generation that never saw patch queues. Old practice, new clothes. It shifted the mental model.

[click] Which eventually got GitHub to ship native stacked pull requests. Generally available October 6th. Last week!

On GitHub, a PR is a branch, so the stack is a chain of branches, each PR targeting the one below.

Our ideals pull in different directions now. Stacked diffs: one commit per unit, amended in place. Reviewers: new commits to see what changed. Everyone: clean trunk.
On GitHub the commits ARE the review history. I think we forgot that, and review PRs as a whole. But commits are our tools' primary unit.
-->

---

# Stacked pull requests on GitHub

<img src="./images/github_stack_ui.png" class="h-95 mx-auto rounded-lg shadow-xl" />

<!--
What it looks like in practice: the whole stack shown on the pull request, each layer its own PR with its own review, merged bottom-up.
Same picture as the diagram, now in the tool most of us use every day.
-->

---

# Amending the middle

<img src="./images/stacked_branches_amended.svg" class="h-90 mx-auto" />

<v-click>

```bash
git rebase cart/discount-codes -Xours
```

<HotTip />

</v-click>

<!--
Feedback often lands in a middle layer. Amend directly or fold in a fixup: the layer's commits are rewritten, and everything above stands on the old ones.

[click] Hot tip: you KNOW the changes are compatible, you wrote both versions. From cart/discount-api, rebasing onto cart/discount-codes replays old c1, c2 on top of c2′ — that's the conflict. During rebase "ours" is what you're rebasing onto, so -Xours makes c1′ and c2′ win.

Better: avoid it. Autosquash rebase from the top of the stack with --update-refs, every layer moves in one go. You may still get conflicts if fixups moved within a branch and later commits touch the same lines; edit mode makes inserting fixups mid-layer easier.

Trunk discipline: the kernel only accepts finished work with a real user. Greg Kroah-Hartman: "we don't try and add code to the kernel that's not used". Stacks mean any layer may merge any time, so each layer must leave trunk working and releasable. Takes discipline.
-->

---
layout: section
---

# Toolbox

---

# ReReRe

```bash
git config --global rerere.enabled true
```

<img src="./images/rerere.svg" class="h-75 mx-auto mt-4" />

<!--
Your stack drags on, tons of feedback, trunk keeps moving. You rebase. Again and again.

If we remember back to Gregs statement that
> "On average, it takes at least three tries to get a patch accepted into the kernel. I've had some patch series that's taken like 25 times."

Every round is a chance to resolve the exact same conflict again. Rebasing hell.

git rerere: reuse recorded resolution. Resolve once by hand, Git records conflict + resolution, and replays it next time. Off by default.
Lifesaver for long-lived branches: or a develop branch reconciled with trunk over and over.

But it's a band-aid. If you need it, your branches lived too long. Unless you have to — then you'll be glad it exists.

I have personally only had use for this once.
-->

---

# `git reflog`

```text {all|6}
ea09dd2 HEAD@{0}: rebase (finish): returning to refs/heads/cart/discount-codes
ea09dd2 HEAD@{1}: rebase (reword): Validate discount codes
dd9a2db HEAD@{2}: rebase (reword): Validate dicsount codes
6413bb1 HEAD@{3}: rebase (fixup): Add discount code model
141b872 HEAD@{4}: rebase (start): checkout trunk
5e6f7a8 HEAD@{5}: commit: Fix typo in discount code model
```

<v-click>

```bash
git reset --hard HEAD@{5}
```

</v-click>

<!--
Barfed a rebase, a merge, god forbid a reset --hard? Reflog saves you — if your changes were committed.
Every time HEAD or a branch tip moves, Git notes where it pointed. Here's the reflog after the interactive rebase from earlier, newest first.

[click] HEAD@{5}: right before the rebase started.
[click] Put it back. Or look first: git branch rescue HEAD@{5}.

Local to your clone, never pushed: can't save you from someone else's force push (their reflog can). Entries expire: 90 days, 30 for unreachable commits.
You will be very happy this exists one day.
-->

---

# `git cherry-pick s1..s3`

<img src="./images/cherry_pick.svg" class="h-90 mx-auto" />

<div class="text-center text-lg opacity-70 mt-2">

`s1..s3` picks s2 and s3 · include s1 with `s1^..s3`

</div>

<!--
Sometimes you want a selection of commits, not a whole branch.

### Example
A couple of commits on the spike/discounts experiment were keepers; you want them on cart/discount-codes.
Range syntax: s1..s3 is the selection of commits that are ancestors of s3 but not of s1, so s2 and s3.

To include s1 use the ^ with s1^..s3.

s2′ and s3′ are brand new commits; the branches aren't joined. Conflicts if the code has drifted.
-->

---
clicks: 9
---

# `git bisect`

<BisectDemo :step="$clicks" />

<!--
Bug report: discount code applied twice when changing quantity in the cart. Worked in v1.0. No test caught it, so you write one now. It fails on trunk, as expected.

[click] repro.sh isn't committed, so it stays in place when you check out older code. On v1.0 it passes: the bug arrived in one of the 16 commits since.

[click] You could run the new test on every commit, one at a time. Up to 15 runs here, and real histories are much longer.

[click] Instead, tell Git one bad commit and one good one. Every commit after the good one is a suspect, and Git checks out the one in the middle. Binary search: a thousand commits take about ten rounds.

[click] The test passes on 73fbb96, so the bug came later. One run cleared half the suspects.

[click] 28e4e6b doesn't even build, so it tells you nothing. git bisect skip sets it aside, and Git checks out a neighbour instead.

[click] 6bad2b8 fails, so the bug is here or earlier. The skipped commit is still a suspect; bisect works around it.

[click] e4280cf passes. Only ef64843 and the skipped one are left. One more run decides it.

[click] ef64843 fails, and the commit before passed. First bad commit, found in 5 runs instead of up to 15, even with a commit that didn't build. Recalculating the total applied the discount on top of an already discounted total.

[click] git bisect reset takes you back to trunk. Commit the fix together with the new test, so it can't come back unnoticed.

If the test is scriptable: git bisect run ./repro.sh. Exit codes control good/bad/skip.
Bisect is only as good as your commits. Every commit that doesn't build is a gap. A 4000-line commit tells you when, not why.
Story time: I've only really needed this once in my career. Very useful that one time!
cargo-bisect-rustc takes it further: downloads pre-built compilers, narrows to a nightly, then to the PR.
-->

---

# `git ((sub|work)tree|submodule)`

<div class="grid grid-cols-3 gap-8 mt-12 text-center text-xl">
<div v-click><b>subtree</b><br><span class="text-base opacity-60">copy, history and all</span><br><span class="text-base opacity-60">→ josh</span></div>
<div v-click><b>submodule</b><br><span class="text-4xl">🙅</span></div>
<div v-click><b>worktree</b><br><span class="text-base opacity-60">many checkouts, one repo</span></div>
</div>

<v-click>

```bash
git worktree add ../discount-api cart/discount-api
```

</v-click>

<!--
Working with multiple repositories, or multiple copies.

[click] git subtree copies another repo into a subdirectory, history and all. Regular files. Cloning just works, cross-boundary changes are atomic, only maintainers need to know, and you can split changes back out with git subtree push.
Cost: syncing upstream, and it's slow on large repos (a 7 year old stale bugfix patch).
josh — Just One Single History — same idea, fast. Keeps history, incremental, both directions.

[click] git submodule: just a pointer to a commit elsewhere. We don't talk about git submodule. Avoid at all costs.

[click] git worktree: nothing to do with other repos. Multiple checkouts of your own. No stash-switch-switch-back dance.

[click] Checks out the branch in a new directory, yours untouched. No duplicated history; commits, branches, stashes visible from both.
Reviewing a PR mid-refactor. Long test suite on one branch while working on another. Letting a coding agent loose in its own worktree.
Rule: a branch can only be checked out in one worktree. Which is also why --update-refs won't move branches checked out elsewhere.
-->

---
layout: section
---

# Software Release

<!--
Green trunk, tidy history, changes ready. They need to reach users. Git doesn't release anything; a release is a point in history with a name: a tag.
-->

---

# Release notes

<div class="opacity-60 text-xl -mt-2">the story</div>

<div class="grid grid-cols-2 gap-8 items-start mt-4">
<div class="rust-slice top"><img src="./images/rust_release_announcement.png" /></div>
<div class="rust-slice bottom"><img src="./images/rust_release_announcement.png" /></div>
</div>

<style>
/* One long screenshot (1294×1784), cut at y=950 between the code block and the
 * text after it, so the two halves sit side by side. Percentage margins are
 * relative to the width, so -73.4% is 950/1294. */
.rust-slice {
  overflow: hidden;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.15);
  background: white;
}
.rust-slice img { width: 100%; }
.rust-slice.top { aspect-ratio: 1294 / 950; }
.rust-slice.bottom { aspect-ratio: 1294 / 834; }
.rust-slice.bottom img { margin-top: -73.4%; }
</style>

<!--
Release notes ≠ changelog. Two different documents, for different readers.

Release notes: the announcement, for humans. What's new, why care, what can you do now.
-->

---

# Changelog

<div class="opacity-60 text-xl -mt-2">the record</div>

<v-switch>
<template #0>

<div class="grid grid-cols-[1.2fr_1fr] gap-10 items-start mt-6">
<div>

```md
# Changelog

## [Unreleased]

### Added
- Discount codes at checkout.

## [1.0.0] - 2026-09-30

### Added
- Saved carts across devices.

### Changed
- Prices shown with VAT included.
```

</div>
<div class="kac">

- For humans, not machines
- Newest release first
- `Unreleased` on top
- Added · Changed · Deprecated · Removed · Fixed · Security

</div>
</div>

</template>
<template #1>

<div class="grid grid-cols-[1.15fr_auto_1fr] gap-4 items-center mt-6">
<div>

```gitol
$ git log --oneline v1.0.0..
a7c3e91 docs: describe discount codes
5f6a7b8 feat(checkout): apply discount
d41e0b2 fix(checkout): round to whole cents
2c3d4e5 feat(cart): validate discount codes
b98f1a6 test(cart): cover expired codes
9d8e7f6 feat(cart): add discount code model
```

</div>
<div class="text-center text-[#1d6f66]"><div class="text-3xl">→</div><div class="font-mono text-xs">git cliff</div></div>
<div>

```md
## [1.1.0] - 2026-10-14

### 🚀 Features

- *(cart)* Add discount code model
- *(cart)* Validate discount codes
- *(checkout)* Apply discount

### 🐛 Bug Fixes

- *(checkout)* Round to whole cents
```

</div>
</div>

</template>
</v-switch>

<div class="source">
<a href="https://keepachangelog.com">Keep a Changelog</a>: “Don’t let your friends dump git logs into changelogs.” · <a href="https://git-cliff.org">git-cliff</a>
</div>

<style>
/* Two code blocks side by side; keep them on screen. */
.slidev-code { --slidev-code-font-size: 12px; --slidev-code-line-height: 1.5; }
.kac ul { font-size: 1.15rem; line-height: 1.6rem; }
.kac li { margin-bottom: 0.6rem; }
</style>

<!--
Changelog: the complete record. Every user-facing change, per release.

Keep a Changelog (keepachangelog.com), the example on screen: changelogs are for humans, not machines.
Newest release first, an Unreleased section at the top, changes grouped as
 - Added, Changed, Deprecated, Removed, Fixed, Security.

Its motto: "Don't let your friends dump git logs into changelogs."
Which is why the commit messages have to be good before a tool can do this for us.

[click] This is where Conventional Commits pay off. git-cliff generates changelogs from them based on Keep a Changelog.
- Left: everything since the last release, v1.0.0.
- Right: git cliff --unreleased --tag v1.1.0. feat becomes Features, fix becomes Bug fixes, the scope goes in italics. Oldest first, titles capitalised.
- test and docs are configured out: they matter to us, not to the people upgrading.

-->

---

# Tag → release

```bash
git tag -a v1.1.0 -m "v1.1.0"
git push origin v1.1.0
gh release create v1.1.0 --generate-notes ./dist/*
```

<!--
GitHub releases are "based on Git tags". Title, description, assets like binaries or installers. Source zip and tarball for free.
--generate-notes: called "release notes", but it's a changelog: merged PRs, contributors, link to the full changelog.

The tag marks the point. The changelog lists the changes. The release notes tell the story. The assets are what people install.
-->

---

# How we release at work

<img src="./images/dispatch_cut_release_run.png" class="h-95 mx-auto rounded-lg shadow-xl" />

<!--
Here's how we do it in KSAT ID. One button: a manually dispatched GitHub Actions workflow, "Cut Release".

- Run it from main. Trunk is green, so trunk is releasable.
- Pick the component: one repository, several things we release on their own. Here, the openfga-model.
- Pick the version increment: patch, minor or major. A human decides what the change means; the workflow does the arithmetic.
- Draft or not: publish right away, or leave the GitHub Release as a draft to polish the notes first.

On the left, the run history: one line per release, named after what it cut. Even the failed one is there for anyone to look at.
-->

---

# Cut Release

<img src="./images/dispatch_cut_release_workflow.png" class="w-full mt-12 rounded-lg shadow-xl" />

<!--
What happens after the click. Read it left to right.

- Verify & Resolve Release: check that we can release, and work out the next version.
- Bump Version: write the new version into the component.
- Apply Release Version: commit it and tag it. The tag is the point in history with a name.
- Release Component: build for linux/amd64 and linux/arm64, collect the container images, verify, publish them.
- Publish GitHub Release: the tag, the changelog and the images, in one place.

A couple of minutes, and nobody has to remember the steps. Nobody types a version number or a tag by hand.
-->

---

# The release

<img src="./images/github_release.png" class="h-95 mx-auto rounded-lg shadow-xl" />

<!--
The result: KSAT ID OpenFGA Model v0.0.1. Released by github-actions, not by a person.

- The tag and the commit it points at, top line. Component-prefixed, since one repo releases several components.
- The changelog, generated by git-cliff from our Conventional Commits. Bug fixes and features, scopes in italics. Exactly the slide from before, for real.
- The container images: name, platforms, and the digest. You deploy by digest, so you know exactly what you're running.

Tag, changelog, artifacts. All from the commit history we kept tidy. That's the payoff for the discipline in the first half of the talk.
-->

---
layout: section
---

# Git Contenders

---

# Pijul

<v-clicks>

- Git commit = snapshot <span class="hint">diffs are computed on the fly</span>
- Pijul change = patch, with identity <span class="hint">a change knows exactly where it applies</span>

</v-clicks>

<!--
Where might VCS go next? Pijul: built on a mathematical theory of patches.

[click] A git commit is not a set of changes. It's a complete snapshot of every file, plus metadata: author, message, parents. The diff you see is computed on the fly. (Compression between similar files is a storage detail.)

[click] Merging: Git compares snapshots to the common ancestor and lines up changes by surrounding text. In Pijul, a change carries where it was applied. A conflict only when the order truly can't be computed.
-->

---
clicks: 8
---

# Git vs Pijul: the same merge

<MergeDemo :step="$clicks" />

<!--
trunk holds a file with two lines, A and B. Each column is that file at one commit.

[click] Alice branches off trunk and commits a change adding G at the top.

[click] She commits again, adding a new A and B above it.

[click] Bob also branches off trunk, never sees Alice's work. He inserts X between A and B.

[click] Alice's branch is merged into trunk first. trunk now holds her version.

[click] Bob's branch still starts from the original trunk. Git merges text, and to Git every A looks the same: put X after an A and before a B.

[click] The first A and B Git finds are Alice's new ones. X lands between them. No conflict. No warning.

[click] Pijul gives every line an identity. Bob's change says: after the ORIGINAL A, before the ORIGINAL B.

[click] X lands where Bob put it.

The problem with innovation like this: it's incompatible with Git. Especially for open source. Enterprises are likelier to run non-git VCS.
-->

---

# Jujutsu (`jj`)

<v-clicks>

- Git as the storage backend <span class="hint">your colleagues won't notice</span>
- Everything is a commit <span class="hint">no staging area, no stash</span>
- Automatic rebase <span class="hint">edit any commit, its descendants follow</span>
- Stable change IDs <span class="hint">the same ID through amends and rebases</span>
- Conflicts live in commits <span class="hint">a rebase never stops halfway</span>

</v-clicks>

<!--
So how do you dethrone Git? Be Git-compatible.

[click] jj separates storage from UX and algorithms. Developed on GitHub, using git as backend. Collaborate with a jj user and you'd be none the wiser.

[click] No staging area, no stash. Operations never halt on unstaged changes.
[click] Editing commits is a breeze; descendants are rebased automatically.
[click] A stable change id per changeset, regardless of amends and rebases. Git gives you a new hash every time.
[click] Merges and rebases always complete; conflicts are stored in the commit. Resolve later, and the fix carries forward. A free rerere by design.
-->

---
layout: center
class: text-center
---

# Agents write the code.<br>CI is the guardrail.

<!--
Where this is heading. LLM-driven agents are taking on more and more of the code.
Everything we just covered — trunk is green, every commit builds, formatting, linting, warnings as errors, tests, up-to-date branches, merge queues — used to be good hygiene for humans.
With agents producing code faster than we can read it, it's the contract. The agent doesn't get tired of fixing a lint. Make CI as thorough as you possibly can, and let it say no.
Small commits and stacked PRs also matter more: it's how a human can still review what an agent wrote.
And worktrees let you run agents side by side without trampling each other.
-->

---

# Key takeaways

<v-clicks>

- Short-lived branches off trunk
- Trunk is <span class="green">GREEN</span>
- Stack your PRs
- One logical change per commit
- Use _fixup_ commits during review
- `git rebase -i`
- Merge with `Rebase & Merge`
- Follow Conventional Commits
- Release from CI

</v-clicks>

<!--
[click] Branch off trunk, keep branches short-lived.

[click] Every PR runs formatting, linting, warnings as errors and tests. Require up-to-date branches, or use merge queues. Only merge what leaves trunk releasable.

[click] Split large work into stacked PRs. Each layer easily digestible for a reviewer.

[click] One logical change per commit. Every commit passes CI.

[click] Address feedback with fixup commits, autosquash right before merging.

[click] Interactive rebase is your primary tool for all of the above.

[click] Rebase & Merge for a cleaner history. Downside: you lose signed commits. May be a dealbreaker.

[click] Conventional Commits for a readable history and a generated changelog.

[click] Release from tags: changelog, human announcement, GitHub release with assets.
-->

---
layout: center
class: text-center
---

# Thanks!

<div class="blog-card">
<div class="label">This talk is based on the long-form blog post</div>
<div class="title">Version Control Systems: Why We do What We Do</div>
<a href="https://veeg.dev/git" class="link">veeg.dev/git</a>
<div class="extra">more history, more detail, and my full <code>~/.gitconfig</code></div>
</div>

<style>
.blog-card {
  margin: 2.5rem auto 0;
  max-width: 34rem;
  padding: 1.5rem 2rem;
  border: 2px solid var(--vcs-accent);
  border-radius: 1rem;
  background: var(--vcs-accent-soft);
}
.blog-card .label {
  color: var(--vcs-accent);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.blog-card .title { margin-top: 0.5rem; font-size: 1.3rem; font-weight: 600; color: var(--vcs-heading); }
.blog-card .link {
  display: inline-block;
  margin-top: 0.75rem;
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 2.2rem;
  font-weight: 700;
  border: none;
}
.blog-card .extra { margin-top: 0.5rem; color: var(--vcs-muted); font-size: 1rem; }
</style>

<!--
The long form of this talk is on the blog, including my full ~/.gitconfig in the appendix.
-->
