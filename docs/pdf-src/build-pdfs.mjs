// Builds the PDFs in docs/ from the HTML sources in this folder, using the installed Edge browser.
// Run from the repo root:  node docs/pdf-src/build-pdfs.mjs [path to the slide deck folder]
// Needs playwright-core:   npm install --no-save playwright-core
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..', '..')
const require = createRequire(join(root, 'package.json'))
const { chromium } = require('playwright-core')
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage()

async function print(html, out, options) {
  await page.goto(pathToFileURL(join(here, html)).href)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(600)
  await page.pdf({ path: join(root, 'docs', out), printBackground: true, preferCSSPageSize: true, ...options })
  console.log('wrote docs/' + out)
}

await print('overview.html', 'Crew-Health-Monitor-Overview.pdf')
await print('pitch-script.html', 'Crew-Health-Monitor-Video-Script.pdf')

// The 7-slide deck: the same slide files as the online deck, with local images.
const deck = process.argv[2]
if (deck && existsSync(join(deck, 'project', 'deck.json'))) {
  const index = JSON.parse(readFileSync(join(deck, 'project', 'deck.json'), 'utf8'))
  const images = { '2900474217e47f1d7a9f74bfa54892e1': 'signal-detail.png', c8acb98fee8b4a63726be6df0969154d: 'blood-vessels.png' }
  const css = readFileSync(join(deck, 'project', 'deck.css'), 'utf8')
  const slides = index.order
    .map((id) => readFileSync(join(deck, 'project', 'slides', id + '.html'), 'utf8'))
    .join('\n')
    .replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => (images[id] ? '../' + images[id] : m))
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${index.title}</title>
<style>
@font-face { font-family: 'Geist'; src: url('../../node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2') format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'Geist Mono'; src: url('../../node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2') format('woff2'); font-weight: 100 900; }
@page { size: 1920px 1080px; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1, h2, h3, p { margin: 0; }
${css}
section { position: relative; width: 1920px; height: 1080px; break-after: page; overflow: hidden; }
aside { display: none; }
.stage { animation: none; }
</style></head><body>${slides}</body></html>`
  writeFileSync(join(here, 'deck-print.html'), html)
  await print('deck-print.html', 'Crew-Health-Monitor-Pitch-Deck.pdf', { width: '1920px', height: '1080px' })
}
await browser.close()
