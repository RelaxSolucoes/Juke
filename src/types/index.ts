export interface User {
  id: string;
  name: string;
  email?: string;
  spotify_id?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  created_at: string;
}

export interface Party {
  id: string;
  code: string;
  name: string;
  host_id: string;
  host?: User;
  is_active: boolean;
  current_track?: Track;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  spotify_id: string;
  name: string;
  artist: string;
  album: string;
  duration_ms: number;
  image_url?: string;
  preview_url?: string;
  added_by: string;
  added_by_name: string;
  party_id: string;
  is_playing?: boolean;
  created_at: string;
}

export interface Guest {
  id: string;
  name: string;
  party_id: string;
  created_at: string;
}

export interface SpotifyTrackSearch {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  preview_url?: string;
  uri: string;
}

// Spotify Web Playback SDK types
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => any;
    };
  }
}