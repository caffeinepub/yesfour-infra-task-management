import { ReactNode } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, LogOut, LayoutDashboard, ClipboardList, Shield, Loader2 } from 'lucide-react';
import { UserRole } from '../backend';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { userProfile, isAuthenticated, logout, isAdmin, isManager, isEmployee } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentPath = router.state.location.pathname;

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  const getRoleBadgeColor = (role: UserRole) => {
    if (role === UserRole.admin) return 'bg-task-red text-white';
    if (role === UserRole.manager) return 'bg-task-blue text-white';
    return 'bg-task-green text-white';
  };

  const getRoleLabel = (role: UserRole) => {
    if (role === UserRole.admin) return 'Admin';
    if (role === UserRole.manager) return 'Manager';
    return 'Employee';
  };

  const navLinks = [
    ...(isEmployee ? [{ path: '/employee', label: 'My Tasks', icon: ClipboardList }] : []),
    ...(isManager ? [{ path: '/manager', label: 'Manager Dashboard', icon: LayoutDashboard }] : []),
    ...(isAdmin ? [
      { path: '/admin', label: 'Admin Dashboard', icon: Shield },
      { path: '/manager', label: 'Task Management', icon: LayoutDashboard },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-border shadow-xs sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <img
                src="/assets/uploads/logo_high_res-1.png"
                alt="Yesfour Infra"
                className="h-9 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-brand-green" />
                <span className="text-lg font-bold text-brand-green tracking-tight">Yesfour Infra</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-border mx-1" />
              <span className="hidden sm:block text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Task Management
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPath === link.path;
                return (
                  <button
                    type="button"
                    key={link.path}
                    onClick={() => navigate({ to: link.path as '/' })}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-green-muted text-brand-green'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3">
              {userProfile && (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground leading-none">{userProfile.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{userProfile.department}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getRoleBadgeColor(userProfile.role)}`}>
                    {getRoleLabel(userProfile.role)}
                  </span>
                </div>
              )}
              {isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground border-border"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Yesfour Infra. All rights reserved.</span>
            <span className="flex items-center gap-1">
              Built with{' '}
              <span className="text-task-red">♥</span>{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'yesfour-infra')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-green hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
