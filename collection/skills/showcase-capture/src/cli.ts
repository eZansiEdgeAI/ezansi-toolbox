#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { loadConfig } from './config/load.js'
import { capture, check } from './engine/capture.js'
import { initCommand } from './commands/init.js'
import { doctorCommand } from './commands/doctor.js'
import { installCommand } from './commands/install.js'
import { error, log } from './utils/log.js'

const VERSION = '0.1.0'

const HELP = `showcase-capture ${VERSION}

Usage:
  showcase-capture init
  showcase-capture check [--config <file>] [--only <scene>]
  showcase-capture capture [--config <file>] [--only <scene>] [--out <dir>]
  showcase-capture doctor
  showcase-capture install

Options:
  --config <file>   Path to showcase.config.yaml, .ts, .js or .mjs
  --only <scene>    Run one scene
  --skip-gif        Skip GIF and video capture
  --skip-video      Capture GIF but not WebM
  --headed          Show the browser
  --base-url <url>  Override the server URL
  --out <dir>       Override the output directory
  -h, --help        Show this help
  -v, --version     Show the version
`

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      config: { type: 'string' },
      only: { type: 'string' },
      'skip-gif': { type: 'boolean', default: false },
      'skip-video': { type: 'boolean', default: false },
      headed: { type: 'boolean', default: false },
      'base-url': { type: 'string' },
      out: { type: 'string' },
      help: { type: 'boolean', short: 'h', default: false },
      version: { type: 'boolean', short: 'v', default: false },
    },
  })

  if (values.version) {
    console.log(VERSION)
    return
  }

  const command = positionals[0] ?? 'help'

  if (values.help || command === 'help') {
    console.log(HELP)
    return
  }

  if (command === 'init') {
    await initCommand()
    return
  }

  if (command === 'doctor') {
    await doctorCommand()
    return
  }

  if (command === 'install') {
    await installCommand()
    return
  }

  if (command === 'check' || command === 'capture') {
    const { config, configDir } = await loadConfig(values.config)
    const options = {
      config,
      cwd: configDir,
      only: values.only,
      skipGif: values['skip-gif'],
      skipVideo: values['skip-video'],
      headed: values.headed,
      baseUrl: values['base-url'],
      outDir: values.out,
    }

    if (command === 'check') {
      await check(options)
      log('check complete')
    } else {
      await capture(options)
      log('capture complete')
    }
    return
  }

  throw new Error(`Unknown command "${command}". Run "showcase-capture --help".`)
}

main().catch((cause) => {
  error(cause instanceof Error ? cause.message : String(cause))
  process.exitCode = 1
})
