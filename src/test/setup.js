import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Limpa o JSDOM após cada teste
afterEach(() => {
    cleanup();
});
