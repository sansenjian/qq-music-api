export interface NormalizedSong {
  songId?: number;
  song_id?: number;
  id?: number;
  mid?: string;
  song_mid?: string;
  songName?: string;
  singerName?: string;
  [key: string]: unknown;
}

export interface RankResponseShape {
  req_1?: {
    data?: {
      data?: {
        songInfoList?: NormalizedSong[];
        song_info_list?: NormalizedSong[];
        songList?: NormalizedSong[];
        song_list?: NormalizedSong[];
      };
      songInfoList?: NormalizedSong[];
      song_info_list?: NormalizedSong[];
      songList?: NormalizedSong[];
      song_list?: NormalizedSong[];
    };
  };
  [key: string]: unknown;
}

const SONG_LIST_KEYS = [
  'songInfoList',
  'song_info_list',
  'songList',
  'song_list',
] as const;

/**
 * Locate the active song list key in a rank response and return a writable
 * reference. Used so callers can normalize and reassign in one pass without
 * repeating the multi-path lookup.
 */
export function findSongListLocation(
  responseData: RankResponseShape,
): { container: Record<string, unknown>; key: string } | null {
  const songData = responseData?.req_1?.data;
  if (!songData) return null;

  const inner = (songData as { data?: Record<string, unknown> }).data;

  for (const key of SONG_LIST_KEYS) {
    if (inner && Array.isArray((inner as Record<string, unknown>)[key])) {
      return { container: inner as Record<string, unknown>, key };
    }
  }

  const outer = songData as Record<string, unknown>;
  for (const key of SONG_LIST_KEYS) {
    if (Array.isArray(outer[key])) {
      return { container: outer, key };
    }
  }

  return null;
}

/**
 * Normalize a song item so callers can rely on consistent field names.
 * Sets both camelCase and snake_case variants for song id and mid.
 */
export function normalizeSongItem(song: NormalizedSong): NormalizedSong {
  const normalized = { ...song };

  const songId = normalized.song_id ?? normalized.songId ?? normalized.id;
  if (songId !== undefined) {
    normalized.song_id = songId;
    normalized.songId = songId;
  }

  const existingMid = normalized.song_mid ?? normalized.mid;
  if (existingMid) {
    normalized.song_mid = existingMid;
    normalized.mid = existingMid;
  }

  return normalized;
}
