import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NebulaHub - 橙光",
  description: "NebulaHub 橙光 - 你的智能协作空间",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.className} scroll-smooth`}>
        <ClientLayout interClassName={inter.className}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
