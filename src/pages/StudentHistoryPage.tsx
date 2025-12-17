import React, { useState } from 'react';
import { useStudents } from '@/contexts/StudentContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const StudentHistoryPage: React.FC = () => {
  const { students } = useStudents();
  const { history } = useAttendance();
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);

  const studentHistory = history
    .flatMap(record => record.entries.map(entry => ({
      ...entry,
      recordId: record.id,
      mode: record.mode,
      timestamp: record.timestamp,
    })))
    .filter(entry => {
      const student = students.find(s => s.id === selectedStudentId);
      return student && entry.name === student.name;
    })
    .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Riwayat Absensi Mahasiswa</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <User className="h-5 w-5 mr-2" /> Pilih Mahasiswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Pilih Mahasiswa..." />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} ({student.nim})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <History className="h-5 w-5 mr-2" /> Riwayat Absensi untuk {selectedStudent.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jam</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Tidak ada riwayat absensi untuk mahasiswa ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    studentHistory.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.time}</TableCell>
                        <TableCell>
                          <Badge variant={entry.status.includes('Hadir') ? 'default' : 'secondary'}>
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{entry.mode}</TableCell>
                        <TableCell>{entry.note || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentHistoryPage;