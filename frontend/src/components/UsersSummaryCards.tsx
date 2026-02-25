import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Briefcase, UserCog } from 'lucide-react';
import { UserStats, AccountStatus, UserRole } from '../backend';

interface UsersSummaryCardsProps {
  users: UserStats[];
}

export default function UsersSummaryCards({ users }: UsersSummaryCardsProps) {
  const totalUsers = users.length;
  const totalActive = users.filter((u) => u.profile.accountStatus === AccountStatus.active).length;
  const totalManagers = users.filter((u) => u.profile.role === UserRole.manager).length;
  const totalEmployees = users.filter((u) => u.profile.role === UserRole.employee).length;

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-task-blue',
      bg: 'bg-task-blue-bg',
      border: 'border-task-blue/20',
    },
    {
      label: 'Active Users',
      value: totalActive,
      icon: UserCheck,
      color: 'text-task-green',
      bg: 'bg-task-green-bg',
      border: 'border-task-green/20',
    },
    {
      label: 'Total Managers',
      value: totalManagers,
      icon: UserCog,
      color: 'text-brand-green',
      bg: 'bg-brand-green-muted',
      border: 'border-brand-green/20',
    },
    {
      label: 'Total Employees',
      value: totalEmployees,
      icon: Briefcase,
      color: 'text-task-yellow',
      bg: 'bg-task-yellow-bg',
      border: 'border-task-yellow/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className={`shadow-card border ${stat.border}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
