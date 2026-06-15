export interface Post {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  readTime: number;
  content: string;
  cover?: string;
}

const BACKTICK = '`';

function code(lang: string, ...lines: string[]): string {
  return `${BACKTICK}${lang}\n${lines.join('\n')}\n${BACKTICK}`;
}

export const posts: Post[] = [
  {
    slug: "hello-world",
    title: "Hello World — 重新出发",
    summary: "一个关于重新定义个人的故事。告别庞大的平台项目，回归纯粹的技术博客。",
    date: "2026-06-04",
    tags: ["随笔", "技术"],
    readTime: 3,
    content: [
      "> Welcome to the new era.",
      "",
      "## 为什么重写？",
      "",
      "之前的项目太庞大了。登录、注册、社交、数据中台…… 想法很多，但真正想做的只是**写点东西**。",
      "",
      "所以这次，一切从简。",
      "",
      "## 这个站点要做什么？",
      "",
      "- 写技术笔记",
      "- 记录想法",
      "- 分享踩坑经验",
      "- 偶尔写点乱七八糟的东西",
      "",
      "就这么简单。",
      "",
      "## 技术栈",
      "",
      "- **Next.js 14** — 前端框架",
      "- **Tailwind CSS** — 样式",
      "- **TypeScript** — 类型安全",
      "- **Cyberpunk** — 风格",
      "",
      "## 写在最后",
      "",
      "代码不只是代码。",
      "",
      "希望这个小小的站点，能成为一个干净的起点。",
      ""
    ].join('\n'),
  },
  {
    slug: "neon-terminal-guide",
    title: "搭建赛博朋克风格的开发终端",
    summary: "用 Mac Ghostty + tmux + Claude code 打造霓虹色终端。",
    date: "2026-06-03",
    tags: ["工具", "终端"],
    readTime: 5,
    content: [
      "> 你的终端，就是你的脸面。",
      "",
      "## 为什么要自定义终端？",
      "",
      "每天花 8 小时面对终端，一个好看的终端能让人心情愉悦。",
      "",
      "## 方案概览",
      "",
      "- **终端工具**: Mac Ghostty",
      "- **提示符美化**: Oh-My-Posh",
      "- **字体**: Fira Code",
      "",
      "## 配色方案",
      "",
      "推荐霓虹配色：",
      "- 背景: `#0a0a0a`",
      "- 主色: `#00f0ff` (青色)",
      "- 强调: `#a855f7` (紫色)",
      "- 警告: `#ff006e` (粉色)",
      "",
      "---",
      "*发表于 2026-06-03*",
    ].join('\n'),
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPostSlugs(): string[] {
  return posts.map((p) => p.slug);
}
