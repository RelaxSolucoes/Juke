import React from 'react';
import { useParty } from '../contexts/PartyContext';
import { formatDuration } from '../utils/spotify';
import { Music, Pause, Play, ExternalLink, Volume2 } from 'lucide-react';

export const NowPlaying: React.FC = () => {
  const { nowPlaying, isPlaying } = useParty();

  if (!nowPlaying) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Music className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Nenhuma música tocando no momento</p>
        <p className="text-sm text-gray-400 mt-1">
          O host precisa iniciar a reprodução no Spotify
        </p>
      </div>
    );
  }

  const { track, progress_ms, device } = nowPlaying;
  const progressPercent = (progress_ms / track.duration_ms) * 100;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        {isPlaying ? (
          <Play className="w-5 h-5 text-green-600 fill-current" />
        ) : (
          <Pause className="w-5 h-5 text-gray-500" />
        )}
        <h3 className="font-semibold text-gray-800">
          {isPlaying ? 'Tocando Agora' : 'Pausado'}
        </h3>
      </div>

      {/* Música Info */}
      <div className="flex gap-4">
        {/* Capa do Álbum */}
        <div className="flex-shrink-0">
          {track.image_url ? (
            <img
              src={track.image_url}
              alt={`Capa de ${track.album}`}
              className="w-20 h-20 rounded-lg shadow-md object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
              <Music className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Detalhes da Música */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-lg text-gray-900 truncate">
            {track.name}
          </h4>
          <p className="text-gray-600 truncate">{track.artist}</p>
          <p className="text-sm text-gray-500 truncate">{track.album}</p>

          {/* Link para Spotify */}
          <a
            href={track.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 mt-2"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir no Spotify
          </a>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{formatDuration(progress_ms)}</span>
          <span>{formatDuration(track.duration_ms)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Informações do Dispositivo */}
      {device && device.name && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Volume2 className="w-4 h-4" />
          <span>
            Tocando em: <strong>{device.name}</strong>
            {device.type && ` (${device.type})`}
            {device.volume_percent !== null && ` • ${device.volume_percent}%`}
          </span>
        </div>
      )}
    </div>
  );
}; 