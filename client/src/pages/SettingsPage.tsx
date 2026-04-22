import { useState } from 'react';
import { Moon, Sun, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth/mutations';
import { useDarkMode } from '@/hooks/useDarkMode';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export const SettingsPage = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const logout = useLogout();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const [showSignOut, setShowSignOut] = useState(false);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast.success('Signed out');
      navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and preferences.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold">Profile</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-sm">
              {user ? initials(user.name) : <User className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{user?.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>

        </div>
      </section>

      <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold">Appearance</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {isDark ? 'Dark mode' : 'Light mode'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark themes.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleDark}>
              {isDark ? (
                <>
                  <Sun className="h-4 w-4" />
                  Switch to light
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Switch to dark
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold">Account</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sign out</p>
              <p className="text-xs text-muted-foreground">
                You'll need to sign back in to access your issues.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={() => setShowSignOut(true)}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={showSignOut}
        onOpenChange={setShowSignOut}
        title="Sign out?"
        description="You'll need to sign in again to access your issues."
        confirmText="Sign out"
        cancelText="Stay"
        variant="destructive"
        onConfirm={handleLogout}
        loading={logout.isPending}
      />
    </div>
  );
};
