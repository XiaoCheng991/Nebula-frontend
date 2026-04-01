import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Lock, FileText, Image, Sparkles, Shield, ArrowRight, PenLine } from "lucide-react";
import { AuthRequiredToast } from "@/components/auth/AuthRequiredToast";

export default function Home() {
 return (
  <div className="min-h-screen">
   {/* 认证提示 */}
   <Suspense fallback={null}>
    <AuthRequiredToast />
   </Suspense>

   {/* 背景装饰 */}
   <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 -left-40 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />
    <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
   </div>

   {/* Hero Section */}
   <section className="relative container mx-auto px-4 py-32 text-center">
    <div className="max-w-4xl mx-auto">
     {/* Badge */}
     <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-[var(--glass-border)] px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-lg">
      <Sparkles className="h-4 w-4 text-[var(--accent)]" />
      <span className="text-foreground">强子出品 · 碎碎念个站</span>
     </div>

     {/* 标题 */}
     <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
      <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
       NebulaHub
      </span>
      <span className="block text-2xl md:text-3xl font-medium text-slate-600 dark:text-slate-400 mt-2">
       橙光
      </span>
     </h1>

     {/* Slogan */}
     <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-4 max-w-2xl mx-auto leading-relaxed">
      记录<span className="font-semibold text-orange-600 dark:text-orange-400">碎碎念</span>
     </p>
     <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 max-w-xl mx-auto">
      安静的个人空间，记录日常想法、收藏好文章、存储珍贵文件。
      <br />
      在这里，只做最真实的自己。
     </p>

     {/* CTA Buttons */}
     <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
      <Link href="/login">
       <Button
        size="lg"
        className="w-full sm:w-auto gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 px-8 transition-all duration-300 hover:scale-105"
       >
        <PenLine className="h-5 w-5" />
        开始记录
        <ArrowRight className="h-4 w-4" />
       </Button>
      </Link>
     </div>

     {/* 标语 */}
     <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
      <Shield className="h-4 w-4 text-[var(--accent)]" />
      <span>个人空间 · 自由表达 · 记录成长</span>
     </div>
    </div>
   </section>

   {/* Features Section */}
   <section className="container mx-auto px-4 py-24">
    <div className="max-w-5xl mx-auto">
     {/* Section Header */}
     <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-white">
       我的碎碎念小天地
      </h2>
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
       一个属于个人的私密空间
      </p>
     </div>

     {/* Bento Grid */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Feature 1: 碎碎念日记 */}
      <Card className="admin-card relative overflow-hidden group cursor-pointer border-0">
       <CardContent className="p-6 pb-16">
        <div className="flex items-start gap-4 mb-4">
         <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
          <PenLine className="h-6 w-6 text-white" />
         </div>
         <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">
           碎碎念日记
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
           记录每天的 thoughts，无论是开心还是烦恼，都在这里倾诉。写给自己看，无需顾虑他人。
          </p>
         </div>
        </div>
       </CardContent>
       <div className="absolute bottom-4 right-4">
        <Link
         href="/login"
         className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500 hover:text-white transition-all text-xs font-medium"
        >
         开始记录
         <ArrowRight className="h-3 w-3" />
        </Link>
       </div>
      </Card>

      {/* Feature 2: 文章收藏 */}
      <Card className="admin-card relative overflow-hidden group cursor-pointer border-0">
       <CardContent className="p-6 pb-16">
        <div className="flex items-start gap-4 mb-4">
         <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
          <BookOpen className="h-6 w-6 text-white" />
         </div>
         <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">
           文章收藏
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
           看到好文章随手收藏，随时回顾。建立自己的知识库，学习路上不迷路。
          </p>
         </div>
        </div>
       </CardContent>
       <div className="absolute bottom-4 right-4">
        <Link
         href="/login"
         className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all text-xs font-medium"
        >
         收藏文章
         <ArrowRight className="h-3 w-3" />
        </Link>
       </div>
      </Card>

      {/* Feature 3: 文件存储 */}
      <Card className="admin-card relative overflow-hidden group cursor-pointer border-0">
       <CardContent className="p-6 pb-16">
        <div className="flex items-start gap-4 mb-4">
         <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
          <FileText className="h-6 w-6 text-white" />
         </div>
         <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">
           文件存储
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
           重要文件、学习资料、工作文档，统统存这里。随时随地访问，再也不用担心找不到。
          </p>
         </div>
        </div>
       </CardContent>
       <div className="absolute bottom-4 right-4">
        <Link
         href="/drive"
         className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all text-xs font-medium"
        >
         前往文件库
         <ArrowRight className="h-3 w-3" />
        </Link>
       </div>
      </Card>

      {/* Feature 4: 原图分享 */}
      <Card className="admin-card relative overflow-hidden group cursor-pointer border-0">
       <CardContent className="p-6 pb-16">
        <div className="flex items-start gap-4 mb-4">
         <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-400/20 group-hover:scale-110 transition-transform flex-shrink-0">
          <Image className="h-6 w-6 text-white" />
         </div>
         <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">
           原图存储
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
           拍的照片原样保存，不被压缩不被修改。珍贵的回忆，每一帧都值得珍藏。
          </p>
         </div>
        </div>
       </CardContent>
       <div className="absolute bottom-4 right-4">
        <Link
         href="/login"
         className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500 hover:text-white transition-all text-xs font-medium"
        >
         上传照片
         <ArrowRight className="h-3 w-3" />
        </Link>
       </div>
      </Card>

      {/* Feature 5: 简洁设计 */}
      <Card className="admin-card relative overflow-hidden group cursor-pointer border-0">
       <CardContent className="p-6 pb-16">
        <div className="flex items-start gap-4 mb-4">
         <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/20 group-hover:scale-110 transition-transform flex-shrink-0">
          <Shield className="h-6 w-6 text-white" />
         </div>
         <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">
           简洁无干扰
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
           没有广告，没有推送，没有社交压力。只是一个安静的地方，让你专注记录和思考。
          </p>
         </div>
        </div>
       </CardContent>
       <div className="absolute bottom-4 right-4">
        <Link
         href="/login"
         className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all text-xs font-medium"
        >
         立即体验
         <ArrowRight className="h-3 w-3" />
        </Link>
       </div>
      </Card>

      {/* Feature 6: 私密安全 */}
      <Card className="admin-card relative overflow-hidden group cursor-pointer border-0">
       <CardContent className="p-6 pb-16">
        <div className="flex items-start gap-4 mb-4">
         <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20 group-hover:scale-110 transition-transform flex-shrink-0">
          <Lock className="h-6 w-6 text-white" />
         </div>
         <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">
           私密安全
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
           所有内容加密存储，只有你能访问。你的碎碎念，只属于你自己。
          </p>
         </div>
        </div>
       </CardContent>
       <div className="absolute bottom-4 right-4">
        <Link
         href="/login"
         className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all text-xs font-medium"
        >
         开始使用
         <ArrowRight className="h-3 w-3" />
        </Link>
       </div>
      </Card>
     </div>
    </div>
   </section>

   {/* CTA Section */}
   <section className="container mx-auto px-4 py-24">
    <div className="max-w-3xl mx-auto text-center">
     <div className="admin-card relative p-12 rounded-3xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-white">
       准备好开始记录了吗？
      </h2>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
       加入 NebulaHub，创建一个属于你的私密空间。
       <br />
       在这里，自由表达，真实记录。
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
       <Link href="/register">
        <Button
         size="lg"
         className="w-full sm:w-auto gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 px-8 transition-all duration-300 hover:scale-105"
        >
         免费注册
         <ArrowRight className="h-4 w-4" />
        </Button>
       </Link>
       <Link href="/login">
        <Button
         variant="outline"
         size="lg"
         className="w-full sm:w-auto gap-2 rounded-2xl border-[var(--glass-border)] hover:bg-white/10 dark:hover:bg-white/5 px-8 transition-all duration-300"
        >
         已有账号？登录
        </Button>
       </Link>
      </div>
     </div>
    </div>
   </section>
  </div>
 );
}
