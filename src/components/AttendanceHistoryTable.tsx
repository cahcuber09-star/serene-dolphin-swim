import React from 'react';
import { useAttendance, FinalAttendanceRecord } from '@/contexts/AttendanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Clock } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AttendanceHistoryTable: React.FC = () => {
  const { history } = useAttendance();

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Clock className="h-6 w-6 mr-2" /> Attendance History
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pt-4">
        {history.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-muted-foreground border rounded-md">
            No attendance records finalized yet.
          </div>
        ) : (
          <ScrollArea className="h-[500px] w-full rounded-md border">
            <Accordion type="single" collapsible className="w-full">
              {history.map((record, index) => (
                <AccordionItem key={record.id} value={record.id}>
                  <AccordionTrigger className="hover:no-underline p-4 flex justify-between items-center bg-secondary/20 data-[state=open]:bg-secondary/50 transition-colors">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Record #{history.length - index}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(record.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={record.mode === 'Automatic' ? 'default' : 'outline'}>
                        {record.mode}
                      </Badge>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Mahasiswa</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Jam</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {record.entries.map((entry, entryIndex) => (
                          <TableRow key={entryIndex}>
                            <TableCell className="font-medium">{entry.name}</TableCell>
                            <TableCell>
                              <Badge variant={entry.status.includes('Hadir') ? 'default' : 'secondary'}>
                                {entry.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>{entry.time}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceHistoryTable;