export interface TagStat {
  name: string;
  count: number;
}

/**
 * Color class for a tag — uses HSL utility colors.
 * Pure function — safe to import from client components.
 */
export function getTagColor(tag: string): string {
  const palette: Record<string, string> = {
    随笔: "text-secondary",
    碎碎念: "text-secondary",
    技术: "text-primary",
    生活: "text-yellow-400",
    工具: "text-accent",
    踩坑: "text-orange-400",
    规范: "text-green-400",
    终端: "text-accent",
    学习: "text-primary",
    沉淀: "text-primary",
    想法: "text-secondary",
    笔记: "text-foreground/60",
    日常: "text-yellow-400",
    review: "text-green-400",
    project: "text-violet-400",
    debug: "text-orange-400",
    佳言: "text-secondary",
  };

  return palette[tag] || "text-foreground/55";
}
