import React, { useState } from 'react';
import { 
  Music, 
  Search, 
  Plus, 
  Clock, 
  User, 
  LogOut,
  Play,
  Users,
  AlertCircle
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
      alert('Erro ao buscar músicas. Verifique se o host está com Spotify ativo.');
    } finally {
      setSearching(false);
    }
  };

  const handleLeave = () => {
    leaveParty();
    signOut();
  };

  if (!currentParty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spotify-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Festa não encontrada
          </h2>
          <p className="text-gray-300">
            A festa pode ter sido encerrada ou não existe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Music className="w-8 h-8 mr-3 text-green-400" />
              {currentParty.name}
            </h1>
            <p className="text-gray-300 mt-1">
              Bem-vindo(a), {user?.name}! Você está na festa como convidado.
            </p>
          </div>
          
          <button
            onClick={handleLeave}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Festa</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Track */}
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

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-blue-200 font-medium mb-2">
                      Sistema Simplificado
                    </h3>
                    <p className="text-blue-200/80 text-sm">
                      Agora você pode buscar e adicionar músicas usando as credenciais do host!
                      Não é necessário login individual no Spotify.
                    </p>
                  </div>
                </div>
              </div>

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
                      onClick={() => addTrackToQueue(track, user?.name)}
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