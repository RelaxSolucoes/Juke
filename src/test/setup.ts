import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Removido: Mock para o Spotify Web Playback SDK
// O Juke usa apenas Spotify Web API, não o SDK de reprodução

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