'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DEFAULT_CATEGORIES = ['crypto', 'forex', 'stocks'];

const DEFAULT_NOTIFICATIONS = {
  priceAlerts: true,
  eventAlerts: true,
  socialAlerts: true,
  webPush: false,
};

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [selectedCategories, setSelectedCategories] = useState(DEFAULT_CATEGORIES);
  const [viewMode, setViewMode] = useState('compact');
  const [feedMode, setFeedMode] = useState('global');
  const [terminalMode, setTerminalMode] = useState(true);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [followedUsers, setFollowedUsers] = useState(['AlphaTrader']);
  const [subscribedCreators, setSubscribedCreators] = useState([]);
  const [locale, setLocale] = useState('en-US');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');

  const [user, setUser] = useState({
    id: 'user-1',
    username: 'assetflux_user',
    name: 'AssetFlux User',
    created_at: '2022-01-10T00:00:00Z',
    verified: true,
    activityScore: 78,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('assetflux_app_state_v1');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.selectedCategories)) setSelectedCategories(parsed.selectedCategories);
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

