# Blog Improvements Plan

## Overview

Two open Jira tickets are addressed together because they share the same data model:

- **IB-6** — Fix the date filter bug in `filterByDate` (operators are inverted)
- **IB-7** — Add `category` field to posts and support rich text (Markdown) rendering in the landing

The work is split into 4 sequential sub-tasks. Each sub-task is self-contained and reviewable independently.

No new runtime dependencies are introduced. Markdown parsing is implemented with plain JS regex. Jest is added as a dev dependency for tests only.

---

## Sub-Task 1 — Fix date filter bug (IB-6)

**Status:** [x] done

**Intent:**
The comparison operators in `filterByDate` are inverted, causing the filter to exclude the correct range and include the wrong one.

**Root cause:**
```
// current (wrong)
if (desde && p.publishedAt > desde) return false;  // drops posts AFTER start
if (hasta && p.publishedAt < hasta) return false;  // drops posts BEFORE end

// correct
if (desde && p.publishedAt < desde) return false;  // drops posts BEFORE start
if (hasta && p.publishedAt > hasta) return false;  // drops posts AFTER end
```

**Expected Outcomes:**
- Filtering by `desde=2026-05-01` returns only posts on or after May 1, 2026
- Filtering by `hasta=2026-05-31` returns only posts on or before May 31, 2026
- Both params together return the correct inclusive range
- Unit tests for these cases pass

**Todo List:**
1. In `src/postsStore.js`, fix the two comparison operators in `filterByDate`

**Relevant Context:**
- `src/postsStore.js` lines 56–62 — `filterByDate` function
- Comparison is string-based ISO date (`YYYY-MM-DD`), which is lexicographically sortable — no Date parsing needed

---

## Sub-Task 2 — Add `category` field to the data model and API

**Status:** [x] done

**Intent:**
Extend the post model with an optional `category` field. The API already passes the full request body through to the store, so only the store needs updating.

**Expected Outcomes:**
- Seed posts in the store each have a `category` value
- `create()` persists `category` from the input
- `update()` can change `category` via the existing `Object.assign` pattern (no code change needed there)
- `GET /posts` and `GET /posts/:id` return `category` in the response

**Todo List:**
1. In `src/postsStore.js`, add a `category` field to each of the 3 seed posts
   - Suggested values: "Noticias", "Tips", "Roadmap"
2. In `src/postsStore.js`, add `category` to the destructuring in `create()` and include it in the new post object

**Relevant Context:**
- `src/postsStore.js` — seed array (lines 1–26), `create()` function (lines 37–47)
- `src/routes/posts.js` — no changes needed; router already forwards full `req.body`
- The frontend already handles the optional `category` field with a conditional tag render (index.html line 358–360)

---

## Sub-Task 3 — Rich text rendering and category field in the frontend

**Status:** [x] done

**Intent:**
- Render post content as formatted HTML instead of escaped plain text, supporting `**bold**`, `*italic*`, and `# Heading` Markdown syntax
- Add a `category` dropdown to the "Nuevo post" form with values: Noticias, Tips, Roadmap
- Send `category` in the POST request body

**Expected Outcomes:**
- Posts with `**bold**` in content render `<strong>bold</strong>` visually in the landing
- Posts with `*italic*` render `<em>italic</em>`
- Lines starting with `# ` render as `<h3>` (styled inline, not a page heading)
- The "Nuevo post" form has a `<select>` dropdown for category between the Author and Content fields
- Category value is included in the POST body when saving a new post
- The cancel button clears the category dropdown back to its default

**Todo List:**
1. In `public/index.html`, add a `parseMarkdown(str)` function to the `<script>` section that:
   - Escapes HTML first (reuse `escapeHtml`) to prevent XSS
   - Applies regex replacements for `**text**` → `<strong>text</strong>`, `*text*` → `<em>text</em>`, lines starting with `# ` → wrapped in `<strong>` as a heading line
2. Replace the `escapeHtml(post.content)` call inside `render()` with `parseMarkdown(post.content)`
3. Add a `<select id="newCategory">` field to the form HTML, with an empty default option plus Noticias, Tips, Roadmap
4. In the `savePost` click handler, read `newCategory` and include it in the POST body
5. In the `cancelPost` handler, reset `newCategory` to its default value

**Relevant Context:**
- `public/index.html` lines 319–323 — `escapeHtml` helper
- `public/index.html` lines 347–373 — `render()` function; line 368 is where content is injected
- `public/index.html` lines 276–293 — "Nuevo post" form HTML
- `public/index.html` lines 393–416 — cancel and save handlers
- `.content` CSS class uses `white-space: pre-wrap` (line 242) — this should be removed or changed to `pre-line` once HTML rendering is active to avoid double-spacing

---

## Sub-Task 4 — Unit tests with Jest

**Status:** [x] done

**Intent:**
Add a test suite for `postsStore.js` covering the corrected `filterByDate` and the new `category` support, so regressions are caught automatically.

**Expected Outcomes:**
- `npm test` runs and passes all tests
- Tests cover: `filterByDate` (desde only, hasta only, both, neither, boundary dates), `create` with and without category, `getById` hit and miss

**Todo List:**
1. Add Jest as a dev dependency in `package.json` and add a `"test": "jest"` script
2. Create `tests/postsStore.test.js` with the following test cases:
   - `filterByDate` with only `desde` — returns posts on or after that date
   - `filterByDate` with only `hasta` — returns posts on or before that date
   - `filterByDate` with both `desde` and `hasta` — returns posts within the inclusive range
   - `filterByDate` with no params — returns all posts unchanged
   - `filterByDate` boundary — a post exactly on `desde` or `hasta` is included
   - `create` without `category` — post is created, category is undefined
   - `create` with `category` — post is created with correct category value
   - `getById` — returns post for valid ID; returns undefined for missing ID

**Relevant Context:**
- `src/postsStore.js` — all exported functions: `getAll`, `getById`, `create`, `update`, `filterByDate`
- The store uses a module-level mutable array; tests should use `create` to add test data and use a local copy via `getAll()` for assertions rather than relying on the seed data order
- No test framework currently exists in the project
