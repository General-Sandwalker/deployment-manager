// src/app/login/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogIn, Rocket, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      setError('Invalid email or password');
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cosmic-dark)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Rocket className="mx-auto h-12 w-12 text-[var(--cosmic-highlight)]" />
          <h1 className="mt-4 text-3xl font-bold text-[var(--text-primary)]">
            Welcome Back
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Deploy your projects to the cosmos
          </p>
        </div>

        <div className="border border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)] rounded-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-500 text-sm rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--text-primary)]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] text-[var(--text-primary)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--text-primary)]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] text-[var(--text-primary)]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]"
            >
              Sign In <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-[var(--cosmic-highlight)] hover:text-[var(--cosmic-highlight-dark)] flex items-center justify-center"
            >
              Register <UserPlus className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}