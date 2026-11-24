import type { Locator, Page } from 'playwright'
import type {
  CaptionSpec,
  LocatorSpec,
  ScreenshotSpec,
  Step,
  Viewport,
  WaitForUrlSpec,
} from '../config/types.js'

export type StepRuntime = {
  baseUrl: string
  gifMode?: boolean
  setViewport?: (viewport: Viewport) => Promise<void>
  onScreenshot?: (spec: ScreenshotSpec, page: Page) => Promise<void>
  onCaption?: (caption: CaptionSpec) => Promise<void> | void
  onReset?: () => Promise<void>
  onAfterGoto?: () => Promise<void> | void
  clickWithCursor?: (page: Page, locator: Locator) => Promise<void>
  viewportFor?: (name: string) => Viewport | undefined
  helpers?: Record<string, unknown>
}

export function joinUrl(baseUrl: string, target: string): string {
  if (/^https?:\/\//i.test(target) || target.startsWith('file://')) return target
  return new URL(target, baseUrl).toString()
}

export function locatorFor(page: Page, spec: LocatorSpec): Locator {
  if (typeof spec === 'string') return page.locator(spec)
  if ('role' in spec) {
    return page.getByRole(spec.role as Parameters<Page['getByRole']>[0], {
      name: spec.name,
      exact: false,
    })
  }
  if ('link' in spec) return page.getByRole('link', { name: spec.link })
  return page.getByText(spec.text)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function waitForUrlValue(spec: WaitForUrlSpec): RegExp {
  if (typeof spec === 'string') {
    if (spec.startsWith('/') && spec.lastIndexOf('/') > 0) {
      const end = spec.lastIndexOf('/')
      const pattern = spec.slice(1, end)
      const flags = spec.slice(end + 1)
      return new RegExp(pattern, flags)
    }
    return new RegExp(escapeRegExp(spec))
  }
  return new RegExp(spec.pattern, spec.flags)
}

function assertRunStep(value: unknown): asserts value is (args: {
  page: Page
  baseUrl: string
  helpers?: Record<string, unknown>
}) => Promise<void> | void {
  if (typeof value !== 'function') {
    throw new Error('run steps are only supported in TypeScript or JavaScript configs')
  }
}

export async function runSteps(
  page: Page,
  steps: Step[],
  runtime: StepRuntime,
): Promise<void> {
  for (const [index, step] of steps.entries()) {
    try {
      if ('goto' in step) {
        await page.goto(joinUrl(runtime.baseUrl, step.goto), {
          waitUntil: 'load',
        })
        await runtime.onAfterGoto?.()
      } else if ('waitFor' in step) {
        await locatorFor(page, step.waitFor).first().waitFor({
          state: 'visible',
          timeout: 15_000,
        })
      } else if ('click' in step) {
        const locator = locatorFor(page, step.click).first()
        await locator.waitFor({ state: 'visible', timeout: 15_000 })
        if (runtime.gifMode && runtime.clickWithCursor) {
          await runtime.clickWithCursor(page, locator)
        } else {
          await locator.click()
        }
      } else if ('fill' in step) {
        const locator = step.fill.selector
          ? page.locator(step.fill.selector)
          : page.getByRole(
              step.fill.role as Parameters<Page['getByRole']>[0],
              { name: step.fill.name, exact: false },
            )
        await locator.first().fill(step.fill.value)
      } else if ('press' in step) {
        await page.keyboard.press(step.press)
      } else if ('hover' in step) {
        await locatorFor(page, step.hover).first().hover()
      } else if ('waitForUrl' in step) {
        await page.waitForURL(waitForUrlValue(step.waitForUrl), {
          timeout: 15_000,
        })
        await runtime.onAfterGoto?.()
      } else if ('wait' in step) {
        await page.waitForTimeout(step.wait)
      } else if ('scroll' in step) {
        if (typeof step.scroll === 'number') {
          await page.evaluate((y) => window.scrollTo(0, y), step.scroll)
        } else {
          await page.locator(step.scroll.selector).first().scrollIntoViewIfNeeded()
        }
      } else if ('screenshot' in step) {
        if (!runtime.onScreenshot) {
          throw new Error('screenshot steps are not enabled in this run')
        }
        await runtime.onScreenshot(step.screenshot, page)
      } else if ('viewport' in step) {
        if (!runtime.setViewport || !runtime.viewportFor) {
          throw new Error('viewport steps are not enabled in this run')
        }
        const viewport = runtime.viewportFor(step.viewport)
        if (!viewport) {
          throw new Error(`Unknown viewport "${step.viewport}"`)
        }
        await runtime.setViewport(viewport)
      } else if ('caption' in step) {
        if (runtime.gifMode && runtime.onCaption) {
          await runtime.onCaption(step.caption)
        }
      } else if ('reset' in step) {
        if (!runtime.onReset) {
          throw new Error('reset steps are not enabled in this run')
        }
        await runtime.onReset()
      } else if ('eval' in step) {
        await page.evaluate(step.eval)
      } else if ('run' in step) {
        assertRunStep(step.run)
        await step.run({
          page,
          baseUrl: runtime.baseUrl,
          helpers: runtime.helpers,
        })
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause)
      throw new Error(
        `Step ${index + 1} failed (${Object.keys(step)[0]}): ${message}`,
      )
    }
  }
}
