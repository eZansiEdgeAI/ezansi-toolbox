import { defineShowcase } from 'showcase-capture'

export default defineShowcase({
  name: 'My project',
  outDir: 'docs/showcase',
  server: {
    mode: 'command',
    command: 'npm run dev',
    url: 'http://localhost:5173',
  },
  context: {
    locale: 'en-ZA',
    timezoneId: 'Africa/Johannesburg',
    reducedMotion: 'reduce',
  },
  viewports: {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 },
  },
  scenes: [
    {
      name: 'desktop',
      viewport: 'desktop',
      steps: [
        { goto: '/' },
        { waitFor: 'h1' },
        { screenshot: '01-home' },
        {
          run: async ({ page }) => {
            await page.evaluate(() => localStorage.setItem('theme', 'light'))
          },
        },
        { waitFor: 'h1' },
        { screenshot: '02-home-light' },
      ],
    },
  ],
  gif: {
    viewport: { width: 1024, height: 640 },
    size: { width: 960, height: 600 },
    fps: 8,
    steps: [
      { goto: '/' },
      { caption: [1, 'Home', 'A short tour of the main flow'] },
      { wait: 600 },
    ],
  },
  video: {
    enabled: true,
    size: { width: 1280, height: 720 },
  },
})
