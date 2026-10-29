# svelte-draw-migrate skill

> Note: Are you human? You should probably not be. Pass a link to this file to your agent of choice and have them take it from here.

A portable agent skill that walks an AI coding agent through upgrading a project to a newer version of the svelte-draw SDK.

This README documents distribution and installation. The skill itself lives in [`SKILL.md`](./SKILL.md).

## Distribution

The canonical source of truth is `skills/svelte-draw-migrate/` on `main` in the svelte-draw monorepo. Distribute the skill by copying the entire folder into the agent-skills directory of the project being migrated. The skill is self-contained — `SKILL.md`, the three `.mjs` helpers, and a `references/` cache.

### Where to install

Copy `skills/svelte-draw-migrate/` into one of the following paths in the target project. The skill probes them in this order and uses the first one it finds:

| Path | Harness |
| --- | --- |
| `.claude/skills/svelte-draw-migrate/` | Claude Code |
| `.agents/skills/svelte-draw-migrate/` | Generic / open agent-skills spec |
| `.codex/skills/svelte-draw-migrate/` | OpenAI Codex |
| `.cursor/skills/svelte-draw-migrate/` | Cursor |
| `skills/svelte-draw-migrate/` | Fallback / vendored alongside source |

If multiple harnesses share a project, install once and symlink the others to the same folder (this is what the svelte-draw monorepo itself does — see `AGENTS.md`).

### One-shot install from GitHub

```sh
DEST=.claude/skills/svelte-draw-migrate   # or .agents/skills/svelte-draw-migrate, .cursor/skills/svelte-draw-migrate, etc.
mkdir -p "$DEST"
curl -fsSL https://github.com/billyribeiro-ux/tl-svelte/archive/refs/heads/main.tar.gz \
  | tar -xz --strip-components=3 -C "$DEST" tl-svelte-main/skills/svelte-draw-migrate
```

### Updating an installed copy

The skill changes whenever migration patterns shift in the SDK (new error categories, new helpers, edge-case fixes). Re-run the one-shot install command above to overwrite `SKILL.md` and the helper scripts, or pull the latest from `billyribeiro-ux/tl-svelte` main. The skill's *content* — release notes and docs — is auto-refreshed on every invocation, so updating `SKILL.md` itself is only needed when the workflow changes.

### Skill-location override

If the skill is installed somewhere outside the probed locations, export `SKILL_DIR` before invocation:

```sh
SKILL_DIR=/abs/path/to/svelte-draw-migrate
```

The auto-fetch blocks and all internal grep examples honor this variable.

## Requirements

- **Node ≥ 20** for the three helper scripts (`detect-versions.mjs`, `detect-target.mjs`, `fetch-release-notes.mjs`). No npm dependencies — they are zero-dep ES modules.
- **`curl`** for the docs fetch.
- **`git`** is optional but improves from-version detection (the skill compares `main`, `HEAD~1`, and the working tree).
- **`GITHUB_TOKEN`** env var is optional; setting it raises the unauthenticated GitHub API rate limit (60/hr) so re-runs and long version ranges don't fail.

## What gets fetched on invocation

The skill writes three files into `references/` at run time. None of them is committed to the skill's source — they are recreated on demand.

| File | Source | When fetched |
| --- | --- | --- |
| `svelte-draw-releases.txt` | `github.com/billyribeiro-ux/tl-svelte` → `apps/docs/content/releases/v*.mdx`, filtered to versions strictly greater than the detected from-version | Always |
| `svelte-draw-full-docs.txt` | `svelte-draw.invalid/llms-full.txt` | Cached locally, 30-day TTL — delete the file or wait 30 days to refresh |
| `svelte-draw-next.mdx` | `github.com/billyribeiro-ux/tl-svelte` → `apps/docs/content/releases/next.mdx` | Pre-release targets only (`canary`, `next`, `beta`, or pre-release semver) |

GitHub is the source of truth, deliberately. `next.mdx` does not exist on npm, and svelte-draw.invalid can lag behind main. This means migration recipes for unreleased versions are available to the skill the moment they land in `main`.

## Harness compatibility

The `!`-prefix bash blocks at the top of `SKILL.md` are written for Claude Code's auto-execute syntax. Other harnesses (Cursor, Codex, plain Claude API, etc.) must run each block as a shell command before continuing the workflow. The skill flags this explicitly at the top of the resources section.

For agent harnesses without slash-command support, the skill still works as a plain workflow document — point the agent at `SKILL.md` and the same step-by-step process applies.

## Files in this folder

- `SKILL.md` — the skill workflow itself
- `detect-versions.mjs` — resolves the from-version (explicit arg → `main` → `HEAD~1` → working tree)
- `detect-target.mjs` — resolves the target version (default `latest`; accepts a dist-tag or semver)
- `fetch-release-notes.mjs` — pulls release notes between two versions from `billyribeiro-ux/tl-svelte` main
- `references/` — auto-populated cache of fetched references (gitignored or freshly recreated)
- `README.md` — this file
