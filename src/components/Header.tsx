import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onAboutClick: () => void;
  onBlogClick: () => void;
  onHostLoginClick?: () => void;
}

export default function Header({ onAboutClick, onBlogClick, onHostLoginClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <header
      className="sticky top-0 z-50 bg-white"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-10 flex items-center justify-between h-[60px] md:h-[72px]">
        <button onClick={goHome} className="flex items-center gap-2">
          <img
            src="/90d3767f-65eb-431d-8005-c9f9bb5f2fde.png"
            alt="XpressBnB"
            className="h-8 md:h-9 w-8 md:w-9 object-contain"
          />
          <span className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
            Xpress<span className="text-[#ff385c]">BnB</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={goHome}
            className="px-5 py-2 rounded-full text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Homes
          </button>
          <button
            disabled
            className="px-5 py-2 rounded-full text-sm font-semibold text-gray-400 cursor-default"
          >
            Experiences
          </button>
          <button
            disabled
            className="px-5 py-2 rounded-full text-sm font-semibold text-gray-400 cursor-default"
          >
            Services
          </button>
          <button
            onClick={onAboutClick}
            className="px-5 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            About
          </button>
          <button
            onClick={onBlogClick}
            className="px-5 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Blog
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {onHostLoginClick && (
            <button
              onClick={onHostLoginClick}
              className="bg-[#ff385c] text-white rounded-full px-5 md:px-6 py-2 md:py-2.5 font-semibold text-sm hover:bg-[#e8314f] transition-colors shadow-sm"
            >
              Host Login
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-3 space-y-1">
            <button
              onClick={() => { setMobileMenuOpen(false); onAboutClick(); }}
              className="block w-full text-left px-5 py-3 text-gray-700 hover:bg-gray-50 rounded-full font-semibold transition-colors"
            >
              About
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onBlogClick(); }}
              className="block w-full text-left px-5 py-3 text-gray-700 hover:bg-gray-50 rounded-full font-semibold transition-colors"
            >
              Blog
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
