import path from 'node:path'
import type { Manifest, ShowcaseConfig } from '../config/types.js'
import { writeText } from '../utils/fs.js'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function relativeLink(outDir: string, file: string): string {
  return path.relative(outDir, file).split(path.sep).join('/')
}

export async function writeGallery(
  config: ShowcaseConfig,
  manifest: Manifest,
  outDir: string,
): Promise<void> {
  const title = config.gallery?.title ?? `${config.name} screenshots`
  const intro =
    config.readme?.intro ??
    `Screenshots and motion previews captured from ${config.name}.`

  const motion: string[] = []
  if (manifest.gif) {
    motion.push(
      `<figure class="motion"><img src="${escapeHtml(manifest.gif)}" alt="${escapeHtml(config.name)} showcase GIF" /><figcaption>GIF tour</figcaption></figure>`,
    )
  }
  if (manifest.video) {
    motion.push(
      `<figure class="motion"><video src="${escapeHtml(manifest.video)}" controls autoplay loop muted playsinline></video><figcaption>WebM tour</figcaption></figure>`,
    )
  }

  const sections = manifest.scenes
    .map((scene) => {
      const shots = scene.screenshots
        .map((screenshot) => {
          const link = relativeLink(outDir, path.join(outDir, screenshot.path))
          return `<figure class="shot"><button type="button" data-src="${escapeHtml(link)}"><img src="${escapeHtml(link)}" alt="${escapeHtml(scene.name)} ${escapeHtml(screenshot.name)}" loading="lazy" /></button><figcaption>${escapeHtml(screenshot.name)}</figcaption></figure>`
        })
        .join('\n')

      return `<section class="scene"><h2>${escapeHtml(scene.name)}</h2><div class="grid">${shots}</div></section>`
    })
    .join('\n')

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; --ink: #1b163b; --muted: #6b6685; --line: #e7e3f2; --surface: #fff; --canvas: #f7f5fb; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--canvas); color: var(--ink); font-family: Inter, system-ui, sans-serif; }
    main { max-width: 1200px; margin: 0 auto; padding: 48px 20px 80px; }
    h1 { font-size: clamp(2rem, 5vw, 3.5rem); letter-spacing: -0.04em; margin: 0 0 8px; }
    p.lede { color: var(--muted); max-width: 60ch; margin: 0 0 32px; }
    .motion { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 40px; }
    .motion img, .motion video { width: 100%; border-radius: 16px; border: 1px solid var(--line); background: var(--surface); }
    figure { margin: 0; }
    figcaption { margin-top: 6px; font-size: 12px; color: var(--muted); }
    .scene { margin-top: 40px; }
    .scene h2 { font-size: 1.2rem; margin: 0 0 16px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .shot button { padding: 0; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; background: var(--surface); cursor: zoom-in; display: block; width: 100%; }
    .shot img { width: 100%; display: block; }
    dialog { max-width: min(96vw, 1400px); max-height: 92vh; padding: 0; border: 0; background: transparent; }
    dialog::backdrop { background: rgba(27, 22, 59, 0.75); }
    dialog img { max-width: 100%; max-height: 88vh; display: block; border-radius: 12px; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p class="lede">${escapeHtml(intro)}</p>
    ${motion.join('\n')}
    ${sections}
  </main>
  <dialog id="lightbox"><img alt="" /></dialog>
  <script>
    const dialog = document.getElementById('lightbox');
    const image = dialog.querySelector('img');
    document.querySelectorAll('.shot button').forEach((button) => {
      button.addEventListener('click', () => {
        image.src = button.dataset.src;
        image.alt = button.querySelector('img').alt;
        dialog.showModal();
      });
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  </script>
</body>
</html>`

  await writeText(path.join(outDir, 'index.html'), html)
}
