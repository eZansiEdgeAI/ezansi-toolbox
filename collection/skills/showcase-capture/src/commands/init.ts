import { existsSync } from 'node:fs'
import path from 'node:path'
import { ensureDir, writeText } from '../utils/fs.js'
import { log } from '../utils/log.js'

const TEMPLATE = `name: My project
# baseUrl: http://localhost:5173
outDir: docs/showcase

server:
  mode: static
  dir: dist
  spa: true

reset:
  localStorage:
    - my-app.demo.v1

context:
  locale: en-ZA
  timezoneId: Africa/Johannesburg
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

gif:
  viewport: { width: 1024, height: 640 }
  size: { width: 960, height: 600 }
  fps: 8
  steps:
    - goto: /
    - caption: [1, "Home", "A short tour of the main flow"]
    - wait: 600

video:
  enabled: true
  size: { width: 1280, height: 720 }

readme:
  title: My project visual tour
  intro: A short walkthrough of the main screens.

gallery:
  title: My project screenshots
`

export async function initCommand(cwd = process.cwd()): Promise<void> {
  const configPath = path.join(cwd, 'showcase.config.yaml')
  if (!existsSync(configPath)) {
    await writeText(configPath, TEMPLATE)
    log(`created ${configPath}`)
  } else {
    log(`${configPath} already exists`)
  }

  await ensureDir(path.join(cwd, 'docs', 'showcase', 'screens'))
  log('created docs/showcase/screens')
}
