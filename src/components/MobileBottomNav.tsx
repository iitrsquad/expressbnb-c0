import { useEffect, useState, useRef } from 'react';
import { Search, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

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

          // Only process if enough time has passed (throttle)
          if (timeDiff > 50) {
            lastScrollTime.current = currentTime;

            // Scrolling down
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
              setIsVisible(false);
            }
            // Scrolling up
            else if (currentScrollY < lastScrollY) {
              setIsVisible(true);
            }

            setLastScrollY(currentScrollY);

            // Clear existing timeout
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }

            // Show nav after user stops scrolling
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
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [lastScrollY]);

  // Determine if we should hide the nav based on current path
  const shouldHide =
    currentPath.startsWith('/auth') ||
    currentPath.startsWith('/host/') ||
    currentPath.includes('/property/');

  if (shouldHide) {
    return null;
  }

  const isHomePage = currentPath === '/' || currentPath === '';

  const handleExploreClick = () => {
    if (!isHomePage) {
      onNavigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleHostClick = () => {
    if (user && host) {
      onNavigate(`/host/${host.id}/dashboard/overview`);
    } else {
      onNavigate('/auth/login');
    }
  };

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50
        md:hidden
        px-4 pb-4
        transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="relative">
        {/* Premium glassmorphic backdrop with rounded corners */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50" />

        {/* Subtle top highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent rounded-t-3xl" />

        {/* Content */}
        <div className="relative flex items-center justify-around px-4 py-4 safe-area-inset-bottom">
          {/* Explore */}
          <button
            onClick={handleExploreClick}
            className={`
              relative flex flex-col items-center justify-center gap-1.5 px-8 py-2.5 rounded-2xl
              transition-all duration-300 ease-out
              ${isHomePage
                ? 'text-[#cc2b5e] scale-105'
                : 'text-gray-500 active:scale-95 hover:bg-gray-50'
              }
            `}
          >
            {/* Active indicator */}
            {isHomePage && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] rounded-full animate-pulse" />
            )}

            <div className={`
              transition-all duration-300
              ${isHomePage ? 'transform scale-110' : ''}
            `}>
              <Search
                className={`w-6 h-6 transition-all duration-300 ${isHomePage ? 'stroke-[2.5]' : 'stroke-2'}`}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </div>
            <span className={`text-xs font-medium transition-all duration-300 ${isHomePage ? 'font-bold' : ''}`}>
              Explore Stays
            </span>
          </button>

          {/* Host Login/Dashboard */}
          <button
            onClick={handleHostClick}
            className={`
              relative flex flex-col items-center justify-center gap-1.5 px-8 py-2.5 rounded-2xl
              transition-all duration-300 ease-out
              ${currentPath.startsWith('/auth') || currentPath.startsWith('/host')
                ? 'text-[#cc2b5e] scale-105'
                : 'text-gray-500 active:scale-95 hover:bg-gray-50'
              }
            `}
          >
            {/* Active indicator */}
            {(currentPath.startsWith('/auth') || currentPath.startsWith('/host')) && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] rounded-full animate-pulse" />
            )}

            <div className={`
              transition-all duration-300
              ${(currentPath.startsWith('/auth') || currentPath.startsWith('/host')) ? 'transform scale-110' : ''}
            `}>
              <User
                className={`w-6 h-6 transition-all duration-300 ${
                  currentPath.startsWith('/auth') || currentPath.startsWith('/host')
                    ? 'stroke-[2.5]'
                    : 'stroke-2'
                }`}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </div>
            <span className={`text-xs font-medium transition-all duration-300 ${
              currentPath.startsWith('/auth') || currentPath.startsWith('/host')
                ? 'font-bold'
                : ''
            }`}>
              {user && host ? 'Dashboard' : 'Host Login'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
