/**
 * Audio playlist for the floating MusicPlayer.
 *
 * Each entry maps to a single playable track. URLs can be either:
 *   - absolute https URLs (CDN, GitHub raw, etc.)
 *   - relative paths starting with `/` (served from /public)
 *
 * The player does NOT validate the URL on mount - if a URL 404s
 * the browser just throws a media error and we silently mark the
 * track as failed in the UI (so users see which track is broken).
 *
 * To replace later: drop your mp3s into /public/audio/ and update
 * the `src` field below. The UI is data-driven; nothing else has
 * to change.
 */
export interface Track {
  title: string;
  artist: string;
  src: string;
}

export const PLAYLIST: Track[] = [
  {
    title: "placeholder-01",
    artist: "replace me",
    // TODO: drop a local mp3 into public/audio/ and rewrite this path
    src: "/audio/placeholder-01.mp3",
  },
  {
    title: "placeholder-02",
    artist: "replace me",
    src: "/audio/placeholder-02.mp3",
  },
  {
    title: "placeholder-03",
    artist: "replace me",
    src: "/audio/placeholder-03.mp3",
  },
];
