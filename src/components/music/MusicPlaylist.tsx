"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime, useMusicPlayer } from "@/lib/music";
import { PLAYLIST } from "@/lib/playlist";
import { IconNote } from "./icons";

/**
 * 运行时探测每首曲目时长（仅取元数据，不播放），用于播放列表展示。
 */
function useTrackDurations() {
  const [durations, setDurations] = useState<Record<number, number>>({});

  useEffect(() => {
    let alive = true;
    const probes: HTMLAudioElement[] = [];

    PLAYLIST.forEach((track, i) => {
      const a = new Audio();
      a.preload = "metadata";
      const onMeta = () => {
        if (!isNaN(a.duration) && alive) {
          setDurations((p) => ({ ...p, [i]: a.duration }));
        }
        a.src = "";
      };
      a.addEventListener("loadedmetadata", onMeta);
      a.src = track.src;
      probes.push(a);
    });

    return () => {
      alive = false;
      probes.forEach((a) => {
        a.src = "";
      });
    };
  }, []);

  return durations;
}

/**
 * 播放列表（一体化面板右列）。
 *
 * 与左列共用同一个 useMusicPlayer store（同一 Audio 实例），
 * 点击行即切歌；当前曲目行自动滚入可见区域。
 */
export default function MusicPlaylist() {
  const { state, duration, selectTrack } = useMusicPlayer();
  const durations = useTrackDurations();
  const rowsRef = useRef<HTMLUListElement>(null);

  // 切歌后把当前行滚入视野（几十上百首时也能看到播放位置）
  // 仅在行被列表容器裁掉时才滚，避免 block:'center' 连整页一起拖动
  useEffect(() => {
    const active = rowsRef.current?.querySelector(".is-active");
    if (!active) return;
    const box = rowsRef.current?.getBoundingClientRect();
    const row = active.getBoundingClientRect();
    if (box && (row.top < box.top || row.bottom > box.bottom)) {
      active.scrollIntoView({ block: "nearest" });
    }
  }, [state.idx]);

  if (PLAYLIST.length === 0) return null;

  const rowDuration = (i: number) =>
    i === state.idx ? duration || durations[i] : durations[i];

  return (
    <>
      <div className="music-list-head">
        <h3 className="music-list-title">播放列表</h3>
        <span className="music-list-count">{PLAYLIST.length} 首</span>
      </div>
      <ul className="music-rows" ref={rowsRef}>
        {PLAYLIST.map((t, i) => (
          <li key={t.src}>
            <button
              type="button"
              onClick={() => selectTrack(i)}
              aria-current={i === state.idx}
              className={`music-row${i === state.idx ? " is-active" : ""}`}
            >
              <span className="music-row-no">{String(i + 1).padStart(2, "0")}</span>
              <span className="music-row-thumb">
                <IconNote size={14} />
              </span>
              <span className="music-row-main">
                <span className="music-row-title-row">
                  {i === state.idx && (
                    <span className="music-row-eq" aria-hidden>
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                  <span className="music-row-title">{t.title}</span>
                </span>
                <span className="music-row-meta">
                  <span className="music-row-artist">{t.artist}</span>
                  <span className="music-row-time">
                    {rowDuration(i) ? formatTime(rowDuration(i) as number) : "--:--"}
                  </span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
