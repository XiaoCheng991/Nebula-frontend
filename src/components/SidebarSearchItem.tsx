"use client";

import { IconSearch } from "@tabler/icons-react";

export default function SidebarSearchItem() {
  return (
    <div
      className="nav-item-light flex w-full items-center gap-2.5 text-[20px] font-medium px-5 py-2 rounded-[10px] cursor-pointer"
      onClick={() => window.dispatchEvent(new CustomEvent("kyon:search"))}
    >
      <IconSearch size={18} />
      <span>Search</span>
    </div>
  );
}
