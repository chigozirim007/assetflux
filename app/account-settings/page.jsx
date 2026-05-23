'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useAppState } from '../context/AppStateContext';

const CATEGORIES = [
  { id: 'crypto', label: 'Crypto', description: 'Digital assets and token markets' },
  { id: 'forex', label: 'Forex', description: 'Currencies and macro pairs' },
  { id: 'stocks', label: 'Stocks', description: 'Companies and equity markets' },
  { id: 'shares', label: 'Shares & ETFs', description: 'Funds, indexes, and baskets' },
  { id: 'real-estate', label: 'Real Estate', description: 'REITs and property-linked assets' },
];

function Field({ label, value, onChange, type = 'text', placeholder, autoComplete }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-zinc-400 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
      />
    </label>
  );
}

export default function AccountSettingsPage() {
  const { user, setUser, selectedCategories, replaceSelectedCategories } = useAppState();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const categoriesDirty = useRef(false);
  const categoriesRef = useRef([]);

  useEffect(() => {
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
    });
  }, [user]);

  useEffect(() => {
    if (categoriesDirty.current) return;
    setCategories(selectedCategories);
    categoriesRef.current = selectedCategories;
  }, [selectedCategories]);

  const fullName = useMemo(
    () => [form.firstName, form.lastName].filter(Boolean).join(' ') || form.username || form.email,
    [form.firstName, form.lastName, form.username, form.email]
  );

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleCategory = (category) => {
    categoriesDirty.current = true;
    setCategories(prev => {
      const next = prev.includes(category)
        ? prev.filter(item => item !== category)
        : [...prev, category];
      categoriesRef.current = next;
      return next;
    });
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const { data } = await supabase.auth.getUser();
      const authUser = data?.user;

      const categoriesToSave = categoriesRef.current;

      if (authUser) {
        const authPayload = {
          data: {
            firstName: form.firstName,
            lastName: form.lastName,
            username: form.username,
            phone: form.phone,
          },
        };

        if (form.email && form.email !== authUser.email) authPayload.email = form.email;
        if (form.password) authPayload.password = form.password;

        const { error: authError } = await supabase.auth.updateUser(authPayload);
        if (authError) throw authError;

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            username: form.username,
            email: form.email,
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
            interests: categoriesToSave,
          })
          .eq('id', authUser.id);

        if (profileError) throw profileError;
      }

      const nextUser = {
        ...user,
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        phone: form.phone,
        name: fullName,
      };

      setUser(nextUser);
      replaceSelectedCategories(categoriesToSave);
      localStorage.setItem('assetflux_interests', JSON.stringify(categoriesToSave));
      document.cookie = `assetflux_interests=${encodeURIComponent(JSON.stringify(categoriesToSave))}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem('assetflux_user', JSON.stringify(nextUser));
      try {
        const cached = JSON.parse(localStorage.getItem('assetflux_app_state_v1') || '{}');
        localStorage.setItem('assetflux_app_state_v1', JSON.stringify({
          ...cached,
          user: nextUser,
          selectedCategories: categoriesToSave,
        }));
      } catch {
        localStorage.setItem('assetflux_app_state_v1', JSON.stringify({
          user: nextUser,
          selectedCategories: categoriesToSave,
        }));
      }
      setMessage(authUser ? 'Account settings saved.' : 'Settings saved on this device. Sign in to sync them to your account.');
      set('password', '');
    } catch (err) {
      setError(err.message || 'Unable to save settings right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060f] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">Account Settings</h1>
            <p className="text-sm text-zinc-500">Update your profile, sign-in details, and market interests.</p>
          </div>
          <Link href="/dashboard" className="px-3 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-300 hover:border-violet-500">
            Back to dashboard
          </Link>
        </div>

        <form onSubmit={save} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First name" value={form.firstName} onChange={value => set('firstName', value)} autoComplete="given-name" />
            <Field label="Last name" value={form.lastName} onChange={value => set('lastName', value)} autoComplete="family-name" />
            <Field label="Username" value={form.username} onChange={value => set('username', value.replace(/\s/g, ''))} autoComplete="username" />
            <Field label="Phone" value={form.phone} onChange={value => set('phone', value)} autoComplete="tel" />
            <Field label="Email" type="email" value={form.email} onChange={value => set('email', value)} autoComplete="email" />
            <Field label="New password" type="password" value={form.password} onChange={value => set('password', value)} placeholder="Leave blank to keep current password" autoComplete="new-password" />
          </div>

          <div>
            <h2 className="text-sm font-bold mb-2">Market Interests</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map(category => {
                const active = categories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`text-left rounded-xl border p-4 transition ${
                      active
                        ? 'border-violet-500 bg-violet-600/15'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold">{category.label}</span>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${active ? 'bg-violet-600 border-violet-500' : 'border-zinc-700'}`}>
                        {active ? 'On' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{category.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {message && <p className="rounded-xl border border-emerald-700/40 bg-emerald-900/10 p-3 text-sm text-emerald-300">{message}</p>}
          {error && <p className="rounded-xl border border-red-700/40 bg-red-900/10 p-3 text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
