# Configuration reference

> Load when: Authoring a showcase config or when the workflow needs full server, overlay, step, or TypeScript syntax.

## YAML example

```yaml
name: LaunchPad
baseUrl: http://localhost:5173
outDir: docs/showcase

server:
  mode: command
  command: npm run dev
  url: http://localhost:5173

reset:
  localStorage:
    - launchpad.demo.v2

context:
  locale: en-ZA
  timezoneId: Africa/Johannesburg
  fixedTime: "2026-11-09T09:00:00+02:00"
  reducedMotion: reduce

viewports:
  desktop: { width: 1440, height: 900 }
  mobile: { width: 390, height: 844 }

scenes:
  - name: desktop
    viewport: desktop
    steps:
      - goto: /
      - waitFor: h1
      - screenshot: 01-home

      - goto: /login
      - waitFor: form
      - click:
          role: button
          name: Continue as test user
      - waitForUrl: "#/app/dashboard"
      - screenshot: 06-dashboard

  - name: mobile
    viewport: mobile
    steps:
      - goto: /login
      - waitFor: form
      - click:
          role: button
          name: Continue as test user
      - waitForUrl: "#/app/dashboard"
      - screenshot: 21-mobile-dashboard

gif:
  viewport: { width: 1024, height: 640 }
  size: { width: 960, height: 600 }
  fps: 8
  steps:
    - goto: /
    - caption: [1, Discover, "Learn, match and book in one place"]
    - wait: 600
    - scroll: 660
    - goto: /learn
    - caption: [1, "Explore six practical modules", "Built around real freelance questions"]

video:
  enabled: true
  size: { width: 1280, height: 720 }
```

## Server modes

Static site:

```yaml
server:
  mode: static
  dir: dist
  spa: true
```

Dev server:

```yaml
server:
  mode: command
  command: npm run dev
  url: http://localhost:5173
```

Live URL:

```yaml
server:
  mode: none
baseUrl: https://example.com
```

Optional build step before serving:

```yaml
build: npm run build
```

## Overlay

The GIF overlay is optional. Use it to match the project brand or move the caption away from important content.

```yaml
overlay:
  background: "rgba(8, 20, 38, 0.93)"
  accent: "#5367e8"
  font: "Inter, system-ui, sans-serif"
  offsetX: 24
  offsetY: 24
```

Set `overlay.enabled: false` to record the GIF without captions or cursor.

## Steps

- `goto: /path`
- `waitFor: h1` or `waitFor: { role: heading, name: Dashboard }`
- `click: ".selector"` or `click: { role: button, name: Continue }`
- `fill: { selector: "#email", value: "test@example.com" }`
- `press: Enter`
- `hover: ".card"`
- `waitForUrl: "#/app/dashboard"` or `waitForUrl: { pattern: "/app/", flags: "i" }`
- `wait: 500`
- `scroll: 600` or `scroll: { selector: ".footer" }`
- `screenshot: 01-home`
- `screenshot: { name: 01-home, fullPage: true }`
- `viewport: mobile`
- `caption: [1, "Title", "Subtitle"]` (GIF flow only)
- `reset: true`
- `eval: "localStorage.setItem('key', 'value')"`
- `run: function` (TypeScript or JavaScript config only)

## TypeScript config

Use a TypeScript config when the scenario needs custom logic:

```ts
import { defineShowcase } from 'showcase-capture'

export default defineShowcase({
  name: 'My project',
  outDir: 'docs/showcase',
  server: { mode: 'static', dir: 'dist' },
  scenes: [
    {
      name: 'desktop',
      steps: [
        { goto: '/' },
        {
          run: async ({ page }) => {
            await page.evaluate(() => localStorage.setItem('theme', 'light'))
          },
        },
        { waitFor: 'h1' },
        { screenshot: '01-home' },
      ],
    },
  ],
})
```
