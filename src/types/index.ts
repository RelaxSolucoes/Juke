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

// Removido: Spotify Web Playback SDK types
// O Juke usa apenas Spotify Web API, não o SDK de reprodução

// Sistema Híbrido Free/Premium
export interface PartyPlan {
  type: 'free' | 'premium';
  features: {
    queueVisualization: boolean;
    queueManagement: boolean;
    votingSystem: boolean;
    webPlaybackSDK: boolean;
    tvMode: boolean;
    advancedControls: boolean;
  };
}

export interface PremiumQueueItem {
  id: string;
  party_id: string;
  track_uri: string;
  track_name: string;
  track_artist: string;
  track_album: string;
  track_image: string;
  track_duration_ms: number;
  added_by: string;
  added_by_name: string;
  votes: number;
  voters: string[]; // IDs dos usuários que votaram
  position: number;
  status: 'pending' | 'playing' | 'played';
  created_at: string;
}

export interface VoteAction {
  user_id: string;
  user_name: string;
  queue_item_id: string;
  action: 'vote' | 'unvote';
}