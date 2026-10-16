"use client";

import { useState } from "react";
import { formatTime, useMusicPlayer } from "@/lib/music";
import { PLAYLIST } from "@/lib/playlist";
import { IconNote, IconPlay, IconPause, IconPrev, IconNext } from "./music/icons";

/**
 * Inline nav-bar music trigger + dropdown popover (dark-theme shell).
 *
 * Trigger lives inside the header nav, on the right tail after the
 * three text links. It is a tiny pill (28x28) showing either `♫` or
 * `♪` depending on play state - nothing else, so it never crowds the
 * nav links.
 *
 * Click the trigger to open a popover that hangs below the nav.
 * The popover carries the actual player: track title, prev / play /
 * next, clickable progress bar, clickable volume bar, close.
 *
 * Click outside or press Escape to dismiss. Re-clicking the trigger
 * toggles. Persists idx + volume + playing + time across reloads so
 * a refresh resumes mid-track.
 *
 * Errors stay silent. Auto-advance to next track on `ended`.
 *
 * Playback itself lives in the shared engine (`@/lib/music`); the
 * light-theme sidebar player subscribes to the same store, so both
 * shells drive one single audio element.
 */

export default function MusicPlayer() {
  const [open, setOpen] = useState(false);
  const {
    state,
    error,
    track,
    currentTime,
    duration,
    progressPct,
    volPct,
    progressRef: progressBarRef,
    volumeRef: volumeBarRef,
    onProgressDown,
    onVolumeDown,
    togglePlay,
    prevTrack,
    nextTrack,
  } = useMusicPlayer();

  // 若播放列表为空，整个按钮隐藏。
  if (PLAYLIST.length === 0) return null;

  return (
    <div
      id="music-player-root"
      className="relative font-mono"
    >
      {/* ============================================================ */}
      {/* TRIGGER - 28x28 pill, lives in the nav                      */}
      {/* ============================================================ */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label={open ? "close music player" : "open music player"}
        aria-expanded={open}
        className={[
          "h-7 w-7 flex items-center justify-center transition-colors text-[13px] leading-none border nav-glow music-trigger",
          open
            ? "text-primary border-primary/60"
            : "text-foreground/65 border-transparent hover:text-primary hover:border-primary/40",
        ].join(" ")}
      >
        <span aria-hidden>
          <IconNote size={18} />
        </span>
      </button>

      {/* ============================================================ */}
      {/* POPOVER - drops down from the trigger, lives below the nav  */}
      {/* ============================================================ */}
      {open && (
        <div
          role="dialog"
          aria-label="music player"
          className="absolute top-full right-0 mt-2 z-[60] text-[11px] music-popover"
          style={{
            width: 280,
            background: "hsl(var(--background) / 0.96)",
            border: "1px solid hsl(var(--primary) / 0.45)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 8px 32px hsl(var(--background) / 0.40)",
          }}
        >
          {/* header */}
          <div
            className="flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-wider"
            style={{
              borderBottom: "1px solid hsl(var(--primary) / 0.20)",
              color: "hsl(var(--primary) / 0.80)",
            }}
          >
            <span>// music.player</span>
            <span className="text-foreground/35 normal-case tracking-normal tabular-nums">
              {state.idx + 1}/{PLAYLIST.length}
            </span>
          </div>

          {/* track */}
          <div className="px-4 py-3">
            <p
              className="text-foreground/85 truncate"
              style={{ fontSize: 12 }}
              title={track.title}
            >
              {track.title}
            </p>
            <p className="text-foreground/40 truncate text-[10px] mt-0.5">
              {track.artist}
            </p>
            {error && (
              <p className="text-red-400/70 text-[10px] mt-1">
                track failed to load
              </p>
            )}
          </div>

          {/* controls + progress */}
          <div
            className="px-4 pb-3 space-y-2"
            style={{
              borderTop: "1px solid hsl(var(--primary) / 0.10)",
            }}
          >
            {/* row: prev / play / next, centered in the row */}
            <div className="pt-3 flex items-center gap-3 justify-center">
              <button
                type="button"
                onClick={prevTrack}
                aria-label="previous track"
                className="h-7 w-7 flex items-center justify-center text-foreground/60 hover:text-primary transition-colors leading-none"
              >
                <IconPrev size={12} />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={state.playing ? "pause" : "play"}
                className="h-7 w-7 flex items-center justify-center text-primary hover:text-glow transition-colors leading-none border border-primary/40 hover:border-primary"
                style={{ minWidth: 28 }}
              >
                {state.playing ? <IconPause size={11} /> : <IconPlay size={11} />}
              </button>
              <button
                type="button"
                onClick={nextTrack}
                aria-label="next track"
                className="h-7 w-7 flex items-center justify-center text-foreground/60 hover:text-primary transition-colors leading-none"
              >
                <IconNext size={12} />
              </button>
            </div>

            {/* row: time stamp, split left/right */}
            <div className="flex items-center justify-between text-foreground/40 tabular-nums text-[10px] px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* progress track + thumb */}
            {/*
              padding-left/right = 8px = half thumb width (16px).
              This keeps the thumb centered exactly at the filled bar end
              at 100% progress, with no gap and no overflow.
              thumb x = progressPct% + 2.86%  (2.86 = 8px / 280px * 100)
            */}
            <div
              ref={progressBarRef}
              onPointerDown={onProgressDown}
              className="relative h-8 flex items-center cursor-pointer touch-none"
              style={{ paddingLeft: 8, paddingRight: 8 }}
              aria-label="seek"
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPct)}
            >
              {/* track background: solid subtle line */}
              <div
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full"
                style={{ background: "hsl(var(--foreground) / 0.12)" }}
              />
              {/* filled track: solid primary with glow, no transition */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full"
                style={{
                  width: `${progressPct}%`,
                  background: "hsl(var(--primary) / 0.80)",
                  boxShadow: "0 0 6px hsl(var(--primary) / 0.30)",
                }}
              />
              {/* Sonic Orb thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `calc(${progressPct}% + 2.86%)`, transform: "translate(-50%, -50%)" }}
              >
                {/* pulse ring (CSS animation) */}
                <div className="absolute inset-0 w-5 h-5 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full pulse-ring" />
                {/* SVG thumb: outer ring + filled core + center dot */}
                <svg width={16} height={16} viewBox="0 0 16 16" className="relative" style={{ filter: "drop-shadow(0 0 5px hsl(var(--primary) / 0.65))" }}>
                  {/* outer ring */}
                  <circle cx="8" cy="8" r="6" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.2" opacity="0.9" />
                  {/* filled core */}
                  <circle cx="8" cy="8" r="3.5" fill="hsl(var(--primary))" />
                  {/* center dot */}
                  <circle cx="8" cy="8" r="1.2" fill="hsl(var(--background))" opacity="0.85" />
                </svg>
              </div>
            </div>

            {/* volume */}
            <div className="flex items-center gap-2">
              <span className="text-foreground/40 text-[10px] uppercase tracking-wider w-6">
                vol
              </span>
              <div
                ref={volumeBarRef}
                onPointerDown={onVolumeDown}
                className="relative flex-1 h-[3px] cursor-pointer touch-none"
                style={{ background: "hsl(var(--foreground) / 0.12)" }}
                aria-label="volume"
                role="slider"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(volPct)}
              >
                <div
                  className="absolute left-0 top-0 h-full"
                  style={{
                    width: `${volPct}%`,
                    background: "hsl(var(--primary) / 0.80)",
                  }}
                />
              </div>
              <span className="text-foreground/40 tabular-nums text-[10px] w-7 text-right">
                {Math.round(volPct)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
