import { chromiumPath } from '../utils/chromium.js'
import { findConfig } from '../config/load.js'
import { log, warn } from '../utils/log.js'

export async function doctorCommand(cwd = process.cwd()): Promise<void> {
  const nodeMajor = Number(process.versions.node.split('.')[0])
  log(`node: ${process.versions.node}`)
  if (nodeMajor < 20) warn('Node 20 or newer is required')

  const config = findConfig(cwd)
  if (config) log(`config: ${config}`)
  else warn('no showcase config found; run "showcase-capture init"')

  const chrome = chromiumPath()
  if (chrome) log(`chromium: ${chrome}`)
  else warn('Chromium not found; run "npx playwright install chromium"')

  if (config && chrome && nodeMajor >= 20) {
    log('ready')
  }
}
