import React from 'react';
import { Users, UserCheck, Briefcase, User } from 'lucide-react';
import { UserStats, UserRole } from '../backend';

interface UsersSummaryCardsProps {
  usersStats: UserStats[];
}

function getRoleKey(role: unknown): string {
  if (typeof role === 'string') return role;
  if (typeof role === 'object' && role !== null) return Object.keys(role)[0];
  return String(role);
}

function getStatusKey(status: unknown): string {
  if (typeof status === 'string') return status;
  if (typeof status === 'object' && status !== null) return Object.keys(status)[0];
  return String(status);
}

function StatCard({
  icon,
  label,
  value,
  colorClass,
  bgClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-card p-5 flex items-center gap-4">
      <div className={`p-3 rounded-full ${bgClass}`}>{icon}</div>
      <div>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function UsersSummaryCards({ usersStats }: UsersSummaryCardsProps) {
  const total = usersStats.length;
  const active = usersStats.filter((u) => getStatusKey(u.profile.accountStatus) === 'active').length;
  const managers = usersStats.filter((u) => getRoleKey(u.profile.role) === UserRole.manager).length;
  const employees = usersStats.filter((u) => getRoleKey(u.profile.role) === UserRole.employee).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={<Users className="w-6 h-6 text-white" />}
        label="Total Users"
        value={total}
        colorClass="text-brand-green"
        bgClass="bg-brand-green"
      />
      <StatCard
        icon={<UserCheck className="w-6 h-6 text-white" />}
        label="Active Users"
        value={active}
        colorClass="text-task-green"
        bgClass="bg-task-green"
      />
      <StatCard
        icon={<Briefcase className="w-6 h-6 text-white" />}
        label="Managers"
        value={managers}
        colorClass="text-task-blue"
        bgClass="bg-task-blue"
      />
      <StatCard
        icon={<User className="w-6 h-6 text-white" />}
        label="Employees"
        value={employees}
        colorClass="text-task-yellow"
        bgClass="bg-task-yellow"
      />
    </div>
  );
}
