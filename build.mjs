/**
 * build.mjs — Neo4j Marp build pipeline
 *
 * Usage:
 *   node build.mjs [input.md] [--html|--pdf|--preview]
 *
 * Defaults:
 *   input  → slides.md
 *   format → --html
 *
 * Examples:
 *   node build.mjs                          # slides.md → slides.html
 *   node build.mjs --pdf                    # slides.md → slides.pdf
 *   node build.mjs my-talk.md --pdf         # my-talk.md → my-talk.pdf
 *   npm run pdf                             # slides.md → slides.pdf
 *   npm run pdf -- my-talk.md              # my-talk.md → my-talk.pdf
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'fs'
import { execFileSync, spawnSync } from 'child_process'
import { tmpdir } from 'os'
import { join, basename, dirname, resolve } from 'path'
import hljs from 'highlight.js'
import cypher from 'highlightjs-cypher'

hljs.registerLanguage('cypher', cypher)

// ── Parse arguments ───────────────────────────────────────────────────────
const args = process.argv.slice(2)
const FORMAT_FLAGS = ['--pdf', '--html', '--preview']
const format   = args.find(a => FORMAT_FLAGS.includes(a)) ?? '--html'
const inputArg = args.find(a => !a.startsWith('--')) ?? 'slides.md'

const inputFile  = resolve(inputArg)
const stem       = basename(inputFile, '.md')
const dir        = dirname(inputFile)
const previewFile = join(dir, `${stem}.preview.md`)

console.log(`[build] ${inputArg} → ${format.replace('--', '')}`)

// ── Step 1: Preprocess ────────────────────────────────────────────────────
let content = readFileSync(inputFile, 'utf8')

// Cypher syntax highlighting
content = content.replace(/```cypher\n([\s\S]*?)```/g, (_, code) => {
  const highlighted = hljs.highlight(code.trimEnd(), { language: 'cypher' }).value
  return `<pre class="hljs language-cypher"><code>${highlighted}</code></pre>`
})

// Mermaid → SVG
const mmdc   = new URL('./node_modules/.bin/mmdc', import.meta.url).pathname
const tmpDir = mkdtempSync(join(tmpdir(), 'marp-mermaid-'))

try {
  let idx = 0
  content = content.replace(/```mermaid\n([\s\S]*?)```/g, (_, diagram) => {
    const inFile  = join(tmpDir, `d${idx}.mmd`)
    const outFile = join(tmpDir, `d${idx}.svg`)
    idx++

    writeFileSync(inFile, diagram.trimEnd())
    execFileSync(mmdc, ['-i', inFile, '-o', outFile, '--backgroundColor', 'transparent'], { stdio: 'pipe' })

    const svg = readFileSync(outFile, 'utf8')
      .replace(/<\?xml[^?]*\?>\s*/g, '')
      .replace(/(<svg[^>]*) width="[^"]*"/, '$1')
      .replace(/(<svg[^>]*) height="[^"]*"/, '$1')

    return `<div class="mermaid-diagram">${svg}</div>`
  })
} finally {
  rmSync(tmpDir, { recursive: true, force: true })
}

writeFileSync(previewFile, content)

// ── Step 2: Marp CLI ──────────────────────────────────────────────────────
const marp = new URL('./node_modules/.bin/marp', import.meta.url).pathname

const outputArgs =
  format === '--pdf'     ? ['--pdf', '--allow-local-files', '-o', join(dir, `${stem}.pdf`)]
: format === '--preview' ? ['--preview']
:                          ['-o', join(dir, `${stem}.html`)]

const result = spawnSync(
  marp,
  ['--no-stdin', '--html', previewFile, ...outputArgs],
  { stdio: 'inherit' }
)

process.exit(result.status ?? 0)
