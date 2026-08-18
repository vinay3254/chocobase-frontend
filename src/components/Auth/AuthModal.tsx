import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  ArrowRight, 
  Github, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Zap, 
  Gamepad2 
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    signIn, 
    signUp, 
    setActiveView 
  } = useSupabase();

  const [mode, setMode] = useState<'signin' | 'signup' | 'magic_link'>(authModalMode || 'signin');
  const [email, setEmail] = useState('vinaygk219@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  React.useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode || 'signin');
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      setActiveView('overview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true);
    try {
      const demoEmail = provider === 'github' ? 'vinay.dev@github.com' : 'vinaygk219@gmail.com';
      if (mode === 'signup') {
        await signUp(demoEmail, undefined, provider);
      } else {
        await signIn(demoEmail, undefined, provider);
      }
      setActiveView('overview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async (demoEmail: string) => {
    setIsLoading(true);
    try {
      await signIn(demoEmail, 'password123', 'email');
      setActiveView('overview');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2B1D20]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl shadow-xl overflow-hidden text-[#2B1D20] my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E8DDD2] bg-[#FAF7F2] relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9B888C] hover:text-[#2B1D20] hover:bg-[#E8DDD2]/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#8B1E3F] flex items-center justify-center text-white shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-sm text-[#2B1D20] tracking-tight">supabase</span>
          </div>

          <h2 className="text-sm font-bold text-[#2B1D20]">
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Magic Link'}
          </h2>
          <p className="text-xs text-[#685559] mt-0.5">
            {mode === 'signin' ? 'Access your databases and studio projects.' : mode === 'signup' ? 'Get started with Postgres, Auth, and Storage.' : 'Send a passwordless login link to your inbox.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E8DDD2] bg-[#FFFDF9] text-xs font-medium">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              mode === 'signin' 
                ? 'border-[#8B1E3F] text-[#8B1E3F] font-bold bg-[#FAF7F2]/60' 
                : 'border-transparent text-[#685559] hover:text-[#2B1D20]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              mode === 'signup' 
                ? 'border-[#8B1E3F] text-[#8B1E3F] font-bold bg-[#FAF7F2]/60' 
                : 'border-transparent text-[#685559] hover:text-[#2B1D20]'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setMode('magic_link')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              mode === 'magic_link' 
                ? 'border-[#8B1E3F] text-[#8B1E3F] font-bold bg-[#FAF7F2]/60' 
                : 'border-transparent text-[#685559] hover:text-[#2B1D20]'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-3.5">
          {mode !== 'magic_link' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSocialAuth('github')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#E8DDD2] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-xs font-semibold text-[#2B1D20] transition-colors shadow-2xs"
              >
                <Github className="w-4 h-4" />
                <span>Continue with GitHub</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSocialAuth('google')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DDD2] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-xs font-medium text-[#2B1D20] transition-colors shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialAuth('discord')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DDD2] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-xs font-medium text-[#2B1D20] transition-colors shadow-2xs"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-[#5865F2]" />
                  <span>Discord</span>
                </button>
              </div>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-[#E8DDD2]" />
                <span className="text-[10px] uppercase font-bold text-[#9B888C] tracking-wider">or email</span>
                <div className="flex-1 h-px bg-[#E8DDD2]" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#2B1D20] mb-1">Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9B888C]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F]"
                />
              </div>
            </div>

            {mode !== 'magic_link' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#2B1D20]">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('magic_link')}
                      className="text-[11px] text-[#8B1E3F] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9B888C]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] font-mono focus:outline-hidden focus:border-[#8B1E3F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-[#9B888C] hover:text-[#2B1D20]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white transition-colors shadow-xs disabled:opacity-50 mt-1"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Send Link'}</span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo */}
          <div className="pt-2.5 border-t border-[#E8DDD2] space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-[#9B888C] tracking-wider text-center">
              Demo Access
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('vinaygk219@gmail.com')}
                className="p-2 rounded-lg border border-[#E8DDD2] bg-[#FFFDF9] hover:bg-[#FAF7F2] text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-[#2B1D20] truncate">vinaygk219@gmail.com</div>
                <div className="text-[10px] text-[#8B1E3F] font-mono">Admin</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn('alex160198@gmail.com')}
                className="p-2 rounded-lg border border-[#E8DDD2] bg-[#FFFDF9] hover:bg-[#FAF7F2] text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-[#2B1D20] truncate">alex160198@gmail.com</div>
                <div className="text-[10px] text-[#286E4F] font-mono">Developer</div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#9B888C] pt-0.5">
            <ShieldCheck className="w-3 h-3 text-[#286E4F]" />
            <span>PostgreSQL Row Level Security Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
