import React from 'react';
import { Music, Play, Pause } from 'lucide-react';
import { useParty } from '../contexts/PartyContext';

export const NowPlaying: React.FC = () => {
  const { nowPlaying, isPlaying } = useParty();

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center">
          {isPlaying ? (
            <Play className="w-4 h-4 mr-2 text-green-400" />
          ) : (
            <Pause className="w-4 h-4 mr-2 text-gray-400" />
          )}
          Tocando Agora
        </h3>
      </div>
      
      <div className="text-center py-8 text-gray-400">
        <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-white font-medium">Funcionalidade Simplificada</p>
        <p className="text-sm">
          Para o MVP, focamos apenas na busca e adição de músicas
        </p>
        <p className="text-xs mt-2 text-gray-500">
          Recursos avançados serão implementados na próxima versão
        </p>
      </div>
    </div>
  );
}; 