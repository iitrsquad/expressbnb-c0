import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight, TrendingUp, Shield, Zap, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: 'register' | 'forgot') => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    const { error } = await signInWithGoogle();

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  const features = [
    { icon: TrendingUp, text: 'Maximize your revenue' },
    { icon: Shield, text: 'Secure & verified' },
    { icon: Zap, text: 'Instant bookings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#cc2b5e]/20 to-[#753a88]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#753a88]/20 to-[#cc2b5e]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-100/30 to-purple-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Branding & Features (Desktop) */}
        <div className={`hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 transform transition-all duration-1000 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-3 mb-8 group cursor-pointer">
              <div className="w-14 h-14 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <LogIn className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#cc2b5e] to-[#753a88] bg-clip-text text-transparent">
                  XpressBnB
                </h2>
                <p className="text-sm text-gray-600">Host Dashboard</p>
              </div>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome back to your
              <span className="block bg-gradient-to-r from-[#cc2b5e] to-[#753a88] bg-clip-text text-transparent mt-2">
                hosting journey
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Manage your properties, track bookings, and grow your rental business Exponentially with our AI powered Host Dashboard.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 transform transition-all duration-700 ${
                    mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${(index + 2) * 200}ms` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#cc2b5e]/10 to-[#753a88]/10 rounded-xl flex items-center justify-center group hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-[#cc2b5e] group-hover:text-[#753a88] transition-colors" />
                  </div>
                  <span className="text-lg font-medium text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 flex items-center gap-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-white shadow-md"
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Join 5,000+ hosts</p>
                <p className="text-xs text-gray-600">Already earning with us</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className={`lg:hidden text-center pt-8 px-4 transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] rounded-2xl mb-4 shadow-xl transform hover:scale-105 transition-transform">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to manage your properties</p>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className={`max-w-md w-full transform transition-all duration-1000 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20 hover:shadow-3xl transition-shadow duration-500">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-shake">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      focusedField === 'email' ? 'text-[#cc2b5e]' : 'text-gray-400'
                    }`} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#cc2b5e]/20 focus:border-[#cc2b5e] focus:bg-white transition-all duration-300 outline-none text-gray-900 placeholder-gray-400"
                      placeholder="you@example.com"
                    />
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] transform origin-left transition-transform duration-300 ${
                      focusedField === 'email' ? 'scale-x-100' : 'scale-x-0'
                    }`}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      focusedField === 'password' ? 'text-[#cc2b5e]' : 'text-gray-400'
                    }`} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#cc2b5e]/20 focus:border-[#cc2b5e] focus:bg-white transition-all duration-300 outline-none text-gray-900 placeholder-gray-400"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#cc2b5e] transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#cc2b5e] to-[#753a88] transform origin-left transition-transform duration-300 ${
                      focusedField === 'password' ? 'scale-x-100' : 'scale-x-0'
                    }`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-lg border-2 border-gray-300 text-[#cc2b5e] focus:ring-[#cc2b5e] focus:ring-offset-0 cursor-pointer transition-all"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot')}
                    className="text-sm font-semibold text-[#cc2b5e] hover:text-[#753a88] transition-colors relative group"
                  >
                    Forgot password?
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#753a88] group-hover:w-full transition-all duration-300"></span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="group relative w-full bg-gradient-to-r from-[#cc2b5e] to-[#753a88] text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-[#cc2b5e]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#753a88] to-[#cc2b5e] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className="group w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-[#cc2b5e] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {googleLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Connecting...
                  </span>
                ) : (
                  'Sign in with Google'
                )}
              </button>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => onNavigate('register')}
                    className="font-bold text-[#cc2b5e] hover:text-[#753a88] transition-colors relative group inline-block"
                  >
                    Sign up
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#753a88] group-hover:w-full transition-all duration-300"></span>
                  </button>
                </p>
              </div>

              {/* Trust badges */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Secure Login</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Data Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
