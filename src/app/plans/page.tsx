import Sidebar from "@/components/Sidebar";
import HabitTracker from "@/components/HabitTracker";
import PlansTipsPanel from "@/components/PlansTipsPanel";
import LightOnlyRedirect from "@/components/LightOnlyRedirect";

// 按请求渲染：让 SSR 里的"今日日期"始终是访问当天，与客户端 hydration 快照一致。
export const dynamic = "force-dynamic";

export default function PlansRoute() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-6 home-container light-page-layout plans-layout">
      <LightOnlyRedirect />
      <Sidebar />
      <div className="min-w-0 flex-1 home-main">
        <HabitTracker />
      </div>
      {/* 浅色三列：右侧常驻每日提醒栏。深色下 .sl 隐藏，提醒改由 HabitTips FAB 承担 */}
      <aside className="sl sidebar-right">
        <PlansTipsPanel />
      </aside>
    </div>
  );
}
