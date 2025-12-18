import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Relatorios from './Relatorios';

// Mock Supabase
const mockSelect = vi.fn();
const mockCsv = vi.fn();
const mockFrom = vi.fn();

vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: (table) => {
            mockFrom(table);
            return {
                select: (cols) => {
                    mockSelect(cols);
                    return {
                        csv: mockCsv,
                        // For PDF which just awaits select()
                        then: (resolve) => resolve({ data: [{ col: 'val' }], error: null })
                    }
                }
            }
        },
    },
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('Relatorios Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        mockFrom.mockReturnValue({
            select: mockSelect
        });
        mockSelect.mockReturnValue({
            csv: mockCsv
        });
        // mockCsv behavior
        mockCsv.mockResolvedValue({ data: 'col1,col2\nval1,val2', error: null });
    });

    it('renders export buttons', () => {
        render(<Relatorios />);
        expect(screen.getByText('Central de Relatórios')).toBeInTheDocument();
        // Check for specific buttons
        expect(screen.getAllByText('CSV').length).toBeGreaterThan(0);
        expect(screen.getAllByText('PDF').length).toBeGreaterThan(0);
    });

    it('triggers CSV export when clicked', async () => {
        render(<Relatorios />);

        // Click the first CSV button (Candidatos)
        const csvButtons = screen.getAllByText('CSV');
        fireEvent.click(csvButtons[0]);

        await waitFor(() => {
            expect(mockFrom).toHaveBeenCalledWith('candidatos');
            // Check if toast success appears (optional, or check console)
            // But main logic is calling supabase
            expect(mockCsv).toHaveBeenCalled();
        });
    });
});
