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
  Sparkles,
  Zap,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';
import { formatDuration } from '../utils/spotify';
import { NowPlaying } from './NowPlaying';

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
  } = useParty();

  const [showCreateParty, setShowCreateParty] = useState(!currentParty);
  const [partyName, setPartyName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [addedTracks, setAddedTracks] = useState<Set<string>>(new Set());

  // Busca AJAX em tempo real
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchTracks(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Erro na busca:', error);
      } finally {
        setSearching(false);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchTracks]);

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

  const copyPartyCode = async () => {
    if (currentParty) {
      await navigator.clipboard.writeText(currentParty.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleAddToQueue = async (track: any) => {
    // Mostrar feedback imediato
    setAddedTracks(prev => new Set([...prev, track.id]));
    
    try {
      // Adicionar direto ao Spotify (sem Supabase por enquanto)
      await addTrackToQueue(track, user?.name);
      
      console.log('✅ Música adicionada com sucesso:', track.name);
      
      // Manter feedback por 3 segundos
      setTimeout(() => {
        setAddedTracks(prev => {
          const newSet = new Set(prev);
          newSet.delete(track.id);
          return newSet;
        });
      }, 3000);
    } catch (error) {
      console.error('Erro ao adicionar música:', error);
      
      // Remover feedback em caso de erro
      setAddedTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(track.id);
        return newSet;
      });
      
      // Mostrar erro visual (opcional)
      alert('Erro ao adicionar música. Tente novamente.');
    }
  };

  const handleLeaveParty = () => {
    leaveParty();
  };

  if (showCreateParty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Criar Nova Festa
              </h2>
              <p className="text-purple-200">
                Comece sua festa musical agora!
              </p>
            </div>
            
            <form onSubmit={handleCreateParty} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Nome da festa
                </label>
                <input
                  type="text"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Ex: Festa de Sábado 🎉"
                  maxLength={100}
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={signOut}
                  className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Criar Festa ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header Premium */}
      <div className="bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{currentParty?.name}</h1>
                <p className="text-purple-200">Host: {user?.name} • {guests.length} convidados</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Código da Festa */}
              <div className="bg-white/10 rounded-xl px-4 py-2 border border-white/20">
                <div className="flex items-center space-x-2">
                  <span className="text-purple-200 text-sm">Código:</span>
                  <code className="text-white font-mono text-lg">{currentParty?.code}</code>
                  <button
                    onClick={copyPartyCode}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    title="Copiar código"
                  >
                    {codeCopied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-purple-300" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLeaveParty}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl transition-all flex items-center space-x-2 border border-red-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Busca Premium - Área Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* Header da Busca */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Search className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
                  Busca Musical Premium
                  <Sparkles className="w-6 h-6 ml-2 text-yellow-400" />
                </h2>
                <p className="text-purple-200">
                  Digite e veja a mágica acontecer em tempo real ✨
                </p>
              </div>

              {/* Campo de Busca Premium */}
              <div className="relative mb-8">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className={`w-6 h-6 transition-colors ${searching ? 'text-purple-400 animate-spin' : 'text-purple-300'}`} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/20 border-2 border-white/30 rounded-2xl pl-12 pr-4 py-4 text-white text-lg placeholder-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300"
                  placeholder="🎵 Digite o nome da música ou artista..."
                />
                {searching && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Resultados da Busca */}
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {searchResults.length === 0 && searchQuery && !searching && (
                  <div className="text-center py-12 text-purple-300">
                    <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl">Nenhum resultado encontrado</p>
                    <p className="text-sm">Tente buscar por outro termo</p>
                  </div>
                )}

                {searchResults.length === 0 && !searchQuery && (
                  <div className="text-center py-12 text-purple-300">
                    <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl">Comece digitando para buscar</p>
                    <p className="text-sm">A busca acontece automaticamente</p>
                  </div>
                )}

                {searchResults.map((track, index) => {
                  const isAdded = addedTracks.has(track.id);
                  return (
                    <div 
                      key={track.id} 
                      className={`group flex items-center space-x-3 bg-white/5 hover:bg-white/10 rounded-2xl p-3 transition-all duration-300 transform hover:scale-[1.01] border border-white/10 hover:border-white/20 ${isAdded ? 'bg-green-500/20 border-green-400/50' : ''}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Capa do Álbum - Menor no mobile */}
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0">
                        {track.album.images[0] ? (
                          <img 
                            src={track.album.images[0].url} 
                            alt={track.album.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <Music className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                        )}
                        {isAdded && (
                          <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                            <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-bounce" />
                          </div>
                        )}
                      </div>
                      
                      {/* Informações da Música - Prioridade no mobile */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-white font-semibold text-base sm:text-lg leading-tight group-hover:text-purple-200 transition-colors">
                          {track.name}
                        </h4>
                        <p className="text-purple-300 text-sm leading-tight truncate">
                          {track.artists[0].name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-purple-400 flex-shrink-0" />
                          <span className="text-purple-400 text-xs">
                            {formatDuration(track.duration_ms)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Botão de Adicionar - Responsivo */}
                      <button
                        onClick={() => handleAddToQueue(track)}
                        disabled={isAdded}
                        className={`p-2 sm:p-3 rounded-xl transition-all duration-300 transform hover:scale-110 flex-shrink-0 ${
                          isAdded 
                            ? 'bg-green-500 text-white cursor-not-allowed' 
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25'
                        }`}
                        title={isAdded ? 'Adicionada!' : 'Adicionar à fila'}
                      >
                        {isAdded ? (
                          <div className="flex items-center space-x-1">
                            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline text-xs font-medium">ADICIONADA</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline text-xs font-medium">ADICIONAR</span>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar - Convidados */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                Convidados ({guests.length})
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {guests.length === 0 ? (
                  <div className="text-center py-8 text-purple-300">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Aguardando convidados...</p>
                  </div>
                ) : (
                  guests.map((guest) => (
                    <div key={guest.id} className="flex items-center space-x-3 bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{guest.name}</p>
                        <p className="text-purple-300 text-xs">
                          {new Date(guest.created_at).toLocaleTimeString()}
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