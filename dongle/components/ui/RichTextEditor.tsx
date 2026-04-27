"use client";

/**
 * RichTextEditor
 *
 * A Tiptap-based rich text editor that stores content as an HTML string.
 * Supported formatting: Bold, Italic, Strike, Heading (H1-H3),
 * Bullet list, Ordered list, Blockquote, Code block, Link, Horizontal rule.
 *
 * The `onChange` callback receives the sanitized HTML string on every change.
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  label?: string;
  className?: string;
}

// Toolbar button helper
function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        "p-1.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        active
          ? "bg-blue-500 text-white"
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
        disabled && "opacity-40 pointer-events-none"
      )}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write something...",
  maxLength = 2000,
  error,
  label,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: "not-prose" } },
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "text-blue-500 underline underline-offset-2",
        },
      }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[140px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate({ editor: ed }) {
      const html = sanitizeHtml(ed.getHTML());
      onChange?.(html);
    },
  });

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const isNearLimit = charCount > maxLength * 0.85;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}

      <div
        className={cn(
          "rounded-2xl border bg-white dark:bg-zinc-900 overflow-hidden transition-colors",
          error
            ? "border-red-400 dark:border-red-500"
            : "border-zinc-200 dark:border-zinc-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
          {/* Text style */}
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
            <strong>B</strong>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
            <em>I</em>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
            <s>S</s>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">
            <code className="font-mono text-xs">{"`"}</code>
          </ToolbarBtn>

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          {/* Headings */}
          {([1, 2, 3] as const).map((level) => (
            <ToolbarBtn
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              active={editor.isActive("heading", { level })}
              title={`Heading ${level}`}
            >
              <span className="font-bold text-xs">H{level}</span>
            </ToolbarBtn>
          ))}

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          {/* Lists */}
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h11M9 12h11M9 19h11M4 5v.01M4 12v.01M4 19v.01" /></svg>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </ToolbarBtn>

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          {/* Link */}
          <ToolbarBtn onClick={setLink} active={editor.isActive("link")} title="Insert link">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule" active={false}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>
          </ToolbarBtn>

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          {/* Undo / Redo */}
          <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
          </ToolbarBtn>
        </div>

        {/* Editor area */}
        <EditorContent editor={editor} />

        {/* Character count */}
        <div className="flex justify-end px-4 py-1.5 border-t border-zinc-100 dark:border-zinc-800">
          <span className={cn("text-xs", isNearLimit ? "text-orange-500" : "text-zinc-400")}>
            {charCount} / {maxLength}
          </span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
