import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance, FinalAttendanceEntry } from '@/contexts/AttendanceContext';
import { useMqtt } from '@/hooks/useMqtt'; // Import useMqtt to access publish function
import { Button } from '@/components/ui/button';
import { LogOut, Zap, Hand, Save, Loader2 } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';
import AutomaticAttendanceTable from '@/components/AutomaticAttendanceTable';
import ManualAttendanceForm from '@/components/ManualAttendanceForm';
import AttendanceHistoryTable from '@/components/AttendanceHistoryTable';
import { showSuccess, showError } from '@/utils/toast';

type AttendanceMode = 'automatic' | 'manual' | null;

const DashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const { addRecord } = useAttendance();
  const [mode, setMode] = useState<AttendanceMode>(null); // Initial state is null
  const [currentRecords, setCurrentRecords] = useState<FinalAttendanceEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  // Use a generic MQTT hook just to check connection status and publish for manual mode
  const { isConnected, publish } = useMqtt("dummy/topic/for/publish"); 

  const handleRecordsChange = useCallback((records: FinalAttendanceEntry[]) => {
    setCurrentRecords(records);
  }, []);

  const handleModeChange = (newMode: AttendanceMode) => {
    if (newMode === 'automatic' || newMode === 'manual') {
      setMode(newMode);
      setCurrentRecords([]); // Clear records when switching mode
    }
  };

  const handleRecordAttendance = () => {
    if (currentRecords.length === 0) {
      showError("No attendance data available to record.");
      return;
    }
    
    setIsRecording(true);

    if (mode === 'manual') {
      // 1. Publish manual data to MQTT topic 1/2
      if (!isConnected) {
        showError("MQTT client is not connected. Cannot publish manual data.");
        setIsRecording(false);
        return;
      }
      
      const payload = JSON.stringify(currentRecords);
      publish("1/2", payload);
      // Note: showSuccess is called inside addRecord for consistency
    }
    
    // 2. Save data to history context
    addRecord(mode === 'automatic' ? 'Automatic' : 'Manual', currentRecords);
    
    // 3. Clear current records (optional, but good practice)
    setCurrentRecords([]);
    
    setIsRecording(false);
  };

  const isRecordButtonDisabled = !isConnected || isRecording || currentRecords.length === 0;

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

      <div className="mb-8 flex flex-col items-center">
        {/* Mode Selection using two separate buttons (Always visible) */}
        <div className="flex space-x-4 mb-6">
          <Button 
            variant={mode === 'automatic' ? 'default' : 'outline'}
            onClick={() => handleModeChange('automatic')}
            className="px-6"
          >
            <Zap className="h-4 w-4 mr-2" /> Automatic Mode
          </Button>
          <Button 
            variant={mode === 'manual' ? 'default' : 'outline'}
            onClick={() => handleModeChange('manual')}
            className="px-6"
          >
            <Hand className="h-4 w-4 mr-2" /> Manual Mode
          </Button>
        </div>
        
        {/* Finalize button is only visible if a mode is selected */}
        {mode && (
          <>
            <Button 
              onClick={handleRecordAttendance} 
              disabled={isRecordButtonDisabled}
              className="w-full max-w-md"
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
            {isRecordButtonDisabled && currentRecords.length === 0 && (
                <p className="text-sm text-red-500 mt-2">
                    {mode === 'automatic' ? 'Waiting for data from MQTT topic 1/0...' : 'Please check students manually.'}
                </p>
            )}
          </>
        )}
      </div>

      <div className="grid gap-6 mb-8">
        {mode === 'automatic' && (
          <AutomaticAttendanceTable onRecordsChange={handleRecordsChange} />
        )}
        
        {mode === 'manual' && (
          <ManualAttendanceForm onRecordsChange={handleRecordsChange} />
        )}
        
        {!mode && (
            <div className="h-40 flex items-center justify-center text-xl text-muted-foreground border rounded-lg bg-card">
                Please select an attendance mode to begin.
            </div>
        )}
      </div>
      
      {/* Attendance History Section remains visible */}
      <AttendanceHistoryTable />
      
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default DashboardPage;