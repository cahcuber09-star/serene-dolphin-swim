import React, { useEffect } from 'react';
import { useMqtt } from '@/hooks/useMqtt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FinalAttendanceEntry } from '@/contexts/AttendanceContext'; // Use the defined interface

interface AttendanceRecord extends FinalAttendanceEntry {
  timestamp: number; // Keep timestamp locally for sorting/display
}

interface AutomaticAttendanceTableProps {
  onRecordsChange: (records: FinalAttendanceEntry[]) => void;
}

const parseMessage = (message: string, timestamp: number): AttendanceRecord | null => {
  try {
    const data = JSON.parse(message);
    if (data && typeof data.nama === 'string' && typeof data.status === 'string') {
      const dateObj = new Date(timestamp);
      // Ensure status is one of the expected types, defaulting if necessary
      const status: FinalAttendanceEntry['status'] = data.status === 'Hadir' ? 'Hadir' : 'Tidak Hadir'; 
      
      return {
        name: data.nama,
        status: status,
        timestamp,
        date: dateObj.toLocaleDateString(),
        time: dateObj.toLocaleTimeString(),
      };
    }
  } catch (e) {
    // Ignore non-JSON messages for this table
  }
  return null;
};

const AutomaticAttendanceTable: React.FC<AutomaticAttendanceTableProps> = ({ onRecordsChange }) => {
  const topic = "1/0";
  const { messages, isConnected } = useMqtt(topic);

  const records: AttendanceRecord[] = messages
    .map(msg => parseMessage(msg.message, msg.timestamp))
    .filter((record): record is AttendanceRecord => record !== null);
    
  // Notify parent component whenever records change
  useEffect(() => {
    // Map to FinalAttendanceEntry structure (excluding timestamp)
    const entries: FinalAttendanceEntry[] = records.map(({ name, status, date, time }) => ({ name, status, date, time }));
    onRecordsChange(entries);
  }, [records, onRecordsChange]);


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Automatic Attendance Data (Topic: {topic})</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Connecting..."}
          </Badge>
          {!isConnected && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-4">
        <ScrollArea className="h-[400px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Mahasiswa</TableHead>
                <TableHead>Status Kehadiran</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jam</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Waiting for automatic attendance data...
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'Hadir' ? 'default' : 'secondary'}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.time}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AutomaticAttendanceTable;