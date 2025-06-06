import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Users, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Copy, 
  Plus,
  X,
  Search,
  Clock,
  User,
  Smartphone,
  Check,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';
import { formatDuration } from '../utils/spotify';
import { NowPlaying } from './NowPlaying';
import { SpotifyQueue } from './SpotifyQueue';

export const HostDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { 
    currentParty, 
    queue, 
    guests, 
    isPlaying, 
    currentTrack,
    createParty,
    addTrackToQueue,
    pausePlayback,
    resumePlayback,
    skipToNext,
    skipToPrevious,
    removeTrackFromQueue,
    leaveParty,
    searchTracks,
    getCurrentPlaybackState
  } = useParty();

  const [showCreateParty, setShowCreateParty] = useState(!currentParty);
  const [partyName, setPartyName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [copied, setCopied] = useState(false);

  // Monitorar estado de reprodução
  useEffect(() => {
    if (!currentParty) return;

    const checkPlaybackState = async () => {
      try {
        await getCurrentPlaybackState();
      } catch (error) {
        // Ignorar erros silenciosamente
      }
    };

    // Verificar estado inicial
    checkPlaybackState();

    // Verificar a cada 10 segundos
    const interval = setInterval(checkPlaybackState, 10000);

    return () => clearInterval(interval);
  }, [currentParty, getCurrentPlaybackState]);

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) return;

    try {
      await createParty(partyName.trim());
      setShowCreateParty(false);
    } catch (error) {
      console.error('Erro ao criar festa:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await searchTracks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setSearching(false);
    }
  };

  const copyPartyCode = async () => {
    if (currentParty) {
      await navigator.clipboard.writeText(currentParty.code);
      setCodeCopied(true);
      setCopied(true);
      setTimeout(() => {
        setCodeCopied(false);
        setCopied(false);
      }, 2000);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      resumePlayback();
    }
  };

  const handleAddToQueue = (track: any) => {
    addTrackToQueue(track, user?.name);
  };

  const handleLeaveParty = () => {
    leaveParty();
  };

  const refreshNowPlaying = async () => {
    await getCurrentPlaybackState();
  };

  if (showCreateParty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spotify-900 via-green-900 to-emerald-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl animate-slide-up">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Criar Nova Festa
            </h2>
            
            <form onSubmit={handleCreateParty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da festa
                </label>
                <input
                  type="text"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-500 focus:border-transparent"
                  placeholder="Ex: Festa de Sábado"
                  maxLength={100}
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={signOut}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-spotify-600 hover:bg-spotify-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Criar Festa
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-900 via-green-900 to-emerald-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Music className="w-8 h-8 text-spotify-400" />
                <div>
                  <h1 className="text-xl font-bold text-white">{currentParty?.name}</h1>
                  <p className="text-sm text-gray-300">Host: {user?.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Sistema Simplificado Status */}
              <div className="flex items-center space-x-2 bg-blue-600/20 text-blue-400 px-3 py-2 rounded-lg">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm">Sistema Simplificado</span>
              </div>

              {/* Party Code */}
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                <span className="text-gray-300 text-sm">Código:</span>
                <code className="text-white font-mono text-lg">{currentParty?.code}</code>
                <button
                  onClick={copyPartyCode}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Copiar código"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              <button
                onClick={handleLeaveParty}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Encerrar Festa
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Now Playing - Integrado na área principal */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Tocando Agora
              </h2>
              <NowPlaying />
            </div>

            {/* Controles de Reprodução */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Music className="w-5 h-5 mr-2" />
                Controles de Reprodução
              </h2>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={skipToPrevious}
                  className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                  title="Música anterior"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handlePlayPause}
                  className="bg-spotify-600 hover:bg-spotify-700 text-white p-4 rounded-full transition-colors"
                  title={isPlaying ? 'Pausar' : 'Reproduzir'}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                
                <button
                  onClick={skipToNext}
                  className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                  title="Próxima música"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <button
                  onClick={refreshNowPlaying}
                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 p-3 rounded-full transition-colors ml-4"
                  title="Atualizar estado"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Buscar e Adicionar Músicas
              </h2>
              
              <form onSubmit={handleSearch} className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-500"
                    placeholder="Buscar por música ou artista..."
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="bg-spotify-600 hover:bg-spotify-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {searching ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </form>

              {/* Search Results */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((track) => (
                  <div key={track.id} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      {track.album.images[0] ? (
                        <img 
                          src={track.album.images[0].url} 
                          alt={track.album.name}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <Music className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{track.name}</h4>
                      <p className="text-gray-300 text-sm">{track.artists[0].name}</p>
                      <p className="text-gray-400 text-xs">{formatDuration(track.duration_ms)}</p>
                    </div>
                    <button
                      onClick={() => handleAddToQueue(track)}
                      className="bg-spotify-600 hover:bg-spotify-700 text-white p-2 rounded-lg transition-colors"
                      title="Adicionar à fila"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Queue - Substituída pela fila real */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Music className="w-5 h-5 mr-2" />
                Fila Real do Spotify
              </h2>
              
              <SpotifyQueue />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Guests */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Convidados ({guests.length})
              </h2>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {guests.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum convidado ainda</p>
                  </div>
                ) : (
                  guests.map((guest) => (
                    <div key={guest.id} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{guest.name}</p>
                        <p className="text-gray-400 text-xs">
                          Entrou {new Date(guest.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};