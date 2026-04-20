import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';

interface PreloaderProps {
  isLoading: boolean;
}

export default function Preloader({ isLoading }: PreloaderProps) {
  const [shouldRender, setShouldRender] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
      setIsVisible(true);
    }
  }, [isLoading]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-pink-50 to-purple-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="relative mb-6 animate-pulse-scale">
          <div className="absolute inset-0 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] rounded-2xl blur-xl opacity-50 animate-pulse" />
          <div className="relative bg-gradient-to-r from-[#cc2b5e] to-[#753a88] p-6 rounded-2xl shadow-2xl">
            <Home className="w-16 h-16 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#cc2b5e] to-[#753a88] bg-clip-text text-transparent">
            XpressBnB
          </h1>
        </div>
        <div className="mt-6 flex gap-2">
          <div className="w-2 h-2 bg-[#cc2b5e] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-[#753a88] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-[#cc2b5e] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
