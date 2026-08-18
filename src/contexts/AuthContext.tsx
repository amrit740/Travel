import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPreferences } from '../types';
import { apiAuth, getStoredToken, setStoredToken, removeStoredToken } from '../services/api';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { checkIsAdmin, PRIMARY_ADMIN_UID } from '../lib/adminService';

interface AuthContextType {
  user: User | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  demoLogin: (role?: 'user' | 'admin') => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; profile_image?: string }) => Promise<void>;
  updatePreferences: (data: Partial<UserPreferences>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync Firebase Auth state listener & establish verified application session
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          const verifyRes = await apiAuth.verifyFirebase({
            idToken,
            name: fbUser.displayName || undefined,
            email: fbUser.email || undefined,
            profile_image: fbUser.photoURL || undefined,
          });

          if (isMounted && verifyRes && verifyRes.token) {
            setStoredToken(verifyRes.token);
            const isAdminUser = checkIsAdmin(verifyRes.user);
            setUser({ ...verifyRes.user, role: isAdminUser ? 'admin' : (verifyRes.user.role || 'user') });
            setPreferences(verifyRes.preferences);
          }
        } catch (e) {
          console.warn('[AuthContext] Firebase token verification note:', e);
          const isAdminUser = checkIsAdmin(fbUser.uid);
          const fallbackUserData: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || (isAdminUser ? 'TravelWise Administrator' : 'Traveler'),
            email: fbUser.email || '',
            role: isAdminUser ? 'admin' : 'user',
            profile_image: fbUser.photoURL || undefined,
            created_at: new Date().toISOString(),
          };

          const defaultPrefs: UserPreferences = {
            id: `pref-${fbUser.uid}`,
            user_id: fbUser.uid,
            travel_style: ['Adventure', 'Cultural'],
            preferred_activities: ['Historical Sites', 'Photography'],
            food_preferences: ['Local Cuisine'],
            accommodation_preference: 'Hotel',
            transportation_preference: 'Mixed',
            preferred_budget: 50000,
            preferred_destinations: ['Goa', 'Jaipur', 'Kerala', 'Manali'],
          };

          if (isMounted) {
            setUser(fallbackUserData);
            setPreferences(defaultPrefs);
            apiAuth.syncUser(fallbackUserData).then((syncRes) => {
              if (syncRes && syncRes.token) {
                setStoredToken(syncRes.token);
              }
            }).catch(() => {});
          }
        }
      } else {
        // Fallback to local server session if Firebase user is not active
        const token = getStoredToken();
        if (token) {
          try {
            const res = await apiAuth.getMe();
            if (isMounted && res && res.user) {
              const isAdm = checkIsAdmin(res.user);
              setUser({ ...res.user, role: isAdm ? 'admin' : (res.user.role || 'user') });
              setPreferences(res.preferences);
            }
          } catch (meErr) {
            console.warn('[AuthContext] Stored session invalid, resetting:', meErr);
            removeStoredToken();
            if (isMounted) {
              setUser(null);
              setPreferences(null);
            }
          }
        } else if (!auth.currentUser) {
          if (isMounted) {
            setUser(null);
            setPreferences(null);
          }
        }
      }
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      // 1. Authenticate with Firebase Email/Password
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      const idToken = await fbUser.getIdToken();

      // 2. Exchange Firebase token for Application JWT Session
      const verifyRes = await apiAuth.verifyFirebase({
        idToken,
        email: fbUser.email || email,
        name: fbUser.displayName || undefined,
        profile_image: fbUser.photoURL || undefined,
      });

      setStoredToken(verifyRes.token);
      const isAdminUser = checkIsAdmin(verifyRes.user);
      setUser({ ...verifyRes.user, role: isAdminUser ? 'admin' : (verifyRes.user.role || 'user') });
      setPreferences(verifyRes.preferences);
    } catch (err: any) {
      console.warn('[AuthContext] Firebase login fallback to local API:', err?.message || err);
      try {
        const res = await apiAuth.login({ email, password: pass });
        setStoredToken(res.token);
        const isAdm = checkIsAdmin(res.user);
        const loggedUser = { ...res.user, role: isAdm ? 'admin' : (res.user.role || 'user') };
        setUser(loggedUser);
        setPreferences(res.preferences);
      } catch (fallbackErr: any) {
        throw new Error(err.message || fallbackErr.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;

      if (name && auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: name }).catch(() => {});
      }

      const idToken = await fbUser.getIdToken(true);

      // 2. Exchange Firebase token for Application JWT Session
      const verifyRes = await apiAuth.verifyFirebase({
        idToken,
        name: name.trim(),
        email,
        profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      });

      setStoredToken(verifyRes.token);
      const isAdminUser = checkIsAdmin(verifyRes.user);
      setUser({ ...verifyRes.user, role: isAdminUser ? 'admin' : (verifyRes.user.role || 'user') });
      setPreferences(verifyRes.preferences);
    } catch (err: any) {
      console.warn('[AuthContext] Firebase registration fallback to local register:', err?.message || err);
      try {
        const res = await apiAuth.register({ name, email, password: pass });
        if (res && res.token) {
          setStoredToken(res.token);
          const isAdm = checkIsAdmin(res.user);
          setUser({ ...res.user, role: isAdm ? 'admin' : (res.user.role || 'user') });
          setPreferences(res.preferences);
        }
      } catch (backendErr: any) {
        throw new Error(err.message || backendErr.message || 'Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken();

      // Exchange Firebase token for Application JWT Session
      const verifyRes = await apiAuth.verifyFirebase({
        idToken,
        name: fbUser.displayName || undefined,
        email: fbUser.email || undefined,
        profile_image: fbUser.photoURL || undefined,
      });

      setStoredToken(verifyRes.token);
      const isAdminUser = checkIsAdmin(verifyRes.user);
      setUser({ ...verifyRes.user, role: isAdminUser ? 'admin' : (verifyRes.user.role || 'user') });
      setPreferences(verifyRes.preferences);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      const code = err.code || '';
      const msg = err.message || '';
      if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed-by-user')) {
        throw new Error('Sign-in popup was closed.');
      }
      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        throw new Error(
          `Domain not authorized in Firebase: "${currentDomain}". To enable Google Sign-In, add this domain to Firebase Console > Authentication > Settings > Authorized domains.`
        );
      }
      throw new Error(err.message || 'Failed to sign in with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (_role: 'user' | 'admin' = 'user') => {
    setIsLoading(true);
    try {
      // Demo login signs in as standard demo traveler
      const demoEmail = 'anjalireal24@gmail.com';
      const demoPass = 'demo12345';
      try {
        const userCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
        const fbUser = userCredential.user;
        const idToken = await fbUser.getIdToken();
        const verifyRes = await apiAuth.verifyFirebase({
          idToken,
          email: demoEmail,
          name: 'Anjali Sharma',
        });
        setStoredToken(verifyRes.token);
        setUser(verifyRes.user);
        setPreferences(verifyRes.preferences);
      } catch {
        // Fallback demo API
        const res = await apiAuth.demoLogin('user');
        setStoredToken(res.token);
        setUser({ ...res.user, role: 'user' });
        setPreferences(res.preferences);
      }
    } catch {
      const fallbackUser: User = {
        id: `demo-user-${Date.now()}`,
        name: 'Anjali Sharma',
        email: 'anjalireal24@gmail.com',
        profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        role: 'user',
        created_at: new Date().toISOString(),
      };
      setUser(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeStoredToken();
    localStorage.removeItem('travel_wise_active_trip_id');
    setUser(null);
    setPreferences(null);
    signOut(auth).catch(() => {});
    apiAuth.logout().catch(() => {});
  };

  const updateProfile = async (data: { name?: string; profile_image?: string }) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);

      if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: data.name || auth.currentUser.displayName,
          photoURL: data.profile_image || auth.currentUser.photoURL,
        }).catch(() => {});
      }

      // Also update profile via backend
      apiAuth.updateProfile(data).catch(() => {});
    }
  };

  const updatePreferences = async (data: Partial<UserPreferences>) => {
    if (preferences) {
      const updated = { ...preferences, ...data };
      setPreferences(updated);
      apiAuth.updatePreferences(data).catch(() => {});
    }
  };

  const refreshUserData = async () => {
    if (auth.currentUser) {
      const fbUser = auth.currentUser;
      try {
        const idToken = await fbUser.getIdToken();
        const verifyRes = await apiAuth.verifyFirebase({
          idToken,
          name: fbUser.displayName || undefined,
          email: fbUser.email || undefined,
          profile_image: fbUser.photoURL || undefined,
        });
        setStoredToken(verifyRes.token);
        const isAdminUser = checkIsAdmin(verifyRes.user);
        setUser({ ...verifyRes.user, role: isAdminUser ? 'admin' : (verifyRes.user.role || 'user') });
        setPreferences(verifyRes.preferences);
      } catch {
        const isAdminUser = checkIsAdmin(fbUser.uid);
        setUser({
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || (isAdminUser ? 'TravelWise Administrator' : 'Traveler'),
          email: fbUser.email || '',
          profile_image: fbUser.photoURL || undefined,
          role: isAdminUser ? 'admin' : 'user',
          created_at: new Date().toISOString(),
        });
      }
    } else {
      const token = getStoredToken();
      if (token) {
        try {
          const res = await apiAuth.getMe();
          if (res && res.user) {
            const isAdm = checkIsAdmin(res.user);
            setUser({ ...res.user, role: isAdm ? 'admin' : (res.user.role || 'user') });
            setPreferences(res.preferences);
          }
        } catch {
          removeStoredToken();
          setUser(null);
          setPreferences(null);
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register,
        signup: register,
        signInWithGoogle,
        demoLogin,
        logout,
        updateProfile,
        updatePreferences,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
