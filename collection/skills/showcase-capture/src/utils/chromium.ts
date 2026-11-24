import { existsSync } from 'node:fs'
import { chromium, type Browser } from 'playwright'

export function chromiumPath(): string | undefined {
  const explicit =
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
    process.env.CHROME_PATH
  if (explicit && existsSync(explicit)) return explicit

  try {
    const bundled = chromium.executablePath()
    if (bundled && existsSync(bundled)) return bundled
  } catch {
    // Playwright may not have a browser installed.
  }

  const common = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ]

  return common.find((candidate) => existsSync(candidate))
}

export async function launchBrowser(headless = true): Promise<Browser> {
  const executablePath = chromiumPath()
  try {
    return await chromium.launch({
      headless,
      executablePath,
    })
  } catch (cause) {
    throw new Error(
      [
        'Could not launch Chromium.',
        'Run "npx playwright install chromium" or set CHROME_PATH.',
        cause instanceof Error ? cause.message : String(cause),
      ].join('\n'),
    )
  }
}
