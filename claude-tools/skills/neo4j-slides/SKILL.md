---
name: neo4j-slides
description: Generate a Neo4j-branded Marp slide deck on a given topic and build it to PDF. Use when the user asks to create a presentation, deck, or slides about any Neo4j or graph database subject.
argument-hint: <topic description>
allowed-tools: Read, Write, Bash
---

## Slide generation rules

!`cat "${CLAUDE_SKILL_DIR}/SLIDE_PROMPT.md"`

---

## Your task

Generate a complete Neo4j Marp slide deck about: **$ARGUMENTS**

### Steps

1. **Derive a filename** from the topic in kebab-case with `.md` extension (e.g. `graph-rag-intro.md`). Keep it short and descriptive.

2. **Get the current working directory** by running `pwd`. You will write the deck file there (called `<cwd>` below).

3. **Write the deck** to `<cwd>/<filename>`. The output must be a complete, ready-to-build `.md` file — no explanation, no code fences wrapping the whole file.

   The file **MUST** begin with exactly this frontmatter block (add `title:` and other fields after `math: katex` if desired, but never omit or replace these four required lines):
   ```
   ---
   marp: true
   theme: neo4j
   paginate: true
   math: katex
   ---
   ```

4. **Set up the build environment** — clone the template to a temporary directory and install dependencies:
   ```bash
   NEO4J_MARP_TMP=$(mktemp -d)
   git clone --depth 1 https://github.com/halftermeyer/neo4j-marp-template.git "$NEO4J_MARP_TMP"
   cd "$NEO4J_MARP_TMP" && npm install --silent
   ```
   Do this unconditionally — do not ask the user for permission.

5. **Copy assets** — copy the template's `assets/` directory as a sibling of the deck file so that images (logo, node shapes, etc.) resolve correctly at build time and remain available afterwards:
   ```bash
   cp -r "$NEO4J_MARP_TMP/assets" <cwd>/assets
   ```
   Do not delete `<cwd>/assets` during cleanup — leave it in place.

6. **Build to PDF** from the cloned template directory:
   ```bash
   cd "$NEO4J_MARP_TMP" && node build.mjs <absolute-path-to-deck-file> --pdf
   ```
   The PDF will be written next to the `.md` file.

7. **Clean up** only the temporary clone — never touch `<cwd>/assets`:
   ```bash
   rm -rf "$NEO4J_MARP_TMP"
   ```

8. **Report** the output `.md` and `.pdf` paths to the user.
