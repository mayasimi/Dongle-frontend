# Rich Text Content Format

## Decision: Tiptap + HTML Storage

After evaluating Tiptap, Lexical, and Slate:

| | Tiptap | Lexical | Slate |
|---|---|---|---|
| React 19 support | ✅ | ✅ | ⚠️ partial |
| Output format | HTML / JSON | JSON | JSON |
| Bundle size | ~50 KB | ~45 KB | ~40 KB |
| Maintenance | Active (Notion-backed) | Active (Meta) | Slower |
| SSR safety | ✅ | ✅ | ⚠️ |

**Chosen: Tiptap with HTML string storage.**

Reasons:
- HTML is the simplest format to render securely in read-only views
- No custom serializer/deserializer needed
- Directly portable to any future backend or on-chain storage
- DOMPurify sanitization is well-understood and battle-tested

---

## Storage Format

Content is stored as an **HTML string** produced by Tiptap's `editor.getHTML()`.

Example:
```html
<h2>What is Soroban Swap?</h2>
<p>A <strong>next-generation</strong> AMM built on Soroban.</p>
<ul>
  <li>Permissionless liquidity pools</li>
  <li>On-chain price oracles</li>
</ul>
<pre><code>const swap = await sorobanSwap.execute(params);</code></pre>
```

---

## Supported Formatting

| Tool | Keyboard shortcut |
|---|---|
| Bold | `Ctrl/Cmd + B` |
| Italic | `Ctrl/Cmd + I` |
| Strikethrough | toolbar only |
| Inline code | toolbar only |
| Heading 1 / 2 / 3 | toolbar only |
| Bullet list | toolbar only |
| Ordered list | toolbar only |
| Blockquote | toolbar only |
| Code block | toolbar only |
| Link | toolbar (prompts for URL) |
| Horizontal rule | toolbar only |
| Undo / Redo | `Ctrl/Cmd + Z` / `Ctrl/Cmd + Y` |

---

## Security

### Sanitization pipeline

```
User types → Tiptap HTML → sanitizeHtml() → stored string
                                ↓
                          DOMPurify strips:
                          - <script>, <iframe>, <object>, <embed>
                          - on* event attributes (onclick, onerror…)
                          - javascript: href values
                          - Any tag/attr not in the allowlist
```

### Allowlist

**Tags:** `p br strong em s u h1 h2 h3 ul ol li blockquote pre code a hr`

**Attributes:** `href target rel` (on `<a>` only)

All `<a>` tags are post-processed to add `target="_blank" rel="noopener noreferrer"` preventing tab-napping attacks.

### Rendering

`RichTextRenderer` calls `sanitizeHtml()` inside a `useMemo` before passing to `dangerouslySetInnerHTML`. The sanitizer runs on the **client only** (DOMPurify requires a DOM). On the server, the raw string is returned unchanged and re-sanitized on hydration.

### Character limit

The editor enforces a **2000 character limit** via Tiptap's `CharacterCount` extension. The Zod schema validates the same limit server-side.

---

## Components

| Component | Location | Purpose |
|---|---|---|
| `RichTextEditor` | `components/ui/RichTextEditor.tsx` | Editable Tiptap instance with toolbar |
| `RichTextRenderer` | `components/ui/RichTextRenderer.tsx` | Sanitized read-only HTML renderer |
| `sanitizeHtml` | `lib/sanitize.ts` | DOMPurify wrapper with allowlist |
| `htmlToPlainText` | `lib/sanitize.ts` | Strip tags for truncated previews |
