import path from 'node:path'
import type { Manifest, ShowcaseConfig } from '../config/types.js'
import { writeText } from '../utils/fs.js'

function relativeLink(outDir: string, file: string): string {
  return path.relative(outDir, file).split(path.sep).join('/')
}

export async function writeReadme(
  config: ShowcaseConfig,
  manifest: Manifest,
  outDir: string,
): Promise<void> {
  const title = config.readme?.title ?? `${config.name} visual tour`
  const intro =
    config.readme?.intro ??
    `Screenshots and motion previews captured from ${config.name}.`

  const lines: string[] = [`# ${title}`, '', intro, '']

  if (manifest.gif) {
    lines.push(`![${config.name} showcase](${manifest.gif})`, '')
  }

  if (manifest.video) {
    lines.push(
      `<video src="${manifest.video}" controls autoplay loop muted playsinline></video>`,
      '',
    )
  }

  for (const scene of manifest.scenes) {
    lines.push(`## ${scene.name}`, '')
    for (const screenshot of scene.screenshots) {
      const link = relativeLink(outDir, path.join(outDir, screenshot.path))
      lines.push(`![${scene.name} ${screenshot.name}](${link})`, '')
    }
  }

  await writeText(path.join(outDir, 'README.md'), `${lines.join('\n').trim()}\n`)
}
