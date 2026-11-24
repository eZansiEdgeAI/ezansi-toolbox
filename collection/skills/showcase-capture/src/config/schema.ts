import { z } from 'zod'
import type { ShowcaseConfig } from './types.js'

const viewportSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})

export const locatorSchema = z.union([
  z.string(),
  z.object({ role: z.string(), name: z.string().optional() }),
  z.object({ link: z.string() }),
  z.object({ text: z.string() }),
])

const waitForUrlSchema = z.union([
  z.string(),
  z.object({ pattern: z.string(), flags: z.string().optional() }),
])

const fillSchema = z
  .object({
    selector: z.string().optional(),
    role: z.string().optional(),
    name: z.string().optional(),
    value: z.string(),
  })
  .refine((value) => Boolean(value.selector || value.role), {
    message: 'fill requires a selector or a role',
  })

const screenshotSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    fullPage: z.boolean().optional(),
    selector: z.string().optional(),
  }),
])

const captionSchema = z.tuple([z.number().int().nonnegative(), z.string(), z.string()])

export const stepSchema = z.union([
  z.object({ goto: z.string() }),
  z.object({ waitFor: locatorSchema }),
  z.object({ click: locatorSchema }),
  z.object({ fill: fillSchema }),
  z.object({ press: z.string() }),
  z.object({ hover: locatorSchema }),
  z.object({ waitForUrl: waitForUrlSchema }),
  z.object({ wait: z.number().nonnegative() }),
  z.object({
    scroll: z.union([z.number(), z.object({ selector: z.string() })]),
  }),
  z.object({ screenshot: screenshotSchema }),
  z.object({ viewport: z.string() }),
  z.object({ caption: captionSchema }),
  z.object({ reset: z.literal(true) }),
  z.object({ eval: z.string() }),
  z.object({ run: z.any() }),
])

const sceneSchema = z.object({
  name: z.string().min(1),
  viewport: z.string().optional(),
  steps: z.array(stepSchema).min(1),
})

const serverSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('static'),
    dir: z.string().min(1),
    port: z.number().int().positive().optional(),
    spa: z.boolean().optional(),
  }),
  z.object({
    mode: z.literal('command'),
    command: z.string().min(1),
    url: z.string().url(),
    reuseExisting: z.boolean().optional(),
  }),
  z.object({
    mode: z.literal('none'),
  }),
])

const contextSchema = z.object({
  locale: z.string().optional(),
  timezoneId: z.string().optional(),
  fixedTime: z.string().optional(),
  reducedMotion: z.enum(['reduce', 'no-preference']).optional(),
  colorScheme: z.enum(['light', 'dark']).optional(),
})

const resetSchema = z.object({
  localStorage: z.array(z.string()).optional(),
  cookies: z.boolean().optional(),
})

const gifSchema = z.object({
  name: z.string().optional(),
  viewport: viewportSchema.optional(),
  size: viewportSchema.optional(),
  fps: z.number().positive().optional(),
  steps: z.array(stepSchema).min(1),
})

const videoSchema = z.object({
  enabled: z.boolean().optional(),
  name: z.string().optional(),
  size: viewportSchema.optional(),
})

const overlaySchema = z.object({
  enabled: z.boolean().optional(),
  background: z.string().optional(),
  accent: z.string().optional(),
  font: z.string().optional(),
  offsetX: z.number().optional(),
  offsetY: z.number().optional(),
})

export const configSchema = z.object({
  name: z.string().min(1),
  baseUrl: z.string().url().optional(),
  outDir: z.string().default('docs/showcase'),
  build: z.string().optional(),
  server: serverSchema.default({ mode: 'none' }),
  context: contextSchema.optional(),
  reset: resetSchema.optional(),
  viewports: z
    .record(z.string(), viewportSchema)
    .default({
      desktop: { width: 1440, height: 900 },
      mobile: { width: 390, height: 844 },
    }),
  scenes: z.array(sceneSchema).min(1),
  gif: gifSchema.optional(),
  video: videoSchema.optional(),
  readme: z
    .object({
      title: z.string().optional(),
      intro: z.string().optional(),
    })
    .optional(),
  gallery: z
    .object({
      title: z.string().optional(),
    })
    .optional(),
  overlay: overlaySchema.optional(),
  mask: z.array(z.string()).optional(),
})

export function parseConfig(input: unknown): ShowcaseConfig {
  const parsed = configSchema.parse(input) as ShowcaseConfig
  if (parsed.server.mode === 'none' && !parsed.baseUrl) {
    throw new Error('baseUrl is required when server.mode is "none"')
  }
  if (parsed.video?.enabled && !parsed.gif) {
    throw new Error('video.enabled requires a gif flow to record')
  }
  return parsed
}
