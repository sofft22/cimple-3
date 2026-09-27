import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Shield, Lock, ArrowLeft } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminLogin({ onNavigate }: Props) {
  const { login } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      onNavigate('/admin');
    } else {
      setError('Incorrect password.');
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <button
        onClick={() => onNavigate('/')}
        className="flex items-center gap-1 text-gray-500 text-sm mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to store
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-50 items-center justify-center mb-4">
          <Shield className="w-7 h-7 text-brand-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Admin Login</h1>
        <p className="text-sm text-gray-600 mt-1">Enter your password to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Enter password"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-500 text-xs font-medium mt-1.5">{error}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full h-11 rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] transition-all"
        >
          Login
        </button>
      </form>
    </div>
  );
}
