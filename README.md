# eZansi Toolbox

A collection of skills, agents, plugins, and tools that augment the student journey with AI. Each item is self-contained and documents its own setup.

`collection/` is the catalogue. To use an item, copy it into your agent's active skills directory (for example `.agents/skills/` or `.opencode/skills/`); tools install from their own folder.

## Skills

| Skill | Description |
|---|---|
| [create-project-documentation](collection/skills/create-project-documentation/SKILL.md) | Builds or refreshes a complete project documentation set — README, ADRs, user and admin guides, changelog, release notes — and records upkeep rules in `AGENTS.md`. |
| [design-thinking-coach](collection/skills/design-thinking-coach/README.md) | Coaches grades 5–12 through a design-thinking ideation session with age-banded questions, research verification, and a final proposal, research log, and decision record. |
| [showcase-capture](collection/skills/showcase-capture/SKILL.md) | Captures screenshots, a captioned GIF, and a WebM tour of a web project from a YAML or TypeScript scenario. |
| [skill-creator](collection/skills/skill-creator/SKILL.md) | Interviews you about a skill idea, scaffolds it from a template, and validates it with `skill-review`. |
| [skill-review](collection/skills/skill-review/SKILL.md) | Audits skills against agentskills.io best practices on six quality axes and can apply approved improvements. |

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

Keep descriptions to one line: what it does and who it is for. Setup, usage, and limits belong in the item's own documentation.

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

MIT — see [LICENSE](LICENSE).
