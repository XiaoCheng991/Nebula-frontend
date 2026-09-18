/** Find colon index, supporting both English : and Chinese ： */
/** @param {string} s */
function findColon(s) {
  const en = s.indexOf(":");
  const zh = s.indexOf("：");
  if (en !== -1 && zh !== -1) return Math.min(en, zh);
  return en !== -1 ? en : zh;
}

/**
 * Parse YAML frontmatter from Markdown content.
 * Supports --- delimited blocks and bare key-value at file top.
 */
/** @param {string} content */
function parseFrontmatter(content) {
  let fmText;

  const delimMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (delimMatch) {
    fmText = delimMatch[1];
  } else {
    const lines = content.split("\n");
    const kvLines = [];
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith("#")) break;
      if (findColon(t) === -1) break;
      kvLines.push(t);
    }
    fmText = kvLines.join("\n");
  }

  if (!fmText) return {};

  /** @type {Record<string, any>} */
  const result = {};
  for (const line of fmText.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const ci = findColon(t);
    if (ci === -1) continue;
    const key = t.slice(0, ci).trim().toLowerCase();
    const value = t.slice(ci + 1).trim();

    if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value
        .slice(1, -1)
        .split(/[,、\s]+/)
        .map((s) => s.trim().replace(/['"]/g, ""))
        .filter(Boolean);
    } else if (/^\d+$/.test(value)) {
      result[key] = parseInt(value, 10);
    } else if (value === "true") {
      result[key] = true;
    } else if (value === "false") {
      result[key] = false;
    } else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      result[key] = value.slice(1, -1);
    } else {
      result[key] = value;
    }
  }

  return result;
}

module.exports = { findColon, parseFrontmatter };
