'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppState } from '../context/AppStateContext';

export const NAV_LINKS = [
  { label: 'Dashboard',   href: '/dashboard', requiresAuth: true },
  { label: 'Experts',     href: '/experts'      },
  { label: 'Forex',       href: '/forex'         },
  { label: 'Crypto',      href: '/crypto'        },
  { label: 'Stocks',      href: '/stocks'        },
  { label: 'Shares',      href: '/shares'        },
  { label: 'Real Estate', href: '/real-estate'   },
  { label: 'Marketplace', href: '/marketplace', requiresAuth: true },
];

export function getVisibleNavLinks(isAuthenticated) {
  return NAV_LINKS.filter(link => isAuthenticated || !link.requiresAuth);
}

export default function Header({ active }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { authLoading, isAuthenticated, signOut, user } = useAppState();
  const visibleLinks = getVisibleNavLinks(isAuthenticated);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    router.replace('/signin');
  };

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-5 max-w-7xl mx-auto relative z-40">

        {/* Logo */}
        <Link href="/" className="text-lg sm:text-2xl font-black tracking-tighter uppercase flex-shrink-0 hover:opacity-80 transition">
          Asset<span className="text-violet-400">Flux</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex gap-4 xl:gap-8 font-medium text-zinc-400">
          {visibleLinks.map(link => {
            const isActive = active && link.href.includes(active);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition whitespace-nowrap text-sm xl:text-base ${
                  isActive ? 'text-violet-400 font-semibold' : 'hover:text-violet-400'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Auth buttons + hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!authLoading && isAuthenticated ? (
            <>
              <Link href="/profile" className="hidden sm:flex text-zinc-300 border border-zinc-700 px-3 xs:px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold hover:border-violet-500 hover:text-violet-300 transition text-[11px] xs:text-xs sm:text-sm whitespace-nowrap">
                {user.username ? `@${user.username}` : 'Profile'}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden sm:flex bg-zinc-100 text-zinc-950 px-3 xs:px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold hover:bg-white transition-all text-[11px] xs:text-xs sm:text-sm whitespace-nowrap"
              >
                Logout
              </button>
            </>
          ) : !authLoading ? (
            <>
              <Link href="/signin" className="hidden sm:flex text-zinc-300 border border-zinc-700 px-3 xs:px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold hover:border-violet-500 hover:text-violet-300 transition text-[11px] xs:text-xs sm:text-sm whitespace-nowrap">
                Sign in
              </Link>
              <Link href="/signup" className="hidden sm:flex bg-violet-600 text-white px-3 xs:px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] hover:bg-violet-500 transition-all text-[11px] xs:text-xs sm:text-sm whitespace-nowrap">
                Sign up
              </Link>
            </>
          ) : null}

          {/* Hamburger - visible below lg */}
          <button
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(p => !p)}
            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 rounded-lg border border-zinc-700 hover:border-violet-600 transition ml-0.5 flex-shrink-0"
          >
            <span className={`block w-4 h-0.5 bg-zinc-300 transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-4 h-0.5 bg-zinc-300 transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-4 h-0.5 bg-zinc-300 transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-violet-900/30 ${
          menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col px-6 py-4 max-w-7xl mx-auto">
          {visibleLinks.map(link => {
            const isActive = active && link.href.includes(active);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`py-3 text-base font-medium border-b border-zinc-800/60 last:border-0 transition ${
                  isActive ? 'text-violet-400' : 'text-zinc-300 hover:text-violet-400'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          {/* Mobile Auth Links */}
          {!authLoading && (
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-zinc-800/60 sm:hidden pb-2">
              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="py-2.5 text-center text-zinc-300 border border-zinc-700 rounded-full font-semibold hover:text-violet-300 hover:border-violet-500 transition">
                    Profile
                  </Link>
                  <button type="button" onClick={handleSignOut} className="py-2.5 text-center bg-zinc-100 text-zinc-950 rounded-full font-bold hover:bg-white transition">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signin" onClick={() => setMenuOpen(false)} className="py-2.5 text-center text-zinc-300 border border-zinc-700 rounded-full font-semibold hover:text-violet-300 hover:border-violet-500 transition">
                    Sign in
                  </Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="py-2.5 text-center bg-violet-600 text-white rounded-full font-bold hover:bg-violet-500 transition shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

