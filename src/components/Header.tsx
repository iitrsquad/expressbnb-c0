import { Menu, X, LogIn } from 'lucide-react';
import { useState } from 'react';
import AnimatedLogo from './AnimatedLogo';

interface HeaderProps {
  onAboutClick: () => void;
  onBlogClick: () => void;
  onHostLoginClick?: () => void;
}

export default function Header({ onAboutClick, onBlogClick, onHostLoginClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-100">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div>
                <AnimatedLogo />
                <p className="text-xs text-gray-500 font-medium tracking-wide">India's Smarter Stay</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-3">
              <button onClick={onAboutClick} className="px-5 py-2.5 text-gray-700 hover:bg-gray-50 font-semibold rounded-full transition-all">
                About
              </button>
              <button onClick={onBlogClick} className="px-5 py-2.5 text-gray-700 hover:bg-gray-50 font-semibold rounded-full transition-all">
                Blog
              </button>
              {onHostLoginClick && (
                <button
                  onClick={onHostLoginClick}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white font-semibold rounded-full hover:from-[#d64371] hover:to-[#8a4b9e] transition-all shadow-md hover:shadow-lg"
                >
                  <LogIn className="w-4 h-4" />
                  Host Login
                </button>
              )}
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <nav className="px-4 py-4 space-y-2">
              <button onClick={onAboutClick} className="block w-full text-left px-5 py-3 text-gray-700 hover:bg-gray-50 rounded-full font-semibold transition-colors">
                About
              </button>
              <button onClick={onBlogClick} className="block w-full text-left px-5 py-3 text-gray-700 hover:bg-gray-50 rounded-full font-semibold transition-colors">
                Blog
              </button>
              {onHostLoginClick && (
                <button
                  onClick={onHostLoginClick}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white font-semibold rounded-full hover:from-[#d64371] hover:to-[#8a4b9e] transition-all shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  Host Login
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
