declare module 'gifenc' {
  export type Palette = number[][]

  type Gifenc = {
    GIFEncoder: () => {
      writeFrame(
        index: Uint8Array,
        width: number,
        height: number,
        options?: {
          palette?: Palette
          delay?: number
          repeat?: number
          transparent?: boolean
        },
      ): void
      finish(): void
      bytes(): Uint8Array
    }
    quantize: (rgba: Uint8Array, maxColors: number) => Palette
    applyPalette: (rgba: Uint8Array, palette: Palette) => Uint8Array
  }

  const gifenc: Gifenc
  export default gifenc
}
