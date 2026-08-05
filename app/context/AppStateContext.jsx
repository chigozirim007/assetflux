'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, SESSION_EXPIRY_SECONDS } from '../lib/supabase';

const DEFAULT_CATEGORIES = [];

const DEFAULT_NOTIFICATIONS = {
  priceAlerts: true,
  eventAlerts: true,
  socialAlerts: true,
  webPush: false,
};

const DEFAULT_POSTS = [];

const AppStateContext = createContext(null);

const DEFAULT_USER = {
  id: null,
  username: '',
  name: '',
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  created_at: '',
  verified: false,
  activityScore: 0,
  role: 'user',
};

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const entry = document.cookie
    .split('; ')
    .find(item => item.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.split('=').slice(1).join('=')) : null;
}

function persistInterests(categories) {
  try { localStorage.setItem('assetflux_interests', JSON.stringify(categories)); } catch {}
  if (typeof document !== 'undefined') {
    document.cookie = `assetflux_interests=${encodeURIComponent(JSON.stringify(categories))}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

export function AppStateProvider({ children }) {
  const [selectedCategories, setSelectedCategories] = useState(DEFAULT_CATEGORIES);
  const [viewMode, setViewMode] = useState('compact');
  const [feedMode, setFeedMode] = useState('global');
  const [terminalMode, setTerminalMode] = useState(true);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [subscribedCreators, setSubscribedCreators] = useState([]);
  const [posts, setPosts] = useState(DEFAULT_POSTS);
  const [locale, setLocale] = useState('en-US');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');

  const [user, setUser] = useState(DEFAULT_USER);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const resetSignedInState = () => {
    setUser(DEFAULT_USER);
    setSelectedCategories(DEFAULT_CATEGORIES);
    setFollowedUsers([]);
    setSubscribedCreators([]);
    setPosts(DEFAULT_POSTS);

    // Thoroughly wipe all stored user data, auth tokens, and cached state
    try {
      if (typeof window !== 'undefined') {
        // Clear specific app storage items
        localStorage.removeItem('assetflux_user');
        localStorage.removeItem('assetflux_app_state_v1');
        localStorage.removeItem('assetflux_interests');
        localStorage.removeItem('af_prices_v3');

        // Clear all Supabase auth tokens & assetflux keys from localStorage
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.startsWith('assetflux') || key.startsWith('af_'))) {
            localStorage.removeItem(key);
          }
        }

        // Clear sessionStorage
        sessionStorage.clear();
      }
    } catch {
      // ignore storage cleanup failures
    }

    // Expire and clear all cookies
    if (typeof document !== 'undefined') {
      try {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        }
      } catch {
        // ignore cookie cleanup failures
      }
    }
  };

  useEffect(() => {
    try {
      const rawInterests = localStorage.getItem('assetflux_interests') || readCookie('assetflux_interests');
      let hasSignupInterests = false;
      if (rawInterests) {
        const interests = JSON.parse(rawInterests);
        if (Array.isArray(interests)) {
          setSelectedCategories(interests);
          hasSignupInterests = true;
        }
      }

      const raw = localStorage.getItem('assetflux_app_state_v1');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!hasSignupInterests && Array.isArray(parsed.selectedCategories)) setSelectedCategories(parsed.selectedCategories);
      if (parsed.viewMode) setViewMode(parsed.viewMode);
      if (parsed.feedMode) setFeedMode(parsed.feedMode);
      if (typeof parsed.terminalMode === 'boolean') setTerminalMode(parsed.terminalMode);
      if (parsed.notifications) setNotifications(prev => ({ ...prev, ...parsed.notifications }));
      if (Array.isArray(parsed.followedUsers)) setFollowedUsers(parsed.followedUsers);
      if (Array.isArray(parsed.subscribedCreators)) setSubscribedCreators(parsed.subscribedCreators);
      if (Array.isArray(parsed.posts)) setPosts(parsed.posts);
      if (parsed.locale) setLocale(parsed.locale);
      if (parsed.timezone) setTimezone(parsed.timezone);
    } catch {
      // ignore bad cache
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function applyAuthUser(authUser) {
      if (!active) return;
      if (!authUser) {
        resetSignedInState();
        setSession(null);
        setAuthLoading(false);
        return;
      }

      const meta = authUser.user_metadata || {};
      const nextUser = {
        id: authUser.id,
        email: authUser.email || '',
        username: meta.username || authUser.email?.split('@')[0] || '',
        firstName: meta.firstName || '',
        lastName: meta.lastName || '',
        phone: meta.phone || '',
        name: [meta.firstName, meta.lastName].filter(Boolean).join(' ') || meta.username || authUser.email || '',
        created_at: authUser.created_at || '',
      };

      setUser(prev => ({ ...prev, ...nextUser }));
      setAuthLoading(false);

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, email, first_name, last_name, phone, interests, verified, created_at, role')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!active || !profile) return;

      if (Array.isArray(profile.interests)) {
        setSelectedCategories(profile.interests);
        persistInterests(profile.interests);
      }

      setUser(prev => ({
        ...prev,
        username: profile.username || prev.username,
        email: profile.email || prev.email,
        firstName: profile.first_name || prev.firstName,
        lastName: profile.last_name || prev.lastName,
        phone: profile.phone || prev.phone,
        verified: !!profile.verified,
        role: profile.role || 'user',
        created_at: profile.created_at || prev.created_at,
        name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || prev.name,
      }));
    }

    function isSessionExpired(session) {
      if (!session) return true;
      // Check token expiry from the JWT 'exp' claim
      const expiresAt = session.expires_at; // Unix timestamp in seconds
      if (expiresAt && Date.now() / 1000 > expiresAt) return true;
      // Also enforce our own max session age from user creation/last sign-in
      const issuedAt = session.token?.iat || (session.user?.last_sign_in_at
        ? new Date(session.user.last_sign_in_at).getTime() / 1000
        : null);
      if (issuedAt && (Date.now() / 1000 - issuedAt) > SESSION_EXPIRY_SECONDS) return true;
      return false;
    }

    async function loadSessionProfile() {
      try {
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise(resolve => setTimeout(() => resolve({ data: { session: null } }), 4000)),
        ]);
        const { data: sessionData } = sessionResult;
        if (!active) return;

        const currentSession = sessionData?.session || null;

        // Force sign-out if the session is stale (older than SESSION_EXPIRY_SECONDS)
        if (currentSession && isSessionExpired(currentSession)) {
          console.info('Session expired — signing out automatically.');
          await supabase.auth.signOut();
          resetSignedInState();
          setSession(null);
          setAuthLoading(false);
          return;
        }

        setSession(currentSession);
        const authUser = currentSession?.user || null;
        applyAuthUser(authUser);
      } catch {
        if (!active) return;
        resetSignedInState();
        setSession(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    let listener;
    try {
      const authListener = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession || null);
        applyAuthUser(nextSession?.user || null);
      });
      listener = authListener.data;
    } catch {
      setAuthLoading(false);
    }

    loadSessionProfile();
    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const payload = {
      selectedCategories,
      viewMode,
      feedMode,
      terminalMode,
      notifications,
      followedUsers,
      subscribedCreators,
      posts,
      locale,
      timezone,
      user,
    };
    try {
      if (session?.user) {
        localStorage.setItem('assetflux_app_state_v1', JSON.stringify(payload));
      }
    } catch {
      // ignore persistence failures
    }
  }, [selectedCategories, viewMode, feedMode, terminalMode, notifications, followedUsers, subscribedCreators, posts, locale, timezone, user, session]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    resetSignedInState();
  };

  const getAuthor = () => ({
    id: user.id || user.username || user.email || 'local-user',
    username: user.username || user.email?.split('@')[0] || 'assetflux_user',
    name: user.name || user.username || 'AssetFlux User',
  });

  const value = useMemo(() => ({
    selectedCategories,
    setSelectedCategories,
    viewMode,
    setViewMode,
    feedMode,
    setFeedMode,
    terminalMode,
    setTerminalMode,
    notifications,
    setNotifications,
    followedUsers,
    setFollowedUsers,
    subscribedCreators,
    setSubscribedCreators,
    posts,
    setPosts,
    locale,
    setLocale,
    timezone,
    setTimezone,
    user,
    setUser,
    session,
    authLoading,
    isAuthenticated: !!session?.user,
    isAdmin: user.role === 'admin',
    refreshProfile: async () => {
      if (!session?.user?.id) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, email, first_name, last_name, phone, interests, verified, created_at, role')
        .eq('id', session.user.id)
        .maybeSingle();
      if (profile) {
        setUser(prev => ({
          ...prev,
          username: profile.username || prev.username,
          email: profile.email || prev.email,
          firstName: profile.first_name || prev.firstName,
          lastName: profile.last_name || prev.lastName,
          phone: profile.phone || prev.phone,
          verified: !!profile.verified,
          role: profile.role || 'user',
          created_at: profile.created_at || prev.created_at,
          name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || prev.name,
        }));
      }
    },
    signOut,
    replaceSelectedCategories: (categories) => {
      setSelectedCategories(categories);
      persistInterests(categories);
    },
    toggleCategory: (category) => {
      setSelectedCategories(prev => prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]);
    },
    toggleFollow: (username) => {
      setFollowedUsers(prev => prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]);
    },
    toggleSubscribe: (creatorId) => {
      setSubscribedCreators(prev => prev.includes(creatorId)
        ? prev.filter(id => id !== creatorId)
        : [...prev, creatorId]);
    },
    createPost: ({ category, content }) => {
      const author = getAuthor();
      const now = new Date().toISOString();
      const post = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
        category,
        content,
        author,
        likes: [],
        comments: [],
        createdAt: now,
        updatedAt: now,
      };
      setPosts(prev => [post, ...prev]);
      return post;
    },
    updatePost: (postId, payload) => {
      setPosts(prev => prev.map(post => post.id === postId
        ? { ...post, ...payload, updatedAt: new Date().toISOString() }
        : post));
    },
    deletePost: (postId) => {
      setPosts(prev => prev.filter(post => post.id !== postId));
    },
    toggleLikePost: (postId) => {
      const author = getAuthor();
      setPosts(prev => prev.map(post => {
        if (post.id !== postId) return post;
        const likes = post.likes || [];
        return {
          ...post,
          likes: likes.includes(author.id)
            ? likes.filter(id => id !== author.id)
            : [...likes, author.id],
        };
      }));
    },
    addComment: (postId, content) => {
      const author = getAuthor();
      setPosts(prev => prev.map(post => post.id === postId
        ? {
            ...post,
            comments: [
              ...(post.comments || []),
              {
                id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
                content,
                author,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        : post));
    },
    updateNotification: (key, value) => {
      setNotifications(prev => ({ ...prev, [key]: value }));
    },
    isFollowing: (username) => followedUsers.includes(username),
    isSubscribed: (creatorId) => subscribedCreators.includes(creatorId),
  }), [selectedCategories, viewMode, feedMode, terminalMode, notifications, followedUsers, subscribedCreators, posts, locale, timezone, user]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

