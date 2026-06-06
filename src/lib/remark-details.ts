import type { Root, Content } from "mdast";

/**
 * Remark plugin: wrap each heading + its body into a raw HTML <details> block.
 * 
 * This operates on the mdast tree and injects raw HTML nodes directly,
 * so the output is already <details><summary>...</summary>body</details>
 * before it even reaches rehype/react-markdown.
 * 
 * Algorithm:
 *   1. Walk the tree, identify heading positions
 *   2. For each heading, find its "range" (until next heading of same/higher level)
 *   3. Replace the range with a single "html" node containing <details>...</details>
 */

interface HeadingInfo {
  idx: number;       // index in parent.children
  level: number;
  title: string;
}

function extractHeadingText(node: any): string {
  if (!node.children) return "";
  let text = "";
  for (const child of node.children) {
    if (child.type === "text") text += child.value || "";
    else if (child.children) text += extractHeadingText(child);
  }
  return text;
}

function nodeToHtml(node: Content): string {
  switch (node.type) {
    case "text": return (node as any).value || "";
    case "html": return (node as any).value || "";
    case "inlineCode": return `<code>${(node as any).value}</code>`;
    case "code": return `<pre><code>${(node as any).value}</code></pre>`;
    case "paragraph": return `<p>${(node as any).children?.map(nodeToHtml).join("") || ""}</p>`;
    case "blockquote": return `<blockquote>${(node as any).children?.map(nodeToHtml).join("") || ""}</blockquote>`;
    case "list": {
      const tag = (node as any).ordered ? "ol" : "ul";
      return `<tag>${(node as any).children?.map((c: any) => `<li>${c.children?.map(nodeToHtml).join("") || ""}</li>`).join("") || ""}</${tag}>`;
    }
    case "listItem": return `<li>${(node as any).children?.map(nodeToHtml).join("") || ""}</li>`;
    case "emphasis": return `<em>${(node as any).children?.map(nodeToHtml).join("") || ""}</em>`;
    case "strong": return `<strong>${(node as any).children?.map(nodeToHtml).join("") || ""}</strong>`;
    case "link": return `<a href="${(node as any).url || ""}">${(node as any).children?.map(nodeToHtml).join("") || ""}</a>`;
    case "image": return `<img src="${(node as any).url || ""}" alt="${(node as any).alt || ""}" />`;
    case "thematicBreak": return "<hr />";
    case "break": return "<br />";
    case "heading": return ""; // headings are handled specially
    default: {
      // Fallback: render children
      if ((node as any).children) {
        return (node as any).children.map(nodeToHtml).join("");
      }
      return "";
    }
  }
}

function nodesToHtml(nodes: Content[]): string {
  return nodes.map(nodeToHtml).join("\n");
}

export default function remarkDetails() {
  return (tree: Root) => {
    processNode(tree);
  };
}

function processNode(parent: any) {
  if (!parent.children) return;

  const children = parent.children;
  const headings: HeadingInfo[] = [];

  // Find all direct heading children
  for (let i = 0; i < children.length; i++) {
    if (children[i].type === "heading") {
      headings.push({
        idx: i,
        level: (children[i] as any).depth,
        title: extractHeadingText(children[i]),
      });
    }
  }

  if (headings.length === 0) return;

  // Process in reverse to keep indices valid
  for (let hi = headings.length - 1; hi >= 0; hi--) {
    const h = headings[hi];
    const endIdx = hi + 1 < headings.length ? headings[hi + 1].idx : children.length;

    // Collect body nodes (everything between this heading and the next)
    const bodyNodes = children.slice(h.idx + 1, endIdx);

    // Recursively process body nodes (for nested headings)
    for (const node of bodyNodes) {
      processNode(node);
    }

    // Build the HTML
    const bodyHtml = nodesToHtml(bodyNodes);
    const html = `<details open data-level="${h.level}"><summary>${h.title}</summary>${bodyHtml}</details>`;

    // Replace heading + body with single html node
    children.splice(h.idx, endIdx - h.idx, {
      type: "html",
      value: html,
    } as any);
  }
}
