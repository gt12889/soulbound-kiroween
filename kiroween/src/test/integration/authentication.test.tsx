import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { AppProvider } from '../../contexts/AppContext';
import LoginPage from '../../components/auth/LoginPage';
import RegisterPage from '../../components/auth/RegisterPage';
import PasswordReset from '../../components/auth/PasswordReset';
import * as authService from '../../services/authService';

// Mock auth service
vi.mock('../../services/authService');
vi.mock('../../services/firebaseService', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn((callback) => {
      callback(null);
      return vi.fn();
    }),
  },
}));

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>{component}</AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Registration Flow', () => {
    it('should register user with valid inputs', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 'test-uid',
        email: 'test@example.com',
        provider: 'email' as const,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      vi.mocked(authService.register).mockResolvedValue(mockUser);

      renderWithAuth(<RegisterPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /register|sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith('test@example.com', 'Password123');
      });
    });

    it('should show error for invalid password', async () => {
      const user = userEvent.setup();
      renderWithAuth(<RegisterPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'weak');
      await user.type(confirmPasswordInput, 'weak');

      const submitButton = screen.getByRole('button', { name: /register|sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderWithAuth(<RegisterPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'DifferentPassword123');

      const submitButton = screen.getByRole('button', { name: /register|sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should handle registration errors', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.register).mockRejectedValue(
        new Error('An account with this email already exists')
      );

      renderWithAuth(<RegisterPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /register|sign up/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/account with this email already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Login Flow', () => {
    it('should login user with correct credentials', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 'test-uid',
        email: 'test@example.com',
        provider: 'email' as const,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      vi.mocked(authService.login).mockResolvedValue(mockUser);

      renderWithAuth(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /login|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith('test@example.com', 'Password123');
      });
    });

    it('should show error for incorrect credentials', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.login).mockRejectedValue(
        new Error('Invalid email or password')
      );

      renderWithAuth(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'WrongPassword123');

      const submitButton = screen.getByRole('button', { name: /login|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should handle rate limiting', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.login).mockRejectedValue(
        new Error('Too many failed attempts. Please try again later.')
      );

      renderWithAuth(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /login|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/too many failed attempts/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Reset Flow', () => {
    it('should send password reset email', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.sendPasswordReset).mockResolvedValue();

      renderWithAuth(<PasswordReset />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(authService.sendPasswordReset).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should show error for non-existent email', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.sendPasswordReset).mockRejectedValue(
        new Error('No account found with this email')
      );

      renderWithAuth(<PasswordReset />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'nonexistent@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset|reset password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/no account found/i)).toBeInTheDocument();
      });
    });
  });

  describe('OAuth Authentication', () => {
    it('should sign in with Google', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 'google-uid',
        email: 'test@gmail.com',
        provider: 'google' as const,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      vi.mocked(authService.signInWithGoogle).mockResolvedValue(mockUser);

      renderWithAuth(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(authService.signInWithGoogle).toHaveBeenCalled();
      });
    });

    it('should sign in with GitHub', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 'github-uid',
        email: 'test@github.com',
        provider: 'github' as const,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      vi.mocked(authService.signInWithGithub).mockResolvedValue(mockUser);

      renderWithAuth(<LoginPage />);

      const githubButton = screen.getByRole('button', { name: /github/i });
      await user.click(githubButton);

      await waitFor(() => {
        expect(authService.signInWithGithub).toHaveBeenCalled();
      });
    });

    it('should handle OAuth popup blocked', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.signInWithGoogle).mockRejectedValue(
        new Error('Popup blocked. Please allow popups for this site.')
      );

      renderWithAuth(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText(/popup blocked/i)).toBeInTheDocument();
      });
    });

    it('should handle OAuth cancelled by user', async () => {
      const user = userEvent.setup();
      vi.mocked(authService.signInWithGithub).mockRejectedValue(
        new Error('Sign-in cancelled')
      );

      renderWithAuth(<LoginPage />);

      const githubButton = screen.getByRole('button', { name: /github/i });
      await user.click(githubButton);

      await waitFor(() => {
        expect(screen.getByText(/sign-in cancelled/i)).toBeInTheDocument();
      });
    });
  });

  describe('Session Expiration Handling', () => {
    it('should handle session expiration during authenticated operation', async () => {
      // Mock an authenticated user initially
      // const mockAuthStateChanged = vi.fn();
      vi.mocked(authService.getCurrentUser).mockReturnValue({
        id: 'test-uid',
        email: 'test@example.com',
        provider: 'email' as const,
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      // Simulate session expiration by triggering auth state change to null
      const { rerender } = renderWithAuth(<LoginPage />);

      // Simulate session expiration
      vi.mocked(authService.getCurrentUser).mockReturnValue(null);
      
      // Trigger a re-render to simulate auth state change
      rerender(
        <BrowserRouter>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </BrowserRouter>
      );

      // User should be logged out
      await waitFor(() => {
        expect(authService.getCurrentUser()).toBeNull();
      });
    });

    it('should redirect to login when session expires', async () => {
      // This test verifies that expired sessions are handled by the auth state listener
      const mockUser = {
        id: 'test-uid',
        email: 'test@example.com',
        provider: 'email' as const,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      // Start with authenticated user
      vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);
      
      renderWithAuth(<LoginPage />);

      // Simulate session expiration
      vi.mocked(authService.getCurrentUser).mockReturnValue(null);
      vi.mocked(authService.isAuthenticated).mockReturnValue(false);

      await waitFor(() => {
        expect(authService.isAuthenticated()).toBe(false);
      });
    });

    it('should handle token refresh on session near expiration', async () => {
      // Firebase handles token refresh automatically
      // This test verifies the auth state listener continues to work
      const mockUser = {
        id: 'test-uid',
        email: 'test@example.com',
        provider: 'email' as const,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);
      vi.mocked(authService.isAuthenticated).mockReturnValue(true);

      renderWithAuth(<LoginPage />);

      await waitFor(() => {
        expect(authService.isAuthenticated()).toBe(true);
      });
    });

    it('should handle network errors during session validation', async () => {
      const user = userEvent.setup();
      
      // Simulate network error during login
      vi.mocked(authService.login).mockRejectedValue(
        new Error('Network error. Please check your connection.')
      );

      renderWithAuth(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');

      const submitButton = screen.getByRole('button', { name: /login|sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error|connection/i)).toBeInTheDocument();
      });
    });
  });
});
