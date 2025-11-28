import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Zap, Hand } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AutomaticAttendanceTable from '@/components/AutomaticAttendanceTable';
import ManualAttendanceForm from '@/components/ManualAttendanceForm';

type AttendanceMode = 'automatic' | 'manual';

const DashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const [mode, setMode] = useState<AttendanceMode>('automatic');

  const handleModeChange = (newMode: string) => {
    if (newMode === 'automatic' || newMode === 'manual') {
      setMode(newMode);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary">Attendance Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <div className="mb-8 flex justify-center">
        <ToggleGroup 
          type="single" 
          value={mode} 
          onValueChange={handleModeChange}
          className="bg-card p-1 rounded-lg shadow-md"
        >
          <ToggleGroupItem value="automatic" aria-label="Toggle automatic mode" className="px-6">
            <Zap className="h-4 w-4 mr-2" /> Automatic Mode
          </ToggleGroupItem>
          <ToggleGroupItem value="manual" aria-label="Toggle manual mode" className="px-6">
            <Hand className="h-4 w-4 mr-2" /> Manual Mode
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid gap-6">
        {mode === 'automatic' && (
          <AutomaticAttendanceTable />
        )}
        
        {mode === 'manual' && (
          <ManualAttendanceForm />
        )}
      </div>
      
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default DashboardPage;