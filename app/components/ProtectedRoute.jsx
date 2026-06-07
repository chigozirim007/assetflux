'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppState } from '../context/AppStateContext';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authLoading, isAuthenticated } = useAppState();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const next = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/signin?next=${next}`);
    }
  }, [authLoading, isAuthenticated, pathname, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05060f] text-white flex items-center justify-center p-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4 text-sm text-zinc-400">
          Checking your session...
        </div>
      </div>
    );
  }

  return children;
}
