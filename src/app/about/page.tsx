"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  IconArrowUpRight,
  IconBrandBilibili,
  IconBrandGithub, IconBrandTiktok,
  IconExternalLink,
  IconMail,
  IconWorld,
} from "@tabler/icons-react";
import Sidebar from "@/components/Sidebar";

type Status = {
  icon: string;
  label: string;
  time: string;
};

type Weather = {
  temperature: number;
  icon: string;
  label: string;
};

type WeatherResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
};

const weatherByCode: Record<number, { icon: string; label: string }> = {
  0: { icon: "☀️", label: "晴" },
  1: { icon: "🌤️", label: "晴间多云" },
  2: { icon: "⛅", label: "多云" },
  3: { icon: "☁️", label: "阴" },
  45: { icon: "🌫️", label: "雾" },
  48: { icon: "🌫️", label: "雾凇" },
  51: { icon: "🌦️", label: "毛毛雨" },
  53: { icon: "🌦️", label: "小雨" },
  55: { icon: "🌧️", label: "细雨" },
  56: { icon: "🌧️", label: "冻雨" },
  57: { icon: "🌧️", label: "冻雨" },
  61: { icon: "🌧️", label: "小雨" },
  63: { icon: "🌧️", label: "中雨" },
  65: { icon: "🌧️", label: "大雨" },
  66: { icon: "🌧️", label: "冻雨" },
  67: { icon: "🌧️", label: "冻雨" },
  71: { icon: "🌨️", label: "小雪" },
  73: { icon: "❄️", label: "中雪" },
  75: { icon: "❄️", label: "大雪" },
  77: { icon: "🌨️", label: "雪粒" },
  80: { icon: "🌦️", label: "阵雨" },
  81: { icon: "🌧️", label: "阵雨" },
  82: { icon: "⛈️", label: "强阵雨" },
  85: { icon: "🌨️", label: "阵雪" },
  86: { icon: "❄️", label: "强阵雪" },
  95: { icon: "⛈️", label: "雷雨" },
  96: { icon: "⛈️", label: "雷雨伴冰雹" },
  99: { icon: "⛈️", label: "强雷雨" },
};

const socialLinks = [
  { label: "GitHub", href: "https://github.com/XiaoCheng991", icon: IconBrandGithub },
  { label: "Bilibili", href: "https://space.bilibili.com/3546566354798756", icon: IconBrandBilibili },
  { label: "Email", href: "mailto:kyon991@proton.me", icon: IconMail },
  { label: "CSDN", href: "https://blog.csdn.net/qq_60985619", icon: IconWorld },
  { label: "Gitee", href: "https://gitee.com/XiaoCheng991", icon: IconExternalLink },
  { label: "Douyin", href: "https://www.douyin.com/user/self?from_tab_name=main", icon: IconBrandTiktok },
  { label: "Xiaohongshu", href: "https://www.xiaohongshu.com/user/profile/65730a66000000002002ef1a", icon: IconExternalLink },
];

type GameEntry = {
  name: string;
  coverUrl?: string;
};

type BookEntry = {
  title: string;
  coverUrl?: string;
};

type VideoEntry = {
  title: string;
  coverUrl?: string;
  href?: string;
};

type FavoriteEntry = {
  title: string;
  meta?: string;
  href?: string;
};

type FavoriteTab = "quotes" | "podcasts" | "videos" | "writing";

type UploadTarget = "hobby" | "game" | "book" | "video" | "favorite";

type UploadButtonProps = {
  target: UploadTarget;
  label: string;
  accept: string;
  disabled?: boolean;
  onUpload: (target: UploadTarget, file: File) => void;
};

const hobbies = [
  { title: "吉他", description: "把灵感拨成一段旋律。" },
];
const initialHobbyWorks: { title: string; kind: "audio" | "video"; href?: string }[] = [];
const initialGames: GameEntry[] = [];
const initialBooks: BookEntry[] = [];
const initialVideos: VideoEntry[] = [];
const initialFavoriteQuotes: FavoriteEntry[] = [];
const initialFavoritePodcasts: FavoriteEntry[] = [];
const initialFavoriteVideos: FavoriteEntry[] = [];
const initialFavoriteWriting: FavoriteEntry[] = [];
const favoriteTabs: { id: FavoriteTab; label: string }[] = [
  { id: "quotes", label: "语录" },
  { id: "podcasts", label: "播客" },
  { id: "videos", label: "视频" },
  { id: "writing", label: "文字" },
];

const initialFavoriteCollections: Record<FavoriteTab, FavoriteEntry[]> = {
  quotes: initialFavoriteQuotes,
  podcasts: initialFavoritePodcasts,
  videos: initialFavoriteVideos,
  writing: initialFavoriteWriting,
};

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://vzxtwpfxuyqyjitoqgap.supabase.co"
).replace(/\/$/, "");
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_KEY;

function UploadButton({
  target,
  label,
  accept,
  disabled,
  onUpload,
}: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        className="about-upload-button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </button>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(target, file);
          event.target.value = "";
        }}
      />
    </>
  );
}

async function uploadToBlogImages(file: File, target: UploadTarget) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${target}/${Date.now()}-${safeName}`;
  const response = await fetch(`${supabaseUrl}/storage/v1/object/blog-images/${path}`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "false",
    },
    body: file,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Supabase 上传失败");
  }

  return `${supabaseUrl}/storage/v1/object/public/blog-images/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function getNanjingStatus(): Status {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  let icon = "😴";
  let label = "睡觉中";
  if (hour >= 9 && hour < 12) {
    icon = "💻";
    label = "写代码中";
  } else if (hour >= 12 && hour < 14) {
    icon = "🍚";
    label = "干饭时间";
  } else if (hour >= 14 && hour < 18) {
    icon = "🐟";
    label = "摸鱼中";
  } else if (hour >= 18 && hour < 20) {
    icon = "🚶";
    label = "散步放空";
  } else if (hour >= 20 && hour < 23) {
    icon = "📝";
    label = "写博客";
  }

  return { icon, label, time: `${String(hour).padStart(2, "0")}:${minute}` };
}

function getWeather(code: number) {
  return weatherByCode[code] ?? { icon: "🌐", label: "天气未知" };
}
const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);
const polaroidClass = (index: number): string =>
  index % 3 === 0 ? "about-polaroid about-polaroid-r0"
  : index % 3 === 1 ? "about-polaroid about-polaroid-r1"
  : "about-polaroid about-polaroid-r2";
const bookmarkColor = (tab: FavoriteTab): string => {
  switch (tab) {
    case "quotes": return "hsl(180 82% 60%)";
    case "podcasts": return "hsl(262 46% 66%)";
    case "videos": return "hsl(28 82% 58%)";
    default: return "hsl(150 42% 50%)";
  }
};


export default function AboutPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [favoriteTab, setFavoriteTab] = useState<FavoriteTab>("quotes");
  const [hobbyWorks, setHobbyWorks] = useState(initialHobbyWorks);
  const [games, setGames] = useState(initialGames);
  const [books, setBooks] = useState(initialBooks);
  const [videos, setVideos] = useState(initialVideos);
  const [favoriteCollections, setFavoriteCollections] = useState(initialFavoriteCollections);
  const [uploadingTarget, setUploadingTarget] = useState<UploadTarget | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const handleUpload = async (target: UploadTarget, file: File) => {
    setUploadingTarget(target);
    setUploadMessage(null);
    try {
      const publicUrl = await uploadToBlogImages(file, target);
      const title = file.name.replace(/\.[^.]+$/, "");

      if (target === "hobby") {
        setHobbyWorks((items) => [
          ...items,
          { title, kind: file.type.startsWith("video/") ? "video" : "audio", href: publicUrl },
        ]);
      } else if (target === "game") {
        setGames((items) => [...items, { name: title, coverUrl: publicUrl }]);
      } else if (target === "book") {
        setBooks((items) => [...items, { title, coverUrl: publicUrl }]);
      } else if (target === "video") {
        setVideos((items) => [
          ...items,
          {
            title,
            href: publicUrl,
            coverUrl: file.type.startsWith("image/") ? publicUrl : undefined,
          },
        ]);
      } else {
        setFavoriteCollections((collections) => ({
          ...collections,
          [favoriteTab]: [
            ...collections[favoriteTab],
            { title, meta: "刚刚上传", href: publicUrl },
          ],
        }));
      }

      setUploadMessage(`已上传：${title}`);
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "上传失败");
    } finally {
      setUploadingTarget(null);
    }
  };

  useEffect(() => {
    let active = true;
    const updateStatus = () => {
      if (active) setStatus(getNanjingStatus());
    };

    updateStatus();
    const timer = window.setInterval(updateStatus, 30_000);

    const loadWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=32.06&longitude=118.80&current=temperature_2m,weather_code",
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("weather request failed");
        const data = (await response.json()) as WeatherResponse;
        const temperature = data.current?.temperature_2m;
        const code = data.current?.weather_code;
        if (active && typeof temperature === "number" && typeof code === "number") {
          setWeather({ temperature, ...getWeather(code) });
        }
      } catch {
        if (active) setWeather(null);
      }
    };

    void loadWeather();
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-5 py-6 light-page-layout light-two-column">
      <Sidebar />
      <div className="light-page-main light-about-main">
        <div className="about-playful-intro">
          <div className="about-dark-avatar">
            <Image
              src="https://vzxtwpfxuyqyjitoqgap.supabase.co/storage/v1/object/public/user-avatar/avatars/myslef.png"
              alt="avatar"
              width={128}
              height={128}
              className="w-full h-full object-cover"
              priority
              sizes="96px"
            />
          </div>
          <div>
            <div className="about-terminal-only">{`// hello.world`}</div>
            <h1 className="about-playful-title">Halcyon</h1>
            <p className="about-playful-subtitle">代码、散步，以及一些还没发生的好事。</p>
          </div>
        </div>

        <div className="about-top-grid">
          <div className="about-top-stack">
            <article className="about-insight-card">
              <div className="about-insight-card-title">
                <span>当前状态</span>
                <span className="about-terminal-only">{`[ live.status ]`}</span>
              </div>
              <div className="about-insight-card-value">
                <span aria-hidden="true">{status?.icon ?? "◌"}</span>
                <span>{status?.label ?? "读取中…"}</span>
              </div>
              <div className="about-insight-card-meta">南京时间 {status?.time ?? "--:--"}</div>
            </article>

            <article className="about-insight-card">
              <div className="about-insight-card-title">
                <span>南京天气</span>
                <span className="about-terminal-only">{`[ weather.now ]`}</span>
              </div>
              <div className="about-insight-card-value">
                <span aria-hidden="true">{weather?.icon ?? "🌤️"}</span>
                <span>{weather ? `${Math.round(weather.temperature)}°C` : "读取中…"}</span>
              </div>
              <div className="about-insight-card-meta">{weather?.label ?? "实时天气"}</div>
            </article>
          </div>

          <article className="about-insight-card about-social-card">
            <div className="about-insight-card-title">
              <span>找到我</span>
              <span className="about-terminal-only">{`[ social.links ]`}</span>
            </div>
            <div className="about-social-list">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  <Icon size={16} />
                  <span>{label}</span>
                  <IconArrowUpRight className="about-social-arrow" size={15} />
                </a>
              ))}
            </div>
          </article>
        </div>

        <section className="about-intro-copy">
          <span className="about-terminal-only">{`// intro.md`}</span>
          <p>
          Halcyon，Do myself!
          </p>
        </section>

        <section className="about-module about-hobby-module">
          <div className="about-module-heading">
            <div>
              <span className="about-terminal-only">{`// hobby.ts`}</span>
              <h2>🎸 爱好</h2>
            </div>
            <div className="about-module-tools">
              <span className="about-module-count">{hobbyWorks.length}</span>
              {hobbyWorks.length > 0 && (
                <UploadButton
                  target="hobby"
                  label="继续上传"
                  accept="audio/*,video/*"
                  disabled={uploadingTarget === "hobby"}
                  onUpload={handleUpload}
                />
              )}
            </div>
          </div>
          <div className="about-gramophone">
            <div className="about-gramophone-base">
              <div className="about-gramophone-platter">
                <div className="about-gramophone-label" />
              </div>
              <div className="about-gramophone-tonearm" />
            </div>
            <div className="about-cassette-rack">
              {hobbyWorks.length > 0 ? (
                hobbyWorks.map((work) => (
                  <a key={work.title} href={work.href ?? "#"} className="about-cassette-slot">
                    <span className="about-cassette-thumb" aria-hidden="true">
                      {work.kind === "audio" ? "♫" : "▶"}
                    </span>
                    <span className="about-cassette-title">{work.title}</span>
                  </a>
                ))
              ) : (
                range(4).map((i) => (
                  <div key={`empty-${i}`} className="about-cassette-slot about-cassette-empty" />
                ))
              )}
            </div>
            <div className="about-gramophone-empty">
              <span>还没有唱片，录一段吧</span>
              <UploadButton
                target="hobby"
                label="上传作品"
                accept="audio/*,video/*"
                disabled={uploadingTarget === "hobby"}
                onUpload={handleUpload}
              />
            </div>
          </div>
        </section>

        <section className="about-module about-game-module">
          <div className="about-module-heading">
            <div>
              <span className="about-terminal-only">{`// game.library`}</span>
              <h2>🎮 游戏库</h2>
            </div>
            <div className="about-module-tools">
              <span className="about-module-count">{games.length}</span>
              {games.length > 0 && (
                <UploadButton
                  target="game"
                  label="继续添加"
                  accept="image/*"
                  disabled={uploadingTarget === "game"}
                  onUpload={handleUpload}
                />
              )}
            </div>
          </div>
          <div className="about-cassette-wall about-glass">
            {games.length > 0 ? (
              <div className="about-cassette-grid">
                {games.map((game) => (
                  <a key={game.name} href="#" className="about-cassette-card">
                    <span
                      className="about-cassette-cover"
                      style={game.coverUrl ? { backgroundImage: `url(${game.coverUrl})` } : undefined}
                    >
                      {!game.coverUrl && "🎮"}
                    </span>
                    <span className="about-cassette-label">{game.name}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="about-cassette-console about-glass">
                <span className="about-cassette-screen">
                  <span className="about-cassette-screen-text">INSERT GAME</span>
                  <span className="about-cassette-dpad" />
                </span>
                <UploadButton
                  target="game"
                  label="上传封面"
                  accept="image/*"
                  disabled={uploadingTarget === "game"}
                  onUpload={handleUpload}
                />
              </div>
            )}
          </div>
        </section>

        <section className="about-module about-book-module">
          <div className="about-module-heading">
            <div>
              <span className="about-terminal-only">{`// book.shelf`}</span>
              <h2>📚 书架</h2>
            </div>
            <div className="about-module-tools">
              <span className="about-module-count">{books.length}</span>
              {books.length > 0 && (
                <UploadButton
                  target="book"
                  label="继续添加"
                  accept="image/*"
                  disabled={uploadingTarget === "book"}
                  onUpload={handleUpload}
                />
              )}
            </div>
          </div>
          <div className="about-shelf-scene">
            <div className="about-shelf-glow" />
            <div className="about-shelf-back" />
            <div className="about-shelf-frame">
              <div className="about-shelf-divider" />
              <div className="about-books">
                {books.length > 0
                  ? books.map((book) => (
                      <div key={book.title} className="about-book">
                        <span
                          className="about-book-cover"
                          style={book.coverUrl ? { backgroundImage: `url(${book.coverUrl})` } : undefined}
                        >
                          {!book.coverUrl && "📖"}
                        </span>
                        <span className="about-book-title">{book.title}</span>
                      </div>
                    ))
                  : range(6).map((i) => (
                      <div key={`empty-${i}`} className="about-book about-book-empty" />
                    ))}
              </div>
            </div>
            <div className="about-shelf-lamp">
              <span className="about-shelf-lamp-arm" />
            </div>
            {books.length === 0 && (
              <div className="about-empty-shelf">
                <span>书还在路上</span>
                <UploadButton
                  target="book"
                  label="上传书籍封面"
                  accept="image/*"
                  disabled={uploadingTarget === "book"}
                  onUpload={handleUpload}
                />
              </div>
            )}
          </div>
        </section>

        <section className="about-module about-video-module">
          <div className="about-module-heading">
            <div>
              <span className="about-terminal-only">{`// video.clip`}</span>
              <h2>🎬 随手拍</h2>
            </div>
            <div className="about-module-tools">
              <span className="about-module-count">{videos.length}</span>
              {videos.length > 0 && (
                <UploadButton
                  target="video"
                  label="继续上传"
                  accept="image/*,video/*"
                  disabled={uploadingTarget === "video"}
                  onUpload={handleUpload}
                />
              )}
            </div>
          </div>
          <div className="about-polaroid-wall about-glass">
            {videos.length > 0 ? (
              <div className="about-polaroid-grid">
                {videos.map((video, i) => (
                  <a key={video.title} href={video.href ?? "#"} className={polaroidClass(i)}>
                    <span
                      className="about-polaroid-cover"
                      style={video.coverUrl ? { backgroundImage: `url(${video.coverUrl})` } : undefined}
                    >
                      {!video.coverUrl && "▶"}
                    </span>
                    <span className="about-polaroid-caption">{video.title}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="about-polaroid about-polaroid-empty">
                <span className="about-polaroid-placeholder" aria-hidden="true">
                  ▶
                </span>
                <span className="about-polaroid-caption">第一张照片</span>
                <UploadButton
                  target="video"
                  label="上传视频"
                  accept="image/*,video/*"
                  disabled={uploadingTarget === "video"}
                  onUpload={handleUpload}
                />
              </div>
            )}
          </div>
        </section>

        <section className="about-module about-favorite-module">
          <div className="about-module-heading">
            <div>
              <span className="about-terminal-only">{`// favorites.db`}</span>
              <h2>⭐ 收藏夹</h2>
            </div>
            <div className="about-module-tools">
              <span className="about-module-count">{favoriteCollections[favoriteTab].length}</span>
              {favoriteCollections[favoriteTab].length > 0 && (
                <UploadButton
                  target="favorite"
                  label="继续上传"
                  accept="text/*,image/*,video/*"
                  disabled={uploadingTarget === "favorite"}
                  onUpload={handleUpload}
                />
              )}
            </div>
          </div>
          <div className="about-bookmark-tabs" role="tablist" aria-label="收藏分类">
            {favoriteTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={favoriteTab === tab.id}
                className={favoriteTab === tab.id ? "is-active" : ""}
                onClick={() => setFavoriteTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {favoriteCollections[favoriteTab].length > 0 ? (
            <div className="about-bookmark-grid">
              {favoriteCollections[favoriteTab].map((entry) => (
                <a key={entry.title} href={entry.href ?? "#"} className="about-bookmark">
                  <span
                    className="about-bookmark-swatch"
                    style={{ backgroundColor: bookmarkColor(favoriteTab) }}
                  />
                  <strong className="about-bookmark-title">{entry.title}</strong>
                  {entry.meta && <span className="about-bookmark-meta">{entry.meta}</span>}
                </a>
              ))}
            </div>
          ) : (
            <div className="about-bookmark-empty">
              <div className="about-bookmark-slots">
                {range(6).map((i) => (
                  <div key={`slot-${i}`} className="about-bookmark-slot" />
                ))}
              </div>
              <span>等待被收藏</span>
            </div>
          )}
        </section>
        {uploadMessage && <p className="about-upload-message" role="status">{uploadMessage}</p>}
      </div>
    </div>
  );
}
