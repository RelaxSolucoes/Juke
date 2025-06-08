import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Search, 
  Plus, 
  User, 
  LogOut,
  Users,
  Check,
  Clock,
  Sparkles,
  Zap,
  Heart,
  Star,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';
import { formatDuration } from '../utils/spotify';
import { SimpleGuestWelcome } from './SimpleGuestWelcome';

export const GuestView: React.FC = () => {
  const { user, signOut } = useAuth();

  const { 
    currentParty, 
    guests, 
    addTrackToQueue,
    leaveParty,
    searchTracks
  } = useParty();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
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

  const handleLeave = () => {
    leaveParty();
    signOut();
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

  if (!currentParty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            {/* Ícone de Erro */}
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <Music className="w-10 h-10 text-red-400" />
            </div>
            
            {/* Título e Descrição */}
            <h2 className="text-2xl font-bold text-white mb-4">
              🚫 Festa não encontrada
            </h2>
            <p className="text-purple-200 mb-8 leading-relaxed">
              A festa pode ter sido encerrada pelo host ou o código pode estar incorreto.
            </p>
            
            {/* Botões de Ação */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Limpar festa atual e voltar para tela de login
                  leaveParty();
                  signOut();
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl transition-all font-medium flex items-center justify-center space-x-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Tentar Outra Festa</span>
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all border border-white/20 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Recarregar Página</span>
              </button>
            </div>
            
            {/* Dica */}
            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
              <p className="text-blue-200 text-sm">
                💡 <strong>Dica:</strong> Verifique se o código da festa está correto ou peça um novo código para o host.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header Premium - Responsivo */}
      <div className="bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            {/* Primeira linha - Nome da festa e ícone */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-white flex items-center truncate">
                    {currentParty.name}
                    <Star className="w-4 h-4 ml-2 text-yellow-400 flex-shrink-0" />
                  </h1>
                  <p className="text-purple-200 text-sm truncate">
                    {user?.name} • {guests.length} pessoas
                  </p>
                </div>
              </div>
            </div>
            
            {/* Segunda linha - Botão sair */}
            <div className="flex justify-end">
              <button
                onClick={handleLeave}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-lg transition-all flex items-center space-x-2 border border-red-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  {currentParty.name}
                  <Star className="w-5 h-5 ml-2 text-yellow-400" />
                </h1>
                <p className="text-purple-200">
                  Bem-vindo(a), {user?.name}! • {guests.length} pessoas na festa
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLeave}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl transition-all flex items-center space-x-2 border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Festa</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Simple Guest Welcome */}
        <SimpleGuestWelcome
          partyName={currentParty.name}
          hostName={currentParty.host?.name || 'Host'}
          guestCount={guests.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Busca Premium - Área Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
              {/* Header da Busca */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center justify-center">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-pink-400" />
                  Juke Party
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 ml-2 text-pink-400" />
                </h2>
                <p className="text-purple-200 text-sm sm:text-base">
                  Busque e adicione suas músicas favoritas à festa! 🎶
                </p>
              </div>

              {/* Aviso Premium */}
              <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-pink-200 font-semibold text-base sm:text-lg mb-2">
                      Você é o DJ! ✨
                    </h3>
                    <p className="text-pink-200/80 text-sm sm:text-base">
                      Seu pedido é uma ordem!
                      Escolheu, entrou na fila, tocou!🚀
                    </p>
                  </div>
                </div>
              </div>

              {/* Campo de Busca Premium */}
              <div className="relative mb-6 sm:mb-8">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${searching ? 'text-pink-400 animate-spin' : 'text-pink-300'}`} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/20 border-2 border-white/30 rounded-2xl pl-11 sm:pl-12 pr-4 py-3 sm:py-4 text-white text-base sm:text-lg placeholder-pink-300 focus:outline-none focus:ring-4 focus:ring-pink-500/50 focus:border-pink-400 transition-all duration-300"
                  placeholder="🎵 Buscar música..."
                />
                {searching && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Resultados da Busca */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchResults.length === 0 && searchQuery && !searching && (
                  <div className="text-center py-12 text-pink-300">
                    <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl">Nenhum resultado encontrado</p>
                    <p className="text-sm">Tente buscar por outro termo</p>
                  </div>
                )}

                {searchResults.length === 0 && !searchQuery && (
                  <div className="text-center py-12 text-pink-300">
                    <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl">Busque</p>
                    <p className="text-sm">Por músicas ou artistas</p>
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
                          <div className="w-full h-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
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
                        <h4 className="text-white font-semibold text-base sm:text-lg leading-tight group-hover:text-pink-200 transition-colors">
                          {track.name}
                        </h4>
                        <p className="text-pink-300 text-sm leading-tight truncate">
                          {track.artists[0].name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-pink-400 flex-shrink-0" />
                          <span className="text-pink-400 text-xs">
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
                            : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-pink-500/25'
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
                <Users className="w-5 h-5 mr-2 text-pink-400" />
                Na Festa ({guests.length})
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {guests.length === 0 ? (
                  <div className="text-center py-8 text-pink-300">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Aguardando mais pessoas...</p>
                  </div>
                ) : (
                  guests.map((guest) => (
                    <div key={guest.id} className="flex items-center space-x-3 bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{guest.name}</p>
                        <p className="text-pink-300 text-xs">
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