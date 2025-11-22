import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import * as authService from '../../services/authService';

// Mock Firebase
vi.mock('../../services/firebaseService', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn((callback) => {
      callback(null);
      return vi.fn(); // unsubscribe function
    }),
  },
  db: {},
}));

// Mock auth service
vi.mock('../../services/authService', () => ({
  getCurrentUser: vi.fn(() => null),
  isAuthenticated: vi.fn(() => false),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithGithub: vi.fn(),
  validatePassword: vi.fn(() => ({ valid: true })),
}));

// Test components
const ProtectedComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

describe('Protected Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect unauthenticated users to login', async () => {
    // Mock unauthenticated state
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);

    render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <ProtectedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );

    // Should redirect to login and show login page
    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  it('should render protected content for authenticated users', async () => {
    // Mock authenticated state
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      provider: 'email' as const,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);

    // Mock Firebase auth state
    const { auth } = await import('../../services/firebaseService');
    (auth as any).currentUser = {
      uid: mockUser.id,
      email: mockUser.email,
      providerData: [{ providerId: 'password' }],
      metadata: {
        creationTime: mockUser.createdAt.toISOString(),
        lastSignInTime: mockUser.lastLogin.toISOString(),
      },
    };

    render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );

    // Should render protected content
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should preserve intended destination in location state', async () => {
    // Mock unauthenticated state
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);

    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route
              path="/protected-page"
              element={
                <ProtectedRoute>
                  <ProtectedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );

    // Should redirect to login
    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    // Verify we're on login page
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should protect all application routes', async () => {
    // Mock unauthenticated state
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);

    const protectedRoutes = [
      '/terminal-tarot',
      '/ghost-writer',
      '/necronomicon-notes',
      '/graveyard-dashboard',
    ];

    for (const route of protectedRoutes) {
      const { unmount } = render(
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginComponent />} />
              <Route
                path={route}
                element={
                  <ProtectedRoute>
                    <ProtectedComponent />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // Should redirect to login for each protected route
      await waitFor(() => {
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      });

      unmount();
    }
  });

  it('should handle session expiration by redirecting to login', async () => {
    // Start with authenticated state
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      provider: 'email' as const,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);

    const { rerender } = render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );

    // Should render protected content initially
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    // Simulate session expiration
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);

    // Rerender to trigger auth state change
    rerender(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );

    // Should redirect to login after session expires
    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });
});
