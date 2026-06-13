import { getAllTags } from "@/lib/tags";
import TagCloud from "@/components/TagCloud";

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <section className="mb-12 pt-8">
        <div className="flex items-center gap-2 text-xs font-mono text-primary/60 mb-4">
          <span>// explore by topic</span>
          <span className="cursor-blink" />
        </div>
        <h1 className="text-4xl font-bold mb-3 text-foreground leading-tight">
          <span className="text-primary">[</span>
          <span className="text-secondary"> tags </span>
          <span className="text-primary">]</span>
        </h1>
        <p className="text-foreground/50 font-mono text-sm">
          {tags.length} 个分类 · 点击查看相关文章
        </p>
      </section>

      <section>
        <TagCloud tags={tags} />
      </section>
    </div>
  );
}
