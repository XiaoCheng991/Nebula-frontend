"use client";

import { IconSearch } from "@tabler/icons-react";

export default function SidebarSearchItem() {
  return (
    <div
      className="menu-item w-full text-left cursor-pointer"
      onClick={() => window.dispatchEvent(new CustomEvent("kyon:search"))}
    >
      <IconSearch size={18} />
      <span>Search</span>
    </div>
  );
}
