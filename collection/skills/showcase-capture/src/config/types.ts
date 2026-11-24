export type Viewport = {
  width: number
  height: number
}

export type LocatorSpec =
  | string
  | { role: string; name?: string }
  | { link: string }
  | { text: string }

export type WaitForUrlSpec =
  | string
  | { pattern: string; flags?: string }

export type FillSpec = {
  selector?: string
  role?: string
  name?: string
  value: string
}

export type ScreenshotSpec =
  | string
  | {
      name: string
      fullPage?: boolean
      selector?: string
    }

export type CaptionSpec = [number, string, string]

export type Step =
  | { goto: string }
  | { waitFor: LocatorSpec }
  | { click: LocatorSpec }
  | { fill: FillSpec }
  | { press: string }
  | { hover: LocatorSpec }
  | { waitForUrl: WaitForUrlSpec }
  | { wait: number }
  | { scroll: number | { selector: string } }
  | { screenshot: ScreenshotSpec }
  | { viewport: string }
  | { caption: CaptionSpec }
  | { reset: true }
  | { eval: string }
  | { run: unknown }

export type SceneConfig = {
  name: string
  viewport?: string
  steps: Step[]
}

export type ServerConfig =
  | {
      mode: 'static'
      dir: string
      port?: number
      spa?: boolean
    }
  | {
      mode: 'command'
      command: string
      url: string
      reuseExisting?: boolean
    }
  | {
      mode: 'none'
    }

export type ContextConfig = {
  locale?: string
  timezoneId?: string
  fixedTime?: string
  reducedMotion?: 'reduce' | 'no-preference'
  colorScheme?: 'light' | 'dark'
}

export type ResetConfig = {
  localStorage?: string[]
  cookies?: boolean
}

export type GifConfig = {
  name?: string
  viewport?: Viewport
  size?: Viewport
  fps?: number
  steps: Step[]
}

export type VideoConfig = {
  enabled?: boolean
  name?: string
  size?: Viewport
}

export type ReadmeConfig = {
  title?: string
  intro?: string
}

export type GalleryConfig = {
  title?: string
}

export type OverlayConfig = {
  enabled?: boolean
  background?: string
  accent?: string
  font?: string
  offsetX?: number
  offsetY?: number
}

export type ShowcaseConfig = {
  name: string
  baseUrl?: string
  outDir: string
  build?: string
  server: ServerConfig
  context?: ContextConfig
  reset?: ResetConfig
  viewports: Record<string, Viewport>
  scenes: SceneConfig[]
  gif?: GifConfig
  video?: VideoConfig
  readme?: ReadmeConfig
  gallery?: GalleryConfig
  overlay?: OverlayConfig
  mask?: string[]
}

export type ScreenshotRecord = {
  name: string
  path: string
}

export type SceneRecord = {
  name: string
  screenshots: ScreenshotRecord[]
  error?: string
}

export type Manifest = {
  name: string
  generatedAt: string
  scenes: SceneRecord[]
  gif?: string
  video?: string
}
