// Spotify Web API integration - Sistema Simplificado com Credenciais Compartilhadas
import { supabase } from './supabase';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export interface SpotifyConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export const spotifyConfig: SpotifyConfig = {
  clientId: (import.meta.env.VITE_SPOTIFY_CLIENT_ID || '').trim(),
  redirectUri: (import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'https://juke-seven.vercel.app/callback').trim(),
  scopes: [
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
  ]
};

// ===== FUNÇÕES DE AUTENTICAÇÃO (apenas para hosts) =====

export const generatePartyCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getSpotifyAuthUrl = async (): Promise<string> => {
  // Limpar dados anteriores
  localStorage.removeItem('spotify_code_verifier');
  localStorage.removeItem('spotify_redirect_uri');
  localStorage.removeItem('spotify_auth_code_used');
  
  // Gerar code verifier e challenge para PKCE
  const codeVerifier = generateRandomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  localStorage.setItem('spotify_code_verifier', codeVerifier);
  localStorage.setItem('spotify_redirect_uri', spotifyConfig.redirectUri);
  
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
    const codeUsed = localStorage.getItem('spotify_auth_code_used');
    if (codeUsed === code) {
      throw new Error('Authorization code already used');
    }

    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    const redirectUri = localStorage.getItem('spotify_redirect_uri') || spotifyConfig.redirectUri;

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: spotifyConfig.clientId,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to exchange code for tokens: ${response.status} - ${errorData.error}: ${errorData.error_description}`);
    }

    localStorage.setItem('spotify_auth_code_used', code);
    localStorage.removeItem('spotify_code_verifier');
    localStorage.removeItem('spotify_redirect_uri');

    return await response.json();
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    localStorage.removeItem('spotify_code_verifier');
    localStorage.removeItem('spotify_redirect_uri');
    return null;
  }
};

// ===== SISTEMA DE CREDENCIAIS COMPARTILHADAS =====

// Salvar credenciais do host na festa
export const saveHostCredentials = async (
  partyCode: string, 
  accessToken: string, 
  refreshToken: string, 
  expiresIn: number
): Promise<boolean> => {
  try {
    const expiresAt = new Date(Date.now() + (expiresIn * 1000));
    
    const { error } = await supabase
      .from('parties')
      .update({
        host_token: accessToken,
        host_refresh_token: refreshToken,
        token_expires_at: expiresAt.toISOString()
      })
      .eq('code', partyCode)
      .eq('is_active', true);

    if (error) {
      console.error('Erro ao salvar credenciais do host:', error);
      return false;
    }

    console.log('✅ Credenciais do host salvas com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao salvar credenciais:', error);
    return false;
  }
};

// Buscar credenciais do host para uma festa
export const getHostCredentials = async (partyCode: string): Promise<{
  hostToken: string;
  hostRefreshToken: string;
  tokenExpiresAt: string;
  partyId: string;
} | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_host_credentials', { party_code: partyCode });

    if (error || !data || data.length === 0) {
      console.error('Erro ao buscar credenciais do host:', error);
      return null;
    }

    const credentials = data[0];
    return {
      hostToken: credentials.host_token,
      hostRefreshToken: credentials.host_refresh_token,
      tokenExpiresAt: credentials.token_expires_at,
      partyId: credentials.party_id
    };
  } catch (error) {
    console.error('Erro ao buscar credenciais:', error);
    return null;
  }
};

// Renovar token do host
export const refreshHostToken = async (partyCode: string, refreshToken: string): Promise<string | null> => {
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
    const newToken = data.access_token;
    const expiresIn = data.expires_in || 3600;
    
    // Atualizar token no banco
    const expiresAt = new Date(Date.now() + (expiresIn * 1000));
    await supabase
      .rpc('update_host_token', {
        party_code: partyCode,
        new_token: newToken,
        new_expires_at: expiresAt.toISOString()
      });

    console.log('✅ Token do host renovado com sucesso');
    return newToken;
  } catch (error) {
    console.error('Erro ao renovar token do host:', error);
    return null;
  }
};

// Verificar se token está próximo de expirar (5 minutos)
export const isTokenExpiringSoon = (tokenExpiresAt: string): boolean => {
  const expirationTime = new Date(tokenExpiresAt).getTime();
  const currentTime = Date.now();
  const fiveMinutesInMs = 5 * 60 * 1000;
  
  return (expirationTime - currentTime) <= fiveMinutesInMs;
};

// Verificar se token já expirou
export const isTokenExpired = (tokenExpiresAt: string): boolean => {
  const expirationTime = new Date(tokenExpiresAt).getTime();
  return Date.now() >= expirationTime;
};

// ===== FUNÇÕES DA API SPOTIFY (usando credenciais do host) =====

// Fazer requisição para API do Spotify com auto-refresh
const makeSpotifyRequest = async (
  endpoint: string,
  partyCode: string,
  options: RequestInit = {}
): Promise<any> => {
  const credentials = await getHostCredentials(partyCode);
  if (!credentials) {
    throw new Error('Credenciais do host não encontradas');
  }

  let { hostToken } = credentials;

  // Verificar se precisa renovar o token
  if (isTokenExpiringSoon(credentials.tokenExpiresAt)) {
    console.log('🔄 Token expirando, renovando...');
    const newToken = await refreshHostToken(partyCode, credentials.hostRefreshToken);
    if (newToken) {
      hostToken = newToken;
    }
  }

  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${hostToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token inválido, tentar renovar
      console.log('🔄 Token inválido, tentando renovar...');
      const newToken = await refreshHostToken(partyCode, credentials.hostRefreshToken);
      if (newToken) {
        // Tentar novamente com o novo token
        const retryResponse = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        
        if (!retryResponse.ok) {
          throw new Error(`Spotify API error: ${retryResponse.status}`);
        }
        
        // Verificar se há conteúdo para fazer parse JSON
        const contentType = retryResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await retryResponse.text();
          return text ? JSON.parse(text) : null;
        }
        return null;
      }
    }
    throw new Error(`Spotify API error: ${response.status}`);
  }

  // Verificar se há conteúdo para fazer parse JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
  
  // Para respostas sem conteúdo (como 204 No Content)
  return null;
};

// Buscar músicas usando credenciais do host
export const searchTracksWithHostCredentials = async (
  query: string, 
  partyCode: string
): Promise<any[]> => {
  try {
    const data = await makeSpotifyRequest(
      `/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
      partyCode
    );
    
    return data.tracks?.items || [];
  } catch (error) {
    console.error('Erro ao buscar músicas:', error);
    throw error;
  }
};

// Adicionar música à fila do Spotify do host
export const addToHostQueue = async (trackUri: string, partyCode: string): Promise<void> => {
  try {
    const credentials = await getHostCredentials(partyCode);
    if (!credentials) {
      throw new Error('Credenciais do host não encontradas');
    }

    let { hostToken } = credentials;

    // Verificar se precisa renovar o token
    if (isTokenExpiringSoon(credentials.tokenExpiresAt)) {
      console.log('🔄 Token expirando, renovando...');
      const newToken = await refreshHostToken(partyCode, credentials.hostRefreshToken);
      if (newToken) {
        hostToken = newToken;
      }
    }

    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/queue?uri=${encodeURIComponent(trackUri)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hostToken}`,
      },
    });

    // A API do Spotify retorna 204 (No Content) para sucesso na fila
    if (response.status === 204) {
      console.log('✅ Música adicionada à fila do host');
      return;
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido, tentar renovar
        console.log('🔄 Token inválido, tentando renovar...');
        const newToken = await refreshHostToken(partyCode, credentials.hostRefreshToken);
        if (newToken) {
          // Tentar novamente com o novo token
          const retryResponse = await fetch(`${SPOTIFY_API_BASE}/me/player/queue?uri=${encodeURIComponent(trackUri)}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${newToken}`,
            },
          });
          
          if (retryResponse.status === 204) {
            console.log('✅ Música adicionada à fila do host (após renovar token)');
            return;
          }
        }
      }
      
      const errorText = await response.text();
      console.error('Erro da API Spotify:', response.status, errorText);
      throw new Error(`Erro ao adicionar à fila: ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao adicionar à fila:', error);
    throw error;
  }
};

// Controles de reprodução do host
export const hostPlaybackControls = {
  // Pausar reprodução
  pause: async (partyCode: string): Promise<void> => {
    await makeSpotifyRequest('/me/player/pause', partyCode, { method: 'PUT' });
  },

  // Retomar reprodução
  play: async (partyCode: string): Promise<void> => {
    await makeSpotifyRequest('/me/player/play', partyCode, { method: 'PUT' });
  },

  // Pular para próxima música
  skipNext: async (partyCode: string): Promise<void> => {
    await makeSpotifyRequest('/me/player/next', partyCode, { method: 'POST' });
  },

  // Pular para música anterior
  skipPrevious: async (partyCode: string): Promise<void> => {
    await makeSpotifyRequest('/me/player/previous', partyCode, { method: 'POST' });
  },

  // Obter estado atual da reprodução
  getCurrentState: async (partyCode: string): Promise<any> => {
    return await makeSpotifyRequest('/me/player', partyCode);
  }
};

// Obter informações do usuário (apenas para hosts)
export const getCurrentUser = async (accessToken: string) => {
  const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Obter música tocando atualmente
export const getCurrentlyPlaying = async (partyCode: string): Promise<any> => {
  try {
    const data = await makeSpotifyRequest('/me/player/currently-playing', partyCode);
    
    // Se não há nada tocando, retornar null
    if (!data || !data.item) {
      return null;
    }

    // Formatar dados da música atual
    return {
      track: {
        id: data.item.id,
        name: data.item.name,
        artist: data.item.artists.map((artist: any) => artist.name).join(', '),
        album: data.item.album.name,
        duration_ms: data.item.duration_ms,
        image_url: data.item.album.images[0]?.url || null,
        external_url: data.item.external_urls.spotify
      },
      progress_ms: data.progress_ms,
      is_playing: data.is_playing,
      device: data.device
    };
  } catch (error) {
    console.error('Erro ao obter música atual:', error);
    return null;
  }
};



// Utilitário para formatar duração
export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// ===== FUNÇÕES DE PLAYLIST DE FALLBACK =====

// Buscar playlists do usuário (host) - usando token direto do usuário
export const getUserPlaylists = async (accessToken: string): Promise<any[]> => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Erro ao buscar playlists:', error);
    return [];
  }
};

// Função alternativa para buscar playlists usando credenciais da festa (para depois)
export const getUserPlaylistsFromParty = async (partyCode: string): Promise<any[]> => {
  try {
    const response = await makeSpotifyRequest(
      '/me/playlists?limit=50',
      partyCode
    );
    
    return response.items || [];
  } catch (error) {
    console.error('Erro ao buscar playlists:', error);
    return [];
  }
};

// Iniciar reprodução de uma playlist
export const startPlaylistPlayback = async (
  playlistUri: string, 
  partyCode: string
): Promise<void> => {
  try {
    const credentials = await getHostCredentials(partyCode);
    if (!credentials) {
      throw new Error('Credenciais do host não encontradas');
    }

    let { hostToken } = credentials;

    // Verificar se precisa renovar o token
    if (isTokenExpiringSoon(credentials.tokenExpiresAt)) {
      console.log('🔄 Token expirando, renovando...');
      const newToken = await refreshHostToken(partyCode, credentials.hostRefreshToken);
      if (newToken) {
        hostToken = newToken;
      }
    }

    console.log('🎵 Enviando comando para iniciar playlist:', playlistUri);
    
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/play`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${hostToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context_uri: playlistUri
      })
    });

    console.log('📡 Resposta da API Spotify:', response.status, response.statusText);

    // Sucesso: 204 (No Content) ou 200 (OK)
    if (response.status === 204 || response.status === 200) {
      console.log('✅ Playlist iniciada com sucesso');
      return;
    }

    // Erro 404: Nenhum dispositivo ativo
    if (response.status === 404) {
      throw new Error('Nenhum dispositivo Spotify ativo encontrado. Abra o Spotify em algum dispositivo e tente novamente.');
    }

    // Erro 403: Premium necessário
    if (response.status === 403) {
      throw new Error('Spotify Premium é necessário para controlar a reprodução.');
    }

    // Erro 401: Token inválido, tentar renovar
    if (response.status === 401) {
      console.log('🔄 Token inválido, tentando renovar...');
      const newToken = await refreshHostToken(partyCode, credentials.hostRefreshToken);
      if (newToken) {
        // Tentar novamente com o novo token
        const retryResponse = await fetch(`${SPOTIFY_API_BASE}/me/player/play`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            context_uri: playlistUri
          })
        });
        
        if (retryResponse.status === 204 || retryResponse.status === 200) {
          console.log('✅ Playlist iniciada com sucesso (após renovar token)');
          return;
        }
        
        if (retryResponse.status === 404) {
          throw new Error('Nenhum dispositivo Spotify ativo encontrado. Abra o Spotify em algum dispositivo e tente novamente.');
        }
      }
    }

    // Outros erros
    const errorText = await response.text().catch(() => 'Erro desconhecido');
    console.error('❌ Erro da API Spotify:', response.status, errorText);
    throw new Error(`Erro ao iniciar playlist: ${response.status} - ${errorText}`);
    
  } catch (error) {
    console.error('❌ Erro ao iniciar playlist:', error);
    throw error;
  }
};

// Salvar playlist de fallback na festa
export const saveFallbackPlaylist = async (
  partyCode: string,
  playlistId: string,
  playlistName: string,
  playlistUri: string
): Promise<boolean> => {
  try {
    console.log('💾 Salvando playlist de fallback:', {
      partyCode,
      playlistId,
      playlistName,
      playlistUri
    });

    const { data, error } = await supabase
      .from('parties')
      .update({
        fallback_playlist_id: playlistId,
        fallback_playlist_name: playlistName,
        fallback_playlist_uri: playlistUri
      })
      .eq('code', partyCode)
      .eq('is_active', true)
      .select();

    if (error) {
      console.error('❌ Erro ao salvar playlist de fallback:', error);
      return false;
    }

    if (!data || data.length === 0) {
      console.error('❌ Nenhuma festa encontrada com o código:', partyCode);
      return false;
    }

    console.log('✅ Playlist de fallback salva com sucesso:', data[0]);
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar playlist de fallback:', error);
    return false;
  }
};

// Buscar playlist de fallback da festa
export const getFallbackPlaylist = async (partyCode: string): Promise<{
  playlistId: string;
  playlistName: string;
  playlistUri: string;
} | null> => {
  try {
    console.log('🔍 Buscando playlist de fallback para festa:', partyCode);
    
    const { data, error } = await supabase
      .from('parties')
      .select('fallback_playlist_id, fallback_playlist_name, fallback_playlist_uri')
      .eq('code', partyCode)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar playlist de fallback:', error);
      return null;
    }

    if (!data) {
      console.error('❌ Nenhuma festa encontrada com código:', partyCode);
      return null;
    }

    if (!data.fallback_playlist_id) {
      console.log('⚠️ Festa encontrada mas sem playlist de fallback configurada');
      return null;
    }

    console.log('✅ Playlist de fallback encontrada:', {
      playlistId: data.fallback_playlist_id,
      playlistName: data.fallback_playlist_name,
      playlistUri: data.fallback_playlist_uri
    });

    return {
      playlistId: data.fallback_playlist_id,
      playlistName: data.fallback_playlist_name,
      playlistUri: data.fallback_playlist_uri
    };
  } catch (error) {
    console.error('❌ Erro ao buscar playlist de fallback:', error);
    return null;
  }
};

// ===== FUNÇÕES LEGADAS (manter compatibilidade) =====

// Manter para compatibilidade com código existente
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

// Buscar músicas (versão legada - usar searchTracksWithHostCredentials)
export const searchTracks = async (query: string, accessToken: string): Promise<any[]> => {
  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tracks?.items || [];
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};