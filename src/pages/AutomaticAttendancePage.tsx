import React, { useState, useEffect } from 'react';
import { useMqtt } from '@/hooks/useMqtt';
import { useStudents, Student } from '@/contexts/StudentContext';
import { useAttendance, FinalAttendanceEntry } from '@/contexts/AttendanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Loader2, Calendar as CalendarIcon } from 'lucide-react';
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
  const MQTT_TOPIC = "absensi/rfid/data";
  const { isConnected, messages } = useMqtt(MQTT_TOPIC);
  const [liveAttendance, setLiveAttendance] = useState<LiveAttendanceEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // 1. Initialization: Set up initial 'Tidak Hadir' state for all students
  useEffect(() => {
    const initialData: LiveAttendanceEntry[] = students.map(student => ({
        student,
        status: 'Tidak Hadir',
        date: format(new Date(), 'dd/MM/yyyy'),
        time: format(new Date(), 'HH:mm:ss'),
    }));
    // Only initialize if the student list changes or if liveAttendance is empty
    setLiveAttendance(initialData.sort((a, b) => a.student.name.localeCompare(b.student.name)));
  }, [students]);

  // 2. Process incoming MQTT messages (JSON containing UID)
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[0].message.trim();
      let scannedUid: string | null = null;
      
      try {
        // Attempt to parse the message as JSON
        const data = JSON.parse(latestMessage);
        // We expect the UID field to be named 'uid' based on the user's example
        if (data && data.uid) {
            scannedUid = data.uid;
        }
      } catch (e) {
        // If parsing fails, assume the message itself might be the UID string (fallback)
        // However, based on the user's error, we prioritize JSON parsing.
        console.warn("MQTT message is not valid JSON or missing 'uid' field:", latestMessage);
        showError(`Format pesan MQTT tidak valid: ${latestMessage}`);
        return;
      }
      
      if (!scannedUid) return;

      const now = new Date();
      const formattedDate = format(now, 'dd/MM/yyyy');
      const formattedTime = format(now, 'HH:mm:ss');
      
      // Find the student matching the scanned RFID UID
      const studentScanned = students.find(s => s.rfidUid === scannedUid);

      if (studentScanned) {
        setLiveAttendance(prevLive => {
          // Use a map for efficient updates
          const liveMap = new Map(prevLive.map(entry => [entry.student.id, entry]));
          
          const existingEntry = liveMap.get(studentScanned.id);
          
          if (existingEntry && existingEntry.status === 'Hadir') {
              // Student already marked present
              showSuccess(`${studentScanned.name} sudah tercatat hadir.`);
              return prevLive; 
          }

          // Update the specific student entry to Hadir
          const updatedEntry: LiveAttendanceEntry = {
            student: studentScanned,
            status: 'Hadir',
            date: formattedDate,
            time: formattedTime,
          };
          
          // If the student was not in the liveAttendance list (e.g., if students list was updated after initialization), add them.
          if (!existingEntry) {
              liveMap.set(studentScanned.id, updatedEntry);
          } else {
              liveMap.set(studentScanned.id, updatedEntry);
          }
          
          // Convert map back to array and sort
          const newLiveAttendance = Array.from(liveMap.values()).sort((a, b) => a.student.name.localeCompare(b.student.name));
          
          showSuccess(`${studentScanned.name} berhasil tercatat hadir.`);
          return newLiveAttendance;
        });
      } else {
        // Only show error if the UID didn't match a student
        showError(`RFID UID ${scannedUid} tidak ditemukan dalam daftar mahasiswa.`);
      }
    }
  }, [messages, students]); 

  const handleFinalizeAttendance = () => {
    if (students.length === 0) {
      showError("Tidak ada data mahasiswa untuk direkam.");
      return;
    }
    
    setIsRecording(true);
    
    const now = new Date();
    const defaultDate = format(now, 'dd/MM/yyyy');
    const defaultTime = format(now, 'HH:mm:ss');

    // Ensure we process ALL students, using liveAttendance data if available, otherwise defaulting to Alpha
    const liveMap = new Map(liveAttendance.map(entry => [entry.student.id, entry]));

    const entries: FinalAttendanceEntry[] = students.map(student => {
        const liveEntry = liveMap.get(student.id);
        
        const status = (liveEntry && liveEntry.status === 'Hadir') ? 'Hadir' : 'Alpha';
        const date = liveEntry?.date || defaultDate;
        const time = liveEntry?.time || defaultTime;
        const note = status === 'Alpha' ? 'Otomatis Alpha' : '';
        
        return {
            name: student.name,
            status: status as FinalAttendanceEntry['status'],
            date,
            time,
            note,
        };
    });
    
    addRecord('Automatic', entries);
    
    // Re-initialize live attendance for the next session
    const initialData: LiveAttendanceEntry[] = students.map(student => ({
        student,
        status: 'Tidak Hadir',
        date: format(new Date(), 'dd/MM/yyyy'),
        time: format(new Date(), 'HH:mm:ss'),
    }));
    setLiveAttendance(initialData.sort((a, b) => a.student.name.localeCompare(b.student.name)));
    
    setIsRecording(false);
  };

  const totalPresent = liveAttendance.filter(e => e.status === 'Hadir').length;
  const totalStudents = students.length;
  const isFinalizeDisabled = isRecording || totalStudents === 0;
  
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
          Topik: {MQTT_TOPIC} (Menunggu pesan JSON dengan field 'uid')
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
                  <TableHead>NIM</TableHead>
                  <TableHead>STATUS KEHADIRAN</TableHead>
                  <TableHead>TANGGAL ABSENSI</TableHead>
                  <TableHead>JAM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isConnected ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-red-500">
                            Tidak terhubung ke MQTT broker.
                        </TableCell>
                    </TableRow>
                ) : students.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Tidak ada data mahasiswa. Silakan tambahkan mahasiswa terlebih dahulu.
                        </TableCell>
                    </TableRow>
                ) : (
                    liveAttendance.map((entry, index) => {
                        const status = entry.status;
                        
                        return (
                            <TableRow key={entry.student.id} className={status === 'Hadir' ? 'bg-green-50/50 dark:bg-green-900/10' : ''}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">{entry.student.name}</TableCell>
                                <TableCell>{entry.student.nim}</TableCell>
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