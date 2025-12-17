import React, { useState, useEffect } from 'react';
import { useMqtt } from '@/hooks/useMqtt';
import { useStudents, Student } from '@/contexts/StudentContext';
import { useAttendance, FinalAttendanceEntry } from '@/contexts/AttendanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Zap, Save, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';

interface LiveAttendanceEntry {
  student: Student;
  status: 'Hadir' | 'Tidak Hadir';
}

const AutomaticAttendancePage: React.FC = () => {
  const { students } = useStudents();
  const { addRecord } = useAttendance();
  const { isConnected, messages } = useMqtt("1/0");
  const [liveAttendance, setLiveAttendance] = useState<LiveAttendanceEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Process incoming MQTT messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[0].message;
      let presentStudentIds: string[] = [];
      
      try {
        // Assuming MQTT message is a JSON string containing an array of student IDs who are present
        // Example: ["s1", "s3"]
        presentStudentIds = JSON.parse(latestMessage);
        if (!Array.isArray(presentStudentIds)) {
            throw new Error("Message is not an array.");
        }
      } catch (e) {
        console.error("Failed to parse MQTT message from 1/0:", e);
        // Fallback: treat message as a single ID if parsing fails
        // This is a robust fallback, but ideally the device sends JSON array.
        presentStudentIds = []; 
      }

      const newLiveAttendance: LiveAttendanceEntry[] = students.map(student => {
        // Check if the student ID is in the list of present IDs
        const isPresent = presentStudentIds.includes(student.id);
        return {
          student,
          status: isPresent ? 'Hadir' : 'Tidak Hadir',
        };
      });
      setLiveAttendance(newLiveAttendance);
    }
  }, [messages, students]);

  const handleFinalizeAttendance = () => {
    if (liveAttendance.length === 0) {
      showError("No live attendance data to record. Please wait for MQTT data.");
      return;
    }
    
    setIsRecording(true);
    
    const formattedDate = format(new Date(), 'dd/MM/yyyy');
    const formattedTime = format(new Date(), 'HH:mm:ss');

    const entries: FinalAttendanceEntry[] = liveAttendance.map(entry => ({
      name: entry.student.name,
      status: entry.status === 'Hadir' ? 'Hadir' : 'Alpha', // Automatic mode only records Hadir or Alpha
      date: formattedDate,
      time: formattedTime,
      note: entry.status === 'Tidak Hadir' ? 'Otomatis Alpha' : '',
    }));
    
    addRecord('Automatic', entries);
    setLiveAttendance([]); // Clear live data after recording
    setIsRecording(false);
  };

  const totalPresent = liveAttendance.filter(e => e.status === 'Hadir').length;
  const totalStudents = students.length;
  const isFinalizeDisabled = isRecording || liveAttendance.length === 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center">
        <Zap className="h-6 w-6 mr-2" /> Absensi Otomatis (Topic 1/0)
      </h2>
      <p className={cn("text-sm", isConnected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
        MQTT Status: {isConnected ? 'Connected' : 'Disconnected'} to broker.hivemq.com:8000
      </p>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between space-y-2 pb-4">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="font-medium">{format(new Date(), 'PPP, HH:mm:ss')}</span>
          </div>
          <Button onClick={handleFinalizeAttendance} disabled={isFinalizeDisabled}>
              {isRecording ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recording...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Finalize & Record ({totalPresent}/{totalStudents} Hadir)
                </>
              )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">NO</TableHead>
                  <TableHead>NAMA LENGKAP</TableHead>
                  <TableHead>NIM</TableHead>
                  <TableHead>KELAS</TableHead>
                  <TableHead className="w-[150px]">STATUS KEHADIRAN</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            Tidak ada data mahasiswa.
                        </TableCell>
                    </TableRow>
                ) : (
                    students.map((student, index) => {
                        const liveEntry = liveAttendance.find(e => e.student.id === student.id);
                        const status = liveEntry?.status || 'Tidak Hadir';
                        
                        return (
                            <TableRow key={student.id} className={status === 'Hadir' ? 'bg-green-50/50 dark:bg-green-900/10' : ''}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">{student.name}</TableCell>
                                <TableCell>{student.nim}</TableCell>
                                <TableCell>{student.class}</TableCell>
                                <TableCell>
                                    <span className={cn(
                                        "font-semibold",
                                        status === 'Hadir' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    )}>
                                        {status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomaticAttendancePage;