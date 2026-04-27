import { useEffect, useState, useRef } from 'react';
import { Home, Compass, Bookmark, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const WARM = '#F4A261';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const TABS = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'explore', label: 'Explore', icon: Compass, path: '/stays/delhi' },
  { id: 'saved', label: 'Saved', icon: Bookmark, path: '/' },
  { id: 'profile', label: 'Profile', icon: User, path: '/auth/login' },
] as const;

export default function MobileBottomNav({ currentPath, onNavigate }: MobileBottomNavProps) {
  const { user, host } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef(Date.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        rafRef.current = window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const currentTime = Date.now();
          const timeDiff = currentTime - lastScrollTime.current;

          if (timeDiff > 50) {
            lastScrollTime.current = currentTime;

            if (currentScrollY > lastScrollY && currentScrollY > 50) {
              setIsVisible(false);
            } else if (currentScrollY < lastScrollY) {
              setIsVisible(true);
            }

            setLastScrollY(currentScrollY);

            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }

            scrollTimeoutRef.current = setTimeout(() => {
              setIsVisible(true);
            }, 300);
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [lastScrollY]);

  const shouldHide =
    currentPath.startsWith('/auth') ||
    currentPath.startsWith('/host/') ||
    currentPath.includes('/property/');

  if (shouldHide) return null;

  const getActiveTab = () => {
    if (currentPath === '/' || currentPath === '') return 'home';
    if (currentPath.startsWith('/stays/')) return 'explore';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: typeof TABS[number]) => {
    if (tab.id === 'home') {
      if (currentPath === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        onNavigate('/');
      }
    } else if (tab.id === 'profile') {
      if (user && host) {
        onNavigate(`/host/${host.id}/dashboard/overview`);
      } else {
        onNavigate('/auth/login');
      }
    } else {
      onNavigate(tab.path);
    }
  };

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50
        md:hidden
        transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}
      style={{ willChange: 'transform, opacity', height: 72 }}
    >
      <div
        className="h-full"
        style={{
          background: 'rgba(26,26,26,0.92)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-around h-full px-2 safe-area-inset-bottom">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all"
                style={{
                  color: isActive ? WARM : 'rgba(255,255,255,0.35)',
                }}
              >
                {isActive && (
                  <div
                    className="absolute -top-0.5 w-6 h-0.5 rounded-full"
                    style={{
                      background: WARM,
                      boxShadow: `0 0 8px ${WARM}80`,
                    }}
                  />
                )}
                <Icon
                  className="w-6 h-6 transition-all"
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span
                  className="text-[11px] transition-all"
                  style={{ fontWeight: isActive ? 700 : 500 }}
                >
                  {tab.id === 'profile' && user ? 'Dashboard' : tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
