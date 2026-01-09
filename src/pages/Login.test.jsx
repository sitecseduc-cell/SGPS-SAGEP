import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from '../Login';
// We don't import AuthContext or useAuth normally if we mock the module, 
// but we might need to import it if we want to spy on it, or just rely on the mock factory.

// Mock the AuthContext module
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockResetPassword = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        signIn: mockSignIn,
        signUp: mockSignUp,
        resetPassword: mockResetPassword,
        loading: false
    })
}));

const renderLogin = () => {
    return render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );
};

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders login form by default', () => {
        renderLogin();
        expect(screen.getByText('Acesse sua conta')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('seu.email@exemplo.com')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /entrar no sistema/i })).toBeInTheDocument();
    });

    test('validates incorrect email', async () => {
        const user = userEvent.setup();
        renderLogin();
        const emailInput = screen.getByPlaceholderText('seu.email@exemplo.com');
        const submitBtn = screen.getByRole('button', { name: /entrar no sistema/i });

        await user.type(emailInput, 'invalid-email');
        await user.click(submitBtn);

        expect(await screen.findByText('E-mail inválido')).toBeInTheDocument();
    });

    test('calls signIn on valid submit', async () => {
        const user = userEvent.setup();
        renderLogin();
        const emailInput = screen.getByPlaceholderText('seu.email@exemplo.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitBtn = screen.getByRole('button', { name: /entrar no sistema/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitBtn);

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    test('switches to register view', async () => {
        const user = userEvent.setup();
        renderLogin();
        const registerLink = screen.getByRole('button', { name: /criar uma conta agora/i });
        await user.click(registerLink);

        expect(await screen.findByText('Novo Usuário')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Seu Nome')).toBeInTheDocument();
    });
});
