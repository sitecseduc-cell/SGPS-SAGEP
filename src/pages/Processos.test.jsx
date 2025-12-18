import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Processos from './Processos';
import * as processosService from '../services/processos';

// Mock service
vi.mock('../services/processos', () => ({
    fetchProcessos: vi.fn(),
    createProcesso: vi.fn(),
    updateProcesso: vi.fn(),
    deleteProcesso: vi.fn(),
}));

describe('Processos Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders title and button', async () => {
        // Return empty list initially
        processosService.fetchProcessos.mockResolvedValue([]);

        render(<Processos />);

        expect(screen.getByText('Gerenciamento dos Processos')).toBeInTheDocument();
        expect(screen.getByText('Cadastrar Processo')).toBeInTheDocument();
    });

    it('renders list of processes after fetch', async () => {
        const mockData = [
            { id: 1, nome: 'Processo Seletivo 2025', inicio: '2025-01-01', fim: '2025-02-01', fase_atual: 'Planejamento', progresso: 10 },
            { id: 2, nome: 'Concurso 2026', inicio: '2026-03-01', fim: '2026-04-01', fase_atual: 'Publicado', progresso: 50 }
        ];

        processosService.fetchProcessos.mockResolvedValue(mockData);

        render(<Processos />);

        await waitFor(() => {
            expect(screen.getByText('Processo Seletivo 2025')).toBeInTheDocument();
            expect(screen.getByText('Concurso 2026')).toBeInTheDocument();
        });

        // Check status badges
        expect(screen.getByText('Planejamento')).toBeInTheDocument();
        expect(screen.getByText('Publicado')).toBeInTheDocument();
    });
});
