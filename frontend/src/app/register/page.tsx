// src/app/register/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Rocket, LogIn } from 'lucide-react';
import { createUser } from '@/services/users';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Register the user using createUser
      await createUser(formData);
      
      // 2. Automatically log them in after registration
      await login(formData.email, formData.password);
      
      // 3. Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cosmic-dark)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Rocket className="mx-auto h-12 w-12 text-[var(--cosmic-highlight)]" />
          <h1 className="mt-4 text-3xl font-bold text-[var(--text-primary)]">
            Join CosmicDeploy
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
              <Label htmlFor="full_name" className="text-[var(--text-primary)]">
                Full Name
              </Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] text-[var(--text-primary)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--text-primary)]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] text-[var(--text-primary)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--text-primary)]">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                className="bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] text-[var(--text-primary)]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              <Rocket className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-[var(--cosmic-highlight)] hover:text-[var(--cosmic-highlight-dark)] flex items-center justify-center"
            >
              Sign in <LogIn className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-[var(--text-tertiary)]">
          By registering, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}