"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandBilibili,
  IconFileText,
  IconFolder,
  IconHome,
  IconMail,
  IconMenu2,
  IconRss,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import SidebarSearchItem from "@/components/SidebarSearchItem";
import ThemeToggleRow from "@/components/ThemeToggleRow";
import { IconNote } from "@/components/music/icons";

export default function Sidebar() {
  // 移动端（≤768px）抽屉：折叠态只留顶部条，展开态滑出全高玻璃抽屉。
  // ≥769px 抽屉整体隐藏（CSS 控制），不影响桌面端侧边栏原样。
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    // 抽屉打开时锁定 body 滚动，避免背景跟随滚动
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <aside className="sl sidebar-light" aria-label="侧边栏">
      {/* 移动端顶部收纳条：≤768px 显示，≥769px 隐藏 */}
      <div className="sidebar-mobile-bar">
        <Link href="/" className="sidebar-mobile-brand" onClick={close}>
          <span className="sidebar-mobile-avatar">
            <Image
              src="https://vzxtwpfxuyqyjitoqgap.supabase.co/storage/v1/object/public/user-avatar/avatars/myslef.png"
              alt="avatar"
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />
          </span>
          <span className="sidebar-mobile-name">Halcyon</span>
        </Link>
        <button
          type="button"
          className="sidebar-mobile-toggle"
          aria-label="打开菜单"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconX size={20} /> : <IconMenu2 size={20} />}
        </button>
      </div>

      {/* 遮罩：仅抽屉展开时出现 */}
      {open ? (
        <div className="sidebar-mobile-mask" aria-hidden="true" onClick={close} />
      ) : null}

      <div className={`sidebar-mobile-drawer${open ? " is-open" : ""}`}>
      <div className="flex flex-col px-5 gap-3 w-full items-center">
        <div className="w-32 h-32 rounded-full overflow-hidden mx-1 mt-4 mb-1">
          <Image
            src="https://vzxtwpfxuyqyjitoqgap.supabase.co/storage/v1/object/public/user-avatar/avatars/myslef.png"
            alt="avatar"
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xl font-bold text-foreground">Halcyon</span>
          <span className="text-sm text-foreground/50 text-center">喜忧参半，皆是日常</span>
        </div>

        <div className="flex gap-4 text-foreground/60">
          <a
            href="https://github.com/XiaoCheng991"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hover:text-primary transition-colors"
          >
            <IconBrandGithub size={20} />
          </a>
          <a
            href="https://space.bilibili.com/3546566354798756"
            target="_blank"
            rel="noreferrer"
            aria-label="Bilibili"
            className="hover:text-primary transition-colors"
          >
            <IconBrandBilibili size={20} />
          </a>
          <a
            href="mailto:kyon991@proton.me"
            aria-label="Email"
            className="hover:text-primary transition-colors"
          >
            <IconMail size={20} />
          </a>
          <a href="/feed.xml" aria-label="RSS" className="hover:text-primary transition-colors">
            <IconRss size={20} />
          </a>
        </div>
      </div>

      <div className="h-px bg-border my-6" />

      <nav className="flex flex-col gap-1.5" aria-label="主导航">
        <Link href="/" className="menu-item" onClick={close}>
          <IconHome size={20} />
          Home
        </Link>
        <Link href="/about" className="menu-item" onClick={close}>
          <IconUser size={20} />
          About
        </Link>
        <Link href="/about" className="menu-item" onClick={close}>
          <IconFolder size={20} />
          Projects
        </Link>
        <Link href="/plans" className="menu-item" onClick={close}>
          <IconFileText size={20} />
          Plans
        </Link>
        <Link href="/music" className="menu-item" onClick={close}>
          <IconNote size={20} />
          Music
        </Link>
        <SidebarSearchItem />
        <ThemeToggleRow />
      </nav>
      </div>
    </aside>
  );
}
