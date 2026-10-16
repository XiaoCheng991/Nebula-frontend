import {
  useCallback,
  useRef,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { PLAYLIST } from "./playlist";

/**
 * Shared music engine: one Audio element, one state source.
 *
 * Both the dark nav-bar player (MusicPlayer.tsx) and the light-theme
 * sidebar player (SidebarMusicItem.tsx) subscribe to this store, so a
 * theme switch never creates a second audio element and playback keeps
 * running from where it left off.
 *
 * State layout / storage key / persistence semantics are unchanged from
 * the original single-instance implementation.
 */

export const STORAGE_KEY = "kyon:music:state";

interface PlayerState {
  idx: number;
  volume: number;
  playing: boolean;
  time: number;
}

export interface MusicState extends PlayerState {
  currentTime: number;
  duration: number;
  error: boolean;
}

const DEFAULT_STATE: PlayerState = {
  idx: 0,
  volume: 0.5,
  playing: false,
  time: 0,
};

export function formatTime(t: number): string {
  if (!t || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function loadState(): PlayerState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const p = JSON.parse(raw);
    return {
      idx: typeof p.idx === "number" ? p.idx : 0,
      volume: typeof p.volume === "number" ? p.volume : 0.5,
      playing: !!p.playing,
      time: typeof p.time === "number" ? p.time : 0,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(s: MusicState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ idx: s.idx, volume: s.volume, playing: s.playing, time: s.currentTime })
    );
  } catch {
    // silent
  }
}

let state: MusicState = { ...DEFAULT_STATE, currentTime: 0, duration: 0, error: false };
let audio: HTMLAudioElement | null = null;
let rafId: number | null = null;
let booted = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function stopTick() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function startTick() {
  stopTick();
  const tick = () => {
    if (audio) {
      state = { ...state, currentTime: audio.currentTime };
      saveState(state);
      emit();
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function onEnded() {
  apply({ idx: (state.idx + 1) % PLAYLIST.length, time: 0, currentTime: 0 });
}

/**
 * Single write path: merges the patch into the store, replays the audio
 * side effects that the old per-field useEffect stack performed
 * (volume, track src, play/pause, progress tick, persistence).
 */
function apply(next: Partial<MusicState>) {
  const prev = state;
  const idxChanged = next.idx !== undefined && next.idx !== prev.idx;
  const playingChanged = next.playing !== undefined && next.playing !== prev.playing;

  state = { ...prev, ...next };

  if (audio) {
    if (next.volume !== undefined && next.volume !== prev.volume) {
      audio.volume = state.volume;
    }
    if (idxChanged) {
      const t = PLAYLIST[state.idx];
      if (t) {
        state = { ...state, error: false };
        audio.src = t.src;
        if (audio.readyState > 0 && !isNaN(audio.duration)) {
          state.duration = audio.duration;
        }
        audio.currentTime = state.time;
        state.currentTime = state.time;
      }
    }
    if (idxChanged || playingChanged) {
      if (state.playing) audio.play().catch(() => {});
      else audio.pause();
    }
  }

  if (state.playing && (idxChanged || playingChanged)) startTick();
  else if (!state.playing) stopTick();

  saveState(state);
  emit();
}

function onMeta() {
  if (!audio || isNaN(audio.duration)) return;
  state = { ...state, duration: audio.duration };
  emit();
}

function onError() {
  state = { ...state, error: true };
  emit();
}

function boot() {
  if (booted) return;
  booted = true;

  state = { ...loadState(), currentTime: 0, duration: 0, error: false };

  const a = new Audio();
  a.volume = state.volume;
  const t = PLAYLIST[state.idx];
  if (t) a.src = t.src;
  a.currentTime = state.time;
  audio = a;

  a.addEventListener("loadedmetadata", onMeta);
  a.addEventListener("ended", onEnded);
  a.addEventListener("error", onError);

  if (state.playing) {
    a.play().catch(() => {});
    startTick();
  }
}

export function subscribeMusic(listener: () => void): () => void {
  boot();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMusicState(): MusicState {
  return state;
}

export function musicTogglePlay() {
  apply({ playing: !state.playing });
}

export function musicPrevTrack() {
  apply({
    idx: state.idx <= 0 ? PLAYLIST.length - 1 : state.idx - 1,
    time: 0,
    currentTime: 0,
  });
}

export function musicNextTrack() {
  apply({ idx: (state.idx + 1) % PLAYLIST.length, time: 0, currentTime: 0 });
}

export function musicSelectTrack(idx: number) {
  if (idx === state.idx) {
    musicTogglePlay();
    return;
  }
  if (!PLAYLIST[idx]) return;
  apply({ idx, time: 0, currentTime: 0 });
}

export function musicSeek(pct: number) {
  if (!audio || !state.duration) return;
  const t = pct * state.duration;
  audio.currentTime = t;
  apply({ time: t, currentTime: t });
}

export function musicSetVolume(v: number) {
  apply({ volume: Math.max(0, Math.min(1, v)) });
}

/**
 * React binding for the shared engine. Each shell mounts its own bar
 * refs (the hook only needs an element whose rect is the value range).
 */
export function useMusicPlayer() {
  const state = useSyncExternalStore(subscribeMusic, getMusicState, getMusicState);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const volumeRef = useRef<HTMLDivElement | null>(null);

  const onProgressDown = useDragHandler(progressRef, musicSeek);
  const onVolumeDown = useDragHandler(volumeRef, musicSetVolume);

  return {
    state,
    error: state.error,
    track: PLAYLIST[state.idx] || PLAYLIST[0],
    currentTime: state.currentTime,
    duration: state.duration,
    progressPct: state.duration ? (state.currentTime / state.duration) * 100 : 0,
    volPct: state.volume * 100,
    progressRef,
    volumeRef,
    onProgressDown,
    onVolumeDown,
    togglePlay: musicTogglePlay,
    prevTrack: musicPrevTrack,
    nextTrack: musicNextTrack,
    selectTrack: musicSelectTrack,
    seekTo: musicSeek,
    setVolume: musicSetVolume,
  };
}

/**
 * Lets a user grab a value bar and drag instead of having to blindly
 * click-and-release. ref points at the bar DOM node so we can compute
 * x ratios at any pointer move.
 */
function useDragHandler(
  ref: RefObject<HTMLElement>,
  onMove: (pct: number) => void
) {
  return useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      // Initiate a click-to-set immediately on press, so single taps
      // still work without dragging.
      const applyRatio = (clientX: number) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
        onMove(pct);
      };

      applyRatio(e.clientX);

      // While the pointer is held down, follow it. Capture the pointer
      // so we keep getting moves even if the cursor slips off the bar.
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);
      e.preventDefault();

      const onUp = () => {
        target.releasePointerCapture(e.pointerId);
        window.removeEventListener("pointermove", onMoveWin);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
      const onMoveWin = (ev: PointerEvent) => applyRatio(ev.clientX);

      window.addEventListener("pointermove", onMoveWin);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [ref, onMove]
  );
}
