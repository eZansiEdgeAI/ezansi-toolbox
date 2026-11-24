---
name: showcase-capture
description: Capture screenshots, a captioned GIF and a WebM tour of a web project from a YAML or TypeScript config. Use when the user wants a visual tour, portfolio screenshots, a README gallery, or an automated showcase for a web app or static site.
---

# Showcase capture

Use this skill when someone wants screenshots, a GIF or a WebM walkthrough of a web project. The tool runs Playwright against a local or live site, follows a declarative scenario, and writes a README and gallery.

## What it produces

- `screens/*.png`
- `README.md` with the screenshots and captions
- `index.html` gallery
- `showcase.json` manifest
- optional `*.gif`
- optional `*.webm`

## Install

From the skill directory:

```bash
node scripts/install.mjs
```

From the npm package:

```bash
npx showcase-capture install
```

Or manually:

```bash
npm install
npm run build
npx playwright install chromium
```

Check the environment:

```bash
npx showcase-capture doctor
```

## Workflow

1. Inspect the project.
   - Framework and dev command.
   - Build output directory for static sites.
   - Routes and key screens.
   - Authentication flow and test user.
   - Seed or reset mechanism, usually localStorage or cookies.
   - The 5 to 8 screens that best explain the product.
   - One end-to-end flow for the GIF and WebM.

2. Write `showcase.config.yaml`.
   - Use a static, command or live URL server.
   - Use roles and accessible names before CSS selectors.
   - Add a `reset` block so every scene starts from a known state.
   - Use `mask` for emails, tokens, names and payment details.
   - Keep the GIF flow short: 20 to 40 seconds.
   - Load `references/configuration.md` when you need the full config, server-mode or step syntax.

3. Validate the scenario. This checks the scenes and the GIF flow.

```bash
npx showcase-capture check
```

4. Capture.

```bash
npx showcase-capture capture
```

5. Review the output.
   - Open `README.md` and `index.html`.
   - Check the GIF and WebM.
   - Fix missing selectors, bad crops or timing.
   - Re-run with `--only <scene>` while iterating. This captures only that scene; GIF and WebM are skipped.

6. Leave the config and generated output uncommitted unless the user explicitly asks for a commit.

## Gotchas

- **Partial captures omit motion output.** `capture --only <scene>` writes the selected scene but skips GIF and WebM; run a full capture to refresh those files.
- **Configs can execute commands and code.** `build`, `server.command`, `eval` and TypeScript `run` steps execute in the project environment; use only trusted configs and project code.
- **Chromium is required even for checks.** Install it with `npx playwright install chromium` before `check` or `capture`; `doctor` reports when it is missing.

## Privacy

- Do not capture admin screens, secrets, tokens or payment details.
- Use `mask` for emails, names and account data.
- Use a test account with fictional data.
- Check the GIF and WebM before publishing.
- The tool does not upload anything.

## Troubleshooting

- `Could not launch Chromium`: run `npx playwright install chromium` or set `CHROME_PATH`.
- `Server did not respond`: check the command, port and URL. Use `reuseExisting: true` if the dev server is already running.
- `waitFor` times out: prefer `getByRole` selectors, check the page title, or add a `wait`.
- GIF is too long: shorten the steps, lower `fps`, or reduce the viewport.
- WebM is missing: check that `video.enabled` is true and a `gif` flow exists.
- Screenshots are wrong size: set the viewport in the scene or config.
