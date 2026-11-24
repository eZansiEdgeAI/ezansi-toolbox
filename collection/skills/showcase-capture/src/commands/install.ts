import { spawn } from 'node:child_process'
import { log } from '../utils/log.js'

export async function installCommand(): Promise<void> {
  log('installing Chromium for Playwright')
  await new Promise<void>((resolve, reject) => {
    const child = spawn('npx', ['playwright', 'install', 'chromium'], {
      shell: true,
      stdio: 'inherit',
    })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`playwright install failed with exit code ${code}`))
    })
  })
  log('Chromium installed')
}
