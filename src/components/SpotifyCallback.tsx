import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SpotifyCallback: React.FC = () => {
  const navigate = useNavigate();
  const { handleSpotifyCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('Spotify auth error:', error);
        navigate('/');
        return;
      }

      if (code) {
        try {
          await handleSpotifyCallback(code);
          navigate('/');
        } catch (error) {
          console.error('Error handling Spotify callback:', error);
          navigate('/');
        }
      } else {
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, handleSpotifyCallback]);

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