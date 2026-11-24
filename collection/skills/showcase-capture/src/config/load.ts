import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createJiti } from 'jiti'
import { parse as parseYaml } from 'yaml'
import { ZodError } from 'zod'
import { parseConfig } from './schema.js'
import type { ShowcaseConfig } from './types.js'

const CONFIG_NAMES = [
  'showcase.config.yaml',
  'showcase.config.yml',
  'showcase.config.ts',
  'showcase.config.mts',
  'showcase.config.js',
  'showcase.config.mjs',
]

export function findConfig(cwd = process.cwd()): string | undefined {
  for (const name of CONFIG_NAMES) {
    const candidate = path.join(cwd, name)
    if (existsSync(candidate)) return candidate
  }
  return undefined
}

function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const where = issue.path.length ? issue.path.join('.') : 'config'
      return `${where}: ${issue.message}`
    })
    .join('\n')
}

async function importConfig(filePath: string): Promise<unknown> {
  if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
    const text = await readFile(filePath, 'utf8')
    return parseYaml(text)
  }

  if (filePath.endsWith('.ts') || filePath.endsWith('.mts')) {
    const jiti = createJiti(import.meta.url, {
      interopDefault: true,
    })
    return jiti.import(filePath)
  }

  const module = await import(pathToFileURL(filePath).href)
  return module.default ?? module
}

export async function loadConfig(
  explicitPath?: string,
  cwd = process.cwd(),
): Promise<{
  config: ShowcaseConfig
  configPath: string
  configDir: string
}> {
  const configPath = explicitPath
    ? path.resolve(cwd, explicitPath)
    : findConfig(cwd)

  if (!configPath) {
    throw new Error(
      'No showcase config found. Run "showcase-capture init" or pass --config.',
    )
  }

  const raw = await importConfig(configPath)

  try {
    return {
      config: parseConfig(raw),
      configPath,
      configDir: path.dirname(configPath),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`Invalid showcase config:\n${formatZodError(error)}`)
    }
    throw error
  }
}
