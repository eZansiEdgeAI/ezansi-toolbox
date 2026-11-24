import { writeFile } from 'node:fs/promises'
import type { Page } from 'playwright'
import gifenc from 'gifenc'
import { PNG } from 'pngjs'
import type { Viewport } from '../config/types.js'
import { log } from '../utils/log.js'

const { applyPalette, GIFEncoder, quantize } = gifenc

export type ScreencastFrame = {
  data: string
  timestamp: number
}

type GifOptions = {
  width: number
  height: number
  fps: number
  output: string
}

export async function startScreencast(page: Page): Promise<{
  frames: ScreencastFrame[]
  stop: () => Promise<void>
}> {
  const session = await page.context().newCDPSession(page)
  const frames: ScreencastFrame[] = []

  session.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    frames.push({
      data,
      timestamp:
        typeof metadata?.timestamp === 'number'
          ? metadata.timestamp * 1000
          : Date.now(),
    })
    await session
      .send('Page.screencastFrameAck', { sessionId })
      .catch(() => {})
  })

  await session.send('Page.startScreencast', {
    format: 'png',
    maxWidth: 1024,
    maxHeight: 768,
    everyNthFrame: 1,
  })

  return {
    frames,
    stop: async () => {
      await session.send('Page.stopScreencast').catch(() => {})
      await session.detach().catch(() => {})
    },
  }
}

function resizeRgba(
  source: Uint8Array,
  sourceWidth: number,
  sourceHeight: number,
  width: number,
  height: number,
): Uint8Array {
  if (sourceWidth === width && sourceHeight === height) {
    return new Uint8Array(source)
  }

  const target = new Uint8Array(width * height * 4)
  const xRatio = sourceWidth / width
  const yRatio = sourceHeight / height

  for (let y = 0; y < height; y += 1) {
    const sourceY = (y + 0.5) * yRatio - 0.5
    const y0 = Math.max(0, Math.floor(sourceY))
    const y1 = Math.min(sourceHeight - 1, y0 + 1)
    const weightY = Math.max(0, Math.min(1, sourceY - y0))

    for (let x = 0; x < width; x += 1) {
      const sourceX = (x + 0.5) * xRatio - 0.5
      const x0 = Math.max(0, Math.floor(sourceX))
      const x1 = Math.min(sourceWidth - 1, x0 + 1)
      const weightX = Math.max(0, Math.min(1, sourceX - x0))

      const topLeft = (y0 * sourceWidth + x0) * 4
      const topRight = (y0 * sourceWidth + x1) * 4
      const bottomLeft = (y1 * sourceWidth + x0) * 4
      const bottomRight = (y1 * sourceWidth + x1) * 4
      const targetIndex = (y * width + x) * 4

      for (let channel = 0; channel < 4; channel += 1) {
        const top =
          source[topLeft + channel] +
          (source[topRight + channel] - source[topLeft + channel]) * weightX
        const bottom =
          source[bottomLeft + channel] +
          (source[bottomRight + channel] - source[bottomLeft + channel]) * weightX
        target[targetIndex + channel] = Math.round(
          top + (bottom - top) * weightY,
        )
      }
    }
  }

  return target
}

function decodeAndResize(
  frame: ScreencastFrame,
  size: Viewport,
): Uint8Array {
  const png = PNG.sync.read(Buffer.from(frame.data, 'base64'))
  return resizeRgba(png.data, png.width, png.height, size.width, size.height)
}

function buildRenderPlan(frames: ScreencastFrame[], fps: number): Array<{
  sourceIndex: number
  delay: number
}> {
  const first = frames[0]?.timestamp ?? 0
  const last = frames[frames.length - 1]?.timestamp ?? first
  const duration = Math.max(last - first, 1000)
  const step = 1000 / fps
  const plan: Array<{ sourceIndex: number; delay: number }> = []
  let sourceIndex = 0

  for (let elapsed = 0; elapsed <= duration; elapsed += step) {
    while (
      sourceIndex + 1 < frames.length &&
      frames[sourceIndex + 1].timestamp - first <= elapsed
    ) {
      sourceIndex += 1
    }

    const previous = plan[plan.length - 1]
    if (previous && previous.sourceIndex === sourceIndex) {
      previous.delay += step
    } else {
      plan.push({ sourceIndex, delay: step })
    }
  }

  return plan
}

export async function encodeGif(
  frames: ScreencastFrame[],
  options: GifOptions,
): Promise<void> {
  if (frames.length === 0) {
    log('no screencast frames captured; skipping GIF')
    return
  }

  const plan = buildRenderPlan(frames, options.fps)
  const size = { width: options.width, height: options.height }
  const sampleCount = Math.min(10, frames.length)
  const samples: Uint8Array[] = []

  for (let index = 0; index < sampleCount; index += 1) {
    const frameIndex = Math.floor(
      (index / Math.max(1, sampleCount - 1)) * (frames.length - 1),
    )
    samples.push(decodeAndResize(frames[frameIndex], size))
  }

  const combined = new Uint8Array(samples.reduce((total, sample) => total + sample.length, 0))
  let offset = 0
  for (const sample of samples) {
    combined.set(sample, offset)
    offset += sample.length
  }

  log(`encoding ${plan.length} GIF frames from ${frames.length} screencast frames`)
  const palette = quantize(combined, 192)
  const gif = GIFEncoder()
  let first = true

  for (const step of plan) {
    const rgba = decodeAndResize(frames[step.sourceIndex], size)
    const indexed = applyPalette(rgba, palette)
    gif.writeFrame(indexed, options.width, options.height, {
      palette: first ? palette : undefined,
      delay: Math.max(20, Math.round(step.delay)),
      repeat: first ? 0 : undefined,
    })
    first = false
  }

  gif.finish()
  await writeFile(options.output, gif.bytes())
  log(`wrote ${options.output}`)
}
