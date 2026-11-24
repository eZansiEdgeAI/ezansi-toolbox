import os from 'node:os'
import path from 'node:path'
import type { Browser, BrowserContext, Locator, Page } from 'playwright'
import type {
  Manifest,
  SceneRecord,
  ScreenshotSpec,
  ShowcaseConfig,
  Viewport,
} from '../config/types.js'
import { ensureDir, ensurePng, moveFile, slugify, writeJson } from '../utils/fs.js'
import { launchBrowser } from '../utils/chromium.js'
import { log } from '../utils/log.js'
import { startServer } from './server.js'
import { runSteps } from './steps.js'
import {
  clickWithCursor,
  installOverlay,
  scrollTo,
  setCaption,
} from './overlay.js'
import { encodeGif, startScreencast } from './gif.js'
import { writeReadme } from './readme.js'
import { writeGallery } from './gallery.js'

export type CaptureOptions = {
  config: ShowcaseConfig
  cwd?: string
  only?: string
  skipGif?: boolean
  skipVideo?: boolean
  headed?: boolean
  baseUrl?: string
  outDir?: string
}

function initScript(fixedTime?: string): string {
  const time = fixedTime ? `new Date(${JSON.stringify(fixedTime)}).getTime()` : 'Date.now()'
  return `
(() => {
  const fixedTime = ${time};
  const NativeDate = Date;
  class ShowcaseDate extends NativeDate {
    constructor(...args) {
      if (args.length === 0) super(fixedTime);
      else super(...args);
    }
    static now() { return fixedTime; }
  }
  Object.defineProperty(window, 'Date', {
    value: ShowcaseDate,
    configurable: true,
    writable: true,
  });
  const style = document.createElement('style');
  style.textContent = 'html{scrollbar-width:none}html::-webkit-scrollbar{display:none}';
  document.head?.appendChild(style);
})();
`
}

function contextOptions(config: ShowcaseConfig, viewport: Viewport) {
  const context = config.context ?? {}
  return {
    viewport,
    deviceScaleFactor: 1,
    locale: context.locale,
    timezoneId: context.timezoneId,
    reducedMotion: context.reducedMotion,
    colorScheme: context.colorScheme,
  }
}

async function resetPage(
  page: Page,
  context: BrowserContext,
  config: ShowcaseConfig,
  baseUrl: string,
): Promise<void> {
  await page.goto(baseUrl, { waitUntil: 'load' })

  const localStorageKeys = config.reset?.localStorage ?? []
  if (localStorageKeys.length > 0) {
    await page.evaluate((keys) => {
      for (const key of keys) window.localStorage.removeItem(key)
    }, localStorageKeys)
  }

  if (config.reset?.cookies) {
    await context.clearCookies()
  }

  if (localStorageKeys.length > 0 || config.reset?.cookies) {
    await page.reload({ waitUntil: 'load' })
  }
}

function maskLocators(page: Page, config: ShowcaseConfig): Locator[] {
  return (config.mask ?? []).map((selector) => page.locator(selector))
}

async function takeScreenshot(
  page: Page,
  config: ShowcaseConfig,
  outDir: string,
  spec: ScreenshotSpec,
): Promise<{ name: string; path: string }> {
  const name = typeof spec === 'string' ? spec : spec.name
  const fileName = ensurePng(name)
  const target = path.join(outDir, 'screens', fileName)
  const mask = maskLocators(page, config)

  if (typeof spec === 'string') {
    await page.screenshot({ path: target, fullPage: false, mask })
  } else if (spec.selector) {
    await page
      .locator(spec.selector)
      .first()
      .screenshot({ path: target, mask })
  } else {
    await page.screenshot({ path: target, fullPage: spec.fullPage ?? false, mask })
  }

  log(`screenshot: ${fileName}`)
  return { name, path: `screens/${fileName}` }
}

async function captureScene(
  browser: Browser,
  config: ShowcaseConfig,
  baseUrl: string,
  outDir: string,
  sceneName: string,
  viewportName: string,
  steps: ShowcaseConfig['scenes'][number]['steps'],
): Promise<SceneRecord> {
  const viewport = config.viewports[viewportName]
  if (!viewport) throw new Error(`Unknown viewport "${viewportName}"`)

  const context = await browser.newContext(contextOptions(config, viewport))
  const page = await context.newPage()
  await page.addInitScript(initScript(config.context?.fixedTime))

  const record: SceneRecord = { name: sceneName, screenshots: [] }

  try {
    await resetPage(page, context, config, baseUrl)
    await runSteps(page, steps, {
      baseUrl,
      onScreenshot: async (spec) => {
        record.screenshots.push(await takeScreenshot(page, config, outDir, spec))
      },
      setViewport: async (next) => {
        await page.setViewportSize(next)
      },
      viewportFor: (name) => config.viewports[name],
      onReset: async () => {
        await resetPage(page, context, config, baseUrl)
      },
    })
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause)
    record.error = message
    throw new Error(`Scene "${sceneName}" failed: ${message}`)
  } finally {
    await context.close()
  }

  return record
}

async function captureMotion(
  browser: Browser,
  config: ShowcaseConfig,
  baseUrl: string,
  outDir: string,
  skipVideo: boolean,
): Promise<{ gif?: string; video?: string }> {
  if (!config.gif) return {}

  const viewport = config.gif.viewport ?? { width: 1024, height: 640 }
  const size = config.gif.size ?? { width: 960, height: 600 }
  const fps = config.gif.fps ?? 8
  const videoEnabled = Boolean(config.video?.enabled) && !skipVideo
  const videoDir = path.join(os.tmpdir(), `showcase-capture-${Date.now()}`)
  await ensureDir(videoDir)

  const context = await browser.newContext({
    ...contextOptions(config, viewport),
    recordVideo: videoEnabled
      ? {
          dir: videoDir,
          size: config.video?.size ?? viewport,
        }
      : undefined,
  })
  const page = await context.newPage()
  await page.addInitScript(initScript(config.context?.fixedTime))
  const video = videoEnabled ? page.video() : undefined

  await resetPage(page, context, config, baseUrl)
  await installOverlay(page, config.overlay)

  const { frames, stop } = await startScreencast(page)

  try {
    await runSteps(page, config.gif.steps, {
      baseUrl,
      gifMode: true,
      clickWithCursor,
      onCaption: async (caption) => {
        log(`caption: ${caption[0]} ${caption[1]}`)
        await setCaption(page, caption)
        await page.evaluate(
          () =>
            new Promise<void>((resolve) => {
              requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
            }),
        )
        await page.waitForTimeout(120)
      },
      onScreenshot: async (spec) => {
        await takeScreenshot(page, config, outDir, spec)
      },
      setViewport: async (next) => {
        await page.setViewportSize(next)
      },
      viewportFor: (name) => config.viewports[name],
      onAfterGoto: async () => {
        await installOverlay(page, config.overlay)
      },
      onReset: async () => {
        await resetPage(page, context, config, baseUrl)
        await installOverlay(page, config.overlay)
      },
      helpers: { scrollTo },
    })
    await page.waitForTimeout(500)
  } finally {
    await stop()
    await context.close()
  }

  const gifName = config.gif.name ?? `${slugify(config.name)}.gif`
  const gifPath = path.join(outDir, gifName)
  await encodeGif(frames, {
    width: size.width,
    height: size.height,
    fps,
    output: gifPath,
  })

  let videoRelative: string | undefined
  if (video) {
    const source = await video.path()
    if (source) {
      const videoName = config.video?.name ?? `${slugify(config.name)}.webm`
      const target = path.join(outDir, videoName)
      await moveFile(source, target)
      videoRelative = videoName
      log(`wrote ${target}`)
    }
  }

  return {
    gif: gifName,
    video: videoRelative,
  }
}

export async function capture(options: CaptureOptions): Promise<Manifest> {
  const cwd = options.cwd ?? process.cwd()
  const config = options.baseUrl
    ? {
        ...options.config,
        baseUrl: options.baseUrl,
        server: { mode: 'none' as const },
      }
    : options.config
  const outDir = path.resolve(cwd, options.outDir ?? config.outDir)
  await ensureDir(path.join(outDir, 'screens'))

  const server = await startServer(config, cwd)
  let browser: Browser | undefined

  try {
    browser = await launchBrowser(!options.headed)
    const scenes = options.only
      ? config.scenes.filter((scene) => scene.name === options.only)
      : config.scenes

    if (scenes.length === 0) {
      throw new Error(`No scene named "${options.only}"`)
    }

    const records: SceneRecord[] = []
    for (const scene of scenes) {
      log(`scene: ${scene.name}`)
      records.push(
        await captureScene(
          browser,
          config,
          server.url,
          outDir,
          scene.name,
          scene.viewport ?? 'desktop',
          scene.steps,
        ),
      )
    }

    const motion = options.skipGif || options.only
      ? {}
      : await captureMotion(browser, config, server.url, outDir, Boolean(options.skipVideo))

    const manifest: Manifest = {
      name: config.name,
      generatedAt: new Date().toISOString(),
      scenes: records,
      ...motion,
    }

    await writeJson(path.join(outDir, 'showcase.json'), manifest)
    await writeReadme(config, manifest, outDir)
    await writeGallery(config, manifest, outDir)
    log(`wrote ${outDir}`)

    return manifest
  } finally {
    try {
      await browser?.close()
    } finally {
      await server.stop()
    }
  }
}

export async function check(options: CaptureOptions): Promise<void> {
  const cwd = options.cwd ?? process.cwd()
  const config = options.baseUrl
    ? {
        ...options.config,
        baseUrl: options.baseUrl,
        server: { mode: 'none' as const },
      }
    : options.config

  const server = await startServer(config, cwd)
  let browser: Browser | undefined

  try {
    browser = await launchBrowser(!options.headed)
    const scenes = options.only
      ? config.scenes.filter((scene) => scene.name === options.only)
      : config.scenes

    for (const scene of scenes) {
      const viewportName = scene.viewport ?? 'desktop'
      const viewport = config.viewports[viewportName]
      if (!viewport) throw new Error(`Unknown viewport "${viewportName}"`)

      const context = await browser.newContext(contextOptions(config, viewport))
      const page = await context.newPage()
      await page.addInitScript(initScript(config.context?.fixedTime))

      try {
        await resetPage(page, context, config, server.url)
        await runSteps(page, scene.steps, {
          baseUrl: server.url,
          setViewport: async (next) => page.setViewportSize(next),
          viewportFor: (name) => config.viewports[name],
          onReset: async () => resetPage(page, context, config, server.url),
          onScreenshot: async () => {},
          onCaption: async () => {},
          clickWithCursor: async (_page, locator) => locator.click(),
        })
        log(`check passed: ${scene.name}`)
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause)
        throw new Error(`Scene "${scene.name}" failed: ${message}`)
      } finally {
        await context.close()
      }
    }

    if (config.gif) {
      const viewport = config.gif.viewport ?? { width: 1024, height: 640 }
      const context = await browser.newContext(contextOptions(config, viewport))
      const page = await context.newPage()
      await page.addInitScript(initScript(config.context?.fixedTime))

      try {
        await resetPage(page, context, config, server.url)
        await installOverlay(page, config.overlay)
        await runSteps(page, config.gif.steps, {
          baseUrl: server.url,
          gifMode: true,
          clickWithCursor,
          onCaption: async (caption) => setCaption(page, caption),
          onScreenshot: async () => {},
          setViewport: async (next) => page.setViewportSize(next),
          viewportFor: (name) => config.viewports[name],
          onAfterGoto: async () => installOverlay(page, config.overlay),
          onReset: async () => {
            await resetPage(page, context, config, server.url)
            await installOverlay(page, config.overlay)
          },
        })
        log('check passed: gif')
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause)
        throw new Error(`GIF flow failed: ${message}`)
      } finally {
        await context.close()
      }
    }
  } finally {
    try {
      await browser?.close()
    } finally {
      await server.stop()
    }
  }
}
