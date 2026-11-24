import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import path from 'node:path'
import { spawn, type ChildProcess } from 'node:child_process'
import type { ShowcaseConfig } from '../config/types.js'
import { log } from '../utils/log.js'

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
}

export type RunningServer = {
  url: string
  stop: () => Promise<void>
}

function runCommand(command: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    log(`running: ${command}`)
    const child = spawn(command, {
      cwd,
      shell: true,
      stdio: 'inherit',
    })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Command failed with exit code ${code}: ${command}`))
    })
  })
}

function killProcessTree(child: ChildProcess): Promise<void> {
  return new Promise((resolve) => {
    if (!child.pid) return resolve()
    if (process.platform === 'win32') {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
      })
      killer.on('exit', () => resolve())
      killer.on('error', () => resolve())
      return
    }
    child.kill('SIGTERM')
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      resolve()
    }, 3000)
    child.on('exit', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

async function waitForUrl(url: string, timeoutMs = 30_000): Promise<void> {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      await fetch(url, { signal: AbortSignal.timeout(1500) })
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }
  throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`)
}

function startStaticServer(
  rootDir: string,
  port: number,
  spa: boolean,
): Promise<RunningServer> {
  const root = path.resolve(rootDir)

  const server: Server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', 'http://localhost')
      const decodedPath = decodeURIComponent(requestUrl.pathname)
      const candidate = path.resolve(root, `.${decodedPath}`)
      if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403)
        response.end('Forbidden')
        return
      }

      let filePath = candidate
      let fileStat = await stat(filePath).catch(() => undefined)

      if (fileStat?.isDirectory()) {
        filePath = path.join(filePath, 'index.html')
        fileStat = await stat(filePath).catch(() => undefined)
      }

      if (!fileStat?.isFile() && spa) {
        filePath = path.join(root, 'index.html')
        fileStat = await stat(filePath).catch(() => undefined)
      }

      if (!fileStat?.isFile()) {
        response.writeHead(404)
        response.end('Not found')
        return
      }

      const extension = path.extname(filePath).toLowerCase()
      response.writeHead(200, {
        'Content-Type': MIME_TYPES[extension] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      })
      createReadStream(filePath).pipe(response)
    } catch (cause) {
      response.writeHead(500)
      response.end(cause instanceof Error ? cause.message : 'Server error')
    }
  })

  return new Promise((resolve, reject) => {
    server.on('error', reject)
    server.listen(port, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        reject(new Error('Could not read static server address'))
        return
      }
      const url = `http://127.0.0.1:${address.port}/`
      log(`static server: ${url}`)
      resolve({
        url,
        stop: async () => {
          await new Promise<void>((done) => server.close(() => done()))
        },
      })
    })
  })
}

export async function startServer(
  config: ShowcaseConfig,
  cwd: string,
): Promise<RunningServer> {
  if (config.build) {
    await runCommand(config.build, cwd)
  }

  if (config.server.mode === 'none') {
    if (!config.baseUrl) throw new Error('baseUrl is required')
    return { url: config.baseUrl, stop: async () => {} }
  }

  if (config.server.mode === 'static') {
    const dir = path.resolve(cwd, config.server.dir)
    return startStaticServer(dir, config.server.port ?? 0, config.server.spa ?? true)
  }

  if (config.server.reuseExisting) {
    try {
      await fetch(config.server.url, { signal: AbortSignal.timeout(1500) })
      log(`reusing server: ${config.server.url}`)
      return { url: config.server.url, stop: async () => {} }
    } catch {
      // Start a new server below.
    }
  }

  log(`starting: ${config.server.command}`)
  const child = spawn(config.server.command, {
    cwd,
    shell: true,
    stdio: 'inherit',
  })

  const stop = async () => {
    await killProcessTree(child)
  }

  try {
    await waitForUrl(config.server.url)
  } catch (cause) {
    await stop()
    throw cause
  }

  log(`server ready: ${config.server.url}`)
  return { url: config.server.url, stop }
}
