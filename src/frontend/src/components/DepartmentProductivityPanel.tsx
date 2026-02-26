import React from 'react';
import { BarChart2 } from 'lucide-react';
import { TaskResponse, TaskStatus } from '../backend';

interface DepartmentProductivityPanelProps {
  tasks: TaskResponse[];
}

function getStatusKey(status: unknown): string {
  if (typeof status === 'string') return status;
  if (typeof status === 'object' && status !== null) return Object.keys(status)[0];
  return String(status);
}

function getDeptKey(dept: unknown): string {
  if (typeof dept === 'string') return dept;
  if (typeof dept === 'object' && dept !== null) return Object.keys(dept)[0];
  return String(dept);
}

export default function DepartmentProductivityPanel({ tasks }: DepartmentProductivityPanelProps) {
  const deptStats: Record<string, { total: number; completed: number; points: number }> = {};

  for (const task of tasks) {
    const dept = getDeptKey(task.department);
    if (!deptStats[dept]) {
      deptStats[dept] = { total: 0, completed: 0, points: 0 };
    }
    deptStats[dept].total += 1;
    const statusKey = getStatusKey(task.status);
    if (statusKey === TaskStatus.green) {
      deptStats[dept].completed += 1;
    }
    deptStats[dept].points += Number(task.performancePoints);
  }

  const departments = Object.entries(deptStats);

  if (departments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>No task data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {departments.map(([dept, stats]) => {
        const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        return (
          <div key={dept} className="bg-white rounded-lg shadow-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800 capitalize">{dept}</span>
              <span className="text-sm text-gray-500">{stats.total} tasks</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div
                className="bg-brand-green h-2 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{completionRate}% complete</span>
              <span className={stats.points >= 0 ? 'text-green-600' : 'text-red-500'}>
                {stats.points >= 0 ? '+' : ''}{stats.points} pts
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
