import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLogin } from '@/features/auth/mutations';
import { getErrorMessage } from '@/lib/api';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const from = (location.state as { from?: string } | null)?.from ?? '/issues';

  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!formRef.current) return;
      const inputs = formRef.current.querySelectorAll<HTMLInputElement>('input');
      inputs.forEach((input) => {
        if (input.name && input.value) {
          setValue(input.name as keyof LoginFormValues, input.value);
        }
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not sign in'));
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Bug className="h-5 w-5" />
          </div>
          <h1 className="mt-3 text-lg font-semibold tracking-tight">
            Tracker
          </h1>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access your issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};
