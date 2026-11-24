export function log(message: string): void {
  console.log(`[showcase] ${message}`)
}

export function warn(message: string): void {
  console.warn(`[showcase] warning: ${message}`)
}

export function error(message: string): void {
  console.error(`[showcase] error: ${message}`)
}

export function indent(message: string): string {
  return `  ${message}`
}
