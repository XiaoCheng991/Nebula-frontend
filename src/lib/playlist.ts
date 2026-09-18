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
    title: "A Broken Heart Heals with Time",
    artist: "Dennis Kuo",
    src: "https://vzxtwpfxuyqyjitoqgap.supabase.co/storage/v1/object/public/site-bgm/A_Broken_Heart_Heals_with_Time.mp3",
  },
  {
    title: "二十五（20s）",
    artist: "查漓芸",
    src: "https://vzxtwpfxuyqyjitoqgap.supabase.co/storage/v1/object/public/site-bgm/25.mp3",
  },
  {
    title: "Fading Echo",
    artist: "tianyang",
    src: "https://vzxtwpfxuyqyjitoqgap.supabase.co/storage/v1/object/public/site-bgm/Fading%20Echo.mp3",
  },
  {
    title: "二十五",
    artist: "陈一豪Clear",
    src: "https://vzxtwpfxuyqyjitoqgap.supabase.co/storage/v1/object/public/site-bgm/obj_wo3DlMOGwrbDjj7DisKw_82336424052_8125_5cc8_5825_be408fe9300402ba15ac917702c9aff4.mp3",
  },
];
