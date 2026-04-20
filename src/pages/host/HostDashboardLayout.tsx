import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Building2,
  Calendar,
  Download,
  BookOpen,
  DollarSign,
  Activity,
  Star,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import AnimatedLogo from '../../components/AnimatedLogo';

interface HostDashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  hostId: string;
}

export default function HostDashboardLayout({
  children,
  currentPage,
  onNavigate,
  hostId,
}: HostDashboardLayoutProps) {
  const { host, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: 'overview', name: 'Overview', icon: Home, path: `/host/${hostId}/dashboard/overview` },
    { id: 'properties', name: 'Properties', icon: Building2, path: `/host/${hostId}/dashboard/properties` },
    { id: 'calendar', name: 'Calendar', icon: Calendar, path: `/host/${hostId}/dashboard/calendar` },
    { id: 'bookings', name: 'Bookings', icon: BookOpen, path: `/host/${hostId}/dashboard/bookings` },
    { id: 'earnings', name: 'Earnings', icon: DollarSign, path: `/host/${hostId}/dashboard/earnings` },
    { id: 'realtime', name: 'Analytics', icon: Activity, path: `/host/${hostId}/dashboard/realtime` },
    { id: 'reviews', name: 'Reviews', icon: Star, path: `/host/${hostId}/dashboard/reviews` },
    { id: 'subscription', name: 'Subscription', icon: CreditCard, path: `/host/${hostId}/dashboard/subscription` },
    { id: 'settings', name: 'Settings', icon: Settings, path: `/host/${hostId}/dashboard/settings` },
    { id: 'support', name: 'Support', icon: HelpCircle, path: `/host/${hostId}/dashboard/support` },
  ];

  const handleSignOut = async () => {
    await signOut();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <AnimatedLogo />
            <p className="text-xs text-gray-600 mt-0.5">Host Dashboard</p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <AnimatedLogo />
            <p className="text-sm text-gray-600 mt-1">Host Dashboard</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] rounded-full flex items-center justify-center text-white font-semibold">
                  {host?.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{host?.name}</p>
                  <p className="text-xs text-gray-600 truncate">{host?.email}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
