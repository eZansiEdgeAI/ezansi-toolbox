import type { Locator, Page } from 'playwright'
import type { CaptionSpec, OverlayConfig } from '../config/types.js'

const DEFAULTS = {
  background: 'rgba(8, 20, 38, 0.93)',
  accent: '#5367e8',
  font: 'Inter, system-ui, sans-serif',
  offsetX: 24,
  offsetY: 24,
}

function overlayCss(overlay: OverlayConfig = {}): string {
  const background = overlay.background ?? DEFAULTS.background
  const accent = overlay.accent ?? DEFAULTS.accent
  const font = overlay.font ?? DEFAULTS.font
  const offsetX = overlay.offsetX ?? DEFAULTS.offsetX
  const offsetY = overlay.offsetY ?? DEFAULTS.offsetY

  return `
#__showcase_caption {
  position: fixed;
  left: ${offsetX}px;
  bottom: ${offsetY}px;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 430px;
  padding: 12px 16px;
  border-radius: 14px;
  background: ${background};
  color: #fff;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
  font-family: ${font};
  pointer-events: none;
}
#__showcase_caption .__n {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: ${accent};
  font-size: 13px;
  font-weight: 700;
}
#__showcase_caption .__t {
  display: block;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
#__showcase_caption .__s {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 400;
  opacity: 0.72;
}
#__showcase_cursor {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 2147483001;
  width: 18px;
  height: 18px;
  border: 2px solid #0f172a;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.32), 0 8px 18px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition:
    left 0.28s cubic-bezier(0.2, 0.8, 0.2, 1),
    top 0.28s cubic-bezier(0.2, 0.8, 0.2, 1),
    width 0.12s ease,
    height 0.12s ease;
  opacity: 0;
}
#__showcase_cursor.__visible { opacity: 1; }
#__showcase_cursor.__clicking {
  width: 12px;
  height: 12px;
  border-color: #fff;
  background: ${accent};
}
`
}

export async function installOverlay(
  page: Page,
  overlay: OverlayConfig = {},
): Promise<void> {
  if (overlay.enabled === false) return

  await page.evaluate((css) => {
    document.getElementById('__showcase_style')?.remove()
    document.getElementById('__showcase_caption')?.remove()
    document.getElementById('__showcase_cursor')?.remove()

    const style = document.createElement('style')
    style.id = '__showcase_style'
    style.textContent = css
    document.head.appendChild(style)

    const caption = document.createElement('div')
    caption.id = '__showcase_caption'
    caption.innerHTML =
      '<span class="__n">1</span><span><span class="__t">Preview</span><span class="__s"></span></span>'
    document.body.appendChild(caption)

    const cursor = document.createElement('div')
    cursor.id = '__showcase_cursor'
    document.body.appendChild(cursor)
  }, overlayCss(overlay))
}

export async function setCaption(
  page: Page,
  caption: CaptionSpec,
): Promise<void> {
  await page.evaluate(
    ({ number, title, subtitle }) => {
      const element = document.getElementById('__showcase_caption')
      if (!element) return
      element.innerHTML = `<span class="__n">${number}</span><span><span class="__t">${title}</span><span class="__s">${subtitle}</span></span>`
      element.animate(
        [{ opacity: 0.99 }, { opacity: 1 }],
        { duration: 80, easing: 'linear' },
      )
    },
    { number: caption[0], title: caption[1], subtitle: caption[2] },
  )
}

export async function moveCursor(
  page: Page,
  locator: Locator,
): Promise<void> {
  const box = await locator.boundingBox()
  if (!box) return
  await page.evaluate(
    ({ x, y }) => {
      const cursor = document.getElementById('__showcase_cursor')
      if (!cursor) return
      cursor.classList.add('__visible')
      cursor.style.left = `${x}px`
      cursor.style.top = `${y}px`
    },
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  )
  await page.waitForTimeout(220)
}

export async function clickWithCursor(
  page: Page,
  locator: Locator,
  after = 200,
): Promise<void> {
  await locator.scrollIntoViewIfNeeded().catch(() => {})
  await page.waitForTimeout(80)
  await moveCursor(page, locator)
  await page.evaluate(() =>
    document.getElementById('__showcase_cursor')?.classList.add('__clicking'),
  )
  await page.waitForTimeout(60)
  await locator.click()
  await page.waitForTimeout(100)
  await page.evaluate(() =>
    document.getElementById('__showcase_cursor')?.classList.remove('__clicking'),
  )
  await page.waitForTimeout(after)
}

export async function scrollTo(
  page: Page,
  y: number,
  duration = 760,
): Promise<void> {
  await page.evaluate(
    async ({ y, duration }) => {
      const start = window.scrollY
      const startedAt = performance.now()
      await new Promise<void>((resolve) => {
        const tick = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / duration)
          const eased = 1 - Math.pow(1 - progress, 3)
          window.scrollTo(0, start + (y - start) * eased)
          if (progress < 1) requestAnimationFrame(tick)
          else resolve()
        }
        requestAnimationFrame(tick)
      })
    },
    { y, duration },
  )
}
