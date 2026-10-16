"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { IconVolume } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { formatTime, useMusicPlayer } from "@/lib/music";
import { PLAYLIST } from "@/lib/playlist";
import { IconNext, IconPause, IconPlay, IconPrev } from "./icons";
import MusicPlaylist from "./MusicPlaylist";

/**
 * 音乐播放器独立页面主体（一体化黑胶面板）。
 *
 * 播放逻辑全部来自共享引擎 useMusicPlayer —— 与深色顶部导航播放器共用
 * 同一个 Audio 实例；此处只做页面级 UI 壳层。列表在右列（MusicPlaylist），
 * 与左列共用同一 store，点行即切歌。
 */
export default function MusicPage() {
  const {
    state,
    error,
    track,
    currentTime,
    duration,
    progressPct,
    volPct,
    progressRef,
    volumeRef,
    onProgressDown,
    setVolume,
    togglePlay,
    prevTrack,
    nextTrack,
  } = useMusicPlayer();

  /* /music 为 Light 主题专属页：深色下（直接进入或从浅色切换）重定向到博客列表页 */
  const router = useRouter();
  useEffect(() => {
    const isLight = () => document.documentElement.classList.contains("light");
    if (!isLight()) {
      router.replace("/");
      return;
    }
    const mo = new MutationObserver(() => {
      if (!isLight()) router.replace("/");
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [router]);

  /* 音量：常显横向滑杆，拖动即改 */
  const applyVolumeX = useCallback(
    (clientX: number) => {
      const el = volumeRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setVolume((clientX - r.left) / r.width);
    },
    [setVolume, volumeRef]
  );

  if (PLAYLIST.length === 0) {
    return <p className="music-subtitle">播放列表为空</p>;
  }

  return (
    <div className="music-page">
      <span className="music-deco music-deco-a" aria-hidden />
      <span className="music-deco music-deco-b" aria-hidden />
      <span className="music-deco music-deco-c" aria-hidden />

      {/* 页面标题：杂志排版，大字号 + 留白 */}
      <header className="music-hero">
        <span className="music-eyebrow">
          <span className="music-eyebrow-dot" />
          BGM
        </span>
        <h1 className="music-title">Music</h1>
        <p className="music-subtitle">
          写作时循环的几首曲子，点开即播；与站内播放器共用同一个音频实例，
          切换主题与页面都不会打断播放。
        </p>
        <span className="music-hero-rule" aria-hidden />
      </header>

      {/* 一体化播放器面板：左列播放器 | 右列播放列表 */}
      <div className={`music-panel${state.playing ? " is-playing" : ""}`}>
        <div className={`music-now${state.playing ? " is-playing" : ""}`}>
          {/* 黑胶唱片 + 唱针 */}
          <div className="music-cover">
            <span className="music-cover-halo" aria-hidden />
            <div className="music-cover-disc">
              <span className="music-cover-center">
                {track.cover ? (
                  <Image
                    src={track.cover}
                    alt=""
                    fill
                    sizes="120px"
                    priority
                  />
                ) : null}
              </span>
            </div>
            {/* 唱针：CSS 绘制，播放时落盘 */}
            <span className="music-tonearm" aria-hidden />
          </div>

          {/* 曲目信息 + 控制 */}
          <div className="music-info">
            <span className={`music-status${state.playing ? " is-playing" : ""}`}>
              <span className="music-status-dot" />
              {state.playing ? "正在播放" : "已暂停"}
            </span>
            <h2 className="music-track-title" title={track.title}>
              {track.title}
            </h2>
            <p className="music-track-artist">{track.artist}</p>

            <div className="music-progress">
              {/* 迷你均衡器：播放时错峰跳动，暂停静止 */}
              <span className="music-eq" aria-hidden>
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
              <div className="music-times">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div
                ref={progressRef}
                onPointerDown={onProgressDown}
                className="music-bar"
                aria-label="seek"
                role="slider"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progressPct)}
              >
                <div className="music-bar-track" />
                <div className="music-bar-fill" style={{ width: `${progressPct}%` }} />
                <div className="music-bar-thumb" style={{ left: `${progressPct}%` }} />
              </div>
            </div>

            <div className="music-controls">
              <button
                type="button"
                onClick={prevTrack}
                aria-label="previous track"
                className="music-ctl music-ctl-side"
              >
                <IconPrev size={18} />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={state.playing ? "pause" : "play"}
                className="music-ctl music-ctl-play"
              >
                {state.playing ? <IconPause size={22} /> : <IconPlay size={22} />}
              </button>
              <button
                type="button"
                onClick={nextTrack}
                aria-label="next track"
                className="music-ctl music-ctl-side"
              >
                <IconNext size={18} />
              </button>
            </div>

            {/* 音量：常显横向滑杆（喇叭 + 条 + 数值），独立居中行，保持整列对称 */}
            <div className="music-volume-row">
              <div className="music-volume">
                <IconVolume size={16} className="music-volume-icon" />

                <div
                  ref={volumeRef}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    applyVolumeX(e.clientX);
                  }}
                  onPointerMove={(e) => {
                    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                      applyVolumeX(e.clientX);
                    }
                  }}
                  className="music-bar music-bar--vol"
                  aria-label="volume"
                  role="slider"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(volPct)}
                >
                  <div className="music-bar-track" />
                  <div className="music-bar-fill" style={{ width: `${volPct}%` }} />
                  <div className="music-bar-thumb" style={{ left: `${volPct}%` }} />
                </div>

                <span className="music-volume-value">{Math.round(volPct)}</span>
              </div>
            </div>

            {error && <p className="music-error">曲目加载失败</p>}
          </div>
        </div>

        {/* 右列：播放列表（内部滚动） */}
        <div className="music-playlist">
          <MusicPlaylist />
        </div>
      </div>
    </div>
  );
}
