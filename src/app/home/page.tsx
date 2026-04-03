import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Lock, FileText, Image, Sparkles, Shield, ArrowRight, PenLine } from "lucide-react";
import { AuthRequiredToast } from "@/components/auth/AuthRequiredToast";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 背景图片层 */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/landing-bg.jpg)' }}
      />

      {/* 渐变遮罩层 */}
      <div className="fixed inset-0 z-10 bg-gradient-to-b
        from-black/30 via-black/40 to-black/60"
      />

      {/* 内容层 */}
      <Suspense fallback={null}>
        <AuthRequiredToast />
      </Suspense>

      {/* Hero Section */}
      <section className="relative z-20 container mx-auto px-4 flex min-h-screen items-center justify-center pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 px-5 py-2 rounded-full text-sm font-medium mb-8 animate-[fadeInDown_0.8s_ease-out]">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="text-white/90">强子出品 · 碎碎念个站</span>
          </div>

          {/* 品牌标题 */}
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6 animate-[fadeInUp_1s_ease-out]">
            <span className="bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-100 bg-clip-text text-transparent drop-shadow-lg">
              NebulaHub
            </span>
          </h1>
          <p className="text-2xl md:text-3xl font-light text-white/70 tracking-[0.3em] mb-8 animate-[fadeInUp_1s_ease-out_0.2s_both]">
            橙光
          </p>

          {/* Slogan */}
          <p className="text-xl md:text-2xl text-white/85 mb-4 max-w-2xl mx-normal font-light leading-relaxed animate-[fadeInUp_1s_ease-out_0.3s_both]">
            记录<span className="font-semibold text-amber-300">碎碎念</span>
          </p>
          <p className="text-base md:text-lg text-white/65 mb-12 max-w-xl mx-auto leading-relaxed animate-[fadeInUp_1s_ease-out_0.4s_both]">
            安静的个人空间，记录想法、收藏文章、珍藏回忆。<br />
            在这里，只做最真实的自己。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fadeInUp_1s_ease-out_0.5s_both]">
            <Link href="/login">
              <Button
                size="lg"
                className="gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-2xl shadow-orange-500/30 px-10 transition-all duration-300 hover:scale-105"
              >
                <PenLine className="h-5 w-5" />
                开始记录
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* 底部标签 */}
          <div className="flex items-center justify-center gap-2 text-sm text-white/50 mt-8 animate-[fadeInUp_1s_ease-out_0.6s_both]">
            <Shield className="h-4 w-4" />
            <span>个人空间 · 自由表达 · 记录成长</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-20 container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              碎碎念小天地
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              一个属于个人的私密空间
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<PenLine className="h-6 w-6 text-white" />}
              iconGradient="from-orange-500 to-amber-500"
              title="碎碎念日记"
              desc="记录每天的 thoughts，无论是开心还是烦恼，都在这里倾诉。写给自己看，无需顾虑他人。"
              href="/login"
              linkText="开始记录"
            />
            <FeatureCard
              icon={<BookOpen className="h-6 w-6 text-white" />}
              iconGradient="from-amber-500 to-orange-500"
              title="文章收藏"
              desc="看到好文章随手收藏，随时回顾。建立自己的知识库，学习路上不迷路。"
              href="/login"
              linkText="收藏文章"
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6 text-white" />}
              iconGradient="from-yellow-500 to-amber-500"
              title="文件存储"
              desc="重要文件、学习资料、工作文档，统统存这里。随时随地访问，再也不用担心找不到。"
              href="/drive"
              linkText="前往文件库"
            />
            <FeatureCard
              icon={<Image className="h-6 w-6 text-white" />}
              iconGradient="from-orange-400 to-yellow-500"
              title="原图存储"
              desc="拍的照片原样保存，不被压缩不被修改。珍贵的回忆，每一帧都值得珍藏。"
              href="/login"
              linkText="上传照片"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-white" />}
              iconGradient="from-amber-400 to-orange-500"
              title="简洁无干扰"
              desc="没有广告，没有推送，没有社交压力。只是一个安静的地方，让你专注记录和思考。"
              href="/login"
              linkText="立即体验"
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6 text-white" />}
              iconGradient="from-yellow-400 to-amber-500"
              title="私密安全"
              desc="所有内容加密存储，只有你能访问。你的碎碎念，只属于你自己。"
              href="/login"
              linkText="开始使用"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="backdrop-blur-xl rounded-3xl p-12 bg-white/5 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              准备好开始记录了吗？
            </h2>
            <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto">
              加入 NebulaHub，创建一个属于你的私密空间。<br />
              在这里，自由表达，真实记录。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-xl shadow-orange-500/25 px-10 transition-all duration-300 hover:scale-105"
                >
                  免费注册
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 rounded-full border-white/20 text-white hover:bg-white/10 px-10 transition-all duration-300"
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

/* ---- FeatureCard 组件 ---- */
function FeatureCard({
  icon,
  iconGradient,
  title,
  desc,
  href,
  linkText,
}: {
  icon: React.ReactNode;
  iconGradient: string;
  title: string;
  desc: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="group relative backdrop-blur-xl rounded-2xl p-6 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${iconGradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
          <p className="text-sm text-white/60 leading-relaxed line-clamp-3">{desc}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          href={href}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-black transition-all text-xs font-medium"
        >
          {linkText}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
