# eZansi Toolbox

A collection of skills, agents, plugins, and tools for learning with AI. Each item is self-contained.

`collection/` is the catalogue. Copy a skill into your agent's active skills directory (for example `.agents/skills/` or `.opencode/skills/`). Tools install from their own folder.

## Skills

| Skill | Description |
|---|---|
| [create-project-documentation](collection/skills/create-project-documentation/SKILL.md) | Builds or refreshes a project's documentation set (README, ADRs, user and admin guides, changelog, release notes) and records upkeep rules in `AGENTS.md`. |
| [design-thinking-coach](collection/skills/design-thinking-coach/README.md) | Coaches students in grades 5–12 through a design-thinking session with grade-banded questions and source checks, then produces a proposal, research log, and decision record. |
| [showcase-capture](collection/skills/showcase-capture/SKILL.md) | Captures screenshots, a captioned GIF, and a WebM tour of a web project from a YAML or TypeScript config. |
| [skill-creator](collection/skills/skill-creator/SKILL.md) | Interviews you about a skill idea, scaffolds it from a template, and validates it with `skill-review`. |
| [skill-review](collection/skills/skill-review/SKILL.md) | Audits skills against agentskills.io best practices across six quality axes, then applies the improvements you approve. |

## Agents

| Agent | Description |
|---|---|
| _None yet._ | |

## Plugins

| Plugin | Description |
|---|---|
| _None yet._ | |

## Tools

| Tool | Description |
|---|---|
| [md-doc-search](collection/tools/md-doc-search/README.md) | Installs incremental Markdown search and a local MCP server into a repository so agents can find and read the right docs. |

## Adding a New Item

1. Put it in the matching folder: `collection/skills/<name>/`, `collection/agents/<name>/`, `collection/plugins/<name>/`, or `collection/tools/<name>/`.
2. Add one row to that section's table. Link the name to its entry file (`SKILL.md`, `README.md`, or the agent/plugin definition) and keep the description to one sentence.
3. If the section still says _None yet._, replace that row with the real entry.

Keep descriptions to one line: what it does and who it is for. Put setup, usage, and limits in the item's own documentation.

## Repository Layout

```text
collection/
  skills/    # Agent skills, one folder per skill with a SKILL.md
  agents/    # Agent definitions
  plugins/   # Plugins
  tools/     # Standalone CLIs and utilities
.agents/
  skills/    # This repository's active maintainer skills
```

## License

MIT. See [LICENSE](LICENSE).
