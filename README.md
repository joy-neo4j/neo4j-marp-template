# Neo4j Marp Template

A Marp slide deck template with Neo4j brand theme, Cypher syntax highlighting, Mermaid diagrams, and KaTeX math.

## Quick start

```bash
npm install
npm run html      # → slides.html
npm run pdf       # → slides.pdf
npm run pptx      # → slides.pptx (image-based, not editable)
npm run preview   # → browser preview (live reload)
```

Edit [`slides.md`](slides.md) and re-run.

## Custom input file

```bash
node build.mjs my-talk.md --pdf       # → my-talk.pdf
node build.mjs my-talk.md --pptx      # → my-talk.pptx (image-based, not editable)
node build.mjs my-talk.md --html      # → my-talk.html
npm run pdf -- my-talk.md             # same via npm
npm run pptx -- my-talk.md            # same via npm
```

## Writing slides

Each slide is separated by `---`. Start every deck with this frontmatter:

```markdown
---
marp: true
theme: neo4j
paginate: true
math: katex
---
```

### Slide classes

```markdown
<!-- _class: lead -->    ← dark title slide
<!-- _class: invert -->  ← dark blue section slide
(none)                   ← white content slide
```

### Cypher

Use ` ```cypher ` — keywords, labels, strings, and numbers are syntax-highlighted automatically.

```cypher
MATCH (p:Person)-[:KNOWS]->(friend:Person)
WHERE p.name = "Alice"
RETURN friend.name, friend.age
```

### Mermaid

Use ` ```mermaid ` — rendered to SVG at build time. Supports all diagram types (`graph`, `sequenceDiagram`, `classDiagram`, `flowchart`, etc.)

### Math (KaTeX)

- Inline: `$E = mc^2$`
- Block: `$$\sum_{i=1}^{n} x_i$$`

### Images

```markdown
![width:400px](assets/image.svg)      ← inline, resized
![bg left:40%](assets/image.svg)      ← left background split
![bg right:40%](assets/image.svg)     ← right background split
![bg cover](assets/image.svg)         ← full slide background
```

Put images in [`assets/`](assets/).

## Using an LLM to generate a deck

[`SLIDE_PROMPT.md`](SLIDE_PROMPT.md) is a ready-to-use system prompt. Paste it into any LLM (Claude, ChatGPT, Gemini…) as the system prompt, then describe your deck. The output drops straight into this template.

## Files

| File | Purpose |
|---|---|
| `slides.md` | Your slides — edit this |
| `neo4j.css` | Neo4j brand theme |
| `build.mjs` | Build pipeline (preprocess + Marp CLI) |
| `marp.config.mjs` | Marp engine config (theme + Cypher hljs) |
| `SLIDE_PROMPT.md` | LLM prompt for generating decks |
| `assets/` | Images and SVGs |
| `.vscode/settings.json` | VS Code Marp extension config |
