import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCandidatos, createCandidato, updateCandidatoStatus } from './candidatos';

// Mock Supabase client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();

vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: (table) => {
            mockFrom(table);
            return {
                select: mockSelect,
                insert: mockInsert,
                update: mockUpdate,
            }
        },
    },
}));

// Setup chainable mocks
mockSelect.mockReturnThis();
mockInsert.mockReturnThis();
mockUpdate.mockReturnThis();

// Eq is usually at the end of update/select chains, so handling it specifically in tests or generic setup
// Actually, supabase.from().select() returns a promise-like or {data, error} immediately in simple mocks, 
// but often it is chainable. .eq() follows update/select.
// Let's refine the mock structure.

describe('Candidatos Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default chain behavior
        mockFrom.mockReturnValue({
            select: mockSelect,
            insert: mockInsert,
            update: mockUpdate,
        });

        mockUpdate.mockReturnValue({ eq: mockEq });
        mockSelect.mockResolvedValue({ data: [], error: null });
        mockInsert.mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [{}], error: null })
        });
        mockEq.mockResolvedValue({ error: null });
    });

    it('fetchCandidatos should call supabase select', async () => {
        const mockData = [{ id: 1, nome: 'Test' }];
        mockSelect.mockResolvedValue({ data: mockData, error: null });

        const result = await fetchCandidatos();

        expect(mockFrom).toHaveBeenCalledWith('candidatos');
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(result).toEqual(mockData);
    });

    it('createCandidato should insert data', async () => {
        const newCandidate = { nome: 'New User' };
        const createdCandidate = { id: 1, ...newCandidate };

        mockInsert.mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [createdCandidate], error: null })
        });

        const result = await createCandidato(newCandidate);

        expect(mockFrom).toHaveBeenCalledWith('candidatos');
        expect(mockInsert).toHaveBeenCalledWith([newCandidate]);
        expect(result).toEqual(createdCandidate);
    });

    it('updateCandidatoStatus should update status', async () => {
        const id = 123;
        const newStatus = 'Aprovado';

        await updateCandidatoStatus(id, newStatus);

        expect(mockFrom).toHaveBeenCalledWith('candidatos');
        expect(mockUpdate).toHaveBeenCalledWith({ status: newStatus });
        expect(mockEq).toHaveBeenCalledWith('id', id);
    });
});
