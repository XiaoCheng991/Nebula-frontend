import Image from "next/image";
import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandBilibili,
  IconFileText,
  IconFolder,
  IconHome,
  IconMail,
  IconRss,
  IconUser,
} from "@tabler/icons-react";
import SidebarSearchItem from "@/components/SidebarSearchItem";
import ThemeToggleRow from "@/components/ThemeToggleRow";

export default function Sidebar() {
  return (
    <aside className="sl sidebar-light" aria-label="侧边栏">
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
        <Link href="/" className="menu-item">
          <IconHome size={20} />
          Home
        </Link>
        <Link href="/about" className="menu-item">
          <IconUser size={20} />
          About
        </Link>
        <Link href="/about" className="menu-item">
          <IconFolder size={20} />
          Projects
        </Link>
        <Link href="/about" className="menu-item">
          <IconFileText size={20} />
          Plans
        </Link>
        <SidebarSearchItem />
        <ThemeToggleRow />
      </nav>
    </aside>
  );
}
