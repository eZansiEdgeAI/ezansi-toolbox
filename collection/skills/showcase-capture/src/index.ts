import type { ShowcaseConfig } from './config/types.js'

export function defineShowcase(config: ShowcaseConfig): ShowcaseConfig {
  return config
}

export type {
  ShowcaseConfig,
  SceneConfig,
  Step,
  Viewport,
  ServerConfig,
  GifConfig,
  VideoConfig,
  OverlayConfig,
} from './config/types.js'
