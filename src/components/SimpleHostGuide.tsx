import React, { useState } from 'react';
import { 
  Play, 
  Share2, 
  Users, 
  Music,
  CheckCircle,
  Copy,
  MessageCircle
} from 'lucide-react';

interface SimpleHostGuideProps {
  onStartPlaylist: () => void;
  hasStartedPlaylist: boolean;
  guestCount: number;
  partyCode: string;
  partyName: string;
}

export const SimpleHostGuide: React.FC<SimpleHostGuideProps> = ({
  onStartPlaylist,
  hasStartedPlaylist,
  guestCount,
  partyCode,
  partyName
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const shareMessage = `🎵 Venha para minha festa musical "${partyName}"!\n\nCódigo: ${partyCode}\n\nAcesse: https://juke-seven.vercel.app/`;

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
      {/* Status da Festa */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          🎉 Festa Criada!
        </h2>
        <p className="text-purple-200">
          Código: <span className="font-mono text-xl text-yellow-300">{partyCode}</span>
        </p>
        <p className="text-purple-300 text-sm">
          {guestCount} {guestCount === 1 ? 'pessoa' : 'pessoas'} na festa
        </p>
      </div>

      {/* Ações Principais */}
      <div className="space-y-4">
        {/* Playlist Opcional */}
        {!hasStartedPlaylist && (
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-blue-200 mb-1">
                  🎵 Música de Fundo (Opcional)
                </h3>
                <p className="text-blue-100 text-sm">
                  Toca música automática quando ninguém adiciona nada
                </p>
              </div>
              <button
                onClick={onStartPlaylist}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ml-4"
              >
                <Play className="w-4 h-4" />
                <span>Ativar</span>
              </button>
            </div>
          </div>
        )}

        {hasStartedPlaylist && (
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-200 font-semibold">
                Música de fundo ativada!
              </span>
            </div>
          </div>
        )}

        {/* Compartilhar */}
        <div className="bg-pink-500/20 border border-pink-400/50 rounded-xl p-4">
          <h3 className="font-semibold text-pink-200 mb-3">
            📱 Convide seus Amigos
          </h3>
          
          <div className="space-y-3">
            {/* Botão WhatsApp */}
            <button
              onClick={shareWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Compartilhar no WhatsApp</span>
            </button>

            {/* Copiar Código */}
            <button
              onClick={() => copyToClipboard(partyCode)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <Copy className="w-5 h-5" />
              <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>

            {/* Copiar Link Completo */}
            <button
              onClick={() => copyToClipboard(shareMessage)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <Share2 className="w-5 h-5" />
              <span>Copiar Mensagem Completa</span>
            </button>
          </div>
        </div>

        {/* Status dos Convidados */}
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-purple-200 font-semibold">
                {guestCount === 0 ? 'Aguardando convidados...' : `${guestCount} pessoas na festa!`}
              </span>
            </div>
          </div>
          {guestCount === 0 && (
            <p className="text-purple-300 text-sm mt-2">
              Compartilhe o código para seus amigos entrarem
            </p>
          )}
        </div>
      </div>

      {/* Dica Simples */}
      <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-400/50 rounded-xl">
        <p className="text-yellow-200 text-sm text-center">
          💡 <strong>Dica:</strong> Abra o Spotify em qualquer dispositivo para que as músicas toquem lá
        </p>
      </div>
    </div>
  );
}; 