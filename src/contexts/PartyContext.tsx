import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Party, Track, Guest } from '../types';
import { useAuth } from './AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  searchTracks as spotifySearchTracks,
  playTrack as spotifyPlayTrack,
  addToQueue as spotifyAddToQueue,
  pausePlayback as spotifyPausePlayback,
  resumePlayback as spotifyResumePlayback,
  skipToNext as spotifySkipToNext,
  getPlaybackState,
  makeSpotifyRequest
} from '../utils/spotify';
import {
  createPartyInDB,
  getPartyByCode,
  addGuestToParty,
  getPartyGuests,
  addTrackToQueueDB,
  getPartyQueue,
  removeTrackFromQueueDB,
  updateCurrentTrack,
  deactivateParty,
  subscribeToPartyUpdates
} from '../utils/supabase';

interface PartyContextType {
  currentParty: Party | null;
  queue: Track[];
  guests: Guest[];
  isPlaying: boolean;
  currentTrack: Track | null;
  spotifyDeviceId: string | null;
  createParty: (name: string) => Promise<string>;
  joinParty: (code: string, guestName: string) => Promise<boolean>;
  addTrackToQueue: (track: any) => Promise<void>;
  playTrack: (track: Track) => Promise<void>;
  pausePlayback: () => Promise<void>;
  resumePlayback: () => Promise<void>;
  skipToNext: () => Promise<void>;
  removeTrackFromQueue: (trackId: string) => Promise<void>;
  leaveParty: () => void;
  searchTracks: (query: string) => Promise<any[]>;
  initializeSpotifyPlayer: () => Promise<void>;
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
  const { user, isHost, refreshToken } = useAuth();
  const [currentParty, setCurrentParty] = useLocalStorage<Party | null>('current-party', null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [spotifyDeviceId, setSpotifyDeviceId] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);

  const generatePartyCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSpotifyError = async (error: any, retryFn?: () => Promise<any>) => {
    if (error.message === 'UNAUTHORIZED' && isHost) {
      const refreshed = await refreshToken();
      if (refreshed && retryFn) {
        return await retryFn();
      }
    }
    throw error;
  };

  // Load party data from database
  const loadPartyData = async (party: Party) => {
    try {
      const [queueData, guestsData] = await Promise.all([
        getPartyQueue(party.id),
        getPartyGuests(party.id)
      ]);
      
      setQueue(queueData);
      setGuests(guestsData);
    } catch (error) {
      console.error('Error loading party data:', error);
    }
  };

  // Setup real-time subscription
  const setupRealtimeSubscription = (partyId: string) => {
    if (realtimeSubscription) {
      realtimeSubscription.unsubscribe();
    }

    const subscription = subscribeToPartyUpdates(partyId, (payload) => {
      console.log('Real-time update:', payload);
      
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

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe();
      }
    };
  }, [realtimeSubscription]);

  // Setup real-time when party changes
  useEffect(() => {
    if (currentParty) {
      loadPartyData(currentParty);
      setupRealtimeSubscription(currentParty.id);
    }
  }, [currentParty?.id]);

  const initializeSpotifyPlayer = async () => {
    if (!isHost || !user?.access_token) return;

    return new Promise<void>((resolve) => {
      if (window.Spotify) {
        createPlayer();
      } else {
        window.onSpotifyWebPlaybackSDKReady = createPlayer;
        
        if (!document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://sdk.scdn.co/spotify-player.js';
          script.async = true;
          document.body.appendChild(script);
        }
      }

      function createPlayer() {
        const spotifyPlayer = new window.Spotify.Player({
          name: 'Spotify Party App',
          getOAuthToken: (cb: (token: string) => void) => {
            cb(user!.access_token!);
          },
          volume: 0.5
        });

        spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
          console.log('Spotify player ready with device ID:', device_id);
          setSpotifyDeviceId(device_id);
          setPlayer(spotifyPlayer);
          resolve();
        });

        spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('Device ID has gone offline:', device_id);
        });

        spotifyPlayer.addListener('player_state_changed', async (state: any) => {
          if (state && currentParty) {
            setIsPlaying(!state.paused);
            if (state.track_window.current_track) {
              const track = state.track_window.current_track;
              const currentTrackData: Track = {
                id: track.id,
                spotify_id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                duration_ms: track.duration_ms,
                image_url: track.album.images[0]?.url,
                added_by: user!.id,
                added_by_name: user!.name,
                party_id: currentParty.id,
                created_at: new Date().toISOString(),
              };
              setCurrentTrack(currentTrackData);
              
              // Update current track in database
              try {
                await updateCurrentTrack(currentParty.id, track.id);
              } catch (error) {
                console.error('Error updating current track:', error);
              }
            }
          }
        });

        spotifyPlayer.connect();
      }
    });
  };

  useEffect(() => {
    if (isHost && user?.access_token) {
      initializeSpotifyPlayer();
    }
  }, [isHost, user?.access_token]);

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

      setCurrentParty(newParty);
      setQueue([]);
      setGuests([]);
      return partyCode;
    } catch (error) {
      console.error('Error creating party:', error);
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

      // Add guest to database
      await addGuestToParty({
        name: guestName,
        party_id: party.id,
      });

      setCurrentParty(party);
      return true;
    } catch (error) {
      console.error('Error joining party:', error);
      return false;
    }
  };

  const searchTracks = async (query: string): Promise<any[]> => {
    if (!user?.access_token) return [];

    try {
      return await spotifySearchTracks(query, user.access_token);
    } catch (error) {
      return await handleSpotifyError(error, () => 
        spotifySearchTracks(query, user!.access_token!)
      );
    }
  };

  const addTrackToQueue = async (track: any): Promise<void> => {
    if (!currentParty || !user) return;

    const trackData = {
      spotify_id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      duration_ms: track.duration_ms,
      image_url: track.album.images[0]?.url,
      preview_url: track.preview_url,
      added_by: user.id,
      added_by_name: user.name,
      party_id: currentParty.id,
    };

    try {
      await addTrackToQueueDB(trackData);
      // The real-time subscription will update the local state
    } catch (error) {
      console.error('Error adding track to queue:', error);
      throw new Error('Erro ao adicionar música à fila');
    }
  };

  const playTrack = async (track: Track): Promise<void> => {
    if (!isHost || !user?.access_token || !spotifyDeviceId) return;

    try {
      await spotifyPlayTrack(`spotify:track:${track.spotify_id}`, user.access_token, spotifyDeviceId);
    } catch (error) {
      await handleSpotifyError(error, () =>
        spotifyPlayTrack(`spotify:track:${track.spotify_id}`, user!.access_token!, spotifyDeviceId!)
      );
    }
  };

  const pausePlayback = async (): Promise<void> => {
    if (!isHost || !user?.access_token) return;

    try {
      await spotifyPausePlayback(user.access_token, spotifyDeviceId || undefined);
    } catch (error) {
      await handleSpotifyError(error, () =>
        spotifyPausePlayback(user!.access_token!, spotifyDeviceId || undefined)
      );
    }
  };

  const resumePlayback = async (): Promise<void> => {
    if (!isHost || !user?.access_token) return;

    try {
      await spotifyResumePlayback(user.access_token, spotifyDeviceId || undefined);
    } catch (error) {
      await handleSpotifyError(error, () =>
        spotifyResumePlayback(user!.access_token!, spotifyDeviceId || undefined)
      );
    }
  };

  const skipToNext = async (): Promise<void> => {
    if (!isHost || !user?.access_token) return;

    try {
      await spotifySkipToNext(user.access_token, spotifyDeviceId || undefined);
    } catch (error) {
      await handleSpotifyError(error, () =>
        spotifySkipToNext(user!.access_token!, spotifyDeviceId || undefined)
      );
    }
  };

  const removeTrackFromQueue = async (trackId: string): Promise<void> => {
    try {
      await removeTrackFromQueueDB(trackId);
      // The real-time subscription will update the local state
    } catch (error) {
      console.error('Error removing track from queue:', error);
      throw new Error('Erro ao remover música da fila');
    }
  };

  const leaveParty = async () => {
    if (currentParty && isHost) {
      try {
        await deactivateParty(currentParty.id);
      } catch (error) {
        console.error('Error deactivating party:', error);
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
    
    // Clear local storage
    localStorage.removeItem('current-party');
  };

  const value: PartyContextType = {
    currentParty,
    queue,
    guests,
    isPlaying,
    currentTrack,
    spotifyDeviceId,
    createParty,
    joinParty,
    addTrackToQueue,
    playTrack,
    pausePlayback,
    resumePlayback,
    skipToNext,
    removeTrackFromQueue,
    leaveParty,
    searchTracks,
    initializeSpotifyPlayer,
  };

  return (
    <PartyContext.Provider value={value}>
      {children}
    </PartyContext.Provider>
  );
};