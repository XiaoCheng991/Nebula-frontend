"use client";

function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 12.79A9 9 0 0111.21 3 9 9 0 0021 12.79z" />
    </svg>
  );
}

export default function SidebarThemeButton() {
  return (
    <button
      type="button"
      onClick={() => {
        const el = document.getElementById("theme-toggle-btn");
        if (el) el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }}
      className="nav-item-light flex items-center gap-3 text-sm text-foreground/70 hover:text-primary transition-colors py-1"
    >
      <IconMoon />
      <span>切换主题</span>
    </button>
  );
}
