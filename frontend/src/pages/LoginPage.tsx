import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/auth/AuthContext';
import { signInSchema } from '@/validations/auth.validation';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'email' | 'password', string>>
  >({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const next: Partial<Record<'email' | 'password', string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === 'email' || key === 'password') {
          next[key] = issue.message;
        }
      }
      setFieldErrors(next);
      return;
    }

    setLoading(true);
    try {
      await signIn(parsed.data);
      navigate('/auctions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-background text-foreground flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6">
        <Card className="w-full max-w-md bg-card/70 border-border/60 shadow-lg shadow-black/40">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-emerald-300">
              Sign in
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Log in to place bids and compete in real time.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors(prev => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="you@example.com"
                  required
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-300">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors(prev => ({
                        ...prev,
                        password: undefined,
                      }));
                    }
                  }}
                  placeholder="••••••••"
                  required
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-300">{fieldErrors.password}</p>
                )}
              </div>

              {error && (
                <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-500/30"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Don&apos;t have an account?{' '}
                <Link
                  to="/signup"
                  className="text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
                >
                  Create one
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
