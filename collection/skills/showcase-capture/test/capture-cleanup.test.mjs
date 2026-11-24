import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function assertServerStopsOnBrowserFailure(command) {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'showcase-capture-test-'))

  try {
    const siteDir = path.join(tempDir, 'site')
    mkdirSync(siteDir)
    writeFileSync(path.join(siteDir, 'index.html'), '<h1>Test site</h1>')

    const configPath = path.join(tempDir, 'showcase.config.yaml')
    writeFileSync(
      configPath,
      [
        'name: Cleanup test',
        'outDir: output',
        'server:',
        '  mode: static',
        '  dir: site',
        'viewports:',
        '  desktop:',
        '    width: 800',
        '    height: 600',
        'scenes:',
        '  - name: home',
        '    steps:',
        '      - goto: /',
        '      - screenshot: home',
      ].join('\n'),
    )

    const invalidBrowserPath = path.join(tempDir, 'not-a-browser')
    writeFileSync(invalidBrowserPath, 'not a browser executable')

    const result = spawnSync(
      process.execPath,
      ['dist/cli.js', command, '--config', configPath],
      {
        cwd: packageRoot,
        encoding: 'utf8',
        env: {
          ...process.env,
          CHROME_PATH: invalidBrowserPath,
          PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: invalidBrowserPath,
        },
        timeout: 8000,
      },
    )

    assert.equal(result.error, undefined, result.error?.message)
    assert.equal(result.status, 1, result.stderr)
    assert.match(`${result.stdout}\n${result.stderr}`, /Could not launch Chromium/)
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

test('check stops its server when Chromium fails to launch', () => {
  assertServerStopsOnBrowserFailure('check')
})

test('capture stops its server when Chromium fails to launch', () => {
  assertServerStopsOnBrowserFailure('capture')
})
