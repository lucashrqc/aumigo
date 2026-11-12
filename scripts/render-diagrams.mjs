import { readFile, writeFile, readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const srcDir = join(root, 'docs/diagrams/src')
const outDir = join(root, 'docs/diagrams')
const mermaidPath = join(root, 'node_modules/mermaid/dist/mermaid.min.js')
const scale = 10

const theme = JSON.parse(await readFile(join(srcDir, 'theme.json'), 'utf8'))
const sources = (await readdir(srcDir)).filter((f) => f.endsWith('.mmd')).sort()

const browser = await chromium.launch()

const renderPage = await browser.newPage()
await renderPage.setContent('<!doctype html><html><body></body></html>')
await renderPage.addScriptTag({ path: mermaidPath })
await renderPage.evaluate((cfg) => {
  window.mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    ...cfg,
  })
}, theme)

const shotPage = await browser.newPage({ deviceScaleFactor: scale })

for (const file of sources) {
  const name = file.replace(/\.mmd$/, '')
  const definition = await readFile(join(srcDir, file), 'utf8')
  try {
    const svg = await renderPage.evaluate(async (def) => {
      const id = 'graph-' + Math.random().toString(36).slice(2)
      const { svg } = await window.mermaid.render(id, def)
      return svg
    }, definition)

    await writeFile(join(outDir, `${name}.svg`), svg, 'utf8')

    await shotPage.setContent(
      `<!doctype html><html><head><meta charset="utf-8">
       <style>html,body{margin:0;padding:16px;background:#ffffff;display:inline-block}</style>
       </head><body>${svg}</body></html>`,
    )
    const el = await shotPage.$('svg')
    await el.screenshot({ path: join(outDir, `${name}.png`) })

    console.log(`rendered ${name} -> svg + png`)
  } catch (err) {
    console.error(`FAILED ${name}: ${err.message}`)
    process.exitCode = 1
  }
}

await browser.close()
