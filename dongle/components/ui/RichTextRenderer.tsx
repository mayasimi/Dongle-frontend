"use client";

/**
 * RichTextRenderer
 *
 * Secure read-only renderer for HTML content produced by RichTextEditor.
 * Sanitizes with DOMPurify before rendering via dangerouslySetInnerHTML.
 *
 * Usage:
 *   <RichTextRenderer content={project.description} />
 *   <RichTextRenderer content={project.description} truncate={150} />
 */

import { useMemo } from "react";
import { sanitizeHtml, htmlToPlainText } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

interface RichTextRendererProps {
  /** HTML string from Tiptap / RichTextEditor */
  content: string;
  /** If set, renders plain-text truncated to this many characters */
  truncate?: number;
  className?: string;
}

export default function RichTextRenderer({
  content,
  truncate,
  className,
}: RichTextRendererProps) {
  const sanitized = useMemo(() => sanitizeHtml(content), [content]);

  if (truncate) {
    const plain = htmlToPlainText(content);
    const text = plain.length > truncate ? plain.slice(0, truncate) + "…" : plain;
    return (
      <p className={cn("text-zinc-500 dark:text-zinc-400 text-sm", className)}>
        {text}
      </p>
    );
  }

  return (
    <div
      className={cn(
        // Prose styles for rendered rich text
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:font-bold prose-headings:tracking-tight",
        "prose-a:text-blue-500 prose-a:underline prose-a:underline-offset-2",
        "prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono",
        "prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:rounded-2xl prose-pre:p-4",
        "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-500",
        className
      )}
      // Content is sanitized by DOMPurify before this point
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
