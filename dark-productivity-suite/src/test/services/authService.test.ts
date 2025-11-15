import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  register,
  login,
  logout,
  sendPasswordReset,
  resetPassword,
  signInWithGoogle,
  signInWithGithub,
  validatePassword,
  getCurrentUser,
  isAuthenticated,
} from '../../services/authService';
import * as firebaseAuth from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  confirmPasswordReset: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  GithubAuthProvider: vi.fn(),
}));

vi.mock('../../services/firebaseService', () => ({
  auth: {
    currentUser: null,
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validatePassword', () => {
    it('should validate password with all requirements', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Pass1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePassword('password123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePassword('PASSWORD123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('lowercase letter');
    });

    it('should reject password without number', () => {
      const result = validatePassword('Password');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('number');
    });
  });

  describe('register', () => {
    it('should register user with valid credentials', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: null,
        photoURL: null,
        providerData: [{ providerId: 'password' }],
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };

      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any);

      const user = await register('test@example.com', 'Password123');
      
      expect(user.id).toBe('test-uid');
      expect(user.email).toBe('test@example.com');
      expect(user.provider).toBe('email');
    });

    it('should reject registration with invalid password', async () => {
      await expect(register('test@example.com', 'weak')).rejects.toThrow();
    });

    it('should handle email already in use error', async () => {
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockRejectedValue({
        code: 'auth/email-already-in-use',
      });

      await expect(register('test@example.com', 'Password123')).rejects.toThrow(
        'An account with this email already exists'
      );
    });

    it('should handle invalid email error', async () => {
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockRejectedValue({
        code: 'auth/invalid-email',
      });

      await expect(register('invalid-email', 'Password123')).rejects.toThrow(
        'Invalid email address'
      );
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: null,
        photoURL: null,
        providerData: [{ providerId: 'password' }],
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };

      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any);

      const user = await login('test@example.com', 'Password123');
      
      expect(user.id).toBe('test-uid');
      expect(user.email).toBe('test@example.com');
    });

    it('should handle incorrect credentials', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValue({
        code: 'auth/wrong-password',
      });

      await expect(login('test@example.com', 'WrongPassword123')).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should handle user not found error', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValue({
        code: 'auth/user-not-found',
      });

      await expect(login('nonexistent@example.com', 'Password123')).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should handle too many requests error', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValue({
        code: 'auth/too-many-requests',
      });

      await expect(login('test@example.com', 'Password123')).rejects.toThrow(
        'Too many failed attempts'
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      await expect(logout()).resolves.toBeUndefined();
      expect(firebaseAuth.signOut).toHaveBeenCalled();
    });

    it('should handle logout errors', async () => {
      vi.mocked(firebaseAuth.signOut).mockRejectedValue(new Error('Network error'));

      await expect(logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email', async () => {
      vi.mocked(firebaseAuth.sendPasswordResetEmail).mockResolvedValue();

      await expect(sendPasswordReset('test@example.com')).resolves.toBeUndefined();
      expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should handle user not found error', async () => {
      vi.mocked(firebaseAuth.sendPasswordResetEmail).mockRejectedValue({
        code: 'auth/user-not-found',
      });

      await expect(sendPasswordReset('nonexistent@example.com')).rejects.toThrow(
        'No account found with this email'
      );
    });

    it('should handle invalid email error', async () => {
      vi.mocked(firebaseAuth.sendPasswordResetEmail).mockRejectedValue({
        code: 'auth/invalid-email',
      });

      await expect(sendPasswordReset('invalid-email')).rejects.toThrow(
        'Invalid email address'
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid code and password', async () => {
      vi.mocked(firebaseAuth.confirmPasswordReset).mockResolvedValue();

      await expect(resetPassword('valid-code', 'NewPassword123')).resolves.toBeUndefined();
      expect(firebaseAuth.confirmPasswordReset).toHaveBeenCalledWith(
        expect.anything(),
        'valid-code',
        'NewPassword123'
      );
    });

    it('should reject weak password', async () => {
      await expect(resetPassword('valid-code', 'weak')).rejects.toThrow();
    });

    it('should handle invalid or expired code', async () => {
      vi.mocked(firebaseAuth.confirmPasswordReset).mockRejectedValue({
        code: 'auth/invalid-action-code',
      });

      await expect(resetPassword('invalid-code', 'NewPassword123')).rejects.toThrow(
        'Invalid or expired reset code'
      );
    });
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google successfully', async () => {
      const mockUser = {
        uid: 'google-uid',
        email: 'test@gmail.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        providerData: [{ providerId: 'google.com' }],
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };

      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValue({
        user: mockUser,
      } as any);

      const user = await signInWithGoogle();
      
      expect(user.id).toBe('google-uid');
      expect(user.provider).toBe('google');
    });

    it('should handle popup closed by user', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValue({
        code: 'auth/popup-closed-by-user',
      });

      await expect(signInWithGoogle()).rejects.toThrow('Sign-in cancelled');
    });

    it('should handle popup blocked', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValue({
        code: 'auth/popup-blocked',
      });

      await expect(signInWithGoogle()).rejects.toThrow('Popup blocked');
    });
  });

  describe('signInWithGithub', () => {
    it('should sign in with GitHub successfully', async () => {
      const mockUser = {
        uid: 'github-uid',
        email: 'test@github.com',
        displayName: 'GitHub User',
        photoURL: 'https://github.com/avatar.jpg',
        providerData: [{ providerId: 'github.com' }],
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };

      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValue({
        user: mockUser,
      } as any);

      const user = await signInWithGithub();
      
      expect(user.id).toBe('github-uid');
      expect(user.provider).toBe('github');
    });

    it('should handle account exists with different credential', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValue({
        code: 'auth/account-exists-with-different-credential',
      });

      await expect(signInWithGithub()).rejects.toThrow(
        'An account already exists with this email using a different sign-in method'
      );
    });

    it('should handle popup closed by user', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValue({
        code: 'auth/popup-closed-by-user',
      });

      await expect(signInWithGithub()).rejects.toThrow('Sign-in cancelled');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', async () => {
      const mockFirebaseUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        providerData: [{ providerId: 'password' }],
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };

      // Import and mock the auth object
      const { auth } = await import('../../services/firebaseService');
      (auth as any).currentUser = mockFirebaseUser;

      const user = getCurrentUser();
      
      expect(user).not.toBeNull();
      expect(user?.id).toBe('test-uid');
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null when not authenticated', async () => {
      const { auth } = await import('../../services/firebaseService');
      (auth as any).currentUser = null;

      const user = getCurrentUser();
      
      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      const mockFirebaseUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      };

      const { auth } = await import('../../services/firebaseService');
      (auth as any).currentUser = mockFirebaseUser;

      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      const { auth } = await import('../../services/firebaseService');
      (auth as any).currentUser = null;

      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('Session Expiration', () => {
    it('should handle expired session token', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValue({
        code: 'auth/user-token-expired',
      });

      await expect(login('test@example.com', 'Password123')).rejects.toThrow();
    });

    it('should handle invalid user token', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValue({
        code: 'auth/invalid-user-token',
      });

      await expect(login('test@example.com', 'Password123')).rejects.toThrow();
    });

    it('should handle network errors during authentication', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValue({
        code: 'auth/network-request-failed',
      });

      await expect(login('test@example.com', 'Password123')).rejects.toThrow();
    });

    it('should handle session revoked', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValue({
        code: 'auth/user-disabled',
      });

      await expect(login('test@example.com', 'Password123')).rejects.toThrow();
    });
  });
});
