import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { UserRole, AccountStatus } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DEPARTMENTS = [
  { value: 'Construction', label: 'Construction' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Travel Desk', label: 'Travel Desk' },
  { value: 'Accounts', label: 'Accounts' },
  { value: 'Apartments', label: 'Apartments' },
];

const ROLES = [
  { value: UserRole.admin, label: 'Admin' },
  { value: UserRole.manager, label: 'Manager' },
  { value: UserRole.employee, label: 'Employee' },
];

export default function ProfileSetupPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.employee);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isAuthenticated) {
    navigate({ to: '/login' });
    return null;
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!department) newErrors.department = 'Department is required';
    if (!role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        department,
        role,
        performancePoints: BigInt(0),
        accountStatus: AccountStatus.active,
      });
      toast.success('Profile created successfully!');
      if (role === UserRole.admin) navigate({ to: '/admin' });
      else if (role === UserRole.manager) navigate({ to: '/manager' });
      else navigate({ to: '/employee' });
    } catch (err) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-muted via-white to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="w-8 h-8 text-brand-green" />
            <h1 className="text-3xl font-bold text-brand-green tracking-tight">Yesfour Infra</h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
            Complete Your Profile
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-brand-green" />
              Profile Setup
            </CardTitle>
            <CardDescription>
              Please provide your details to get started with the task management system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? 'border-task-red' : ''}
                />
                {errors.name && <p className="text-xs text-task-red">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className={errors.department ? 'border-task-red' : ''}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-xs text-task-red">{errors.department}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger className={errors.role ? 'border-task-red' : ''}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-xs text-task-red">{errors.role}</p>}
              </div>

              <Button
                type="submit"
                disabled={saveProfile.isPending}
                className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-semibold"
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
