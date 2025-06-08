import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SpotifyCallback: React.FC = () => {
  const navigate = useNavigate();
  const { handleSpotifyCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      // Evitar múltiplas execuções
      if (!processing) return;

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const state = urlParams.get('state');

      console.log('Spotify callback received:', { 
        hasCode: !!code, 
        error, 
        state,
        url: window.location.href 
      });

      if (error) {
        console.error('Spotify auth error:', error);
        setError(`Erro na autenticação: ${error}`);
        setProcessing(false);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        setError('Código de autorização não recebido');
        setProcessing(false);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        console.log('Processing Spotify callback...');
        await handleSpotifyCallback(code);
        console.log('Callback processed successfully, redirecting...');
        
        // Limpar a URL para evitar reprocessamento
        window.history.replaceState({}, document.title, '/');
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error handling Spotify callback:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        setError(`Falha na autenticação: ${errorMessage}`);
        setProcessing(false);
        
        // Redirecionar após 5 segundos em caso de erro
        setTimeout(() => navigate('/'), 5000);
      }
    };

    handleCallback();
  }, []); // Remover dependências para evitar re-execução

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spotify-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Erro na Autenticação
          </h2>
          <p className="text-gray-300 mb-4">
            {error}
          </p>
          <p className="text-gray-400 text-sm">
            Redirecionando para a página inicial...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-900 via-green-900 to-emerald-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-spotify-500 rounded-full mb-4 animate-pulse">
          <Music className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Conectando com Spotify...
        </h2>
        <p className="text-gray-300">
          Aguarde enquanto configuramos sua conta
        </p>
      </div>
    </div>
  );
};