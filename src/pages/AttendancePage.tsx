import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Hand, ArrowLeft } from 'lucide-react';

const AttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isModeSelected = location.pathname !== '/dashboard/attendance';

  if (isModeSelected) {
    // If a sub-route is active, render the content via Outlet
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard/attendance')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Pilihan Mode
          </Button>
        </div>
        <Outlet />
      </>
    );
  }

  // Mode selection view
  return (
    <div className="space-y-6 flex flex-col items-center">
      <h2 className="text-3xl font-bold">Pilih Mode Absensi</h2>
      <p className="text-muted-foreground">Pilih mode yang sesuai untuk merekam kehadiran mahasiswa.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 w-full max-w-3xl">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
          onClick={() => navigate('/dashboard/attendance/automatic')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">Otomatis</CardTitle>
            <Zap className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground mb-4">
              Absensi menggunakan perangkat RFID/IoT.
            </p>
            <Button className="w-full">Mulai Absensi Otomatis</Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
          onClick={() => navigate('/dashboard/attendance/manual')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">Manual</CardTitle>
            <Hand className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground mb-4">
              Pengisian status kehadiran secara manual oleh operator.
            </p>
            <Button className="w-full" variant="secondary">Mulai Absensi Manual</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendancePage;