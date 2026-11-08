import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode = 'login', onNavigate }) {
  const { login, register } = useAuth();
  const isLogin = mode === 'login';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onNavigate('home');
    } catch (requestError) {
      setError(requestError.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white border border-surface-border shadow-xl p-6 sm:p-8">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-teal-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to news
        </button>

        <div className="text-center mb-7">
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto mb-3 text-teal-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-textPrimary">
            {isLogin ? 'Sign in to News Portal' : 'Create your account'}
          </h1>
          <p className="text-sm text-textSecondary mt-2">
            {isLogin
              ? 'Access your personalized news and community features.'
              : 'New accounts start with reader access.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <label className="block">
              <span className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Full name</span>
              <span className="relative block">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-textPrimary focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </span>
            </label>
          )}

          <label className="block">
            <span className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Email address</span>
            <span className="relative block">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-textPrimary focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </span>
          </label>

          <label className="block">
            <span className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Password</span>
            <span className="relative block">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-textPrimary focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wider uppercase disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          {isLogin ? 'New to News Portal?' : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => onNavigate(isLogin ? 'register' : 'login')}
            className="font-bold text-teal-700 hover:text-teal-900"
          >
            {isLogin ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  );
}
