import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import RichTextRenderer from "@/components/ui/RichTextRenderer";

beforeEach(() => {
  // sessionStorage not needed here but keep consistent
});

describe("RichTextRenderer", () => {
  it("renders sanitized HTML content", () => {
    render(<RichTextRenderer content="<p>Hello <strong>world</strong></p>" />);
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
  });

  it("strips script tags before rendering", () => {
    const { container } = render(
      <RichTextRenderer content='<p>Safe</p><script>alert("xss")</script>' />
    );
    expect(container.innerHTML).not.toContain("<script>");
    expect(container.innerHTML).not.toContain("alert");
  });

  it("strips onclick attributes", () => {
    const { container } = render(
      <RichTextRenderer content='<p onclick="alert(1)">text</p>' />
    );
    expect(container.innerHTML).not.toContain("onclick");
  });

  it("renders truncated plain text when truncate prop is set", () => {
    const long = "<p>" + "A".repeat(200) + "</p>";
    render(<RichTextRenderer content={long} truncate={50} />);
    const el = screen.getByText(/A+…/);
    expect(el.textContent?.length).toBeLessThanOrEqual(55); // 50 chars + ellipsis
  });

  it("does not truncate when content is shorter than limit", () => {
    render(<RichTextRenderer content="<p>Short text</p>" truncate={100} />);
    expect(screen.getByText("Short text")).toBeInTheDocument();
  });

  it("renders headings correctly", () => {
    const { container } = render(
      <RichTextRenderer content="<h2>My Heading</h2>" />
    );
    expect(container.querySelector("h2")).toBeTruthy();
    expect(container.querySelector("h2")?.textContent).toBe("My Heading");
  });

  it("renders lists correctly", () => {
    const { container } = render(
      <RichTextRenderer content="<ul><li>Item one</li><li>Item two</li></ul>" />
    );
    const items = container.querySelectorAll("li");
    expect(items.length).toBe(2);
  });

  it("renders links with safe attributes", () => {
    const { container } = render(
      <RichTextRenderer content='<a href="https://example.com">Visit</a>' />
    );
    const link = container.querySelector("a");
    expect(link?.getAttribute("rel")).toContain("noopener");
    expect(link?.getAttribute("target")).toBe("_blank");
  });

  it("renders empty content without crashing", () => {
    const { container } = render(<RichTextRenderer content="" />);
    expect(container).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <RichTextRenderer content="<p>text</p>" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
