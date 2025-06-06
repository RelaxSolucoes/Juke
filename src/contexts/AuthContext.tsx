import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  getSpotifyAuthUrl, 
  exchangeCodeForTokens, 
  getCurrentUser,
  refreshSpotifyToken,
  isTokenExpired,
  isTokenExpiringSoon
} from '../utils/spotify';

interface AuthContextType {
  user: User | null;
  isHost: boolean;
  loading: boolean;
  signInWithSpotify: () => Promise<void>;
  signOut: () => Promise<void>;
  setGuestUser: (name: string) => void;
  handleSpotifyCallback: (code: string) => Promise<void>;
  refreshToken: () => Promise<boolean>;
  ensureValidToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>('spotify-party-user', null);
  const [loading, setLoading] = useState(false);
  const [isHost, setIsHost] = useLocalStorage<boolean>('is-host', false);

  // Auto-refresh token on app load if user exists
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      if (user?.refresh_token && user?.token_expires_at && isHost) {
        // Se o token expirou ou está prestes a expirar, renove automaticamente
        if (isTokenExpired(user.token_expires_at) || isTokenExpiringSoon(user.token_expires_at)) {
          console.log('Token expired or expiring soon, refreshing...');
          await refreshToken();
        }
      }
    };

    checkAndRefreshToken();
    
    // Configurar verificação periódica do token (a cada 5 minutos)
    const tokenCheckInterval = setInterval(checkAndRefreshToken, 5 * 60 * 1000);
    
    return () => clearInterval(tokenCheckInterval);
  }, [user?.refresh_token, user?.token_expires_at, isHost]);

  const signInWithSpotify = async () => {
    setLoading(true);
    try {
      const authUrl = await getSpotifyAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erro ao iniciar login com Spotify:', error);
      setLoading(false);
    }
  };

  const handleSpotifyCallback = async (code: string) => {
    setLoading(true);
    try {
      const tokens = await exchangeCodeForTokens(code);
      if (!tokens) {
        throw new Error('Failed to get tokens');
      }

      const spotifyUser = await getCurrentUser(tokens.access_token);
      
      const newUser: User = {
        id: spotifyUser.id,
        name: spotifyUser.display_name || spotifyUser.id,
        email: spotifyUser.email,
        spotify_id: spotifyUser.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        created_at: new Date().toISOString(),
      };
      
      setUser(newUser);
      setIsHost(true);
    } catch (error) {
      console.error('Erro no callback do Spotify:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!user?.refresh_token) return false;

    try {
      const newAccessToken = await refreshSpotifyToken(user.refresh_token);
      if (!newAccessToken) return false;

      const updatedUser: User = {
        ...user,
        access_token: newAccessToken,
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour
      };

      setUser(updatedUser);
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return false;
    }
  };

  // Função para garantir que sempre temos um token válido
  const ensureValidToken = async (): Promise<string | null> => {
    if (!user?.access_token) return null;

    // Se o usuário não é host, retorna o token atual (convidados não têm refresh)
    if (!isHost || !user.refresh_token || !user.token_expires_at) {
      return user.access_token;
    }

    // Se o token expirou ou está prestes a expirar, tente renová-lo
    if (isTokenExpired(user.token_expires_at) || isTokenExpiringSoon(user.token_expires_at)) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        console.error('Failed to refresh expired token');
        return null;
      }
      // Retorna o novo token após refresh
      return user.access_token;
    }

    return user.access_token;
  };

  const signOut = async () => {
    setUser(null);
    setIsHost(false);
    localStorage.removeItem('spotify-party-user');
    localStorage.removeItem('is-host');
    localStorage.removeItem('spotify_auth_code_used');
  };

  const setGuestUser = (name: string) => {
    const guestUser: User = {
      id: 'guest-' + Date.now(),
      name,
      created_at: new Date().toISOString(),
    };
    setUser(guestUser);
    setIsHost(false);
  };

  const value: AuthContextType = {
    user,
    isHost,
    loading,
    signInWithSpotify,
    signOut,
    setGuestUser,
    handleSpotifyCallback,
    refreshToken,
    ensureValidToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};