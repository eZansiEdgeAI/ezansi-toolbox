#!/usr/bin/env node
import { spawn } from 'node:child_process'

function run(command) {
  return new Promise((resolve, reject) => {
    console.log(`> ${command}`)
    const child = spawn(command, { shell: true, stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Command failed with exit code ${code}: ${command}`))
    })
  })
}

const nodeMajor = Number(process.versions.node.split('.')[0])
if (nodeMajor < 20) {
  console.error('Node 20 or newer is required.')
  process.exit(1)
}

try {
  await run('npm install')
  await run('npm run build')
  await run('npx playwright install chromium')
  await run('node dist/cli.js doctor')
  console.log('showcase-capture is ready.')
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
