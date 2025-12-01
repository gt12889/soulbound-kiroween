import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  AuthError,
} from 'firebase/auth';
import type { User as FirebaseUser, UserCredential } from 'firebase/auth';
import { auth } from './firebaseService';
import type { User } from '../types';

/**
 * Type guard to check if an error is a Firebase Auth error
 */
function isFirebaseAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    (error as { code: string }).code.startsWith('auth/')
  );
}



/**
 * Validates password strength
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
};

/**
 * Converts Firebase user to app User interface
 */
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  const provider = firebaseUser.providerData[0]?.providerId || 'email';
  let providerType: 'email' | 'google' | 'github' = 'email';
  
  if (provider.includes('google')) {
    providerType = 'google';
  } else if (provider.includes('github')) {
    providerType = 'github';
  }

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || undefined,
    photoURL: firebaseUser.photoURL || undefined,
    provider: providerType,
    createdAt: firebaseUser.metadata.creationTime 
      ? new Date(firebaseUser.metadata.creationTime) 
      : new Date(),
    lastLogin: firebaseUser.metadata.lastSignInTime 
      ? new Date(firebaseUser.metadata.lastSignInTime) 
      : new Date(),
  };
};

/**
 * Register a new user with email and password
 */
export const register = async (email: string, password: string): Promise<User> => {
  if (!auth) throw new Error('Firebase is not initialized.');
  const validation = validatePassword(password);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    return convertFirebaseUser(userCredential.user);
  } catch (error: unknown) {
    if (isFirebaseAuthError(error)) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak');
      }
    }
    throw new Error('Registration failed. Please try again.');
  }
};

/**
 * Login with email and password
 */
export const login = async (email: string, password: string): Promise<User> => {
  if (!auth) throw new Error('Firebase is not initialized.');
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    return convertFirebaseUser(userCredential.user);
  } catch (error: unknown) {
    if (isFirebaseAuthError(error)) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      }
    }
    throw new Error('Login failed. Please try again.');
  }
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  if (!auth) throw new Error('Firebase is not initialized.');
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error('Logout failed. Please try again.');
  }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  if (!auth) throw new Error('Firebase is not initialized.');
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    if (isFirebaseAuthError(error)) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      }
    }
    throw new Error('Failed to send password reset email. Please try again.');
  }
};

/**
 * Confirm password reset with code
 */
export const resetPassword = async (code: string, newPassword: string): Promise<void> => {
  if (!auth) throw new Error('Firebase is not initialized.');
  const validation = validatePassword(newPassword);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  try {
    await confirmPasswordReset(auth, code, newPassword);
  } catch (error: unknown) {
    if (isFirebaseAuthError(error)) {
      if (error.code === 'auth/invalid-action-code') {
        throw new Error('Invalid or expired reset code');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak');
      }
    }
    throw new Error('Failed to reset password. Please try again.');
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<User> => {
  if (!auth) throw new Error('Firebase is not initialized.');
  const provider = new GoogleAuthProvider();
  try {
    const userCredential: UserCredential = await signInWithPopup(auth, provider);
    return convertFirebaseUser(userCredential.user);
  } catch (error: unknown) {
    if (isFirebaseAuthError(error)) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
    }
    throw new Error('Google sign-in failed. Please try again.');
  }
};

/**
 * Sign in with GitHub
 */
export const signInWithGithub = async (): Promise<User> => {
  if (!auth) throw new Error('Firebase is not initialized.');
  const provider = new GithubAuthProvider();
  try {
    const userCredential: UserCredential = await signInWithPopup(auth, provider);
    return convertFirebaseUser(userCredential.user);
  } catch (error: unknown) {
    if (isFirebaseAuthError(error)) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with this email using a different sign-in method');
      }
    }
    throw new Error('GitHub sign-in failed. Please try again.');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  if (!auth) return null;
  const firebaseUser = auth.currentUser;
  return firebaseUser ? convertFirebaseUser(firebaseUser) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (!auth) return false;
  return auth.currentUser !== null;
};
