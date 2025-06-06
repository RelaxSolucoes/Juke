import React, { useState } from 'react';
import { 
  Music, 
  Search, 
  Plus, 
  Clock, 
  User, 
  LogOut,
  Play,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';
import { formatDuration } from '../utils/spotify';

export const GuestView: React.FC = () => {
  const { user, signOut } = useAuth();
  const { 
    currentParty, 
    queue, 
    guests, 
    currentTrack, 
    addTrackToQueue,
    leaveParty,
    searchTracks
  } = useParty();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

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

  const handleLeave = () => {
    leaveParty();
    signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Music className="w-8 h-8 text-purple-400" />
                <div>
                  <h1 className="text-xl font-bold text-white">{currentParty?.name}</h1>
                  <p className="text-sm text-gray-300">Convidado: {user?.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-white font-mono text-lg">{currentParty?.code}</span>
              </div>
              
              <button
                onClick={handleLeave}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Now Playing */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Tocando Agora
              </h2>
              
              {currentTrack ? (
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    {currentTrack.image_url ? (
                      <img 
                        src={currentTrack.image_url} 
                        alt={currentTrack.album}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <Music className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{currentTrack.name}</h3>
                    <p className="text-gray-300">{currentTrack.artist}</p>
                    <p className="text-gray-400 text-sm">Adicionada por {currentTrack.added_by_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 text-sm">
                      {formatDuration(currentTrack.duration_ms)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma música tocando</p>
                  <p className="text-sm">Aguarde o host iniciar a reprodução</p>
                </div>
              )}
            </div>

            {/* Search */}
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
                    className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Buscar por música ou artista..."
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
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
                      onClick={() => addTrackToQueue(track)}
                      className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
                      title="Adicionar à fila"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {searchResults.length === 0 && searchQuery && !searching && (
                <div className="text-center py-4 text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum resultado encontrado</p>
                  <p className="text-sm">Tente buscar por outro termo</p>
                </div>
              )}
            </div>

            {/* Queue Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Music className="w-5 h-5 mr-2" />
                Próximas na Fila ({queue.length})
              </h2>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {queue.slice(0, 10).map((track, index) => (
                  <div key={track.id} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                    <span className="text-gray-400 font-mono text-sm w-8">{index + 1}</span>
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      {track.image_url ? (
                        <img 
                          src={track.image_url} 
                          alt={track.album}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <Music className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{track.name}</h4>
                      <p className="text-gray-300 text-sm">{track.artist}</p>
                      <p className="text-gray-400 text-xs">
                        Por {track.added_by_name} • {formatDuration(track.duration_ms)}
                      </p>
                    </div>
                    {track.added_by === user?.id && (
                      <div className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs">
                        Sua música
                      </div>
                    )}
                  </div>
                ))}
                
                {queue.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Fila vazia</p>
                    <p className="text-sm">Seja o primeiro a adicionar uma música!</p>
                  </div>
                )}
              </div>

              {queue.length > 10 && (
                <div className="mt-4 text-center text-gray-400 text-sm">
                  E mais {queue.length - 10} músicas na fila...
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Party Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">
                Informações da Festa
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Music className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">{currentParty?.name}</p>
                    <p className="text-gray-400 text-sm">Nome da festa</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">{currentParty?.host?.name}</p>
                    <p className="text-gray-400 text-sm">Host da festa</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">
                      {currentParty && new Date(currentParty.created_at).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-gray-400 text-sm">Criada em</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guests List */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Convidados ({guests.length})
              </h2>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {guests.map((guest) => (
                  <div key={guest.id} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{guest.name}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(guest.created_at).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {guest.name === user?.name && (
                      <div className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs">
                        Você
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};