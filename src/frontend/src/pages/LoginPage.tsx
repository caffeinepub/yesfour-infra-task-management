import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, isInitializing } = useInternetIdentity();
  const { isAuthenticated, isLoggingIn, userProfile, profileLoading, profileFetched } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (profileLoading || !profileFetched) return;

    if (userProfile === null || userProfile === undefined) {
      navigate({ to: '/profile-setup' });
    } else {
      const role =
        typeof userProfile.role === 'string'
          ? userProfile.role
          : Object.keys(userProfile.role)[0];
      if (role === 'admin') navigate({ to: '/admin' });
      else if (role === 'manager') navigate({ to: '/manager' });
      else navigate({ to: '/employee' });
    }
  }, [isAuthenticated, userProfile, profileLoading, profileFetched, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-muted via-white to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/assets/uploads/logo_high_res-1.png"
              alt="Yesfour Infra"
              className="h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="w-8 h-8 text-brand-green" />
            <h1 className="text-3xl font-bold text-brand-green tracking-tight">Yesfour Infra</h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
            Task Management System
          </p>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in with your Internet Identity to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-semibold py-3 rounded-md transition-colors"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Secure authentication powered by Internet Identity
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Workflow indicator */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded bg-task-yellow-bg text-task-yellow border border-task-yellow/30 font-medium">Assign</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-task-blue-bg text-task-blue border border-task-blue/30 font-medium">Work</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-task-blue-bg text-task-blue border border-task-blue/30 font-medium">Upload Proof</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-task-green-bg text-task-green border border-task-green/30 font-medium">Approve</span>
        </div>
      </div>
    </div>
  );
}
