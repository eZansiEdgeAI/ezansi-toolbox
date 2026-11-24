import { mkdir, writeFile, copyFile, unlink } from 'node:fs/promises'
import path from 'node:path'

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true })
}

export async function writeText(file: string, text: string): Promise<void> {
  await ensureDir(path.dirname(file))
  await writeFile(file, text, 'utf8')
}

export async function writeJson(file: string, value: unknown): Promise<void> {
  await writeText(file, `${JSON.stringify(value, null, 2)}\n`)
}

export async function moveFile(source: string, target: string): Promise<void> {
  await ensureDir(path.dirname(target))
  try {
    await copyFile(source, target)
    await unlink(source)
  } catch {
    await copyFile(source, target)
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ensurePng(name: string): string {
  return name.toLowerCase().endsWith('.png') ? name : `${name}.png`
}
