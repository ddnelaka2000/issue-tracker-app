import { useEffect, useRef, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  Bug,
  LayoutList,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sun,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth/mutations';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/issues', icon: LayoutList, label: 'Issues' },
  { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const logout = useLogout();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const debouncedQ = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    const urlQ = searchParams.get('q') ?? '';
    if (urlQ !== searchInput) setSearchInput(urlQ);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const urlQ = searchParams.get('q') ?? '';
    if (debouncedQ === urlQ) return;
    if (location.pathname === '/issues') {
      const p = new URLSearchParams(searchParams);
      if (debouncedQ) p.set('q', debouncedQ); else p.delete('q');
      setSearchParams(p, { replace: true });
    } else if (debouncedQ) {
      navigate(`/issues?q=${encodeURIComponent(debouncedQ)}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

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
    <div className="flex h-screen bg-background">
      <aside
        className={cn(
          'hidden sm:flex shrink-0 flex-col overflow-hidden transition-[width] duration-200 ease-in-out',
          'bg-violet-50 dark:bg-violet-950 border-r border-violet-100 dark:border-violet-900',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-violet-100 dark:border-violet-900 px-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <PanelLeftOpen className="h-4 w-4" />
              : <PanelLeftClose className="h-4 w-4" />}
          </Button>

          {!collapsed && (
            <Link to="/issues" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Bug className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                Tracker
              </span>
            </Link>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 p-2 pt-3">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900 hover:text-foreground dark:hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-violet-100 dark:border-violet-900 p-2 space-y-0.5">
          <button
            onClick={toggleDark}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-violet-700 dark:text-violet-300 transition-colors hover:bg-violet-100 dark:hover:bg-violet-900 hover:text-foreground dark:hover:text-foreground',
              collapsed && 'justify-center px-2',
            )}
          >
            {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {!collapsed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                title={collapsed ? (user?.name ?? 'Account') : undefined}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-violet-700 dark:text-violet-300 transition-colors hover:bg-violet-100 dark:hover:bg-violet-900 hover:text-foreground dark:hover:text-foreground',
                  collapsed && 'justify-center px-2',
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {user ? initials(user.name) : <User className="h-3 w-3" />}
                </span>
                {!collapsed && <span className="truncate text-left">{user?.name}</span>}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              {user && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="truncate text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setShowSignOutConfirm(true);
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="flex shrink-0 items-center gap-1">
            <Link
              to="/issues"
              className={cn(
                'hidden sm:flex items-center gap-2 shrink-0',
                !collapsed && 'sm:hidden',
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Bug className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                Tracker
              </span>
            </Link>

            <nav className="sm:hidden flex items-center gap-0.5">
              {NAV_ITEMS.filter(({ to }) => to !== '/settings').map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={label}
                  className={({ isActive }) =>
                    cn(
                      'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 justify-center px-2">
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                ref={inputRef}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search issues…"
                className="h-9 pl-8 pr-7 text-sm bg-muted/40 dark:bg-muted/60 border-border dark:border-muted-foreground/20"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={toggleDark}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full p-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {user ? initials(user.name) : <User className="h-3 w-3" />}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user && (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="truncate text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setShowSignOutConfirm(true);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={showSignOutConfirm}
        onOpenChange={setShowSignOutConfirm}
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
}
