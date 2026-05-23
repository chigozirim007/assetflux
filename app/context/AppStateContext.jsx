'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_CATEGORIES = [];

const DEFAULT_NOTIFICATIONS = {
  priceAlerts: true,
  eventAlerts: true,
  socialAlerts: true,
  webPush: false,
};

const AppStateContext = createContext(null);

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
  const [locale, setLocale] = useState('en-US');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');

  const [user, setUser] = useState({
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
  });

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

      const rawUser = localStorage.getItem('assetflux_user');
      if (rawUser) {
        const cachedUser = JSON.parse(rawUser);
        setUser(prev => ({ ...prev, ...cachedUser }));
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
      if (parsed.locale) setLocale(parsed.locale);
      if (parsed.timezone) setTimezone(parsed.timezone);
      if (parsed.user) setUser(prev => ({ ...prev, ...parsed.user }));
    } catch {
      // ignore bad cache
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSessionProfile() {
      const { data } = await supabase.auth.getUser();
      const authUser = data?.user;
      if (!active || !authUser) return;

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, email, first_name, last_name, phone, interests, verified, created_at')
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
        created_at: profile.created_at || prev.created_at,
        name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || prev.name,
      }));
    }

    loadSessionProfile();
    return () => { active = false; };
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
      locale,
      timezone,
      user,
    };
    try {
      localStorage.setItem('assetflux_app_state_v1', JSON.stringify(payload));
    } catch {
      // ignore persistence failures
    }
  }, [selectedCategories, viewMode, feedMode, terminalMode, notifications, followedUsers, subscribedCreators, locale, timezone, user]);

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
    locale,
    setLocale,
    timezone,
    setTimezone,
    user,
    setUser,
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
    updateNotification: (key, value) => {
      setNotifications(prev => ({ ...prev, [key]: value }));
    },
    isFollowing: (username) => followedUsers.includes(username),
    isSubscribed: (creatorId) => subscribedCreators.includes(creatorId),
  }), [selectedCategories, viewMode, feedMode, terminalMode, notifications, followedUsers, subscribedCreators, locale, timezone, user]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

