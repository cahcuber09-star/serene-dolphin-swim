import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarCheck, FileText } from 'lucide-react';
import { useStudents } from '@/contexts/StudentContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import AttendanceSummaryChart from '@/components/AttendanceSummaryChart';

const HomePage: React.FC = () => {
  const { students } = useStudents();
  const { history } = useAttendance();

  const totalStudents = students.length;
  const totalRecords = history.length;
  
  // Simple calculation for summary (last record)
  const lastRecord = history[0];
  const presentCount = lastRecord ? lastRecord.entries.filter(e => e.status.includes('Hadir')).length : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Selamat Datang di Dashboard Absensi</h2>
      <p className="text-muted-foreground">Ringkasan cepat data absensi dan mahasiswa.</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Mahasiswa terdaftar</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rekaman Absensi</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">Sesi absensi telah difinalisasi</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hadir Terakhir</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentCount}</div>
            <p className="text-xs text-muted-foreground">
              {lastRecord ? `Dari ${lastRecord.entries.length} pada ${lastRecord.entries[0]?.date}` : 'Belum ada rekaman'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Attendance Summary Chart */}
      <AttendanceSummaryChart />
    </div>
  );
};

export default HomePage;