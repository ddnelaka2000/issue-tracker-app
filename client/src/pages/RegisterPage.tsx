import { Link, useNavigate } from 'react-router-dom';
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
import { useRegister } from '@/features/auth/mutations';
import { getErrorMessage } from '@/lib/api';
import { registerSchema, type RegisterFormValues } from '@/schemas/auth.schema';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const register_ = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ confirmPassword: _, ...values }) => {
    try {
      await register_.mutateAsync(values);
      toast.success('Account created');
      navigate('/issues', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create account'));
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Bug className="h-5 w-5" />
          </div>
          <h1 className="mt-3 text-lg font-semibold tracking-tight">Tracker</h1>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Create account</CardTitle>
            <CardDescription>Start tracking issues in seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
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
                  autoComplete="new-password"
                  {...register('password')}
                />
                {errors.password ? (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
