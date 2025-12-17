import React, { useState } from 'react';
import { useStudents } from '@/contexts/StudentContext';
import { useAttendance, FinalAttendanceEntry } from '@/contexts/AttendanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { useMqtt } from '@/hooks/useMqtt'; // Import MQTT hook

type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpha';

interface AttendanceState {
  status: AttendanceStatus;
  note: string;
}

const ATTENDANCE_OPTIONS: AttendanceStatus[] = ['Hadir', 'Sakit', 'Izin', 'Alpha'];

const ManualAttendancePage: React.FC = () => {
  const { students } = useStudents();
  const { addRecord } = useAttendance();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceState>>({});
  
  // MQTT for Manual Mode (Topic 1/2) - Used for publishing/monitoring if needed
  const { isConnected, publish, messages } = useMqtt("1/2"); 

  // Initialize attendance data when students load or date changes
  React.useEffect(() => {
    const initialData: Record<string, AttendanceState> = {};
    students.forEach(student => {
      // Default status is Hadir
      initialData[student.id] = { status: 'Hadir', note: '' };
    });
    setAttendanceData(initialData);
  }, [students]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], note },
    }));
  };

  const handleSaveAttendance = () => {
    if (!date) {
      showError("Please select a date.");
      return;
    }

    const formattedDate = format(date, 'dd/MM/yyyy');
    const formattedTime = format(new Date(), 'HH:mm:ss');

    const entries: FinalAttendanceEntry[] = students.map(student => {
      const data = attendanceData[student.id] || { status: 'Alpha', note: '' };
      
      return {
        name: student.name,
        status: data.status as FinalAttendanceEntry['status'],
        date: formattedDate,
        time: formattedTime,
        note: data.note,
      };
    });
    
    addRecord('Manual', entries);
    
    // Optionally publish the manual record to 1/2
    if (isConnected) {
        publish("1/2", JSON.stringify({ date: formattedDate, entries }));
    }
    
    showSuccess(`Absensi tanggal ${formattedDate} berhasil disimpan.`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pengisian Absensi Manual (Topic 1/2)</h2>
      <p className={cn("text-sm", isConnected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
        MQTT Status: {isConnected ? 'Connected' : 'Disconnected'} to broker.hivemq.com:8000
      </p>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between space-y-2 pb-4">
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pilih Tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleSaveAttendance} disabled={!date}>
              <Save className="h-4 w-4 mr-2" /> Simpan Absensi
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
                  <TableHead className="w-[200px]">CATATAN</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => {
                  const currentStatus = attendanceData[student.id]?.status || 'Alpha';
                  const currentNote = attendanceData[student.id]?.note || '';
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.nim}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>
                        <Select 
                          value={currentStatus} 
                          onValueChange={(status) => handleStatusChange(student.id, status as AttendanceStatus)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {ATTENDANCE_OPTIONS.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Textarea 
                          placeholder="Catatan (opsional)"
                          value={currentNote}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          className="resize-none h-10"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Display last received MQTT message from 1/2 */}
      {messages.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Last MQTT Message (1/2)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {messages[0].message}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManualAttendancePage;