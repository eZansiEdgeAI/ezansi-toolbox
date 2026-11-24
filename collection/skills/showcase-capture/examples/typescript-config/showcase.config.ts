import { defineShowcase } from '../../dist/index.js'

export default defineShowcase({
  name: 'Fieldnote Studio (TypeScript config)',
  outDir: 'docs/showcase',
  server: {
    mode: 'static',
    dir: '../static-site',
    spa: true,
  },
  scenes: [
    {
      name: 'desktop',
      steps: [
        { goto: '/' },
        { waitFor: 'h1' },
        { screenshot: '01-home' },
        {
          run: async ({ page }) => {
            await page.evaluate(() => window.scrollTo(0, 180))
          },
        },
        { wait: 200 },
        { screenshot: '02-scrolled' },
      ],
    },
  ],
  gif: {
    steps: [
      { goto: '/' },
      { caption: [1, 'Home', 'A TypeScript config with a custom run step'] },
      { wait: 400 },
    ],
  },
})
