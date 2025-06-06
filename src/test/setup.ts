import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock para o Spotify Web Playback SDK
Object.defineProperty(window, 'Spotify', {
  value: {
    Player: class MockPlayer {
      constructor(options: any) {
        setTimeout(() => {
          if (options.ready) options.ready({ device_id: 'mock-device-id' });
        }, 100);
      }
      
      addListener = vi.fn();
      connect = vi.fn().mockResolvedValue(true);
      disconnect = vi.fn();
      getCurrentState = vi.fn().mockResolvedValue(null);
      getVolume = vi.fn().mockResolvedValue(0.5);
      nextTrack = vi.fn().mockResolvedValue();
      pause = vi.fn().mockResolvedValue();
      previousTrack = vi.fn().mockResolvedValue();
      resume = vi.fn().mockResolvedValue();
      seek = vi.fn().mockResolvedValue();
      setName = vi.fn().mockResolvedValue();
      setVolume = vi.fn().mockResolvedValue();
      togglePlay = vi.fn().mockResolvedValue();
    }
  },
  writable: true
});

// Mock para window.onSpotifyWebPlaybackSDKReady
Object.defineProperty(window, 'onSpotifyWebPlaybackSDKReady', {
  value: undefined,
  writable: true
});

// Mock para fetch
global.fetch = vi.fn();

// Mock para console methods em testes
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  vi.restoreAllMocks();
}); 