import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance, FinalAttendanceEntry } from '@/contexts/AttendanceContext';
import { useMqtt } from '@/hooks/useMqtt';
import { Button } from '@/components/ui/button';
import { LogOut, Zap, Hand, Save, Loader2, ArrowLeft } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';
import AutomaticAttendanceTable from '@/components/AutomaticAttendanceTable';
import ManualAttendanceForm from '@/components/ManualAttendanceForm';
import AttendanceHistoryTable from '@/components/AttendanceHistoryTable';
import { showSuccess, showError } from '@/utils/toast';

type AttendanceMode = 'automatic' | 'manual';

const DashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const { addRecord } = useAttendance();
  const [mode, setMode] = useState<AttendanceMode | null>(null); // Start with null
  const [currentRecords, setCurrentRecords] = useState<FinalAttendanceEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const { isConnected, publish } = useMqtt("dummy/topic/for/publish"); 

  const handleRecordsChange = useCallback((records: FinalAttendanceEntry[]) => {
    setCurrentRecords(records);
  }, []);

  const handleRecordAttendance = () => {
    if (currentRecords.length === 0) {
      showError("No attendance data available to record.");
      return;
    }
    
    setIsRecording(true);

    if (mode === 'manual') {
      if (!isConnected) {
        showError("MQTT client is not connected. Cannot publish manual data.");
        setIsRecording(false);
        return;
      }
      
      const payload = JSON.stringify(currentRecords);
      publish("1/2", payload);
    }
    
    addRecord(mode === 'automatic' ? 'Automatic' : 'Manual', currentRecords);
    
    // Clear records and return to mode selection after recording
    setCurrentRecords([]);
    setMode(null); 
    setIsRecording(false);
  };

  const isRecordButtonDisabled = !isConnected || isRecording || currentRecords.length === 0;

  const renderModeSelection = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h2 className="text-2xl font-semibold mb-6">Pilih Mode Absensi</h2>
      <div className="flex space-x-6">
        <Button 
          size="lg"
          className="h-20 w-40 flex flex-col items-center justify-center text-lg"
          onClick={() => setMode('automatic')}
        >
          <Zap className="h-6 w-6 mb-1" /> Automatic Mode
        </Button>
        <Button 
          size="lg"
          className="h-20 w-40 flex flex-col items-center justify-center text-lg"
          onClick={() => setMode('manual')}
        >
          <Hand className="h-6 w-6 mb-1" /> Manual Mode
        </Button>
      </div>
      
      {/* Attendance History Section only visible when no mode is selected */}
      <div className="mt-12 w-full max-w-4xl">
        <AttendanceHistoryTable />
      </div>
      
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </div>
  );

  const renderAttendanceContent = () => (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => setMode(null)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Pilihan Mode
        </Button>
        <Button 
          onClick={handleRecordAttendance} 
          disabled={isRecordButtonDisabled}
        >
          {isRecording ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recording...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Finalize & Record Attendance ({currentRecords.length} entries)
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 mb-8">
        {mode === 'automatic' && (
          <AutomaticAttendanceTable onRecordsChange={handleRecordsChange} />
        )}
        
        {mode === 'manual' && (
          <ManualAttendanceForm onRecordsChange={handleRecordsChange} />
        )}
      </div>
      
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </>
  );

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

      {mode === null ? renderModeSelection() : renderAttendanceContent()}
      
    </div>
  );
};

export default DashboardPage;