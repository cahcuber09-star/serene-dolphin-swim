import React, { useState } from 'react';
import { useStudents } from '@/contexts/StudentContext';
import { useAttendance, FinalAttendanceRecord } from '@/contexts/AttendanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Filter, Download } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, isWithinInterval, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

interface RecapResult {
  name: string;
  nim: string;
  class: string;
  Hadir: number;
  Sakit: number;
  Izin: number;
  Alpha: number;
}

// Define the specific keys that hold numeric counts
type AttendanceCountKey = 'Hadir' | 'Sakit' | 'Izin' | 'Alpha';

const RecapReportPage: React.FC = () => {
  const { students } = useStudents();
  const { history } = useAttendance();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [filterClass, setFilterClass] = useState('All');
  const [recapData, setRecapData] = useState<RecapResult[]>([]);
  
  // Use the specific type for the constant array
  const ATTENDANCE_STATUSES: AttendanceCountKey[] = ['Hadir', 'Sakit', 'Izin', 'Alpha'];

  const handleGenerateRecap = () => {
    if (!startDate || !endDate) {
      showSuccess("Please select both start and end dates.");
      return;
    }

    const results: Record<string, RecapResult> = {};

    // Initialize results based on filtered students
    students
      .filter(s => filterClass === 'All' || s.class === filterClass)
      .forEach(student => {
        results[student.id] = {
          name: student.name,
          nim: student.nim,
          class: student.class,
          Hadir: 0,
          Sakit: 0,
          Izin: 0,
          Alpha: 0,
        };
      });

    // Process history records
    history.forEach((record: FinalAttendanceRecord) => {
      // Check if the record date falls within the filter interval
      const recordDateStr = record.entries[0]?.date;
      if (!recordDateStr) return;
      
      // Assuming date format is 'dd/MM/yyyy'
      const recordDate = parse(recordDateStr, 'dd/MM/yyyy', new Date());

      if (isWithinInterval(recordDate, { start: startDate, end: endDate })) {
        record.entries.forEach(entry => {
          const student = students.find(s => s.name === entry.name);
          if (student && results[student.id]) {
            
            // Check if the status is one of the countable keys
            if (ATTENDANCE_STATUSES.includes(entry.status as AttendanceCountKey)) {
                const countKey = entry.status as AttendanceCountKey;
                
                // Fix 1 & 2: Use the narrowed key type (countKey) which is guaranteed to be a numeric property.
                results[student.id][countKey] = results[student.id][countKey] + 1;
            }
          }
        });
      }
    });

    setRecapData(Object.values(results));
    showSuccess("Laporan rekapitulasi berhasil dibuat.");
  };
  
  const handleExport = (type: 'PDF' | 'Excel') => {
    showSuccess(`Exporting report to ${type}...`);
    // Placeholder for actual export logic
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Laporan Rekapitulasi Absensi</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Date Picker Start */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Tanggal Mulai</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {/* Date Picker End */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Tanggal Akhir</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            {/* Class Filter */}
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Semua Kelas</SelectItem>
                {['A', 'B', 'C', 'D'].map(c => (
                  <SelectItem key={c} value={c}>Kelas {c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleGenerateRecap} disabled={!startDate || !endDate}>
              <Filter className="h-4 w-4 mr-2" /> Terapkan Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Hasil Rekapitulasi</CardTitle>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => handleExport('PDF')}>
              <Download className="h-4 w-4 mr-2" /> Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('Excel')}>
              <Download className="h-4 w-4 mr-2" /> Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NAMA LENGKAP</TableHead>
                  <TableHead>NIM</TableHead>
                  <TableHead>KELAS</TableHead>
                  <TableHead className="text-center">HADIR</TableHead>
                  <TableHead className="text-center">SAKIT</TableHead>
                  <TableHead className="text-center">IZIN</TableHead>
                  <TableHead className="text-center">ALPHA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recapData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      Silakan terapkan filter untuk melihat laporan rekapitulasi.
                    </TableCell>
                  </TableRow>
                ) : (
                  recapData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{data.name}</TableCell>
                      <TableCell>{data.nim}</TableCell>
                      <TableCell>{data.class}</TableCell>
                      <TableCell className="text-center">{data.Hadir}</TableCell>
                      <TableCell className="text-center">{data.Sakit}</TableCell>
                      <TableCell className="text-center">{data.Izin}</TableCell>
                      <TableCell className="text-center">{data.Alpha}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecapReportPage;