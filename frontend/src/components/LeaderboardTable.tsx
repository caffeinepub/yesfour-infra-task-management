import { Principal } from '@dfinity/principal';
import { useGetUserProfile } from '../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardEntry {
  principal: Principal;
  points: bigint;
  rank: number;
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const { data: profile } = useGetUserProfile(entry.principal.toString());
  const points = Number(entry.points);

  const rankDisplay = () => {
    if (entry.rank === 1) return <span className="text-yellow-500 font-bold">🥇</span>;
    if (entry.rank === 2) return <span className="text-gray-400 font-bold">🥈</span>;
    if (entry.rank === 3) return <span className="text-amber-600 font-bold">🥉</span>;
    return <span className="text-muted-foreground font-medium">#{entry.rank}</span>;
  };

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="font-medium text-center w-12">{rankDisplay()}</TableCell>
      <TableCell>
        <div>
          <p className="font-semibold text-sm text-foreground">{profile?.name ?? 'Loading...'}</p>
          <p className="text-xs text-muted-foreground">{profile?.department ?? ''}</p>
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground capitalize">
        {profile?.role ?? '—'}
      </TableCell>
      <TableCell className="text-right">
        <span className={`font-bold text-sm ${points >= 0 ? 'text-task-green' : 'text-task-red'}`}>
          {points >= 0 ? '+' : ''}{points}
        </span>
      </TableCell>
    </TableRow>
  );
}

interface LeaderboardTableProps {
  leaderboard: Array<[Principal, bigint]>;
}

export default function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  const entries: LeaderboardEntry[] = leaderboard.map(([principal, points], index) => ({
    principal,
    points,
    rank: index + 1,
  }));

  return (
    <Card className="shadow-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Performance Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Medal className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No performance data yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-center w-12">Rank</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <LeaderboardRow key={entry.principal.toString()} entry={entry} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
