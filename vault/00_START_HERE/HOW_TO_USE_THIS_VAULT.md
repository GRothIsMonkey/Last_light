# How to use this vault (browser only)

Everything here works in a web browser. You do not need Obsidian, the Terminal, Codespaces or any installed app.

## 1. Read it on GitHub.com

1. Open the repository: <https://github.com/GRothIsMonkey/Last_light>
2. Click the branch button (top left of the file list, it usually says `main`) and choose **`docs/last-light-vault`**.
   (Until the vault is merged somewhere else, it only exists on this branch.)
3. Click the `vault` folder, then `00_START_HERE`, then `START_HERE.md`.
   Direct link: <https://github.com/GRothIsMonkey/Last_light/blob/docs/last-light-vault/vault/00_START_HERE/START_HERE.md>
4. Every blue link inside a note opens another note. Use the browser's Back button to return.
5. To search: press `/` on any GitHub page, or use the search box, and type a word (for example `Whitcomb`). Choose
   "in this repository". Note: GitHub's code search only indexes the default branch, so on this branch the
   **github.dev** search below is more reliable.

## 2. Read and edit it in github.dev (the browser editor)

1. While looking at the repository on GitHub.com **with the `docs/last-light-vault` branch selected**, press the `.`
   (period) key. Or change `github.com` to `github.dev` in the address bar:
   <https://github.dev/GRothIsMonkey/Last_light/tree/docs/last-light-vault>
2. A VS Code-style editor opens in the browser. The file tree is on the left. Open `vault/00_START_HERE/START_HERE.md`.
3. **See it formatted:** with a note open, press `Ctrl+Shift+V` (`Cmd+Shift+V` on a Mac) for the preview. Links work
   in the preview.
4. **Search the whole vault:** `Ctrl+Shift+F` (`Cmd+Shift+F`) and type a word. Click a result to jump to it.
5. **Edit:** click into the text and type. Markdown basics: `#` makes a heading, `-` makes a bullet,
   `**bold**`, `[link text](../folder/FILE.md)`.
6. **Save your edits to GitHub:**
   - Click the **Source Control** icon on the far left (it looks like a branching line, and shows a number when
     you have changes).
   - Type a short message in the box (for example `Vault: record Chapter Five playtest`).
   - Click **Commit & Push**. Make sure the status bar at the bottom shows the branch `docs/last-light-vault`.
7. Close the tab when done. Nothing is installed.

## 3. Quick edits on GitHub.com (no editor)

1. Open the note on GitHub.com (branch `docs/last-light-vault`).
2. Click the **pencil** icon (top right of the note).
3. Edit, then click **Commit changes…**, write a short message, choose **Commit directly to the
   `docs/last-light-vault` branch**, and confirm.

## 4. How the vault is organized

- Folders are numbered in reading order (`00_START_HERE` → `11_TEMPLATES`).
- File names are in CAPITALS with underscores so links never break on spaces.
- Links are ordinary relative Markdown links (`../02_CHARACTERS/JAMIE.md`). They work on GitHub, in github.dev and in
  Obsidian.
- Links to the game's own files go up two levels (`../../docs/...`, `../../dist/...`).
- Every story fact is labeled. Read [Status labels](STATUS_LABELS.md) once.
- "Not yet verified." means exactly that: the vault could not confirm it from the repository. Do not treat it as a
  gap to fill with a guess.

## 5. Common tasks

| I want to… | Go to |
|---|---|
| See the state of the project | [Current project status](CURRENT_PROJECT_STATUS.md) |
| Look up what happens in a chapter | [Chapter index](../03_CHAPTERS/CHAPTER_INDEX.md) |
| Check whether something is canon | [Established canon](../01_STORY_BIBLE/ESTABLISHED_CANON.md) |
| Follow a clue across chapters | [Mystery and clue tracker](../01_STORY_BIBLE/MYSTERY_AND_CLUE_TRACKER.md) |
| Write down playtest notes | Copy [the playtest template](../11_TEMPLATES/PLAYTEST_NOTE_TEMPLATE.md), then add it to the [Playtest index](../08_PLAYTESTING_AND_ISSUES/PLAYTEST_INDEX.md) |
| Record a decision | [Decision log](DECISION_LOG.md) |
| Keep the vault up to date | [Vault maintenance](VAULT_MAINTENANCE.md) |
| Brief an AI assistant | Point it at [Start here for AI](../10_AI_DEVELOPMENT_GUIDES/START_HERE_FOR_AI.md) |

## 6. Optional: Obsidian later

If you ever use Obsidian on another computer, open the `vault` folder as a vault. A tiny `.obsidian/app.json` sets
links to relative Markdown paths so new links stay GitHub-compatible. Nothing depends on Obsidian or its plugins.
