// Spotify Web API integration
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export interface SpotifyConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export const spotifyConfig: SpotifyConfig = {
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'https://juke-seven.vercel.app/callback',
  scopes: [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative'
  ]
};

export const generatePartyCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getSpotifyAuthUrl = async (): Promise<string> => {
  // Gerar code verifier e challenge para PKCE
  const codeVerifier = generateRandomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Salvar code verifier no localStorage para usar depois
  localStorage.setItem('spotify_code_verifier', codeVerifier);
  
  const params = new URLSearchParams({
    client_id: spotifyConfig.clientId,
    response_type: 'code',
    redirect_uri: spotifyConfig.redirectUri,
    scope: spotifyConfig.scopes.join(' '),
    state: generateRandomString(16),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Função para gerar code challenge para PKCE
const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

export const exchangeCodeForTokens = async (code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
} | null> => {
  try {
    // Recuperar code verifier do localStorage
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: spotifyConfig.redirectUri,
        client_id: spotifyConfig.clientId,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Spotify token exchange error:', errorData);
      throw new Error(`Failed to exchange code for tokens: ${response.status}`);
    }

    // Limpar code verifier após uso
    localStorage.removeItem('spotify_code_verifier');

    return await response.json();
  } catch (error) {
    console.error('Error exchanging code for tokens:', error instanceof Error ? error.message : error);
    localStorage.removeItem('spotify_code_verifier'); // Limpar em caso de erro
    return null;
  }
};

export const refreshSpotifyToken = async (refreshToken: string): Promise<string | null> => {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: spotifyConfig.clientId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

export const makeSpotifyRequest = async (
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = endpoint.startsWith('http') ? endpoint : `${SPOTIFY_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }

  return response.json();
};

export const getCurrentUser = async (accessToken: string) => {
  return makeSpotifyRequest('/me', accessToken);
};

export const searchTracks = async (query: string, accessToken: string): Promise<any[]> => {
  if (!query.trim()) return [];

  try {
    const data = await makeSpotifyRequest(
      `/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
      accessToken
    );
    return data.tracks.items;
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};

export const getPlaybackState = async (accessToken: string) => {
  try {
    return await makeSpotifyRequest('/me/player', accessToken);
  } catch (error) {
    if (error.message.includes('404')) {
      return null; // No active device
    }
    throw error;
  }
};

export const playTrack = async (trackUri: string, accessToken: string, deviceId?: string) => {
  const body: any = {
    uris: [trackUri]
  };

  if (deviceId) {
    body.device_id = deviceId;
  }

  return makeSpotifyRequest('/me/player/play', accessToken, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

export const addToQueue = async (trackUri: string, accessToken: string, deviceId?: string) => {
  const params = new URLSearchParams({ uri: trackUri });
  if (deviceId) {
    params.append('device_id', deviceId);
  }

  return makeSpotifyRequest(`/me/player/queue?${params.toString()}`, accessToken, {
    method: 'POST',
  });
};

export const pausePlayback = async (accessToken: string, deviceId?: string) => {
  const params = deviceId ? `?device_id=${deviceId}` : '';
  return makeSpotifyRequest(`/me/player/pause${params}`, accessToken, {
    method: 'PUT',
  });
};

export const resumePlayback = async (accessToken: string, deviceId?: string) => {
  const params = deviceId ? `?device_id=${deviceId}` : '';
  return makeSpotifyRequest(`/me/player/play${params}`, accessToken, {
    method: 'PUT',
  });
};

export const skipToNext = async (accessToken: string, deviceId?: string) => {
  const params = deviceId ? `?device_id=${deviceId}` : '';
  return makeSpotifyRequest(`/me/player/next${params}`, accessToken, {
    method: 'POST',
  });
};

export const getAvailableDevices = async (accessToken: string) => {
  return makeSpotifyRequest('/me/player/devices', accessToken);
};

export const transferPlayback = async (deviceId: string, accessToken: string) => {
  return makeSpotifyRequest('/me/player', accessToken, {
    method: 'PUT',
    body: JSON.stringify({
      device_ids: [deviceId],
      play: false,
    }),
  });
};

export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};