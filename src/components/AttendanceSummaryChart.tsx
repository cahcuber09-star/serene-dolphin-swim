import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAttendance } from '@/contexts/AttendanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  name: string;
  count: number;
  fill: string;
}

const AttendanceSummaryChart: React.FC = () => {
  const { history } = useAttendance();

  // Aggregate data from history
  const attendanceCounts = history.reduce((acc, record) => {
    record.entries.forEach(entry => {
      const status = entry.status.includes('Hadir') ? 'Hadir' : entry.status;
      if (acc[status] !== undefined) {
        acc[status] += 1;
      }
    });
    return acc;
  }, {
    'Hadir': 0,
    'Sakit': 0,
    'Izin': 0,
    'Alpha': 0,
  } as Record<string, number>);

  const data: ChartData[] = [
    { name: 'Hadir', count: attendanceCounts['Hadir'], fill: 'hsl(var(--primary))' },
    { name: 'Sakit', count: attendanceCounts['Sakit'], fill: 'hsl(var(--destructive))' },
    { name: 'Izin', count: attendanceCounts['Izin'], fill: 'hsl(var(--accent-foreground))' },
    { name: 'Alpha', count: attendanceCounts['Alpha'], fill: 'hsl(var(--muted-foreground))' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Total Kehadiran</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
            <YAxis allowDecimals={false} stroke="hsl(var(--foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))', 
                borderRadius: '0.5rem' 
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="count" name="Total" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AttendanceSummaryChart;