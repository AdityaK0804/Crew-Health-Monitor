// Renders deck.html to one PNG per slide and a PDF, using the installed Edge browser.
// Run from the repo root:  node docs/infographic-deck/render.mjs
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..', '..')
const { chromium } = createRequire(join(root, 'package.json'))('playwright-core')
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 })
await page.goto(pathToFileURL(join(here, 'deck.html')).href, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(800)
mkdirSync(join(here, 'slides'), { recursive: true })
const slides = await page.$$('section')
for (let i = 0; i < slides.length; i++) {
  await slides[i].screenshot({ path: join(here, 'slides', `slide-${i + 1}.png`) })
}
await page.emulateMedia({ media: 'print' })
await page.pdf({ path: join(here, 'Crew-Health-Monitor-Deck.pdf'), printBackground: true, preferCSSPageSize: true })
console.log('rendered', slides.length, 'slides')
await browser.close()
