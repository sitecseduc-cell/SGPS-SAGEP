import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Kanban from './Kanban';
import * as candidatosService from '../services/candidatos';

// Mock service
vi.mock('../services/candidatos', () => ({
    fetchCandidatos: vi.fn(),
    updateCandidatoStatus: vi.fn(),
}));

// Mock Supabase to avoid errors if used directly?
// In Step 206, Kanban doesn't import supabase for operations, but it does import it maybe for 'kanban_cards' creation button?
// Step 206: `<button onClick={async () => { await supabase.from('kanban_cards')...`
// So we need to mock supabase too.
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            insert: vi.fn(),
        })),
    },
}));

describe('Kanban Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        // Make fetchCandidatos return a never-resolving promise or just verify loading logic
        candidatosService.fetchCandidatos.mockImplementation(() => new Promise(() => { }));
        render(<Kanban />);
        // Check for loading spinner or skeleton (assuming we removed Skeleton and used Spinner in previous edits? 
        // Step 206 uses: <div className="animate-spin rounded-full ...">
        const spinner = screen.getByText((content, element) => element.className.includes('animate-spin'));
        expect(spinner).toBeInTheDocument();
    });

    it('renders columns and cards after loading', async () => {
        const mockCandidates = [
            { id: 1, nome: 'João da Silva', created_at: '2025-12-01', status: 'Planejamento' },
            { id: 2, nome: 'Maria Souza', created_at: '2025-12-02', status: 'Classificado' } // Maps to Homologacao
        ];

        candidatosService.fetchCandidatos.mockResolvedValue(mockCandidates);

        render(<Kanban />);

        await waitFor(() => {
            expect(screen.getByText('Fluxo de Trabalho')).toBeInTheDocument();
        });

        // Check column titles
        expect(screen.getByText('Planejamento')).toBeInTheDocument();
        expect(screen.getByText('Homologado')).toBeInTheDocument();

        // Check card content
        expect(screen.getByText('João da Silva')).toBeInTheDocument();
        expect(screen.getByText('Maria Souza')).toBeInTheDocument();
    });
});
