# Cursor Project Rules

These `.mdc` files are **generated** from `~/.ai/*.md` — the same global agent
policies that Claude Code loads via `~/.claude/CLAUDE.md`. They give Cursor the
same rules as Claude in this project.

## Source of truth

Edit the originals in `~/.ai/`, not the files here:

| `~/.ai/`                          | `.cursor/rules/`                   |
| --------------------------------- | ---------------------------------- |
| `tdd-solid-policy.md`             | `tdd-solid-policy.mdc`             |
| `conventional-commits-policy.md`  | `conventional-commits-policy.mdc`  |
| `decision-radar-policy.md`        | `decision-radar-policy.mdc`        |
| `interactive-diagrams-policy.md`  | `interactive-diagrams-policy.mdc`  |

## Regenerating after changes

```sh
./scripts/sync-cursor-rules.sh
```

The script wraps each source file with `alwaysApply: true` frontmatter so Cursor
applies the rule on every chat in this project.

## Adding a new policy

Drop a new `*.md` file in `~/.ai/` and re-run the sync script — it picks up any
new files automatically.
