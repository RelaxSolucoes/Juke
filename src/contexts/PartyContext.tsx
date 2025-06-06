import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Party, Track, Guest } from '../types';
import { useAuth } from './AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  searchTracksWithHostCredentials,
  addToHostQueue,
  hostPlaybackControls,
  saveHostCredentials,
  generatePartyCode
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

interface PartyContextType {
  currentParty: Party | null;
  queue: Track[];
  guests: Guest[];
  isPlaying: boolean;
  currentTrack: Track | null;
  createParty: (name: string) => Promise<string>;
  joinParty: (code: string, guestName: string) => Promise<boolean>;
  addTrackToQueue: (track: any, guestName?: string) => Promise<void>;
  pausePlayback: () => Promise<void>;
  resumePlayback: () => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  removeTrackFromQueue: (trackId: string) => Promise<void>;
  leaveParty: () => void;
  searchTracks: (query: string) => Promise<any[]>;
  getCurrentPlaybackState: () => Promise<any>;
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

  // Monitorar estado de reprodução do Spotify (apenas para hosts)
  useEffect(() => {
    if (!isHost || !currentParty) return;

    const checkPlaybackState = async () => {
      try {
        const state = await hostPlaybackControls.getCurrentState(currentParty.code);
        if (state && state.item) {
          setIsPlaying(!state.is_paused);
          
          const track: Track = {
            id: state.item.id,
            spotify_id: state.item.id,
            name: state.item.name,
            artist: state.item.artists[0]?.name || 'Artista Desconhecido',
            album: state.item.album?.name || 'Álbum Desconhecido',
            duration_ms: state.item.duration_ms,
            image_url: state.item.album?.images[0]?.url,
            added_by: currentParty.host_id,
            added_by_name: currentParty.host?.name || 'Host',
            party_id: currentParty.id,
            created_at: new Date().toISOString(),
          };
          
          setCurrentTrack(track);
        }
      } catch (error) {
        // Ignorar erros silenciosamente (pode não ter dispositivo ativo)
      }
    };

    // Verificar estado inicial
    checkPlaybackState();

    // Verificar a cada 5 segundos
    const interval = setInterval(checkPlaybackState, 5000);

    return () => clearInterval(interval);
  }, [isHost, currentParty?.code]);

  const createParty = async (name: string): Promise<string> => {
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

      setCurrentParty(newParty);
      setQueue([]);
      setGuests([]);
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

    // Determinar quem está adicionando a música
    const addedByName = guestName || user?.name || 'Convidado';
    const addedById = user?.id || 'guest';

    const trackData = {
      spotify_id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      duration_ms: track.duration_ms,
      image_url: track.album.images[0]?.url,
      preview_url: track.preview_url,
      added_by: addedById,
      added_by_name: addedByName,
      party_id: currentParty.id,
    };

    try {
      // Adicionar ao banco de dados
      await addTrackToQueueDB(trackData);
      
      // Adicionar à fila do Spotify do host
      await addToHostQueue(`spotify:track:${track.id}`, currentParty.code);
      
      console.log(`✅ Música "${track.name}" adicionada por ${addedByName}`);
    } catch (error) {
      console.error('Erro ao adicionar música à fila:', error);
      throw new Error('Erro ao adicionar música à fila');
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

  const getCurrentPlaybackState = async (): Promise<any> => {
    if (!currentParty) return null;

    try {
      return await hostPlaybackControls.getCurrentState(currentParty.code);
    } catch (error) {
      console.error('Erro ao obter estado de reprodução:', error);
      return null;
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
    if (currentParty && isHost) {
      try {
        await deactivateParty(currentParty.id);
      } catch (error) {
        console.error('Erro ao desativar festa:', error);
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

  const value: PartyContextType = {
    currentParty,
    queue,
    guests,
    isPlaying,
    currentTrack,
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
  };

  return (
    <PartyContext.Provider value={value}>
      {children}
    </PartyContext.Provider>
  );
};