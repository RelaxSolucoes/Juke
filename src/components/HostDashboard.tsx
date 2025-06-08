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
  Heart,
  Share2,
  QrCode,
  Download,
  Link,
  MessageCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';
import { formatDuration } from '../utils/spotify';
import { NowPlaying } from './NowPlaying';

import { MinimalTip } from './MinimalTip';
import { DeviceStatus } from './DeviceStatus';
import { hasActiveDevice } from '../utils/spotifyDevices';


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
    getUserPlaylists,
    startFallbackPlaylist,
    saveFallbackPlaylist,
  } = useParty();

  const [showCreateParty, setShowCreateParty] = useState(!currentParty);
  const [partyName, setPartyName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [addedTracks, setAddedTracks] = useState<Set<string>>(new Set());
  
  // Estados para playlist de fallback
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  
  // Estados para encerrar festa
  const [showEndPartyModal, setShowEndPartyModal] = useState(false);
  const [endingParty, setEndingParty] = useState(false);

  // Novos estados para melhorar UX da playlist de fallback
  const [fallbackPlaylistStatus, setFallbackPlaylistStatus] = useState<'idle' | 'starting' | 'playing'>('idle');
  const [showSpotifyGuideModal, setShowSpotifyGuideModal] = useState(false);
  const [fallbackPlaylistName, setFallbackPlaylistName] = useState<string>('');
  
  // Estados para verificação de dispositivos
  const [deviceReady, setDeviceReady] = useState(false);
  const [showDeviceCheck, setShowDeviceCheck] = useState(false);
  
  // Estados para modal de compartilhamento
  const [showShareModal, setShowShareModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState(false);

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

  // Carregar playlists do usuário
  const loadUserPlaylists = async () => {
    setLoadingPlaylists(true);
    try {
      const playlists = await getUserPlaylists();
      setUserPlaylists(playlists);
      setShowPlaylistSelector(true);
    } catch (error) {
      console.error('Erro ao carregar playlists:', error);
      alert('Erro ao carregar suas playlists. Tente novamente.');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) return;

    try {
      // Passar a playlist selecionada diretamente para createParty
      const partyCode = await createParty(partyName.trim(), selectedPlaylist);
      
      setShowCreateParty(false);
      setSelectedPlaylist(null); // Limpar seleção
      setShowPlaylistSelector(false);
    } catch (error) {
      console.error('Erro ao criar festa:', error);
      alert('Erro ao criar festa. Tente novamente.');
    }
  };

  const handleStartParty = async () => {
    // Primeiro verificar se há dispositivo ativo
    if (!user?.access_token) {
      alert('❌ Erro de autenticação. Faça login novamente.');
      return;
    }

    // Verificar dispositivos antes de iniciar
    const hasDevice = await hasActiveDevice(user.access_token);
    if (!hasDevice) {
      setShowDeviceCheck(true);
      return;
    }

    setFallbackPlaylistStatus('starting');
    
    try {
      await startFallbackPlaylist();
      setFallbackPlaylistStatus('playing');
      
      // Buscar nome da playlist se disponível
      if (currentParty) {
        try {
          const { getFallbackPlaylist } = await import('../utils/spotify');
          const fallbackInfo = await getFallbackPlaylist(currentParty.code);
          if (fallbackInfo) {
            setFallbackPlaylistName(fallbackInfo.playlistName);
          }
        } catch (error) {
          console.log('Não foi possível obter nome da playlist');
        }
      }
      
    } catch (error) {
      console.error('Erro ao iniciar festa:', error);
      setFallbackPlaylistStatus('idle');
      
      // Mostrar mensagem de erro específica
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao iniciar festa';
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleDeviceReady = (ready: boolean) => {
    setDeviceReady(ready);
  };

  const copyPartyCode = async () => {
    if (currentParty) {
      await navigator.clipboard.writeText(currentParty.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  // Funções do modal de compartilhamento
  const openShareModal = async () => {
    if (!currentParty) return;
    
    // Gerar URL de compartilhamento
    const baseUrl = window.location.origin;
    const url = `${baseUrl}?code=${currentParty.code}`;
    setShareUrl(url);
    
    try {
      // Gerar QR Code
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937', // Cor escura
          light: '#ffffff' // Cor clara
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
    
    setShowShareModal(true);
  };

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl || !currentParty) return;
    
    const link = document.createElement('a');
    link.download = `festa-${currentParty.code}-qrcode.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const shareViaWhatsApp = () => {
    const message = `🎵 Você foi convidado para a festa "${currentParty?.name}"!\n\nEntre agora: ${shareUrl}\n\nOu use o código: ${currentParty?.code}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaTelegram = () => {
    const message = `🎵 Festa "${currentParty?.name}" - Entre agora: ${shareUrl}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  const handleAddToQueue = async (track: any) => {
    // Verificar dispositivo antes de adicionar música
    if (!user?.access_token) {
      alert('❌ Erro de autenticação. Faça login novamente.');
      return;
    }

    const hasDevice = await hasActiveDevice(user.access_token);
    if (!hasDevice) {
      alert('❌ Nenhum dispositivo Spotify ativo encontrado. Abra o Spotify em qualquer dispositivo e toque uma música primeiro.');
      return;
    }

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
      
      // Mostrar erro específico baseado no tipo
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      if (errorMessage.includes('No active device')) {
        alert('❌ Nenhum dispositivo Spotify ativo. Abra o Spotify e toque uma música primeiro.');
      } else {
        alert(`❌ Erro ao adicionar música: ${errorMessage}`);
      }
    }
  };

  const handleLeaveParty = () => {
    setShowEndPartyModal(true);
  };

  const confirmEndParty = async () => {
    setEndingParty(true);
    
    try {
      await leaveParty();
      
      // Limpar estados locais
      setSearchQuery('');
      setSearchResults([]);
      setAddedTracks(new Set());
      setSelectedPlaylist(null);
      setShowPlaylistSelector(false);
      setUserPlaylists([]);
      setShowEndPartyModal(false);
      
      // Resetar estados da playlist de fallback
      setFallbackPlaylistStatus('idle');
      setFallbackPlaylistName('');
      setShowSpotifyGuideModal(false);
      
      // Pequeno delay para suavizar a transição
      setTimeout(() => {
        setShowCreateParty(true);
        setEndingParty(false);
      }, 500);
      
    } catch (error) {
      console.error('Erro ao encerrar festa:', error);
      setEndingParty(false);
      setShowEndPartyModal(false);
      alert('❌ Erro ao encerrar festa. Tente novamente.');
    }
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

              {/* Seleção de Playlist de Fallback */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  🎵 Playlist de fundo (opcional)
                </label>
                <p className="text-xs text-purple-300 mb-3">
                  Escolha uma playlist que tocará automaticamente quando ninguém adicionar músicas
                </p>
                
                {selectedPlaylist ? (
                  /* Playlist Selecionada */
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/50 rounded-xl p-4 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">✅ {selectedPlaylist.name}</p>
                      <p className="text-green-300 text-xs">{selectedPlaylist.tracks?.total || 0} músicas • Playlist selecionada</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlaylist(null);
                        setShowPlaylistSelector(false);
                        setUserPlaylists([]);
                      }}
                      className="text-green-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all"
                      title="Remover playlist"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : !showPlaylistSelector ? (
                  /* Botão para Buscar Playlists */
                  <button
                    type="button"
                    onClick={loadUserPlaylists}
                    disabled={loadingPlaylists}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-purple-200 hover:bg-white/20 transition-all flex items-center justify-center space-x-2 group"
                  >
                    {loadingPlaylists ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-300"></div>
                        <span>Carregando suas playlists...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>🔍 Buscar Minhas Playlists</span>
                      </>
                    )}
                  </button>
                ) : (
                  /* Lista de Playlists */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm">Suas playlists:</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPlaylistSelector(false);
                          setUserPlaylists([]);
                        }}
                        className="text-purple-300 hover:text-white text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                    
                    {userPlaylists.length === 0 ? (
                      <div className="text-center py-4 text-purple-300">
                        <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma playlist encontrada</p>
                      </div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar">
                        {userPlaylists.map((playlist) => (
                          <button
                            key={playlist.id}
                            type="button"
                            onClick={() => {
                              setSelectedPlaylist(playlist);
                              setShowPlaylistSelector(false);
                            }}
                            className="w-full text-left p-3 rounded-xl transition-all bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Music className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate group-hover:text-purple-200">
                                  {playlist.name}
                                </p>
                                <p className="text-purple-300 text-xs">
                                  {playlist.tracks?.total || 0} músicas
                                  {playlist.public === false && ' • Privada'}
                                </p>
                              </div>
                              <Plus className="w-4 h-4 text-purple-300 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowPlaylistSelector(false);
                        setUserPlaylists([]);
                      }}
                      className="w-full text-purple-300 text-sm hover:text-white transition-colors py-2"
                    >
                      ❌ Não usar playlist de fundo
                    </button>
                  </div>
                )}
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
      {/* Header Premium - Responsivo */}
      <div className="bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            {/* Primeira linha - Nome da festa e ícone */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-white truncate">{currentParty?.name}</h1>
                  <p className="text-purple-200 text-sm truncate">
                    {user?.name} • {guests.length} convidados
                  </p>
                </div>
              </div>
            </div>
            
            {/* Segunda linha - Botões */}
            <div className="flex items-center justify-between space-x-2">
              {/* Código da Festa - Compacto */}
              <div className="bg-white/10 rounded-lg px-3 py-2 border border-white/20 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="text-purple-200 text-xs">Código:</span>
                    <code className="text-white font-mono text-sm truncate">{currentParty?.code}</code>
                  </div>
                  <button
                    onClick={openShareModal}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                    title="Compartilhar festa"
                  >
                    <Share2 className="w-4 h-4 text-purple-300" />
                  </button>
                </div>
              </div>

              {/* Botões de ação - Compactos */}
              <button
                onClick={handleStartParty}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-300 p-2 rounded-lg transition-all border border-green-500/30 flex-shrink-0"
                title="Iniciar Festa"
              >
                <Play className="w-4 h-4" />
              </button>

              <button
                onClick={handleLeaveParty}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 p-2 rounded-lg transition-all border border-red-500/30 flex-shrink-0"
                title="Encerrar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
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
              {/* Botão Playlist de Fallback - Estado Inteligente */}
              {fallbackPlaylistStatus === 'idle' && (
                <button
                  onClick={handleStartParty}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2 rounded-xl transition-all flex items-center space-x-2 border border-green-500/30"
                  title="Iniciar Festa"
                >
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">Iniciar Festa</span>
                  <span className="sm:hidden">▶️</span>
                </button>
              )}
              
              {fallbackPlaylistStatus === 'starting' && (
                <div className="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-xl flex items-center space-x-2 border border-yellow-500/30">
                  <div className="w-4 h-4 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Iniciando...</span>
                  <span className="sm:hidden">⏳</span>
                </div>
              )}
              
              {fallbackPlaylistStatus === 'playing' && (
                <div className="bg-green-500/30 text-green-200 px-4 py-2 rounded-xl flex items-center space-x-2 border border-green-400/50">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">
                    {fallbackPlaylistName ? `♪ ${fallbackPlaylistName}` : '♪ Tocando'}
                  </span>
                  <span className="sm:hidden">♪</span>
                </div>
              )}

              {/* Código da Festa */}
              <div className="bg-white/10 rounded-xl px-4 py-2 border border-white/20">
                <div className="flex items-center space-x-2">
                  <span className="text-purple-200 text-sm">Código:</span>
                  <code className="text-white font-mono text-lg">{currentParty?.code}</code>
                  <button
                    onClick={openShareModal}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    title="Compartilhar festa"
                  >
                    <Share2 className="w-4 h-4 text-purple-300" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleLeaveParty}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl transition-all flex items-center space-x-2 border border-red-500/30"
                title="Encerrar festa para todos"
              >
                <LogOut className="w-4 h-4" />
                <span>Encerrar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Dica Minimalista */}
        <MinimalTip type="host" />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Busca Premium - Área Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
              {/* Header da Busca */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-400" />
                  Juke Party
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 ml-2 text-yellow-400" />
                </h2>
                <p className="text-purple-200 text-sm sm:text-base">
                  Digite e veja a mágica acontecer em tempo real ✨
                </p>
              </div>

              {/* Campo de Busca Premium */}
              <div className="relative mb-6 sm:mb-8">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${searching ? 'text-purple-400 animate-spin' : 'text-purple-300'}`} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/20 border-2 border-white/30 rounded-2xl pl-11 sm:pl-12 pr-4 py-3 sm:py-4 text-white text-base sm:text-lg placeholder-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300"
                  placeholder="🎵 Buscar música ou artista..."
                />
                {searching && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
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

      {/* Modal de Confirmação para Encerrar Festa */}
      {showEndPartyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md w-full animate-scale-up">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                Encerrar Festa?
              </h3>
              
              <p className="text-red-200 mb-6">
                Esta ação não pode ser desfeita!
              </p>
              
              <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
                <p className="text-white font-medium mb-2">O que acontecerá:</p>
                <ul className="text-purple-200 text-sm space-y-1">
                  <li>• A festa será finalizada para todos</li>
                  <li>• Todos os convidados serão removidos</li>
                  <li>• A fila de músicas será limpa</li>
                  <li>• Você voltará para criar uma nova festa</li>
                </ul>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEndPartyModal(false)}
                  disabled={endingParty}
                  className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmEndParty}
                  disabled={endingParty}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {endingParty ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Encerrando...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Encerrar Festa</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Orientação para Spotify */}


      {/* Modal de Compartilhamento */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl max-w-lg w-full animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Compartilhar Festa</h3>
                  <p className="text-purple-200 text-sm">{currentParty?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Código da Festa */}
            <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
              <div className="text-center">
                <p className="text-purple-200 text-sm mb-2">Código da Festa</p>
                <div className="flex items-center justify-center space-x-3">
                  <code className="text-white font-mono text-2xl font-bold">{currentParty?.code}</code>
                  <button
                    onClick={copyPartyCode}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Copiar código"
                  >
                    {codeCopied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-purple-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="bg-white rounded-xl p-4 mb-6 text-center">
                <p className="text-gray-700 text-sm mb-3 font-medium">QR Code da Festa</p>
                <div className="flex justify-center mb-4">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code da festa" 
                    className="w-48 h-48 rounded-lg"
                  />
                </div>
                <button
                  onClick={downloadQRCode}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2 mx-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar QR Code</span>
                </button>
              </div>
            )}

            {/* Link de Compartilhamento */}
            <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
              <p className="text-purple-200 text-sm mb-3">Link Direto</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm font-mono"
                />
                <button
                  onClick={copyShareLink}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                  title="Copiar link"
                >
                  {linkCopied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-purple-300" />
                  )}
                </button>
              </div>
              <p className="text-purple-300 text-xs mt-2">
                💡 O convidado só precisa inserir o nome e entrar!
              </p>
            </div>

            {/* Botões de Compartilhamento Social */}
            <div className="space-y-3">
              <p className="text-purple-200 text-sm font-medium">Compartilhar via:</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareViaWhatsApp}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </button>
                
                <button
                  onClick={shareViaTelegram}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Telegram</span>
                </button>
              </div>
            </div>

            {/* Dica */}
            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
              <p className="text-blue-200 text-sm">
                <strong>💡 Dica:</strong> Seus convidados podem usar o QR Code, o link direto ou apenas digitar o código da festa!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Verificação de Dispositivos */}
      {showDeviceCheck && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-2xl w-full animate-scale-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-red-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                ⚠️ Dispositivo Spotify Necessário
              </h3>
              
              <p className="text-red-200 mb-6">
                Para iniciar a festa, você precisa ter o Spotify aberto e tocando em algum dispositivo.
              </p>
            </div>

            {/* Status dos Dispositivos */}
            <div className="mb-6">
              <DeviceStatus 
                onDeviceReady={handleDeviceReady}
                showRefreshButton={true}
              />
            </div>

            {/* Instruções */}
            <div className="bg-white/5 rounded-xl p-6 mb-6 text-left">
              <h4 className="text-white font-bold mb-4 flex items-center">
                <Play className="w-5 h-5 mr-2 text-green-400" />
                Como resolver:
              </h4>
              
              <div className="space-y-3 text-purple-200 text-sm">
                <div className="flex items-start space-x-3">
                  <span className="bg-purple-500/30 text-purple-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <p>Abra o <strong>Spotify</strong> em qualquer dispositivo (celular, computador, tablet, etc.)</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="bg-purple-500/30 text-purple-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <p>Toque <strong>qualquer música</strong> para ativar o dispositivo</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="bg-purple-500/30 text-purple-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <p>Clique em <strong>"🔄 Atualizar"</strong> acima para verificar novamente</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="bg-green-500/30 text-green-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                  <p>Quando aparecer <strong>"✅ Dispositivo ativo"</strong>, clique em <strong>"Continuar"</strong></p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeviceCheck(false)}
                className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Cancelar
              </button>
              
              <button
                onClick={() => {
                  if (deviceReady) {
                    setShowDeviceCheck(false);
                    handleStartParty();
                  } else {
                    alert('❌ Ainda não há dispositivo ativo. Siga as instruções acima.');
                  }
                }}
                disabled={!deviceReady}
                className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  deviceReady 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white' 
                    : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                }`}
              >
                {deviceReady ? '✅ Continuar' : '⏳ Aguardando dispositivo...'}
              </button>
            </div>

            {/* Dica */}
            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
              <p className="text-blue-200 text-sm">
                <strong>💡 Dica:</strong> O Juke controla o Spotify remotamente. Você pode usar qualquer dispositivo onde o Spotify esteja tocando!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};