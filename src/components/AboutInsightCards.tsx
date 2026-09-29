"use client";

import { useEffect, useState } from "react";

type Status = {
  icon: string;
  label: string;
  time: string;
};

type Visitor = {
  city: string;
  ip: string;
};

type Weather = {
  temperature: number;
  code: number;
  icon: string;
  label: string;
};

type IpResponse = {
  city?: string;
  ip?: string;
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

  return {
    icon,
    label,
    time: `${String(hour).padStart(2, "0")}:${minute}`,
  };
}

function getWeather(code: number) {
  return weatherByCode[code] ?? { icon: "🌐", label: "天气未知" };
}

export default function AboutInsightCards() {
  const [status, setStatus] = useState<Status | null>(null);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    let active = true;

    const updateStatus = () => {
      if (active) setStatus(getNanjingStatus());
    };

    updateStatus();
    const statusTimer = window.setInterval(updateStatus, 30_000);

    const loadVisitor = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/", { cache: "no-store" });
        if (!response.ok) throw new Error("ipapi request failed");
        const data = (await response.json()) as IpResponse;
        if (active) {
          setVisitor({ city: data.city || "未知城市", ip: data.ip || "" });
        }
      } catch {
        if (active) setVisitor({ city: "坐标暂不可用", ip: "" });
      }
    };

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
          setWeather({ temperature, code, ...getWeather(code) });
        }
      } catch {
        if (active) setWeather(null);
      }
    };

    void loadVisitor();
    void loadWeather();

    return () => {
      active = false;
      window.clearInterval(statusTimer);
    };
  }, []);

  return (
    <section className="sl about-insight-cards flex gap-4" aria-label="实时小卡片">
      <article className="about-insight-card">
        <div className="about-insight-card-title">当前状态</div>
        <div className="about-insight-card-value">
          <span aria-hidden="true">{status?.icon ?? "⏳"}</span>
          <span>{status?.label ?? "读取中…"}</span>
        </div>
        <div className="about-insight-card-meta">南京时间 {status?.time ?? "--:--"}</div>
      </article>

      <article className="about-insight-card">
        <div className="about-insight-card-title">访客坐标</div>
        <div className="about-insight-card-value">
          <span aria-hidden="true">📍</span>
          <span>{visitor ? `你来自 ${visitor.city}` : "正在定位…"}</span>
        </div>
        <div className="about-insight-card-meta">{visitor?.ip || "IP 暂不可用"}</div>
      </article>

      <article className="about-insight-card">
        <div className="about-insight-card-title">南京天气</div>
        <div className="about-insight-card-value">
          <span aria-hidden="true">{weather?.icon ?? "🌤️"}</span>
          <span>{weather ? `${Math.round(weather.temperature)}°C` : "读取中…"}</span>
        </div>
        <div className="about-insight-card-meta">{weather?.label ?? "实时天气"}</div>
      </article>
    </section>
  );
}
