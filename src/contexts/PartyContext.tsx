import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Party, Track, Guest } from '../types';
import { useAuth } from './AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  searchTracksWithHostCredentials,
  addToHostQueue,
  hostPlaybackControls,
  saveHostCredentials,
  generatePartyCode,
  getCurrentlyPlaying,
  getUserPlaylists,
  startPlaylistPlayback,
  saveFallbackPlaylist,
  getFallbackPlaylist,
} from '../utils/spotify';
import {
  createPartyInDB,
  getPartyByCode,
  addGuestToParty,
  getPartyGuests,
  addTrackToQueueDB,
  getPartyQueue,
  removeTrackFromQueueDB,
  deactivateParty,
  subscribeToPartyUpdates
} from '../utils/supabase';
import { supabase } from '../utils/supabase';

interface PartyContextType {
  currentParty: Party | null;
  queue: Track[];
  guests: Guest[];
  isPlaying: boolean;
  currentTrack: Track | null;
  nowPlaying: any | null;
  createParty: (name: string, selectedPlaylist?: any) => Promise<string>;
  joinParty: (code: string, guestName: string) => Promise<boolean>;
  addTrackToQueue: (track: any, guestName?: string) => Promise<void>;
  pausePlayback: () => Promise<void>;
  resumePlayback: () => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  removeTrackFromQueue: (trackId: string) => Promise<void>;
  leaveParty: () => void;
  searchTracks: (query: string) => Promise<any[]>;
  getCurrentPlaybackState: () => Promise<void>;
  // Funções de playlist de fallback
  getUserPlaylists: () => Promise<any[]>;
  startFallbackPlaylist: () => Promise<void>;
  saveFallbackPlaylist: (playlist: any) => Promise<boolean>;
}

const PartyContext = createContext<PartyContextType | undefined>(undefined);

export const useParty = () => {
  const context = useContext(PartyContext);
  if (context === undefined) {
    throw new Error('useParty deve ser usado dentro de um PartyProvider');
  }
  return context;
};

interface PartyProviderProps {
  children: ReactNode;
}

export const PartyProvider: React.FC<PartyProviderProps> = ({ children }) => {
  const { user, isHost } = useAuth();
  const [currentParty, setCurrentParty] = useLocalStorage<Party | null>('current-party', null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [nowPlaying, setNowPlaying] = useState<any | null>(null);
  const [lastPlayingTrackId, setLastPlayingTrackId] = useState<string | null>(null);
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);

  // Carregar dados da festa do banco
  const loadPartyData = async (party: Party) => {
    try {
      const [queueData, guestsData] = await Promise.all([
        getPartyQueue(party.id),
        getPartyGuests(party.id)
      ]);
      
      setQueue(queueData);
      setGuests(guestsData);
    } catch (error) {
      console.error('Erro ao carregar dados da festa:', error);
    }
  };

  // Configurar subscription em tempo real
  const setupRealtimeSubscription = (partyId: string) => {
    if (realtimeSubscription) {
      realtimeSubscription.unsubscribe();
    }

    try {
      const subscription = subscribeToPartyUpdates(partyId, (payload) => {
        console.log('Atualização em tempo real:', payload);
        
        if (payload.table === 'tracks') {
          if (payload.eventType === 'INSERT') {
            setQueue(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setQueue(prev => prev.filter(track => track.id !== payload.old.id));
          }
        } else if (payload.table === 'guests') {
          if (payload.eventType === 'INSERT') {
            setGuests(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setGuests(prev => prev.filter(guest => guest.id !== payload.old.id));
          }
        } else if (payload.table === 'parties' && payload.eventType === 'UPDATE') {
          setCurrentParty(prev => prev ? { ...prev, ...payload.new } : null);
        }
      });

      setRealtimeSubscription(subscription);
      console.log('✅ Conexão em tempo real estabelecida');
    } catch (error) {
      console.warn('⚠️ Erro ao configurar tempo real, continuando sem sincronização:', error);
      // App continua funcionando sem tempo real
    }
  };

  // Limpar subscription ao desmontar
  useEffect(() => {
    return () => {
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe();
      }
    };
  }, [realtimeSubscription]);

  // Configurar tempo real quando festa muda
  useEffect(() => {
    if (currentParty) {
      loadPartyData(currentParty);
      setupRealtimeSubscription(currentParty.id);
    }
  }, [currentParty?.id]);

  // Função para obter estado atual de reprodução - DESABILITADA PARA MVP
  const getCurrentPlaybackState = async () => {
    // DESABILITADA - causando loops infinitos
    // Implementar depois quando tivermos mais tempo
    console.log('Função desabilitada para MVP');
  };

  const createParty = async (name: string, selectedPlaylist?: any): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');

    const partyCode = generatePartyCode();
    
    try {
      const partyData = await createPartyInDB({
        code: partyCode,
        name,
        host_id: user.id,
        host_name: user.name,
      });

      const newParty: Party = {
        id: partyData.id,
        code: partyData.code,
        name: partyData.name,
        host_id: partyData.host_id,
        host: user,
        is_active: partyData.is_active,
        created_at: partyData.created_at,
        updated_at: partyData.updated_at,
      };

      // Configurar estado local PRIMEIRO
      setCurrentParty(newParty);
      setQueue([]);
      setGuests([]);

      // Salvar credenciais do host na festa
      if (user.access_token && user.refresh_token) {
        const saved = await saveHostCredentials(
          partyCode,
          user.access_token,
          user.refresh_token,
          3600 // 1 hora padrão
        );
        
        if (!saved) {
          console.warn('⚠️ Não foi possível salvar credenciais do host');
        }
      }

      // Salvar playlist de fallback se selecionada
      if (selectedPlaylist) {
        console.log('💾 Salvando playlist de fallback:', selectedPlaylist.name);
        const playlistSaved = await saveFallbackPlaylist(
          partyCode,
          selectedPlaylist.id,
          selectedPlaylist.name,
          selectedPlaylist.uri
        );
        
        if (playlistSaved) {
          console.log('✅ Playlist de fallback configurada:', selectedPlaylist.name);
        } else {
          console.warn('⚠️ Não foi possível salvar a playlist de fallback');
        }
      }

      return partyCode;
    } catch (error) {
      console.error('Erro ao criar festa:', error);
      throw new Error('Erro ao criar festa. Tente novamente.');
    }
  };

  const joinParty = async (code: string, guestName: string): Promise<boolean> => {
    try {
      const partyData = await getPartyByCode(code);
      if (!partyData) {
        return false;
      }

      const party: Party = {
        id: partyData.id,
        code: partyData.code,
        name: partyData.name,
        host_id: partyData.host_id,
        host: {
          id: partyData.host_id,
          name: partyData.host_name,
          created_at: partyData.created_at,
        },
        is_active: partyData.is_active,
        created_at: partyData.created_at,
        updated_at: partyData.updated_at,
      };

      // Adicionar convidado ao banco
      await addGuestToParty({
        name: guestName,
        party_id: party.id,
      });

      setCurrentParty(party);
      return true;
    } catch (error) {
      console.error('Erro ao entrar na festa:', error);
      return false;
    }
  };

  const searchTracks = async (query: string): Promise<any[]> => {
    if (!currentParty || !query.trim()) return [];

    try {
      // Usar credenciais do host para buscar (funciona para hosts e convidados)
      return await searchTracksWithHostCredentials(query, currentParty.code);
    } catch (error) {
      console.error('Erro ao buscar músicas:', error);
      throw new Error('Erro ao buscar músicas. Verifique se o host está com Spotify ativo.');
    }
  };

  const addTrackToQueue = async (track: any, guestName?: string): Promise<void> => {
    if (!currentParty) return;

    try {
      // Adicionar à fila do Spotify do host (MVP simplificado)
      await addToHostQueue(track.uri, currentParty.code);
      
      console.log('✅ Música adicionada ao Spotify:', track.name);
      // Não salvar no Supabase por enquanto - MVP focado apenas no Spotify
    } catch (error) {
      console.error('Erro ao adicionar música:', error);
      throw error;
    }
  };

  const pausePlayback = async (): Promise<void> => {
    if (!currentParty) return;

    try {
      await hostPlaybackControls.pause(currentParty.code);
      setIsPlaying(false);
    } catch (error) {
      console.error('Erro ao pausar reprodução:', error);
      throw new Error('Erro ao pausar reprodução');
    }
  };

  const resumePlayback = async (): Promise<void> => {
    if (!currentParty) return;

    try {
      await hostPlaybackControls.play(currentParty.code);
      setIsPlaying(true);
    } catch (error) {
      console.error('Erro ao retomar reprodução:', error);
      throw new Error('Erro ao retomar reprodução');
    }
  };

  const skipToNext = async (): Promise<void> => {
    if (!currentParty) return;

    try {
      await hostPlaybackControls.skipNext(currentParty.code);
    } catch (error) {
      console.error('Erro ao pular música:', error);
      throw new Error('Erro ao pular música');
    }
  };

  const skipToPrevious = async (): Promise<void> => {
    if (!currentParty) return;

    try {
      await hostPlaybackControls.skipPrevious(currentParty.code);
    } catch (error) {
      console.error('Erro ao voltar música:', error);
      throw new Error('Erro ao voltar música');
    }
  };

  const removeTrackFromQueue = async (trackId: string): Promise<void> => {
    try {
      await removeTrackFromQueueDB(trackId);
      // A subscription em tempo real atualizará o estado local
    } catch (error) {
      console.error('Erro ao remover música da fila:', error);
      throw new Error('Erro ao remover música da fila');
    }
  };

  const leaveParty = async () => {
    if (currentParty && isHost && user) {
      try {
        await deactivateParty(currentParty.id, user.id);
        console.log('🎉 Festa encerrada com sucesso!');
      } catch (error) {
        console.error('Erro ao desativar festa:', error);
        // Mesmo com erro, vamos limpar o estado local
      }
    }

    if (realtimeSubscription) {
      realtimeSubscription.unsubscribe();
    }

    setCurrentParty(null);
    setQueue([]);
    setGuests([]);
    setCurrentTrack(null);
    setIsPlaying(false);
    
    // Limpar localStorage
    localStorage.removeItem('current-party');
  };

  // ===== FUNÇÕES DE PLAYLIST DE FALLBACK =====

  const getUserPlaylistsFunc = async (): Promise<any[]> => {
    if (!user?.access_token) {
      console.error('Usuário não autenticado ou sem token');
      return [];
    }

    try {
      return await getUserPlaylists(user.access_token);
    } catch (error) {
      console.error('Erro ao buscar playlists:', error);
      return [];
    }
  };

  const startFallbackPlaylist = async (): Promise<void> => {
    if (!currentParty) {
      throw new Error('Nenhuma festa ativa');
    }

    try {
      console.log('🔍 Buscando playlist de fallback para festa:', currentParty.code);
      const fallbackPlaylist = await getFallbackPlaylist(currentParty.code);
      
      if (!fallbackPlaylist) {
        console.log('⚠️ Nenhuma playlist configurada - festa iniciada sem música de fundo');
        console.log('✅ Festa iniciada! Aguardando convidados adicionarem músicas...');
        return; // Festa pode iniciar sem playlist - é OPCIONAL
      }

      console.log('🎵 Iniciando playlist configurada:', fallbackPlaylist.playlistName);
      await startPlaylistPlayback(fallbackPlaylist.playlistUri, currentParty.code);
      console.log('✅ Playlist de fallback iniciada:', fallbackPlaylist.playlistName);
    } catch (error) {
      console.error('Erro ao iniciar festa:', error);
      
      // Melhorar mensagem de erro baseada no tipo
      if (error instanceof Error) {
        if (error.message.includes('Nenhum dispositivo Spotify ativo')) {
          throw error; // Manter mensagem específica
        } else if (error.message.includes('Premium')) {
          throw error; // Manter mensagem específica
        } else if (error.message.includes('404')) {
          throw new Error('Nenhum dispositivo Spotify ativo encontrado. Abra o Spotify em algum dispositivo e tente novamente.');
        } else {
          throw new Error('Erro ao iniciar festa. Verifique se o Spotify está ativo e tente novamente.');
        }
      }
      
      throw error;
    }
  };

  const saveFallbackPlaylistFunc = async (playlist: any): Promise<boolean> => {
    if (!currentParty) {
      console.error('Nenhuma festa ativa');
      return false;
    }

    try {
      return await saveFallbackPlaylist(
        currentParty.code,
        playlist.id,
        playlist.name,
        playlist.uri
      );
    } catch (error) {
      console.error('Erro ao salvar playlist de fallback:', error);
      return false;
    }
  };

  const value: PartyContextType = {
    currentParty,
    queue,
    guests,
    isPlaying,
    currentTrack,
    nowPlaying,
    createParty,
    joinParty,
    addTrackToQueue,
    pausePlayback,
    resumePlayback,
    skipToNext,
    skipToPrevious,
    removeTrackFromQueue,
    leaveParty,
    searchTracks,
    getCurrentPlaybackState,
    // Funções de playlist de fallback
    getUserPlaylists: getUserPlaylistsFunc,
    startFallbackPlaylist,
    saveFallbackPlaylist: saveFallbackPlaylistFunc,
  };

  return (
    <PartyContext.Provider value={value}>
      {children}
    </PartyContext.Provider>
  );
};