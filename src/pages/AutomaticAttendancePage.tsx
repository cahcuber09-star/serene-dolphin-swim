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
  date: string;
  time: string;
}

const AutomaticAttendancePage: React.FC = () => {
  const { students } = useStudents();
  const { addRecord } = useAttendance();
  const MQTT_TOPIC = "1/0";
  const { isConnected, messages } = useMqtt(MQTT_TOPIC);
  const [liveAttendance, setLiveAttendance] = useState<LiveAttendanceEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Process incoming MQTT messages and manage live attendance state
  useEffect(() => {
    // Create a map of existing attendance for quick lookup
    const existingMap = liveAttendance.reduce((acc, entry) => {
        acc[entry.student.id] = entry;
        return acc;
    }, {} as Record<string, LiveAttendanceEntry>);

    // 1. Initialization: Ensure liveAttendance reflects all students when the component mounts or students list changes, if it's currently empty.
    if (liveAttendance.length === 0 && students.length > 0) {
        const now = new Date();
        const formattedDate = format(now, 'dd/MM/yyyy');
        const formattedTime = format(now, 'HH:mm:ss');
        
        const initialList = students.map(student => ({
            student,
            status: 'Tidak Hadir' as const,
            date: formattedDate,
            time: formattedTime,
        })).sort((a, b) => a.student.name.localeCompare(b.student.name));
        
        setLiveAttendance(initialList);
        // Do not return here, as we might have messages waiting to be processed immediately after initialization
    }
    
    if (messages.length > 0) {
      const latestMessage = messages[0].message;
      const now = new Date();
      const formattedDate = format(now, 'dd/MM/yyyy');
      const formattedTime = format(now, 'HH:mm:ss');
      
      let presentStudentIds: string[] = [];
      
      try {
        // Assuming MQTT message is a JSON string containing an array of student IDs who are present
        presentStudentIds = JSON.parse(latestMessage);
        if (!Array.isArray(presentStudentIds)) {
            throw new Error("Message is not an array.");
        }
      } catch (e) {
        console.error(`Failed to parse MQTT message from ${MQTT_TOPIC}:`, e);
        presentStudentIds = []; 
      }

      const presentIdSet = new Set(presentStudentIds);
      const newLiveAttendanceMap: Record<string, LiveAttendanceEntry> = {};
      
      // Iterate over all known students
      students.forEach(student => {
        const isPresentInMessage = presentIdSet.has(student.id);
        const existingEntry = existingMap[student.id];
        
        if (isPresentInMessage) {
            // Case 1: Student is present in the latest message.
            if (existingEntry && existingEntry.status === 'Hadir') {
                // If already marked Hadir, keep the original recorded time/date (first entry time).
                newLiveAttendanceMap[student.id] = existingEntry;
            } else {
                // First time detected as Hadir in this session. Record current time.
                newLiveAttendanceMap[student.id] = {
                    student,
                    status: 'Hadir',
                    date: formattedDate,
                    time: formattedTime,
                };
            }
        } else if (existingEntry && existingEntry.status === 'Hadir') {
            // Case 2: Student is NOT in the latest message, but was previously marked Hadir.
            // We keep the 'Hadir' status and the recorded time for the duration of the session.
            newLiveAttendanceMap[student.id] = existingEntry;
        } else {
            // Case 3: Student is not present in the message and was never marked Hadir (or was 'Tidak Hadir').
            // Default to 'Tidak Hadir' using the current time/date for display consistency.
            newLiveAttendanceMap[student.id] = {
                student,
                status: 'Tidak Hadir',
                date: formattedDate, 
                time: formattedTime,
            };
        }
      });
      
      // Convert map back to array, sorted by student name
      setLiveAttendance(Object.values(newLiveAttendanceMap).sort((a, b) => a.student.name.localeCompare(b.student.name)));
    }
  }, [messages, students]); // Depend on messages and students

  const handleFinalizeAttendance = () => {
    if (liveAttendance.length === 0) {
      showError("No live attendance data to record. Please wait for MQTT data or ensure students are loaded.");
      return;
    }
    
    setIsRecording(true);
    
    const entries: FinalAttendanceEntry[] = liveAttendance.map(entry => ({
      name: entry.student.name,
      // If status is 'Tidak Hadir', record as 'Alpha' in the final record.
      status: entry.status === 'Hadir' ? 'Hadir' : 'Alpha', 
      date: entry.date,
      time: entry.time,
      note: entry.status === 'Tidak Hadir' ? 'Otomatis Alpha' : '',
    }));
    
    addRecord('Automatic', entries);
    setLiveAttendance([]); // Clear live data after recording
    setIsRecording(false);
  };

  const totalPresent = liveAttendance.filter(e => e.status === 'Hadir').length;
  const totalStudents = students.length;
  const isFinalizeDisabled = isRecording || liveAttendance.length === 0;
  
  // Determine the current date/time to display in the header
  const displayDate = liveAttendance.length > 0 ? liveAttendance[0].date : format(new Date(), 'dd/MM/yyyy');
  const displayTime = liveAttendance.length > 0 ? liveAttendance[0].time : format(new Date(), 'HH:mm:ss');


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Mode Otomatis</h2>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">
          Status Koneksi MQTT: 
          <span className={cn("ml-1 font-semibold", isConnected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
            {isConnected ? 'Tersambung' : 'Terputus'}
          </span>
        </p>
        <p className="text-sm font-medium text-muted-foreground">
          Topik: {MQTT_TOPIC}
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between space-y-2 pb-4">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="font-medium">Data Live Absensi ({displayDate} {displayTime})</span>
          </div>
          <Button onClick={handleFinalizeAttendance} disabled={isFinalizeDisabled}>
              {isRecording ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Merekam...
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
                  <TableHead>NAMA MAHASISWA</TableHead>
                  <TableHead>STATUS KEHADIRAN</TableHead>
                  <TableHead>TANGGAL ABSENSI</TableHead>
                  <TableHead>JAM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isConnected ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-red-500">
                            Tidak terhubung ke MQTT broker.
                        </TableCell>
                    </TableRow>
                ) : students.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            Tidak ada data mahasiswa.
                        </TableCell>
                    </TableRow>
                ) : (
                    liveAttendance.map((entry, index) => {
                        const status = entry.status;
                        
                        return (
                            <TableRow key={entry.student.id} className={status === 'Hadir' ? 'bg-green-50/50 dark:bg-green-900/10' : ''}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">{entry.student.name}</TableCell>
                                <TableCell>
                                    <span className={cn(
                                        "font-semibold",
                                        status === 'Hadir' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    )}>
                                        {status}
                                    </span>
                                </TableCell>
                                <TableCell>{entry.date}</TableCell>
                                <TableCell>{entry.time}</TableCell>
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