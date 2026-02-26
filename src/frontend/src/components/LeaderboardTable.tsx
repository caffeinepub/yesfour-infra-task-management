import React from 'react';
import { Trophy } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetUserProfile } from '../hooks/useQueries';

interface LeaderboardEntryProps {
  rank: number;
  principalStr: string;
  points: bigint;
}

function LeaderboardEntry({ rank, principalStr, points }: LeaderboardEntryProps) {
  const { data: profile } = useGetUserProfile(principalStr);

  const rankColors: Record<number, string> = {
    1: 'text-yellow-500',
    2: 'text-gray-400',
    3: 'text-amber-600',
  };
  const rankColor = rankColors[rank] ?? 'text-gray-500';

  return (
    <TableRow>
      <TableCell className={`font-bold text-lg ${rankColor}`}>
        {rank <= 3 ? <Trophy className="w-5 h-5 inline mr-1" /> : null}
        {rank}
      </TableCell>
      <TableCell className="font-medium">{profile?.name ?? '—'}</TableCell>
      <TableCell className="text-gray-500">{profile?.department ?? '—'}</TableCell>
      <TableCell className="text-gray-500 capitalize">
        {profile?.role != null
          ? typeof profile.role === 'string'
            ? profile.role
            : Object.keys(profile.role)[0]
          : '—'}
      </TableCell>
      <TableCell className={`font-bold ${Number(points) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
        {Number(points) >= 0 ? '+' : ''}{Number(points)}
      </TableCell>
    </TableRow>
  );
}

interface LeaderboardTableProps {
  leaderboard: Array<[Principal, bigint]>;
}

export default function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-lg font-medium">No leaderboard data yet</p>
        <p className="text-sm">Complete tasks to appear on the leaderboard</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.map(([principal, points], index) => (
            <LeaderboardEntry
              key={principal.toString()}
              rank={index + 1}
              principalStr={principal.toString()}
              points={points}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
