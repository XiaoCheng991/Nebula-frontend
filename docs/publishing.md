# 文章写作与发布

## 写作流程

1. 复制 `content/templates/article.md` 到 `content/drafts/你的文件名.md`，填写标题、固定 slug、实际日期、标签和阅读时长。
2. 在本地 Markdown 编辑器预览草稿。`content/drafts` 不被博客读取，不支持网站草稿预览；若 Git 仓库公开，已提交草稿也会公开。
3. 图片上传 Supabase，复制 Public URL 后插入 `![描述](完整URL)`。正文保留原图，列表使用第一张 Markdown 图片生成缩略图。不添加虚构图片占位路径。
4. 发布时将文章移到 `public/docs/` 根目录，运行 `npm run validate:posts`。
5. 运行 `npm run dev` 预览文章，确认后执行 `npm run build`，再提交 Git、部署 Vercel。

`public` 下的任何文件都可能直接访问，不要把草稿放在 `public/docs/hidden`，也不要用 `draft: true` 隐藏内容。

## 元数据规则

| 字段 | 要求 |
| --- | --- |
| `title` | 必填，非空标题 |
| `slug` | 推荐填写，小写英文、数字和连字符，必须唯一；发布后不要修改 |
| `date` | 必填日期，使用 `YYYY-MM-DD`；兼容旧文章的 `time` / `published` 和斜杠、点分隔日期 |
| `tags` | 必填非空列表，例如 `[技术、随笔]`；标签内不使用空格 |
| `readTime` | 可选，非负整数，单位分钟；目前不会自动计算 |

不填 `slug` 时，地址为 `/blog/docs/article-文件名`，改文件名会改变地址。校验同时检查文件名兼容地址，避免与其他文章 slug 冲突。

支持 `---` 包裹的元数据和现有无分隔符格式，也兼容中文冒号。不支持完整 YAML 语法（嵌套对象、多行值等）。目前摘要由正文提取、封面取第一张 Markdown 图片，模板没有 `summary` 或 `cover` 字段。

## 校验范围

- 只检查 `public/docs/` 根目录的 `.md` 发布文章，模板、草稿与硬编码示例文章不在本命令范围内。
- 检查必填字段、真实日历日期、slug 格式与冲突、阅读时长，以及 Markdown/HTML 图片引用。
- 本地图片允许 `/img/文件名` 或 `../img/文件名`，必须对应 `public/img` 内的现有文件。
- 外部图片只检查 HTTP(S) URL 格式，不发起网络请求；文件是否公开、是否返回 404，需要预览时确认。
- `npm run build` 会先运行校验，有错误则退出，不继续 Next.js 构建。Vercel 应保留 `npm run build` 作为构建命令。
