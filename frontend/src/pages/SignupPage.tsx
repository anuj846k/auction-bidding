import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/auth/AuthContext';
import { signUpSchema } from '@/validations/auth.validation';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'name' | 'email' | 'password', string>>
  >({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = signUpSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      const next: Partial<Record<'name' | 'email' | 'password', string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === 'name' || key === 'email' || key === 'password') {
          next[key] = issue.message;
        }
      }
      setFieldErrors(next);
      return;
    }

    setLoading(true);
    try {
      await signUp(parsed.data);
      navigate('/auctions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
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
              Create account
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Sign up to start bidding and track your wins.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Name</label>
                <Input
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (fieldErrors.name) {
                      setFieldErrors(prev => ({ ...prev, name: undefined }));
                    }
                  }}
                  placeholder="Anuj"
                  required
                />
                {fieldErrors.name && (
                  <p className="text-xs text-red-300">{fieldErrors.name}</p>
                )}
              </div>

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
                {loading ? 'Creating…' : 'Create account'}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
