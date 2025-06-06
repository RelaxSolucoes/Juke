import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { makeSpotifyRequestWithRefresh, makeSpotifyRequest } from '../utils/spotify';

export const useSpotify = () => {
  const { user, isHost, refreshToken, ensureValidToken } = useAuth();

  // Função para fazer requisições com refresh automático
  const makeRequest = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const token = await ensureValidToken();
    if (!token) {
      throw new Error('No valid access token available');
    }

    // Se o usuário é host e tem refresh token, use a versão com refresh automático
    if (isHost && user?.refresh_token) {
      return makeSpotifyRequestWithRefresh(
        endpoint,
        token,
        user.refresh_token,
        // Callback para atualizar o token no contexto quando renovado
        (newToken: string) => {
          // O token já foi atualizado no contexto pelo refreshToken()
          console.log('Token updated in context');
        },
        options
      );
    } else {
      // Para convidados ou quando não há refresh token, use a versão básica
      return makeSpotifyRequest(endpoint, token, options);
    }
  }, [user, isHost, ensureValidToken]);

  const isAuthenticated = Boolean(user?.access_token);
  const canControl = isHost && isAuthenticated;

  return {
    makeRequest,
    isAuthenticated,
    canControl,
    user,
    isHost,
    refreshToken,
    ensureValidToken
  };
}; 