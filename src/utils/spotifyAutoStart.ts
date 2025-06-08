// Funções para abrir Spotify automaticamente e iniciar reprodução
// Baseado na sua sugestão de melhorar a UX

/**
 * Detecta o dispositivo e abre o Spotify apropriado
 */
export const openSpotifyApp = (): void => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/android/.test(userAgent)) {
    // Android - Tenta abrir app, senão abre web
    window.open('spotify:', '_blank');
    setTimeout(() => {
      window.open('https://open.spotify.com', '_blank');
    }, 1000);
  } else if (/iphone|ipad|ipod/.test(userAgent)) {
    // iOS - Tenta abrir app, senão abre web
    window.open('spotify:', '_blank');
    setTimeout(() => {
      window.open('https://open.spotify.com', '_blank');
    }, 1000);
  } else {
    // Desktop - Abre web player
    window.open('https://open.spotify.com', '_blank');
  }
};

/**
 * Inicia reprodução automaticamente
 * Se tem playlist → toca playlist
 * Se não tem → toca qualquer música que estiver no Spotify
 */
export const startPlayback = async (
  accessToken: string, 
  playlistUri?: string
): Promise<void> => {
  try {
    const body: any = {};
    
    if (playlistUri) {
      // Se tem playlist, toca ela
      body.context_uri = playlistUri;
      console.log('🎵 Iniciando playlist:', playlistUri);
    } else {
      // Se não tem playlist, só dá play no que estiver no Spotify
      console.log('▶️ Dando play no Spotify (sem playlist específica)');
    }

    const response = await fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
      console.log('✅ Reprodução iniciada com sucesso!');
      return;
    }

    if (response.status === 404) {
      // Nenhum dispositivo ativo - abre Spotify e tenta novamente
      console.log('📱 Abrindo Spotify...');
      openSpotifyApp();
      
      // Aguarda um pouco e tenta novamente
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const retryResponse = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });

      if (retryResponse.status === 204) {
        console.log('✅ Reprodução iniciada após abrir Spotify!');
        return;
      }
    }

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

  } catch (error) {
    console.error('Erro ao iniciar reprodução:', error);
    throw error;
  }
};

/**
 * Fluxo completo: verifica dispositivo → abre Spotify se necessário → inicia reprodução
 */
export const autoStartSpotify = async (
  accessToken: string,
  playlistUri?: string
): Promise<boolean> => {
  try {
    // Primeiro tenta dar play direto
    await startPlayback(accessToken, playlistUri);
    return true;
  } catch (error) {
    console.log('🔄 Primeira tentativa falhou, abrindo Spotify...');
    
    // Se falhou, abre Spotify e tenta novamente
    openSpotifyApp();
    
    // Aguarda o Spotify abrir
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      await startPlayback(accessToken, playlistUri);
      return true;
    } catch (retryError) {
      console.error('❌ Falha mesmo após abrir Spotify:', retryError);
      return false;
    }
  }
}; 