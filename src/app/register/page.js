'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/login');
      } else {
        setError(data.error || 'Failed to register');
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-6 sm:py-12 bg-black sm:bg-gray-50/50 overflow-hidden">
      {/* Mobile only: the logo sits behind the form; its soft round mask hides the photo's square edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 sm:hidden bg-[url('/login-bg.jpeg')] bg-[length:108%_auto] bg-center bg-no-repeat
          [mask-image:radial-gradient(circle_closest-side,#000_86%,transparent_100%)]"
      />
      {/* Mobile only: orange-tinted fade at the bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-orange-950/50 to-transparent sm:hidden" />

      <div
        className="relative z-10 max-w-md w-full p-5 sm:p-8 rounded-3xl text-white sm:text-gray-900
          [text-shadow:0_1px_6px_rgba(0,0,0,0.75)] sm:[text-shadow:none]
          bg-gradient-to-b from-black/25 via-black/40 to-black/55 backdrop-blur-[3px] border border-white/20
          shadow-[0_0_60px_rgba(249,115,22,0.2)]
          sm:bg-white sm:bg-none sm:backdrop-blur-none sm:border-gray-200/80 sm:shadow-sm"
      >
        <h1 className="text-2xl sm:text-3xl font-black text-center mb-1 tracking-tight">Create an Account</h1>
        <p className="text-white/70 sm:text-gray-500 text-xs text-center mb-4 sm:mb-6 font-medium">
          Join HangOver to start shopping
        </p>

        {error && (
          <div className="mb-4 p-3 text-xs bg-red-500/15 sm:bg-red-50 text-red-200 sm:text-red-600 rounded-xl border border-red-400/30 sm:border-red-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/90 sm:text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl text-sm focus:outline-none transition
                bg-black/35 border border-white/40 text-white placeholder:text-white/60 focus:border-orange-400 focus:bg-black/45
                sm:bg-white sm:border-gray-300 sm:text-gray-900 sm:placeholder:text-gray-400 sm:focus:border-orange-500 sm:focus:bg-white"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/90 sm:text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl text-sm focus:outline-none transition
                bg-black/35 border border-white/40 text-white placeholder:text-white/60 focus:border-orange-400 focus:bg-black/45
                sm:bg-white sm:border-gray-300 sm:text-gray-900 sm:placeholder:text-gray-400 sm:focus:border-orange-500 sm:focus:bg-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/90 sm:text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl text-sm focus:outline-none transition
                bg-black/35 border border-white/40 text-white placeholder:text-white/60 focus:border-orange-400 focus:bg-black/45
                sm:bg-white sm:border-gray-300 sm:text-gray-900 sm:placeholder:text-gray-400 sm:focus:border-orange-500 sm:focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold py-2.5 sm:py-3 rounded-xl transition text-sm shadow-md disabled:opacity-50 mt-2
              bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30
              sm:bg-orange-500 sm:bg-none sm:hover:bg-orange-600 sm:shadow-orange-500/20"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4 sm:my-6">
          <div className="flex-1 border-t border-white/25 sm:border-gray-200" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 sm:text-gray-400">
            Or continue with
          </span>
          <div className="flex-1 border-t border-white/25 sm:border-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 font-bold py-2 sm:py-2.5 px-4 rounded-xl shadow-sm transition text-xs sm:text-sm
            bg-black/35 hover:bg-black/50 border border-white/40 text-white
            sm:bg-white sm:hover:bg-gray-50 sm:border-gray-300/90 sm:text-gray-700"
        >
          <span className="bg-white rounded-full p-1 sm:p-0 flex">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          </span>
          <span>Sign in with Google</span>
        </button>

        <p className="mt-4 sm:mt-6 text-center text-xs text-white/70 sm:text-gray-500 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-400 sm:text-orange-500 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
