import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NewCandidateModal from './NewCandidateModal';

describe('NewCandidateModal', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();

    it('should not render when isOpen is false', () => {
        const { container } = render(
            <NewCandidateModal isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
        render(<NewCandidateModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
        expect(screen.getByText('Novo Candidato')).toBeInTheDocument();
    });

    it('should show validation errors on submit with empty fields', async () => {
        render(<NewCandidateModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

        // Find save button by text matching "Salvar Candidato"
        const saveButton = screen.getByText(/Salvar Candidato/i);
        fireEvent.click(saveButton);

        // Expect validation messages for empty fields
        await waitFor(() => {
            expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument();
            expect(screen.getByText(/CPF é obrigatório/i)).toBeInTheDocument();
            expect(screen.getByText(/Email é obrigatório/i)).toBeInTheDocument();
        });
    });

    it('should validate CPF format', async () => {
        render(<NewCandidateModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

        const cpfInput = screen.getByPlaceholderText('000.000.000-00');
        fireEvent.change(cpfInput, { target: { value: '123' } }); // Invalid CPF

        // We also need to fill other required fields to avoid their errors cluttering or preventing submit if submit logic checks all. 
        // But react-hook-form validates all.
        // Let's just check for CPF error presence.

        const saveButton = screen.getByText(/Salvar Candidato/i);
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/CPF inválido/i)).toBeInTheDocument();
        });
    });
});
