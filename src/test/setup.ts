import '@testing-library/jest-dom/vitest';

// Pastikan Web Crypto API tersedia di lingkungan pengujian jsdom
if (typeof window !== 'undefined' && (!window.crypto || !window.crypto.subtle)) {
  Object.defineProperty(window, 'crypto', {
    value: globalThis.crypto,
  });
}
