import { describe, it, expect, beforeAll } from "vitest";
import { sanitizeHtml, htmlToPlainText } from "@/lib/sanitize";

// jsdom provides window — DOMPurify will run in client mode
beforeAll(() => {
  // Ensure window is defined (jsdom sets this up automatically)
  expect(typeof window).toBe("object");
});

describe("sanitizeHtml", () => {
  it("passes through safe HTML unchanged", () => {
    const input = "<p>Hello <strong>world</strong></p>";
    const result = sanitizeHtml(input);
    expect(result).toContain("Hello");
    expect(result).toContain("<strong>world</strong>");
  });

  it("strips <script> tags", () => {
    const input = '<p>Safe</p><script>alert("xss")</script>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("alert");
    expect(result).toContain("Safe");
  });

  it("strips javascript: href", () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain("javascript:");
  });

  it("strips on* event attributes", () => {
    const input = '<p onclick="alert(1)">text</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain("onclick");
    expect(result).toContain("text");
  });

  it("strips <iframe> tags", () => {
    const input = '<iframe src="https://evil.com"></iframe><p>safe</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain("iframe");
    expect(result).toContain("safe");
  });

  it("strips <img> tags (not in allowlist)", () => {
    const input = '<img src="x" onerror="alert(1)" /><p>text</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain("<img");
    expect(result).toContain("text");
  });

  it("preserves allowed tags: h1-h3, ul, ol, li, blockquote, pre, code", () => {
    const input = `
      <h1>Title</h1>
      <h2>Sub</h2>
      <ul><li>Item</li></ul>
      <ol><li>One</li></ol>
      <blockquote>Quote</blockquote>
      <pre><code>const x = 1;</code></pre>
    `;
    const result = sanitizeHtml(input);
    expect(result).toContain("<h1>");
    expect(result).toContain("<h2>");
    expect(result).toContain("<ul>");
    expect(result).toContain("<ol>");
    expect(result).toContain("<blockquote>");
    expect(result).toContain("<pre>");
    expect(result).toContain("<code>");
  });

  it("adds rel=noopener noreferrer and target=_blank to links", () => {
    const input = '<a href="https://example.com">link</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('rel="noopener noreferrer"');
    expect(result).toContain('target="_blank"');
  });

  it("handles empty string", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("handles plain text with no tags", () => {
    const result = sanitizeHtml("Hello world");
    expect(result).toContain("Hello world");
  });
});

describe("htmlToPlainText", () => {
  it("strips all HTML tags", () => {
    const result = htmlToPlainText("<p>Hello <strong>world</strong></p>");
    expect(result).toBe("Hello world");
  });

  it("returns plain text unchanged", () => {
    expect(htmlToPlainText("just text")).toBe("just text");
  });

  it("handles empty string", () => {
    expect(htmlToPlainText("")).toBe("");
  });

  it("collapses whitespace from block elements", () => {
    const result = htmlToPlainText("<p>Line one</p><p>Line two</p>");
    expect(result).toMatch(/Line one/);
    expect(result).toMatch(/Line two/);
  });

  it("strips nested tags", () => {
    const result = htmlToPlainText("<ul><li><strong>Item</strong></li></ul>");
    expect(result).toContain("Item");
    expect(result).not.toContain("<");
  });
});
