import React from 'react';
import { useParty } from '../contexts/PartyContext';
import { formatDuration } from '../utils/spotify';
import { Music, RefreshCw, ExternalLink, Clock } from 'lucide-react';

export const SpotifyQueue: React.FC = () => {
  const { spotifyQueue, refreshSpotifyQueue } = useParty();

  if (!spotifyQueue || spotifyQueue.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Fila do Spotify vazia</p>
        <p className="text-sm">
          Adicione músicas para ver a fila real
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com botão de refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-green-400" />
          <span className="text-white font-medium">
            Fila Real do Spotify ({spotifyQueue.length})
          </span>
        </div>
        <button
          onClick={refreshSpotifyQueue}
          className="bg-green-600/20 hover:bg-green-600/30 text-green-400 p-2 rounded-lg transition-colors"
          title="Atualizar fila"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Lista da fila */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {spotifyQueue.map((track, index) => (
          <div key={`${track.id}-${index}`} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
            {/* Posição */}
            <div className="flex items-center justify-center w-8 h-8 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">
              {index + 1}
            </div>

            {/* Capa */}
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
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

            {/* Informações da música */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium truncate">{track.name}</h4>
              <p className="text-gray-300 text-sm truncate">{track.artist}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(track.duration_ms)}</span>
                {track.type === 'episode' && (
                  <span className="bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded">
                    Podcast
                  </span>
                )}
              </div>
            </div>

            {/* Link para Spotify */}
            {track.external_url && (
              <a
                href={track.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 p-2 rounded-lg transition-colors"
                title="Abrir no Spotify"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Informação adicional */}
      <div className="text-center text-xs text-gray-500 bg-green-600/10 rounded-lg p-3">
        <p>Esta é a fila real do Spotify do host</p>
        <p>Atualizada automaticamente a cada 5 segundos</p>
      </div>
    </div>
  );
}; 